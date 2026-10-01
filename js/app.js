/* ===================================================
   app.js – Login global, navegação, storage, relatório consolidado e envio
   Arquitetura e Montagens de Computador — Professor Anderson — IFCE
   =================================================== */

const App = (() => {
  'use strict';

  let loggedStudent = null;

  // ---------- Storage ----------
  const Storage = {
    _prefix: 'proc_app_',
    _key(name) { return this._prefix + name; },

    get(name) {
      try {
        const raw = localStorage.getItem(this._key(name));
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },

    set(name, value) {
      try { localStorage.setItem(this._key(name), JSON.stringify(value)); }
      catch (e) { console.error('Storage error:', e); }
    },

    remove(name) { localStorage.removeItem(this._key(name)); },

    saveActivity(activityKey, data) {
      this.set('act_' + activityKey, data);
      Cloud.syncActivityDebounced(activityKey, data);
      updateHomeStatus();
    },

    getActivity(activityKey) {
      return this.get('act_' + activityKey);
    },

    isActivityDone(activityKey) {
      return !!this.get('act_' + activityKey);
    }
  };

  // ---------- Cloud Sync Subsystem (Supabase / Nuvem / Multi-dispositivo) ----------
  const Cloud = {
    _syncTimeout: null,

    updateSyncBadge(status, text) {
      const badge = document.getElementById('header-sync-status');
      if (!badge) return;
      badge.style.display = 'flex';
      badge.className = 'header-sync-badge ' + (status || '');
      const textEl = badge.querySelector('.sync-text');
      if (textEl) {
        textEl.textContent = text || (status === 'syncing' ? 'Salvando...' : status === 'offline' ? 'Modo Offline' : 'Sincronizado');
      }
    },

    async login(matricula, password, name = '', turma = '') {
      const mat = String(matricula || '').trim().toLowerCase();
      const pass = String(password || '').trim();

      // 1. SUPABASE (Para Vercel e Acesso em Qualquer Lugar)
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured()) {
        const sb = SupabaseClient.getClient();
        try {
          const { data: existing, error } = await sb
            .from('students')
            .select('*')
            .eq('matricula', mat)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.warn('Aviso Supabase login:', error);
          }

          if (existing) {
            if (existing.password_hash && existing.password_hash !== pass) {
              return { ok: false, error: 'Senha incorreta para esta matrícula.' };
            }

            // Atualiza timestamp
            await sb.from('students').update({ last_sync_at: new Date().toISOString() }).eq('matricula', mat);

            return {
              ok: true,
              data: {
                student: { matricula: existing.matricula, name: existing.name, turma: existing.turma || '' },
                activities: existing.activities || {}
              }
            };
          }

          // Primeiro acesso (não cadastrado ainda)
          if (!name) {
            return { ok: false, error: 'Matrícula não cadastrada. Por favor, utilize a aba "Primeiro Acesso" para criar sua conta.' };
          }

          // Monta atividades locais se já tiver preenchido algo
          const initialActs = {};
          const localA1 = Storage.get('act_1');
          const localA2 = Storage.get('act_2');
          const localA3 = Storage.get('act_3');
          const localA4 = Storage.get('act_4');
          if (localA1) initialActs['1'] = localA1;
          if (localA2) initialActs['2'] = localA2;
          if (localA3) initialActs['3'] = localA3;
          if (localA4) initialActs['4'] = localA4;

          const newStudent = {
            matricula: mat,
            name: String(name).trim(),
            turma: String(turma).trim(),
            password_hash: pass,
            activities: initialActs,
            last_sync_at: new Date().toISOString()
          };

          const { error: insertErr } = await sb
            .from('students')
            .insert(newStudent);

          if (insertErr) {
            console.error('Erro cadastro Supabase:', insertErr);
            return { ok: false, error: 'Erro ao cadastrar no Supabase: ' + (insertErr.message || 'Verifique as tabelas SQL.') };
          }

          return {
            ok: true,
            data: {
              student: { matricula: newStudent.matricula, name: newStudent.name, turma: newStudent.turma },
              activities: newStudent.activities
            }
          };
        } catch (err) {
          console.warn('Erro na conexão com Supabase:', err);
        }
      }

      // 2. FALLBACK: Servidor Node.js Local (/api/auth/login)
      try {
        const payload = { matricula: mat, password: pass, name, turma };
        const localA1 = Storage.get('act_1');
        const localA2 = Storage.get('act_2');
        const localA3 = Storage.get('act_3');
        const localA4 = Storage.get('act_4');
        if (localA1 || localA2 || localA3 || localA4) {
          payload.initialActivities = {};
          if (localA1) payload.initialActivities['1'] = localA1;
          if (localA2) payload.initialActivities['2'] = localA2;
          if (localA3) payload.initialActivities['3'] = localA3;
          if (localA4) payload.initialActivities['4'] = localA4;
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      } catch (err) {
        console.warn('Servidor offline:', err);
        return { ok: false, offline: true, error: 'Servidor ou Supabase não acessível no momento.' };
      }
    },

    syncActivityDebounced(activityKey, data) {
      if (this._syncTimeout) clearTimeout(this._syncTimeout);
      this.updateSyncBadge('syncing', 'Salvando na nuvem...');
      this._syncTimeout = setTimeout(() => {
        this.syncActivity(activityKey, data);
      }, 500);
    },

    async syncActivity(activityKey, data) {
      const student = getStudent();
      if (!student || !student.matricula) {
        this.updateSyncBadge('offline', 'Salvo no aparelho');
        return;
      }

      const mat = String(student.matricula).trim().toLowerCase();

      // 1. SUPABASE
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured()) {
        const sb = SupabaseClient.getClient();
        try {
          const { data: curr } = await sb.from('students').select('activities').eq('matricula', mat).maybeSingle();
          const acts = (curr && curr.activities) ? curr.activities : {};
          acts[String(activityKey)] = data;

          const { error } = await sb
            .from('students')
            .update({ activities: acts, last_sync_at: new Date().toISOString() })
            .eq('matricula', mat);

          if (!error) {
            this.updateSyncBadge('', 'Sincronizado na nuvem ✓');
            return;
          }
        } catch (err) {
          console.warn('Erro ao atualizar Supabase:', err);
        }
      }

      // 2. FALLBACK NODE.JS
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matricula: student.matricula,
            password: student.password || '',
            activityKey: String(activityKey),
            data
          })
        });

        if (res.ok) {
          this.updateSyncBadge('', 'Sincronizado na nuvem ✓');
        } else {
          this.updateSyncBadge('offline', 'Salvo localmente');
        }
      } catch (e) {
        this.updateSyncBadge('offline', 'Salvo localmente (offline)');
      }
    },

    async fetchStudentData(matricula) {
      const mat = String(matricula || '').trim().toLowerCase();

      // 1. SUPABASE
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured()) {
        const sb = SupabaseClient.getClient();
        try {
          const { data, error } = await sb.from('students').select('*').eq('matricula', mat).maybeSingle();
          if (!error && data) {
            return {
              matricula: data.matricula,
              name: data.name,
              turma: data.turma || '',
              activities: data.activities || {},
              lastSyncAt: data.last_sync_at
            };
          }
        } catch {}
      }

      // 2. FALLBACK NODE.JS
      try {
        const res = await fetch('/api/student/' + encodeURIComponent(matricula));
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async submitReport(submissionData) {
      // 1. SUPABASE
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured()) {
        const sb = SupabaseClient.getClient();
        try {
          const subId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const { error } = await sb.from('submissions').insert({
            id: subId,
            matricula: submissionData.matricula || 'anonimo',
            student_name: submissionData.studentName || 'Não informado',
            turma: submissionData.turma || '',
            activities: submissionData.activities || {},
            report_text: submissionData.reportText || '',
            status: 'enviada'
          });

          if (!error) {
            return { ok: true, data: { submissionId: subId } };
          }
        } catch (e) {
          console.warn('Erro ao enviar relatório no Supabase:', e);
        }
      }

      // 2. FALLBACK NODE.JS
      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });
        const data = await res.json();
        return { ok: res.ok, data };
      } catch (err) {
        return { ok: false, error: 'Servidor indisponível.' };
      }
    },

    async fetchAdminOverview(token) {
      // 1. SUPABASE
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured()) {
        const sb = SupabaseClient.getClient();
        try {
          const { data: students, error: errS } = await sb.from('students').select('*').order('last_sync_at', { ascending: false });
          const { data: subs } = await sb.from('submissions').select('*');

          if (!errS && students) {
            const summary = students.map(s => {
              const acts = s.activities || {};
              return {
                matricula: s.matricula,
                name: s.name,
                turma: s.turma || '',
                createdAt: s.created_at,
                lastSyncAt: s.last_sync_at,
                a1_done: !!acts['1'],
                a2_done: !!acts['2'],
                a3_done: !!acts['3'],
                a4_done: !!acts['4'],
                submissionsCount: (subs || []).filter(sub => sub.matricula === s.matricula).length
              };
            });

            return {
              ok: true,
              data: {
                totalStudents: summary.length,
                totalSubmissions: (subs || []).length,
                students: summary,
                isSupabase: true
              }
            };
          }
        } catch (e) {
          console.warn('Erro admin Supabase:', e);
        }
      }

      // 2. FALLBACK NODE.JS
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        return { ok: res.ok, data };
      } catch {
        return { ok: false, error: 'Não foi possível carregar os dados administrativos.' };
      }
    }
  };


  // ---------- Utils ----------
  const Utils = {
    formatDate(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
    },

    formatCurrency(value) {
      const num = parseFloat(value) || 0;
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    parsePrice(val) {
      if (!val) return 0;
      let str = String(val).replace(/[^\d.,]/g, '').trim();
      if (!str) return 0;

      if (str.includes('.') && str.includes(',')) {
        if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
          str = str.replace(/\./g, '').replace(',', '.');
        } else {
          str = str.replace(/,/g, '');
        }
      } else if (str.includes(',')) {
        str = str.replace(',', '.');
      } else if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 2 && parts[1].length <= 2) {
          // decimal
        } else {
          str = str.replace(/\./g, '');
        }
      }
      const n = parseFloat(str);
      return isNaN(n) ? 0 : n;
    },

    escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
    },

    nowISO() {
      return new Date().toISOString();
    }
  };

  // ---------- Toast ----------
  const Toast = {
    container: null,
    init() { this.container = document.getElementById('toast-container'); },
    show(message, type = 'info', duration = 3500) {
      if (!this.container) this.init();
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      this.container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // ---------- Modal ----------
  const Modal = {
    show(title, message, onConfirm, onCancel, confirmText = 'CONFIRMAR', cancelText = 'CANCELAR') {
      const overlay = document.getElementById('modal-overlay');
      const box = overlay.querySelector('.modal-box');
      box.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="modal-cancel">${cancelText}</button>
          <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
        </div>
      `;
      overlay.classList.add('active');
      document.getElementById('modal-cancel').onclick = () => {
        overlay.classList.remove('active');
        if (onCancel) onCancel();
      };
      document.getElementById('modal-confirm').onclick = () => {
        overlay.classList.remove('active');
        if (onConfirm) onConfirm();
      };
    },
    hide() { document.getElementById('modal-overlay').classList.remove('active'); }
  };

  // ---------- Nav ----------
  const Nav = {
    currentView: 'login',
    showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(viewId);
      if (target) {
        target.classList.add('active');
        this.currentView = viewId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      document.querySelectorAll('.header-nav button').forEach(btn => btn.classList.remove('active'));
      if (viewId === 'home') {
        const homeBtn = document.getElementById('nav-home');
        if (homeBtn) homeBtn.classList.add('active');
      } else if (viewId === 'view-report') {
        const repBtn = document.getElementById('nav-report');
        if (repBtn) repBtn.classList.add('active');
      }
    }
  };

  // ---------- Student Login & State ----------
  function getStudent() { return loggedStudent; }

  function setStudentUI(student) {
    const studentHeader = document.getElementById('header-student-info');
    if (studentHeader) {
      studentHeader.innerHTML = `<span class="dot"></span> ${Utils.escapeHtml(student.name)}${student.turma ? ' (' + Utils.escapeHtml(student.turma) + ')' : ''}`;
      studentHeader.style.display = 'flex';
    }
    const navHome = document.getElementById('nav-home');
    const navReport = document.getElementById('nav-report');
    const navLogout = document.getElementById('nav-logout');
    if (navHome) navHome.style.display = '';
    if (navReport) navReport.style.display = '';
    if (navLogout) navLogout.style.display = '';

    Cloud.updateSyncBadge(student.offline ? 'offline' : '', student.offline ? 'Modo Offline' : 'Sincronizado na nuvem ✓');
  }

  function switchLoginTab(tab) {
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    const panelLogin = document.getElementById('panel-login');
    const panelReg = document.getElementById('panel-register');

    if (tab === 'login') {
      tabLoginBtn.classList.add('active');
      tabRegBtn.classList.remove('active');
      panelLogin.classList.add('active');
      panelReg.classList.remove('active');
    } else {
      tabRegBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      panelReg.classList.add('active');
      panelLogin.classList.remove('active');
    }
  }

  async function handleLoginSubmit() {
    const matInput = document.getElementById('login-matricula');
    const passInput = document.getElementById('login-password');
    const errEl = document.getElementById('login-error-msg');
    const matricula = matInput.value.trim();
    const password = passInput.value.trim();

    if (!matricula || !password) {
      errEl.textContent = 'Informe sua matrícula e sua senha de acesso.';
      errEl.classList.add('visible');
      return;
    }

    errEl.classList.remove('visible');
    const btn = document.getElementById('btn-do-login');
    const originalText = btn.textContent;
    btn.textContent = 'Sincronizando com a nuvem...';
    btn.disabled = true;

    const res = await Cloud.login(matricula, password);
    btn.textContent = originalText;
    btn.disabled = false;

    if (!res.ok) {
      if (res.offline) {
        // Modo offline se servidor estiver indisponível
        const savedStudent = Storage.get('student');
        if (savedStudent && savedStudent.matricula === matricula) {
          loggedStudent = savedStudent;
          setStudentUI(loggedStudent);
          updateHomeStatus();
          Nav.showView('home');
          Toast.show('Conectado em modo offline (servidor indisponível).', 'info');
          return;
        }
        errEl.textContent = 'Servidor inacessível no momento. Use o modo offline abaixo se estiver sem internet.';
        errEl.classList.add('visible');
        return;
      }

      errEl.textContent = res.data && res.data.error ? res.data.error : 'Erro ao realizar login.';
      errEl.classList.add('visible');
      return;
    }

    // Sucesso no login
    const sData = res.data.student;
    loggedStudent = {
      matricula: sData.matricula,
      name: sData.name,
      turma: sData.turma || '',
      password: password
    };
    Storage.set('student', loggedStudent);

    // Carrega e mescla atividades salvas no servidor
    if (res.data.activities) {
      const acts = res.data.activities;
      if (acts['1']) Storage.set('act_1', acts['1']);
      if (acts['2']) Storage.set('act_2', acts['2']);
      if (acts['3']) Storage.set('act_3', acts['3']);
      if (acts['4']) Storage.set('act_4', acts['4']);
    }

    setStudentUI(loggedStudent);
    updateHomeStatus();
    Nav.showView('home');
    Toast.show(`Bem-vindo de volta, ${loggedStudent.name}! Atividades sincronizadas da nuvem.`, 'success', 4500);
  }

  async function handleRegisterSubmit() {
    const matInput = document.getElementById('reg-matricula');
    const nameInput = document.getElementById('reg-name');
    const passInput = document.getElementById('reg-password');
    const turmaInput = document.getElementById('reg-turma');
    const errEl = document.getElementById('reg-error-msg');

    const matricula = matInput.value.trim();
    const name = nameInput.value.trim();
    const password = passInput.value.trim();
    const turma = turmaInput.value.trim();

    if (!matricula || !name || !password) {
      errEl.textContent = 'Preencha Matrícula, Nome Completo e Crie uma Senha.';
      errEl.classList.add('visible');
      return;
    }

    errEl.classList.remove('visible');
    const btn = document.getElementById('btn-do-register');
    const originalText = btn.textContent;
    btn.textContent = 'Criando acesso na nuvem...';
    btn.disabled = true;

    const res = await Cloud.login(matricula, password, name, turma);
    btn.textContent = originalText;
    btn.disabled = false;

    if (!res.ok) {
      if (res.offline) {
        // Fallback offline
        loggedStudent = { matricula, name, turma, password, offline: true };
        Storage.set('student', loggedStudent);
        setStudentUI(loggedStudent);
        updateHomeStatus();
        Nav.showView('home');
        Toast.show('Conta criada localmente (modo offline).', 'info');
        return;
      }
      errEl.textContent = res.data && res.data.error ? res.data.error : 'Erro ao criar conta.';
      errEl.classList.add('visible');
      return;
    }

    loggedStudent = {
      matricula: res.data.student.matricula,
      name: res.data.student.name,
      turma: res.data.student.turma || '',
      password: password
    };
    Storage.set('student', loggedStudent);

    setStudentUI(loggedStudent);
    updateHomeStatus();
    Nav.showView('home');
    Toast.show(`Conta criada com sucesso! Olá, ${name}. Suas atividades estão sincronizadas na nuvem.`, 'success', 5000);
  }

  function handleOfflineAccess(e) {
    if (e) e.preventDefault();
    const name = prompt('Informe seu nome completo para acesso local:');
    if (!name || !name.trim()) return;

    const turma = prompt('Informe sua turma (opcional):') || '';
    loggedStudent = {
      matricula: 'local_' + Date.now().toString(36),
      name: name.trim(),
      turma: turma.trim(),
      password: '',
      offline: true
    };
    Storage.set('student', loggedStudent);
    setStudentUI(loggedStudent);
    updateHomeStatus();
    Nav.showView('home');
    Toast.show(`Modo local ativado. Bem-vindo, ${name}!`, 'info');
  }

  function handleLogout() {
    Modal.show(
      'Trocar de Aluno / Dispositivo',
      'Deseja sair desta conta? Suas respostas continuarão seguras na nuvem e você poderá entrar novamente a qualquer momento com sua matrícula e senha.',
      () => {
        loggedStudent = null;
        Storage.remove('student');
        document.getElementById('header-student-info').style.display = 'none';
        const syncBadge = document.getElementById('header-sync-status');
        if (syncBadge) syncBadge.style.display = 'none';

        document.getElementById('nav-home').style.display = 'none';
        document.getElementById('nav-report').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'none';

        document.getElementById('login-matricula').value = '';
        document.getElementById('login-password').value = '';
        Nav.showView('login');
        Toast.show('Você saiu da sua conta.', 'info');
      },
      null,
      'SIM, SAIR',
      'CANCELAR'
    );
  }


  // ---------- Home status ----------
  function updateHomeStatus() {
    const a1Done = Storage.isActivityDone('1');
    const a2Done = Storage.isActivityDone('2');
    const a3Done = Storage.isActivityDone('3');
    const a4Done = Storage.isActivityDone('4');

    updateCardStatus('a1-status', a1Done);
    updateCardStatus('a2-status', a2Done);
    updateCardStatus('a3-status', a3Done);
    updateCardStatus('a4-status', a4Done);

    // Completion items in home report section
    const ci1 = document.getElementById('ci-a1');
    const ci2 = document.getElementById('ci-a2');
    const ci3 = document.getElementById('ci-a3');
    const ci4 = document.getElementById('ci-a4');
    if (ci1) {
      ci1.className = 'completion-item ' + (a1Done ? 'done' : 'pending');
      ci1.querySelector('.ci-icon').textContent = a1Done ? '✓' : '—';
    }
    if (ci2) {
      ci2.className = 'completion-item ' + (a2Done ? 'done' : 'pending');
      ci2.querySelector('.ci-icon').textContent = a2Done ? '✓' : '—';
    }
    if (ci3) {
      ci3.className = 'completion-item ' + (a3Done ? 'done' : 'pending');
      ci3.querySelector('.ci-icon').textContent = a3Done ? '✓' : '—';
    }
    if (ci4) {
      ci4.className = 'completion-item ' + (a4Done ? 'done' : 'pending');
      ci4.querySelector('.ci-icon').textContent = a4Done ? '✓' : '—';
    }
  }

  function updateCardStatus(elementId, done) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (done) {
      el.className = 'card-status done';
      el.innerHTML = '<span class="status-dot"></span> Concluída';
    } else {
      el.className = 'card-status pending';
      el.innerHTML = '<span class="status-dot"></span> Pendente';
    }
  }

  // ---------- Plain Text Generator (for Email and Clipboard) ----------
  function formatReportAsPlainText(student, now, a1, a2, a3, a4) {
    const line = '='.repeat(64);
    const subline = '-'.repeat(64);
    let txt = '';

    txt += `${line}\n`;
    txt += `RELATÓRIO CONSOLIDADO DE ATIVIDADES — HARDWARE\n`;
    txt += `Disciplina: Arquitetura e Montagens de Computador — IFCE\n`;
    txt += `Professor: Anderson\n`;
    txt += `${line}\n`;
    txt += `Aluno: ${student.name}\n`;
    if (student.turma) txt += `Turma: ${student.turma}\n`;
    txt += `Data de Emissão: ${now}\n`;
    txt += `${line}\n\n`;

    // ATIVIDADE 01
    txt += `[ATIVIDADE 01 — VOCÊ COMPRARIA?]\n`;
    txt += `${subline}\n`;
    if (a1) {
      if (a1.processadores) {
        txt += `* Pesquisa dos 3 Processadores:\n`;
        const fields = ['Fabricante','Modelo','Núcleos','Threads','Frequência base','Frequência máxima','Cache','Soquete','Preço aproximado','Perfil de uso'];
        for (let p = 1; p <= 3; p++) {
          const proc = a1.processadores['processador_' + p] || {};
          txt += `  [Processador ${p}]:\n`;
          fields.forEach(f => {
            txt += `    - ${f}: ${proc[f] || '—'}\n`;
          });
        }
        txt += `\n`;
      }

      if (a1.escolha) {
        txt += `* Processador Escolhido: ${a1.escolha.processador || '—'}\n`;
        txt += `* Justificativa da Escolha: ${a1.escolha.razao || '—'}\n\n`;
      }

      if (a1.componentes) {
        txt += `* Montagem do Computador (Orçamento R$ 5.000):\n`;
        let total = 0;
        Object.keys(a1.componentes).forEach(k => {
          const c = a1.componentes[k];
          const pr = c.preco ? (String(c.preco).trim().startsWith('R$') ? c.preco : Utils.formatCurrency(Utils.parsePrice(c.preco))) : '—';
          txt += `    - ${c.label}: ${c.modelo || '—'} | ${pr}\n`;
          total += Utils.parsePrice(c.preco);
        });
        txt += `    Total Calculado: ${Utils.formatCurrency(total)}\n\n`;
      }

      if (a1.finalidade) {
        txt += `* Finalidade Principal: ${a1.finalidade.tipo || '—'}\n`;
        txt += `* Justificativa do Perfil: ${a1.finalidade.razao || '—'}\n\n`;
      }

      if (a1.desafio500) {
        txt += `* Desafio R$ 500 — Componente Escolhido: ${a1.desafio500.componente || '—'}\n`;
        txt += `* Justificativa do Upgrade: ${a1.desafio500.razao || '—'}\n\n`;
      }

      txt += `* Conclusão do Aluno:\n${a1.conclusao || '—'}\n\n`;
    } else {
      txt += `[Atividade não realizada]\n\n`;
    }

    // ATIVIDADE 02
    txt += `[ATIVIDADE 02 — DESCUBRA O CLOCK DO PROCESSADOR]\n`;
    txt += `${subline}\n`;
    if (a2) {
      Object.keys(a2).forEach(key => {
        const item = a2[key];
        txt += `* ${item.label}:\n  ${item.value || '—'}\n`;
      });
      txt += `\n`;
    } else {
      txt += `[Atividade não realizada]\n\n`;
    }

    // ATIVIDADE 03
    txt += `[ATIVIDADE 03 — MEMÓRIA RAM: APRENDA E INVESTIGUE]\n`;
    txt += `${subline}\n`;
    if (a3) {
      Object.keys(a3).forEach(key => {
        const item = a3[key];
        txt += `* ${item.label}:\n  ${item.value || '—'}\n`;
      });
      txt += `\n`;
    } else {
      txt += `[Atividade não realizada]\n\n`;
    }

    // ATIVIDADE 04
    txt += `[ATIVIDADE 04 — ESTUDO DE CASO: AGÊNCIA PIXEL RÁPIDO]\n`;
    txt += `${subline}\n`;
    if (a4) {
      Object.keys(a4).forEach(key => {
        const item = a4[key];
        txt += `* ${item.label}:\n  ${item.value || '—'}\n`;
      });
      txt += `\n`;
    } else {
      txt += `[Atividade não realizada]\n\n`;
    }

    txt += `${line}\nFim do Relatório — IFCE 2026\n${line}\n`;
    return txt;
  }

  // ---------- Download Standalone HTML Report ----------
  function downloadHtmlReport(student, bodyHtml) {
    const fileName = `Relatorio_Hardware_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Atividades — ${Utils.escapeHtml(student.name)} — IFCE</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 2rem; margin: 0; line-height: 1.6; }
    .report-wrap { max-width: 900px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .report-header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
    .report-header h2 { margin: 0 0 0.5rem 0; color: #0f172a; font-size: 1.4rem; font-weight: 800; }
    .report-meta { color: #475569; font-size: 0.9rem; line-height: 1.7; }
    .report-activity { margin-bottom: 2rem; }
    .report-activity h3 { font-size: 1.15rem; color: #3730a3; border-bottom: 2px solid #e0e7ff; padding-bottom: 0.4rem; margin-bottom: 1rem; }
    .report-field { margin-bottom: 1rem; }
    .report-field-label { font-size: 0.78rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 0.3rem; }
    .report-field-value { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.6rem 0.8rem; font-size: 0.9rem; color: #0f172a; white-space: pre-wrap; word-break: break-word; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; }
    .report-table th, .report-table td { padding: 0.55rem 0.75rem; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: left; }
    .report-table th { background: #f1f5f9; color: #334155; font-weight: 700; }
    @media print {
      body { background: #fff; color: #111; }
      .report-wrap { background: #fff; border: none; box-shadow: none; padding: 0; }
      .report-header h2, .report-meta, .report-activity h3, .report-field-value, .report-table th, .report-table td { color: #111; border-color: #ccc; }
      .report-field-value { background: #f9f9f9; }
      .report-table th { background: #eee; }
    }
  </style>
</head>
<body>
  <div class="report-wrap">
    ${bodyHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  // ---------- Report Generation ----------
  function generateReport() {
    const a1 = Storage.getActivity('1');
    const a2 = Storage.getActivity('2');
    const a3 = Storage.getActivity('3');
    const a4 = Storage.getActivity('4');

    if (!a1 && !a2 && !a3 && !a4) {
      Toast.show('Complete pelo menos uma atividade antes de gerar o relatório.', 'warning');
      return;
    }

    const student = getStudent();
    if (!student) {
      Toast.show('Identifique-se antes de gerar o relatório.', 'error');
      Nav.showView('login');
      return;
    }

    const now = Utils.formatDate(Utils.nowISO());
    const totalDone = [a1, a2, a3, a4].filter(Boolean).length;
    const isComplete = totalDone === 4;

    // Build the rendered HTML
    let bodyHtml = '';

    // Header
    bodyHtml += `
      <div class="report-header">
        <h2>RELATÓRIO CONSOLIDADO DE ATIVIDADES — HARDWARE</h2>
        <div class="report-meta">
          <strong>Aluno:</strong> ${Utils.escapeHtml(student.name)}<br>
          ${student.turma ? '<strong>Turma:</strong> ' + Utils.escapeHtml(student.turma) + '<br>' : ''}
          <strong>Data de Emissão:</strong> ${now}<br>
          <strong>Disciplina:</strong> Arquitetura e Montagens de Computador — IFCE<br>
          <strong>Professor:</strong> Anderson
        </div>
      </div>
    `;

    // Atividade 1
    if (a1) {
      bodyHtml += renderReport_A1(a1);
    } else {
      bodyHtml += `
        <div class="report-activity">
          <h3>ATIVIDADE 01 — Você Compraria?</h3>
          <p style="color:var(--text-muted);font-style:italic">Atividade não realizada.</p>
        </div>`;
    }

    // Atividade 2
    if (a2) {
      bodyHtml += renderReport_A2(a2);
    } else {
      bodyHtml += `
        <div class="report-activity">
          <h3>ATIVIDADE 02 — Descubra o Clock do Seu Processador</h3>
          <p style="color:var(--text-muted);font-style:italic">Atividade não realizada.</p>
        </div>`;
    }

    // Atividade 3
    if (a3) {
      bodyHtml += renderReport_A3(a3);
    } else {
      bodyHtml += `
        <div class="report-activity">
          <h3>ATIVIDADE 03 — Memória RAM: Aprenda e Investigue</h3>
          <p style="color:var(--text-muted);font-style:italic">Atividade não realizada.</p>
        </div>`;
    }

    // Atividade 4
    if (a4) {
      bodyHtml += renderReport_A4(a4);
    } else {
      bodyHtml += `
        <div class="report-activity">
          <h3>ATIVIDADE 04 — Estudo de Caso: Agência Pixel Rápido</h3>
          <p style="color:var(--text-muted);font-style:italic">Atividade não realizada.</p>
        </div>`;
    }

    const defaultProfEmail = Storage.get('prof_email') || 'anderson.andrade@ifce.edu.br';

    // Assemble the full report container with top delivery options
    const container = document.getElementById('report-content');
    container.innerHTML = `
      <!-- Status Banner -->
      <div class="report-status-banner ${isComplete ? 'all-done' : 'has-pending'}">
        <strong>${isComplete ? '✓ Todas as 4 atividades concluídas!' : 'Atenção:'}</strong>
        ${isComplete
          ? 'Seu relatório está completo com as 4 atividades respondidas e pronto para envio.'
          : `Você completou ${totalDone} de 4 atividades. O professor solicita que as 4 sejam enviadas juntas.`}
      </div>

      <!-- Delivery Card -->
      <div class="report-delivery-card">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Envio do Relatório ao Professor Anderson
        </h3>
        <p>Escolha a melhor opção para entregar suas respostas. Suas três atividades consolidadas estão prontas para envio:</p>

        <div class="report-delivery-input-group">
          <label for="report-prof-email">E-mail do Professor:</label>
          <input type="email" class="form-input" id="report-prof-email" value="${Utils.escapeHtml(defaultProfEmail)}" placeholder="Digite o e-mail do professor">
        </div>

        <div class="report-delivery-grid">
          <button class="btn btn-emerald" id="btn-cloud-submit" style="grid-column: 1 / -1; font-weight:700; background: linear-gradient(135deg, #059669, #4f46e5); color:white; border:none; padding:12px; display:flex; align-items:center; justify-content:center; gap:8px;" title="Entrega o relatório diretamente no servidor do professor">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Entregar Diretamente no Sistema do Professor (Nuvem)
          </button>

          <button class="btn btn-primary" id="btn-email-mailto" title="Abre seu cliente de e-mail automaticamente">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Enviar por E-mail
          </button>

          <button class="btn btn-accent" id="btn-copy-report" title="Copia todas as respostas em texto para você colar no Webmail (Gmail, etc.)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copiar Texto Formatado
          </button>

          <button class="btn btn-emerald" id="btn-download-html" title="Baixa o relatório como arquivo HTML para anexar no e-mail">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Arquivo (.html)
          </button>

          <button class="btn btn-outline" id="btn-print-report" title="Gera o PDF pelo diálogo de impressão do navegador">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <!-- Visual Report Content -->
      <div class="report-content" id="report-view-body">
        ${bodyHtml}
      </div>

      <div class="report-actions">
        <button class="btn btn-outline btn-lg" id="btn-back-from-report">&larr; Voltar ao Início</button>
      </div>
    `;

    // Bind event handlers
    const btnCloudSubmit = document.getElementById('btn-cloud-submit');
    if (btnCloudSubmit) {
      btnCloudSubmit.addEventListener('click', async () => {
        btnCloudSubmit.disabled = true;
        btnCloudSubmit.innerHTML = 'Enviando ao servidor do professor...';
        const plainText = formatReportAsPlainText(student, now, a1, a2, a3, a4);
        const res = await Cloud.submitReport({
          studentName: student.name,
          matricula: student.matricula || 'anonimo',
          turma: student.turma || '',
          activities: { '1': a1, '2': a2, '3': a3, '4': a4 },
          reportText: plainText
        });
        if (res.ok) {
          btnCloudSubmit.innerHTML = '✓ Entregue com Sucesso no Sistema!';
          btnCloudSubmit.style.background = '#059669';
          Toast.show('Relatório entregue com sucesso diretamente ao Professor Anderson!', 'success', 6000);
        } else {
          btnCloudSubmit.disabled = false;
          btnCloudSubmit.innerHTML = 'Entregar Diretamente no Sistema do Professor (Nuvem)';
          Toast.show('Não foi possível entregar na nuvem agora. Utilize o envio por E-mail ou Copiar Texto.', 'warning', 6000);
        }
      });
    }

    document.getElementById('report-prof-email').addEventListener('change', e => {
      Storage.set('prof_email', e.target.value.trim());
    });

    document.getElementById('btn-print-report').addEventListener('click', () => window.print());

    document.getElementById('btn-back-from-report').addEventListener('click', () => {
      updateHomeStatus();
      Nav.showView('home');
    });

    document.getElementById('btn-download-html').addEventListener('click', () => {
      downloadHtmlReport(student, bodyHtml);
      Toast.show('Arquivo do relatório baixado com sucesso! Você pode anexá-lo ao seu e-mail.', 'success', 4500);
    });

    document.getElementById('btn-copy-report').addEventListener('click', async () => {
      const plainText = formatReportAsPlainText(student, now, a1, a2, a3, a4);
      try {
        await navigator.clipboard.writeText(plainText);
        Toast.show('Relatório completo copiado para a área de transferência! Cole no seu e-mail (Ctrl+V).', 'success', 5000);
      } catch (err) {
        // Fallback with textarea
        const ta = document.createElement('textarea');
        ta.value = plainText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        Toast.show('Relatório copiado com sucesso!', 'success', 4000);
      }
    });

    document.getElementById('btn-email-mailto').addEventListener('click', () => {
      const emailInput = document.getElementById('report-prof-email');
      const toEmail = emailInput ? emailInput.value.trim() : defaultProfEmail;
      const subject = `[IFCE - AMC] Relatório de Atividades - ${student.name}${student.turma ? ' - ' + student.turma : ''}`;
      const plainText = formatReportAsPlainText(student, now, a1, a2, a3, a4);

      // Save email for next time
      Storage.set('prof_email', toEmail);

      // Mailto URL (truncate if exceeds practical mailto limit, and inform user)
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(plainText);

      // If text is very long, mailto might get truncated by some operating systems/clients,
      // so we also copy to clipboard to ensure the student never loses any data!
      try {
        navigator.clipboard.writeText(plainText);
      } catch {}

      const mailtoUrl = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`;

      if (mailtoUrl.length > 2000) {
        // Safe mailto with summary and instructions to paste
        const shortBody = `Professor Anderson,\n\nSegue o meu relatório de atividades de Hardware (Processadores, Memória RAM e Estudo de Caso).\n\nAluno: ${student.name}\nTurma: ${student.turma || '—'}\nData: ${now}\nStatus: ${totalDone} de 4 atividades realizadas.\n\n[O relatório completo e detalhado já foi copiado para sua área de transferência. Basta pressionar Ctrl + V aqui para colar todo o conteúdo ou anexar o arquivo HTML gerado na aplicação!]\n\nAtenciosamente,\n${student.name}`;
        window.location.href = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodeURIComponent(shortBody)}`;
        Toast.show('Seu cliente de e-mail foi aberto e o texto completo foi copiado para a área de transferência (Ctrl+V)!', 'info', 6000);
      } else {
        window.location.href = mailtoUrl;
        Toast.show('Abrindo seu aplicativo de e-mail...', 'info');
      }
    });

    Nav.showView('view-report');
  }

  function rf(label, value) {
    return `<div class="report-field">
      <div class="report-field-label">${label}</div>
      <div class="report-field-value">${Utils.escapeHtml(value || '')}</div>
    </div>`;
  }

  function renderReport_A1(data) {
    let h = '<div class="report-activity"><h3>ATIVIDADE 01 — Você Compraria?</h3>';

    // Tabela de processadores
    if (data.processadores) {
      const fields = ['Fabricante','Modelo','Núcleos','Threads','Frequência base','Frequência máxima','Cache','Soquete','Preço aproximado','Perfil de uso'];
      h += '<div class="report-field"><div class="report-field-label">PESQUISA DOS PROCESSADORES</div></div>';
      h += '<table class="report-table"><thead><tr><th>Característica</th><th>Proc. 1</th><th>Proc. 2</th><th>Proc. 3</th></tr></thead><tbody>';
      fields.forEach(f => {
        h += '<tr><td style="font-weight:600;color:var(--text-secondary)">' + f + '</td>';
        for (let p = 1; p <= 3; p++) {
          const v = data.processadores['processador_'+p] ? data.processadores['processador_'+p][f] || '' : '';
          h += '<td>' + Utils.escapeHtml(v) + '</td>';
        }
        h += '</tr>';
      });
      h += '</tbody></table>';
    }

    if (data.escolha) {
      h += rf('PROCESSADOR ESCOLHIDO', data.escolha.processador);
      h += rf('JUSTIFICATIVA DA ESCOLHA', data.escolha.razao);
    }

    if (data.componentes) {
      h += '<div class="report-field"><div class="report-field-label">MONTAGEM DO COMPUTADOR (ORÇAMENTO R$ 5.000)</div></div>';
      h += '<table class="report-table"><thead><tr><th>Componente</th><th>Modelo</th><th>Preço</th></tr></thead><tbody>';
      let total = 0;
      Object.keys(data.componentes).forEach(k => {
        const c = data.componentes[k];
        const num = Utils.parsePrice(c.preco);
        total += num;
        const pr = c.preco ? (String(c.preco).trim().startsWith('R$') ? c.preco : Utils.formatCurrency(num)) : '—';
        h += `<tr>
          <td style="font-weight:600;color:var(--text-secondary)">${Utils.escapeHtml(c.label)}</td>
          <td>${Utils.escapeHtml(c.modelo || '—')}</td>
          <td>${Utils.escapeHtml(pr)}</td>
        </tr>`;
      });
      h += `<tr style="font-weight:700;background:#f1f5f9;color:#0f172a;">
        <td colspan="2">TOTAL CALCULADO</td>
        <td>${Utils.formatCurrency(total)}</td>
      </tr>`;
      h += '</tbody></table>';
    }

    if (data.finalidade) {
      h += rf('FINALIDADE PRINCIPAL', data.finalidade.tipo);
      h += rf('JUSTIFICATIVA DA FINALIDADE', data.finalidade.razao);
    }

    if (data.desafio500) {
      h += rf('DESAFIO R$ 500 — COMPONENTE', data.desafio500.componente);
      h += rf('DESAFIO R$ 500 — JUSTIFICATIVA', data.desafio500.razao);
    }

    h += rf('CONCLUSÃO', data.conclusao);
    h += '</div>';
    return h;
  }

  function renderReport_A2(data) {
    let h = '<div class="report-activity"><h3>ATIVIDADE 02 — Descubra o Clock do Seu Processador</h3>';
    Object.keys(data).forEach(key => {
      const item = data[key];
      h += rf(item.label, item.value);
    });
    h += '</div>';
    return h;
  }

  function renderReport_A3(data) {
    let h = '<div class="report-activity"><h3>ATIVIDADE 03 — Memória RAM: Aprenda e Investigue</h3>';
    Object.keys(data).forEach(key => {
      const item = data[key];
      h += rf(item.label, item.value);
    });
    h += '</div>';
    return h;
  }

  function renderReport_A4(data) {
    let h = '<div class="report-activity"><h3>ATIVIDADE 04 — Estudo de Caso: Agência Pixel Rápido</h3>';
    Object.keys(data).forEach(key => {
      const item = data[key];
      h += rf(item.label, item.value);
    });
    h += '</div>';
    return h;
  }

  // ---------- Init ----------
  async function init() {
    Toast.init();

    // Verifica se já existia aluno logado neste navegador
    const savedStudent = Storage.get('student');
    if (savedStudent && (savedStudent.name || savedStudent.matricula)) {
      loggedStudent = savedStudent;
      setStudentUI(loggedStudent);
      updateHomeStatus();
      Nav.showView('home');

      // Tenta sincronizar silenciosamente com o servidor na nuvem se tiver matrícula
      if (savedStudent.matricula && !savedStudent.offline) {
        Cloud.updateSyncBadge('syncing', 'Sincronizando...');
        const remote = await Cloud.fetchStudentData(savedStudent.matricula);
        if (remote && remote.activities) {
          if (remote.activities['1']) Storage.set('act_1', remote.activities['1']);
          if (remote.activities['2']) Storage.set('act_2', remote.activities['2']);
          if (remote.activities['3']) Storage.set('act_3', remote.activities['3']);
          if (remote.activities['4']) Storage.set('act_4', remote.activities['4']);
          updateHomeStatus();
          Cloud.updateSyncBadge('', 'Sincronizado na nuvem ✓');
        } else {
          Cloud.updateSyncBadge('', 'Sincronizado na nuvem ✓');
        }
      }
    } else {
      Nav.showView('login');
      document.getElementById('nav-home').style.display = 'none';
      document.getElementById('nav-report').style.display = 'none';
      document.getElementById('nav-logout').style.display = 'none';
      document.getElementById('header-student-info').style.display = 'none';
      const syncBadge = document.getElementById('header-sync-status');
      if (syncBadge) syncBadge.style.display = 'none';
    }

    bindGlobalEvents();
  }

  function bindGlobalEvents() {
    // Brand e navegação
    document.getElementById('header-brand').addEventListener('click', () => {
      if (loggedStudent) { updateHomeStatus(); Nav.showView('home'); }
    });

    document.getElementById('nav-home').addEventListener('click', () => {
      if (loggedStudent) { updateHomeStatus(); Nav.showView('home'); }
    });

    document.getElementById('nav-report').addEventListener('click', () => {
      if (loggedStudent) { generateReport(); }
    });

    document.getElementById('nav-logout').addEventListener('click', handleLogout);

    // Abas de login
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchLoginTab('login'));
    if (tabRegBtn) tabRegBtn.addEventListener('click', () => switchLoginTab('register'));

    // Submissão de login
    const btnDoLogin = document.getElementById('btn-do-login');
    if (btnDoLogin) btnDoLogin.addEventListener('click', handleLoginSubmit);
    const loginMat = document.getElementById('login-matricula');
    if (loginMat) loginMat.addEventListener('keydown', e => { if (e.key === 'Enter') handleLoginSubmit(); });
    const loginPass = document.getElementById('login-password');
    if (loginPass) loginPass.addEventListener('keydown', e => { if (e.key === 'Enter') handleLoginSubmit(); });

    // Submissão de registro
    const btnDoReg = document.getElementById('btn-do-register');
    if (btnDoReg) btnDoReg.addEventListener('click', handleRegisterSubmit);
    const regPass = document.getElementById('reg-password');
    if (regPass) regPass.addEventListener('keydown', e => { if (e.key === 'Enter') handleRegisterSubmit(); });

    // Modo offline
    const linkOffline = document.getElementById('link-offline-mode');
    if (linkOffline) linkOffline.addEventListener('click', handleOfflineAccess);

    // Início das atividades
    document.getElementById('btn-start-a1').addEventListener('click', () => Atividade1.start(loggedStudent));
    document.getElementById('btn-start-a2').addEventListener('click', () => Atividade2.start(loggedStudent));
    document.getElementById('btn-start-a3').addEventListener('click', () => Atividade3.start(loggedStudent));
    document.getElementById('btn-start-a4').addEventListener('click', () => Atividade4.start(loggedStudent));
    document.getElementById('btn-generate-report').addEventListener('click', generateReport);

    // Modal do Professor
    const btnOpenProf = document.getElementById('btn-open-prof-panel');
    const profModal = document.getElementById('prof-modal-overlay');
    const btnCloseProf = document.getElementById('btn-close-prof-modal');
    const btnProfAuth = document.getElementById('btn-prof-auth');

    if (btnOpenProf && profModal) {
      btnOpenProf.addEventListener('click', () => {
        profModal.classList.add('active');
        const passInput = document.getElementById('prof-pass-input');
        if (passInput) passInput.focus();
      });
    }

    if (btnCloseProf && profModal) {
      btnCloseProf.addEventListener('click', () => {
        profModal.classList.remove('active');
      });
    }

    if (btnProfAuth) {
      btnProfAuth.addEventListener('click', async () => {
        const pass = document.getElementById('prof-pass-input').value.trim();
        const contentDiv = document.getElementById('prof-panel-content');
        if (!pass) return;

        btnProfAuth.disabled = true;
        btnProfAuth.textContent = 'Carregando...';

        const res = await Cloud.fetchAdminOverview(pass);
        btnProfAuth.disabled = false;
        btnProfAuth.textContent = 'Acessar Painel';

        if (!res.ok) {
          contentDiv.innerHTML = `<div class="form-error-msg visible" style="display:block;margin-top:var(--space-md)">${res.error || 'Senha incorreta ou servidor offline.'}</div>`;
          return;
        }

        const data = res.data;
        contentDiv.innerHTML = `
          <div style="margin-top:var(--space-md);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-sm)">
            <div><strong>${data.totalStudents}</strong> alunos cadastrados &middot; <strong>${data.totalSubmissions}</strong> envios consolidados</div>
            <a href="/api/admin/export.csv?token=${encodeURIComponent(pass)}" class="btn btn-sm btn-emerald" style="padding:6px 12px;font-size:0.8rem" download>Baixar Planilha (CSV)</a>
          </div>

          <div style="overflow-x:auto;margin-top:var(--space-md)">
            <table class="prof-admin-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th>Ativ. 01</th>
                  <th>Ativ. 02</th>
                  <th>Ativ. 03</th>
                  <th>Ativ. 04</th>
                  <th>Envios</th>
                </tr>
              </thead>
              <tbody>
                ${data.students.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">Nenhum aluno cadastrado ainda.</td></tr>' : data.students.map(s => `
                  <tr>
                    <td><code>${Utils.escapeHtml(s.matricula)}</code></td>
                    <td style="font-weight:600">${Utils.escapeHtml(s.name)}</td>
                    <td>${Utils.escapeHtml(s.turma || '—')}</td>
                    <td><span class="status-chip ${s.a1_done ? 'done' : 'pending'}">${s.a1_done ? '✓ Feita' : 'Pendente'}</span></td>
                    <td><span class="status-chip ${s.a2_done ? 'done' : 'pending'}">${s.a2_done ? '✓ Feita' : 'Pendente'}</span></td>
                    <td><span class="status-chip ${s.a3_done ? 'done' : 'pending'}">${s.a3_done ? '✓ Feita' : 'Pendente'}</span></td>
                    <td><span class="status-chip ${s.a4_done ? 'done' : 'pending'}">${s.a4_done ? '✓ Feita' : 'Pendente'}</span></td>
                    <td style="font-weight:700;text-align:center">${s.submissionsCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      });
    }
  }

  return { init, Storage, Utils, Toast, Modal, Nav, getStudent, updateHomeStatus };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
