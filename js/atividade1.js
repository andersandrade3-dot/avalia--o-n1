/* ===================================================
   atividade1.js – Você Compraria?
   Arquitetura e Montagens de Computador — IFCE
   =================================================== */

const Atividade1 = (() => {
  'use strict';

  let currentStudent = null;

  const COMPONENTS = [
    { key: 'processador', label: 'Processador',   placeholder: 'Modelo' },
    { key: 'placa_mae',   label: 'Placa-mãe',     placeholder: 'Modelo' },
    { key: 'ram',         label: 'Memória RAM',   placeholder: 'Modelo' },
    { key: 'ssd',         label: 'SSD',           placeholder: 'Modelo' },
    { key: 'fonte',       label: 'Fonte',         placeholder: 'Modelo' },
    { key: 'gabinete',    label: 'Gabinete',      placeholder: 'Modelo' },
    { key: 'gpu',         label: 'Placa de vídeo', placeholder: 'Modelo' }
  ];

  const PROC_FIELDS = [
    'Fabricante', 'Modelo', 'Núcleos', 'Threads',
    'Frequência base', 'Frequência máxima', 'Cache',
    'Soquete', 'Preço aproximado', 'Perfil de uso'
  ];

  const PURPOSES = [
    'PC Gamer', 'Estudos e trabalho', 'Programação',
    'Edição de vídeo', 'Uso empresarial', 'Design e criação'
  ];

  const UPGRADE_OPTIONS = [
    'Processador', 'Memória RAM', 'SSD', 'Placa de vídeo', 'Fonte', 'Outro'
  ];

  const BUDGET = 5000;

  function start(student) {
    currentStudent = student;
    render();
    loadSavedData();
    App.Nav.showView('view-atividade1');
  }

  function render() {
    const container = document.getElementById('a1-content');
    const e = App.Utils.escapeHtml;

    container.innerHTML = `
      <button class="back-btn" id="a1-back">&larr; Voltar ao início</button>
      <div class="student-banner">${e(currentStudent.name)}${currentStudent.turma ? ' — Turma: ' + e(currentStudent.turma) : ''}</div>

      <h1 class="activity-title">Você Compraria?</h1>
      <p class="activity-subtitle">Pesquise três processadores e monte um computador completo com um orçamento de R$ 5.000.</p>

      <div class="progress-container">
        <div class="progress-info">
          <span id="a1-progress-text">Seção 1 de 6</span>
          <span id="a1-progress-pct">0%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="a1-progress-fill" style="width:0%"></div></div>
      </div>

      <!-- SEÇÃO 1: PESQUISA -->
      <div class="section-card">
        <h3><span class="section-number">1</span> Pesquisa dos Processadores</h3>
        <p class="section-desc">Pesquise três processadores e preencha todas as características na tabela comparativa abaixo.</p>
        <div class="proc-table-wrapper">
          <table class="proc-table" id="a1-proc-table">
            <thead><tr><th>Característica</th><th>Processador 1</th><th>Processador 2</th><th>Processador 3</th></tr></thead>
            <tbody>
              ${PROC_FIELDS.map(f => `<tr><td>${f}</td><td><input type="text" data-field="${f}" data-proc="1" placeholder="—"></td><td><input type="text" data-field="${f}" data-proc="2" placeholder="—"></td><td><input type="text" data-field="${f}" data-proc="3" placeholder="—"></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SEÇÃO 2: ESCOLHA -->
      <div class="section-card">
        <h3><span class="section-number">2</span> Escolha do Processador</h3>
        <p class="section-desc">Escolha um dos três processadores pesquisados para montar seu computador.</p>
        <div class="form-group">
          <label class="form-label">Qual dos três processadores você escolheria?</label>
          <div class="option-group">
            ${[1,2,3].map(i => `<div class="option-item"><input type="radio" name="a1-proc-choice" id="a1-choice-${i}" value="Processador ${i}"><label for="a1-choice-${i}">Processador ${i}</label></div>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Por que você escolheu esse processador?</label>
          <span class="form-hint">Justifique considerando características técnicas, soquete, preço e finalidade de uso.</span>
          <textarea class="form-textarea" id="a1-choice-reason" rows="5" placeholder="Escreva sua justificativa aqui..."></textarea>
        </div>
      </div>

      <!-- SEÇÃO 3: MONTE SEU COMPUTADOR -->
      <div class="section-card">
        <h3><span class="section-number">3</span> Monte Seu Computador</h3>
        <p class="section-desc">Selecione os componentes e informe o modelo e preço estimado de cada um dentro do orçamento de R$ 5.000.</p>
        <div class="highlight-box" style="margin-bottom:var(--space-lg)">
          <p style="font-size:1.05rem;font-weight:700;color:var(--accent);margin:0;">Orçamento disponível: R$ 5.000,00</p>
        </div>
        <div id="a1-components">
          <div class="component-row header">
            <span>Componente</span>
            <span>Modelo / Especificação</span>
            <span style="text-align:right">Preço Estimado</span>
          </div>
          ${COMPONENTS.map(c => `
            <div class="component-row" id="row-${c.key}">
              <span class="component-label">${c.label}</span>
              <input type="text" class="form-input" data-comp="${c.key}" data-type="model" placeholder="${c.placeholder}">
              <input type="text" class="form-input" data-comp="${c.key}" data-type="price" placeholder="R$ 0,00" inputmode="decimal">
            </div>
          `).join('')}
        </div>
        <div class="budget-bar" id="a1-budget-bar">
          <div class="budget-item"><div class="budget-label">Total Gasto</div><div class="budget-value" id="a1-total">R$ 0,00</div></div>
          <div class="budget-item"><div class="budget-label">Saldo Restante</div><div class="budget-value under" id="a1-remaining">R$ 5.000,00</div></div>
          <div class="budget-warning" id="a1-budget-warning">Seu orçamento ultrapassou R$ 5.000,00!</div>
        </div>
      </div>

      <!-- SEÇÃO 4: FINALIDADE -->
      <div class="section-card">
        <h3><span class="section-number">4</span> Finalidade</h3>
        <p class="section-desc">Defina para qual finalidade principal essa configuração foi planejada.</p>
        <div class="form-group">
          <label class="form-label">Finalidade do computador</label>
          <div class="option-group">
            ${PURPOSES.map((p,i) => `<div class="option-item"><input type="radio" name="a1-purpose" id="a1-purpose-${i}" value="${p}"><label for="a1-purpose-${i}">${p}</label></div>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Por que essa configuração é adequada para essa finalidade?</label>
          <textarea class="form-textarea" id="a1-purpose-reason" rows="4" placeholder="Explique sua resposta..."></textarea>
        </div>
      </div>

      <!-- SEÇÃO 5: DESAFIO DOS R$ 500 -->
      <div class="section-card">
        <h3><span class="section-number">5</span> Desafio dos R$ 500</h3>
        <div class="challenge-box">
          <h4>Você recebeu mais R$ 500!</h4>
          <p style="margin:0;font-size:0.88rem;color:var(--text-secondary)">Qual componente você melhoraria utilizando esses R$ 500 extras?</p>
        </div>
        <div class="form-group">
          <label class="form-label">Componente a melhorar</label>
          <div class="option-group">
            ${UPGRADE_OPTIONS.map((u,i) => `<div class="option-item"><input type="radio" name="a1-upgrade" id="a1-upgrade-${i}" value="${u}"><label for="a1-upgrade-${i}">${u}</label></div>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Explique por que faria essa melhoria.</label>
          <textarea class="form-textarea" id="a1-upgrade-reason" rows="4" placeholder="Explique sua escolha..."></textarea>
        </div>
      </div>

      <!-- SEÇÃO 6: CONCLUSÃO -->
      <div class="section-card">
        <h3><span class="section-number">6</span> Conclusão</h3>
        <div class="form-group">
          <label class="form-label">Esse é o computador que eu compraria com R$ 5.000 porque...</label>
          <span class="form-hint">Escreva uma conclusão completa sobre sua montagem, considerando equilíbrio de peças, placa-mãe, processador e custo-benefício (mínimo obrigatório de 200 caracteres).</span>
          <textarea class="form-textarea" id="a1-conclusion" rows="6" placeholder="Complete sua conclusão detalhadamente (mínimo de 200 caracteres)..."></textarea>
          <div id="a1-conclusion-counter" style="text-align:right; font-size:0.82rem; margin-top:6px; color:var(--text-muted); font-weight:500;">
            0 / 200 caracteres (faltam 200)
          </div>
        </div>
      </div>

      <div style="text-align:center; margin-top:var(--space-lg)">
        <button class="btn btn-success btn-lg" id="a1-submit">SALVAR ATIVIDADE</button>
      </div>
    `;

    bindEvents();
    updateProgress();
    updateBudget();
    updateConclusionCounter();
  }

  function bindEvents() {
    document.getElementById('a1-back').addEventListener('click', () => { App.updateHomeStatus(); App.Nav.showView('home'); });

    // Inputs de preço dos componentes
    const priceInputs = document.querySelectorAll('#a1-components input[data-type="price"]');
    priceInputs.forEach(input => {
      input.addEventListener('input', () => {
        updateBudget();
        updateProgress();
      });
      input.addEventListener('change', () => {
        updateBudget();
        updateProgress();
      });
      input.addEventListener('keyup', updateBudget);
      input.addEventListener('paste', () => setTimeout(updateBudget, 50));
      input.addEventListener('blur', () => {
        updateBudget();
        const raw = input.value.trim();
        if (raw) {
          const num = parsePrice(raw);
          if (num > 0 && !raw.includes('R$')) {
            input.value = App.Utils.formatCurrency(num);
          }
        }
      });
    });

    // Auto-preenchimento ao escolher processador
    document.querySelectorAll('input[name="a1-proc-choice"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const choice = radio.value;
        const pNum = choice.replace(/\D/g, '');
        if (pNum) {
          const makerInp = document.querySelector(`#a1-proc-table input[data-field="Fabricante"][data-proc="${pNum}"]`);
          const modelInp = document.querySelector(`#a1-proc-table input[data-field="Modelo"][data-proc="${pNum}"]`);
          const priceInp = document.querySelector(`#a1-proc-table input[data-field="Preço aproximado"][data-proc="${pNum}"]`);

          const procModelTarget = document.querySelector('#a1-components input[data-comp="processador"][data-type="model"]');
          const procPriceTarget = document.querySelector('#a1-components input[data-comp="processador"][data-type="price"]');

          if (procModelTarget && !procModelTarget.value.trim() && (makerInp?.value || modelInp?.value)) {
            procModelTarget.value = `${makerInp?.value || ''} ${modelInp?.value || ''}`.trim();
          }
          if (procPriceTarget && !procPriceTarget.value.trim() && priceInp?.value) {
            procPriceTarget.value = priceInp.value.trim();
            updateBudget();
          }
        }
      });
    });

    const concEl = document.getElementById('a1-conclusion');
    if (concEl) {
      concEl.addEventListener('input', () => {
        updateConclusionCounter();
        updateProgress();
      });
    }

    document.getElementById('a1-submit').addEventListener('click', handleSubmit);
    document.getElementById('a1-content').addEventListener('input', updateProgress);
    document.getElementById('a1-content').addEventListener('change', updateProgress);
  }

  function updateConclusionCounter() {
    const el = document.getElementById('a1-conclusion');
    const counter = document.getElementById('a1-conclusion-counter');
    if (!el || !counter) return;
    const len = el.value.trim().length;
    if (len >= 200) {
      counter.textContent = `${len} caracteres (mínimo de 200 atingido ✓)`;
      counter.style.color = 'var(--success)';
    } else {
      const missing = 200 - len;
      counter.textContent = `${len} / 200 caracteres (faltam ${missing})`;
      counter.style.color = len > 0 ? 'var(--warning)' : 'var(--text-muted)';
    }
  }

  function parsePrice(val) {
    if (!val) return 0;
    let str = String(val).replace(/[^\d.,]/g, '').trim();
    if (!str) return 0;

    if (str.includes('.') && str.includes(',')) {
      if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
        // Formato brasileiro: 1.250,50
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato US: 1,250.50
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Decimal com ponto: 600.00 ou 750.50
      } else {
        // Milhar com ponto: 1.500
        str = str.replace(/\./g, '');
      }
    }
    const n = parseFloat(str);
    return isNaN(n) ? 0 : n;
  }

  function updateBudget() {
    let total = 0;
    COMPONENTS.forEach(c => {
      const priceInp = document.querySelector(`#a1-components input[data-comp="${c.key}"][data-type="price"]`);
      if (priceInp) {
        total += parsePrice(priceInp.value);
      }
    });

    const remaining = BUDGET - total;
    const totEl = document.getElementById('a1-total');
    const remEl = document.getElementById('a1-remaining');
    const warnEl = document.getElementById('a1-budget-warning');

    if (totEl) totEl.textContent = App.Utils.formatCurrency(total);
    if (remEl) {
      remEl.textContent = App.Utils.formatCurrency(remaining);
      remEl.className = 'budget-value ' + (remaining < 0 ? 'over' : 'under');
    }
    if (warnEl) {
      warnEl.classList.toggle('visible', remaining < 0);
      warnEl.textContent = remaining < 0
        ? `Atenção: Seu orçamento ultrapassou R$ 5.000,00 em ${App.Utils.formatCurrency(Math.abs(remaining))}!`
        : '';
    }
  }

  function countAnswered() {
    let c = 0;
    document.querySelectorAll('#a1-proc-table input').forEach(i => { if (i.value.trim()) c++; });
    if (document.querySelector('input[name="a1-proc-choice"]:checked')) c++;
    if (document.getElementById('a1-choice-reason').value.trim()) c++;
    document.querySelectorAll('#a1-components input[data-type="model"]').forEach(i => { if (i.value.trim()) c++; });
    document.querySelectorAll('#a1-components input[data-type="price"]').forEach(i => { if (i.value.trim()) c++; });
    if (document.querySelector('input[name="a1-purpose"]:checked')) c++;
    if (document.getElementById('a1-purpose-reason').value.trim()) c++;
    if (document.querySelector('input[name="a1-upgrade"]:checked')) c++;
    if (document.getElementById('a1-upgrade-reason').value.trim()) c++;
    if (document.getElementById('a1-conclusion').value.trim()) c++;
    return c;
  }

  function updateProgress() {
    const answered = countAnswered();
    const totalFields = PROC_FIELDS.length * 3 + 21; // 10*3 + 21 = 51
    const pct = Math.min(100, Math.round((answered / totalFields) * 100));
    const section = answered <= 30 ? 1 : answered <= 32 ? 2 : answered <= 46 ? 3 : answered <= 48 ? 4 : answered <= 50 ? 5 : 6;
    document.getElementById('a1-progress-text').textContent = `Seção ${section} de 6`;
    document.getElementById('a1-progress-pct').textContent = `${pct}%`;
    document.getElementById('a1-progress-fill').style.width = `${pct}%`;
  }

  function collectData() {
    const data = { processadores: {}, escolha: {}, componentes: {}, finalidade: {}, desafio500: {}, conclusao: '' };
    for (let p = 1; p <= 3; p++) {
      data.processadores[`processador_${p}`] = {};
      PROC_FIELDS.forEach(f => {
        const inp = document.querySelector(`#a1-proc-table input[data-field="${f}"][data-proc="${p}"]`);
        data.processadores[`processador_${p}`][f] = inp ? inp.value.trim() : '';
      });
    }
    const cr = document.querySelector('input[name="a1-proc-choice"]:checked');
    data.escolha.processador = cr ? cr.value : '';
    data.escolha.razao = document.getElementById('a1-choice-reason').value.trim();
    COMPONENTS.forEach(c => {
      const m = document.querySelector(`#a1-components input[data-comp="${c.key}"][data-type="model"]`);
      const pr = document.querySelector(`#a1-components input[data-comp="${c.key}"][data-type="price"]`);
      data.componentes[c.key] = { label: c.label, modelo: m ? m.value.trim() : '', preco: pr ? pr.value.trim() : '' };
    });
    const pur = document.querySelector('input[name="a1-purpose"]:checked');
    data.finalidade.tipo = pur ? pur.value : '';
    data.finalidade.razao = document.getElementById('a1-purpose-reason').value.trim();
    const upg = document.querySelector('input[name="a1-upgrade"]:checked');
    data.desafio500.componente = upg ? upg.value : '';
    data.desafio500.razao = document.getElementById('a1-upgrade-reason').value.trim();
    data.conclusao = document.getElementById('a1-conclusion').value.trim();
    return data;
  }

  function validate() {
    const errors = [];
    let pf = 0;
    document.querySelectorAll('#a1-proc-table input').forEach(i => { if (i.value.trim()) pf++; });
    if (pf < 6) errors.push('Preencha pelo menos Fabricante e Modelo dos três processadores pesquisados.');
    if (!document.querySelector('input[name="a1-proc-choice"]:checked')) errors.push('Selecione qual processador você escolheu.');
    if (!document.getElementById('a1-choice-reason').value.trim()) errors.push('Justifique a escolha do processador.');

    const pmModel = document.querySelector('#a1-components input[data-comp="processador"][data-type="model"]');
    const mbModel = document.querySelector('#a1-components input[data-comp="placa_mae"][data-type="model"]');
    const mbPrice = document.querySelector('#a1-components input[data-comp="placa_mae"][data-type="price"]');

    if (!pmModel?.value.trim()) errors.push('Preencha o modelo do Processador na montagem do computador.');
    if (!mbModel?.value.trim() && !mbPrice?.value.trim()) {
      errors.push('Preencha a Placa-mãe (modelo e preço) na montagem do computador.');
    } else if (!mbModel?.value.trim()) {
      errors.push('Informe o modelo da Placa-mãe na montagem do computador.');
    }

    if (!document.querySelector('input[name="a1-purpose"]:checked')) errors.push('Selecione a finalidade do computador.');

    const conclusion = document.getElementById('a1-conclusion').value.trim();
    if (!conclusion) {
      errors.push('Escreva a conclusão da sua montagem.');
    } else if (conclusion.length < 200) {
      errors.push(`A conclusão deve conter no mínimo 200 caracteres para ser salva (atualmente possui ${conclusion.length}, faltam ${200 - conclusion.length}).`);
    }

    return errors;
  }

  function handleSubmit() {
    const errors = validate();
    if (errors.length > 0) { App.Toast.show(errors[0], 'error', 5000); return; }

    App.Modal.show('Salvar atividade', 'Deseja salvar as respostas desta atividade? Você poderá gerar o relatório depois de concluir todas as atividades.',
      () => {
        App.Storage.saveActivity('1', collectData());
        App.Toast.show('Atividade 01 salva com sucesso!', 'success');
        App.updateHomeStatus();
        App.Nav.showView('home');
      }, null, 'SALVAR', 'CANCELAR');
  }

  function loadSavedData() {
    const saved = App.Storage.getActivity('1');
    if (!saved) return;

    if (saved.processadores) {
      for (let p = 1; p <= 3; p++) {
        const proc = saved.processadores[`processador_${p}`];
        if (proc) {
          PROC_FIELDS.forEach(f => {
            const inp = document.querySelector(`#a1-proc-table input[data-field="${f}"][data-proc="${p}"]`);
            if (inp && proc[f]) inp.value = proc[f];
          });
        }
      }
    }

    if (saved.escolha) {
      if (saved.escolha.processador) {
        const r = document.querySelector(`input[name="a1-proc-choice"][value="${saved.escolha.processador}"]`);
        if (r) r.checked = true;
      }
      if (saved.escolha.razao) {
        const rz = document.getElementById('a1-choice-reason');
        if (rz) rz.value = saved.escolha.razao;
      }
    }

    if (saved.componentes) {
      COMPONENTS.forEach(c => {
        const comp = saved.componentes[c.key] || (c.key === 'placa_mae' ? (saved.componentes['placa-mae'] || saved.componentes['placaMae']) : null);
        if (comp) {
          const m = document.querySelector(`#a1-components input[data-comp="${c.key}"][data-type="model"]`);
          const pr = document.querySelector(`#a1-components input[data-comp="${c.key}"][data-type="price"]`);
          if (m && comp.modelo) m.value = comp.modelo;
          if (pr && comp.preco) pr.value = comp.preco;
        }
      });
    }

    if (saved.finalidade) {
      if (saved.finalidade.tipo) {
        const pur = document.querySelector(`input[name="a1-purpose"][value="${saved.finalidade.tipo}"]`);
        if (pur) pur.checked = true;
      }
      if (saved.finalidade.razao) {
        const pr = document.getElementById('a1-purpose-reason');
        if (pr) pr.value = saved.finalidade.razao;
      }
    }

    if (saved.desafio500) {
      if (saved.desafio500.componente) {
        const upg = document.querySelector(`input[name="a1-upgrade"][value="${saved.desafio500.componente}"]`);
        if (upg) upg.checked = true;
      }
      if (saved.desafio500.razao) {
        const ur = document.getElementById('a1-upgrade-reason');
        if (ur) ur.value = saved.desafio500.razao;
      }
    }

    if (saved.conclusao) {
      const conc = document.getElementById('a1-conclusion');
      if (conc) conc.value = saved.conclusao;
    }

    updateBudget();
    updateProgress();
    updateConclusionCounter();
  }

  return { start };
})();
