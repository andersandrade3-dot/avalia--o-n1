/* ===================================================
   atividade2.js – Descubra o Processador e o Clock
   Ferramentas: Terminal (lscpu), CPU-X ou Hardinfo
   Arquitetura e Montagens de Computador — IFCE
   =================================================== */

const Atividade2 = (() => {
  'use strict';

  let currentStudent = null;

  function start(student) {
    currentStudent = student;
    render();
    loadSavedData();
    App.Nav.showView('view-atividade2');
  }

  function render() {
    const container = document.getElementById('a2-content');
    const e = App.Utils.escapeHtml;

    container.innerHTML = `
      <button class="back-btn" id="a2-back">&larr; Voltar ao início</button>
      <div class="student-banner">${e(currentStudent.name)}${currentStudent.turma ? ' — Turma: ' + e(currentStudent.turma) : ''}</div>

      <h1 class="activity-title">Descubra o Processador e o Clock</h1>
      <p class="activity-subtitle">Investigue as características reais do processador do computador utilizando o Terminal, o CPU-X ou o Hardinfo.</p>

      <div class="progress-container">
        <div class="progress-info"><span id="a2-progress-text">Progresso</span><span id="a2-progress-pct">0%</span></div>
        <div class="progress-bar"><div class="progress-fill" id="a2-progress-fill" style="width:0%"></div></div>
      </div>

      <!-- SEÇÃO 1 – FERRAMENTAS DISPONÍVEIS -->
      <div class="section-card">
        <h3><span class="section-number">1</span> Como investigar o processador no Linux Mint</h3>
        <p class="section-desc">Você pode escolher <strong>qualquer uma das ferramentas abaixo</strong> para consultar as informações do processador deste computador:</p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-md); margin-top:var(--space-md);">
          <!-- Opção A: Terminal -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#4f46e5; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção A: Terminal (Já instalado)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Abra o Terminal (<kbd>Ctrl + Alt + T</kbd>) e execute:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code><span class="code-prefix">$ </span>lscpu</code></div>
          </div>

          <!-- Opção B: CPU-X -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#0284c7; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção B: CPU-X (Interface gráfica)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Caso queira instalar uma ferramenta visual similar ao CPU-Z:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code><span class="code-prefix">$ </span>sudo apt install cpu-x<br><span class="code-prefix">$ </span>cpu-x</code></div>
          </div>

          <!-- Opção C: Hardinfo -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#059669; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção C: Hardinfo (System Profiler)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Visualizador detalhado de todos os dispositivos do sistema:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code><span class="code-prefix">$ </span>sudo apt install hardinfo<br><span class="code-prefix">$ </span>hardinfo</code></div>
          </div>
        </div>

        <div class="info-box" style="margin-top:var(--space-md); margin-bottom:0;">
          <strong>Dica:</strong> Escolha a ferramenta que achar mais conveniente. Todas exibem o modelo, o clock e as especificações do processador.
        </div>
      </div>

      <!-- SEÇÃO 2 – DADOS DO PROCESSADOR (UNIFICADO) -->
      <div class="section-card">
        <h3><span class="section-number">2</span> Dados Identificados do Processador</h3>
        <p class="section-desc">Consulte a ferramenta escolhida e preencha as informações reais do computador:</p>

        <div class="form-group">
          <label class="form-label">Qual ferramenta você utilizou para consultar o processador?</label>
          <div class="option-group">
            <div class="option-item"><input type="radio" name="a2-tool" id="a2-tool-terminal" value="Terminal (lscpu)"><label for="a2-tool-terminal">Terminal (lscpu)</label></div>
            <div class="option-item"><input type="radio" name="a2-tool" id="a2-tool-cpux" value="CPU-X"><label for="a2-tool-cpux">CPU-X</label></div>
            <div class="option-item"><input type="radio" name="a2-tool" id="a2-tool-hardinfo" value="Hardinfo"><label for="a2-tool-hardinfo">Hardinfo</label></div>
            <div class="option-item"><input type="radio" name="a2-tool" id="a2-tool-multiple" value="Mais de uma ferramenta"><label for="a2-tool-multiple">Mais de uma ferramenta</label></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:var(--space-md);">
          <div class="form-group">
            <label class="form-label">Modelo / Nome do Processador *</label>
            <input type="text" class="form-input" id="a2-cpu-model" placeholder="Ex: Intel(R) Core(TM) i5-10400 CPU ou AMD Ryzen 5 5600G">
          </div>
          <div class="form-group">
            <label class="form-label">Fabricante *</label>
            <input type="text" class="form-input" id="a2-cpu-maker" placeholder="Ex: Intel ou AMD">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-md);">
          <div class="form-group">
            <label class="form-label">Quantidade de Núcleos (Cores) *</label>
            <input type="text" class="form-input" id="a2-cpu-cores" placeholder="Ex: 4, 6, 8...">
          </div>
          <div class="form-group">
            <label class="form-label">Quantidade de Threads *</label>
            <input type="text" class="form-input" id="a2-cpu-threads" placeholder="Ex: 8, 12, 16...">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:var(--space-md);">
          <div class="form-group">
            <label class="form-label">Clock do Processador *</label>
            <span class="form-hint">Frequência do processador</span>
            <input type="text" class="form-input" id="a2-cpu-clock" placeholder="Ex: 2.90 GHz ou 3600 MHz">
          </div>
          <div class="form-group">
            <label class="form-label">Memória Cache</label>
            <span class="form-hint">Cache L2 ou L3 identificada</span>
            <input type="text" class="form-input" id="a2-cpu-cache" placeholder="Ex: L3 12 MB ou L2 3MB">
          </div>
          <div class="form-group">
            <label class="form-label">Soquete (Socket)</label>
            <span class="form-hint">Se identificado na ferramenta</span>
            <input type="text" class="form-input" id="a2-cpu-socket" placeholder="Ex: LGA 1200, AM4, ou Não identificado">
          </div>
        </div>
      </div>

      <!-- SEÇÃO 3 – QUESTÕES DE PESQUISA -->
      <div class="section-card">
        <h3><span class="section-number">3</span> Questões de Pesquisa</h3>
        <p class="section-desc">Pesquise e explique com suas palavras os conceitos fundamentais do processador:</p>

        <div class="form-group">
          <label class="form-label">1. Pesquise e explique: O que é o Clock de um processador?</label>
          <span class="form-hint">Explique o que é a frequência de clock, sua unidade de medida (GHz/MHz) e como a frequência se relaciona com os ciclos de processamento de instruções por segundo.</span>
          <textarea class="form-textarea" id="a2-q1" rows="4" placeholder="Pesquise e explique o que é o clock do processador..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">2. Pesquise e explique: O que é um Núcleo (Core) de um processador?</label>
          <span class="form-hint">Explique o que é um núcleo de processamento físico, qual sua função e qual a vantagem de ter múltiplos núcleos na CPU.</span>
          <textarea class="form-textarea" id="a2-q2" rows="4" placeholder="Pesquise e explique o que é um núcleo (core)..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">3. Pesquise e explique: O que são Threads e como elas funcionam?</label>
          <span class="form-hint">Explique o conceito de threads, processamento simultâneo/multitarefa e a relação com os núcleos físicos do processador (ex: Hyper-Threading / SMT).</span>
          <textarea class="form-textarea" id="a2-q3" rows="4" placeholder="Pesquise e explique o que são threads e como funcionam..."></textarea>
        </div>
      </div>

      <!-- SEÇÃO 4 – PERGUNTA PRINCIPAL / REFLEXÃO -->
      <div class="section-card">
        <h3><span class="section-number">4</span> Pergunta de Pesquisa e Análise</h3>
        <div class="highlight-box">
          <p class="highlight-question">"Se dois processadores possuem a mesma quantidade de núcleos, mas um trabalha a 2,8 GHz e outro a 4,0 GHz, podemos afirmar apenas pelo clock que o segundo terá maior desempenho? Explique sua resposta considerando a arquitetura e outros fatores do computador."</p>
        </div>
        <div class="form-group">
          <textarea class="form-textarea" id="a2-main-question" rows="6" placeholder="Escreva sua resposta detalhada e justificada considerando a arquitetura, IPC, geração, memória cache e outros fatores do computador..."></textarea>
        </div>
      </div>

      <div style="text-align:center;margin-top:var(--space-lg)">
        <button class="btn btn-success btn-lg" id="a2-submit">SALVAR ATIVIDADE</button>
      </div>
    `;

    bindEvents();
    updateProgress();
  }

  const ALL_FIELDS = [
    'a2-cpu-model',
    'a2-cpu-maker',
    'a2-cpu-cores',
    'a2-cpu-threads',
    'a2-cpu-clock',
    'a2-cpu-cache',
    'a2-cpu-socket',
    'a2-q1',
    'a2-q2',
    'a2-q3',
    'a2-main-question'
  ];

  const RADIO_FIELD = 'a2-tool';

  const LABELS = {
    'a2-tool-answer': 'Ferramenta utilizada na pesquisa',
    'a2-cpu-model': 'Modelo / Nome do Processador',
    'a2-cpu-maker': 'Fabricante do Processador',
    'a2-cpu-cores': 'Quantidade de Núcleos (Cores)',
    'a2-cpu-threads': 'Quantidade de Threads',
    'a2-cpu-clock': 'Clock do Processador',
    'a2-cpu-cache': 'Memória Cache',
    'a2-cpu-socket': 'Soquete (Socket)',
    'a2-q1': '1. Pesquisa: O que é o Clock do Processador',
    'a2-q2': '2. Pesquisa: O que é um Núcleo (Core) do Processador',
    'a2-q3': '3. Pesquisa: O que são Threads e como funcionam',
    'a2-main-question': 'Pergunta Principal: Comparação 2,8 GHz vs 4,0 GHz e Arquitetura'
  };

  function bindEvents() {
    document.getElementById('a2-back').addEventListener('click', () => { App.updateHomeStatus(); App.Nav.showView('home'); });
    document.getElementById('a2-submit').addEventListener('click', handleSubmit);
    document.getElementById('a2-content').addEventListener('input', updateProgress);
    document.getElementById('a2-content').addEventListener('change', updateProgress);
  }

  function countAnswered() {
    let c = 0;
    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value.trim()) c++;
    });
    if (document.querySelector(`input[name="${RADIO_FIELD}"]:checked`)) c++;
    return c;
  }

  function updateProgress() {
    const a = countAnswered();
    const total = ALL_FIELDS.length + 1; // +1 para o radio da ferramenta
    const pct = Math.min(100, Math.round((a / total) * 100));
    document.getElementById('a2-progress-text').textContent = `${a} de ${total} respostas`;
    document.getElementById('a2-progress-pct').textContent = `${pct}%`;
    document.getElementById('a2-progress-fill').style.width = `${pct}%`;
  }

  function collectData() {
    const data = {};

    const toolRadio = document.querySelector(`input[name="${RADIO_FIELD}"]:checked`);
    data['a2-tool-answer'] = {
      label: LABELS['a2-tool-answer'],
      value: toolRadio ? toolRadio.value : ''
    };

    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      data[id] = { label: LABELS[id] || id, value: el ? el.value.trim() : '' };
    });

    return data;
  }

  function validate() {
    const errors = [];
    if (!document.getElementById('a2-cpu-model').value.trim()) errors.push('Preencha o Modelo/Nome do processador.');
    if (!document.getElementById('a2-cpu-maker').value.trim()) errors.push('Preencha o Fabricante do processador.');
    if (!document.getElementById('a2-cpu-cores').value.trim()) errors.push('Preencha a quantidade de núcleos.');
    if (!document.getElementById('a2-cpu-clock').value.trim()) errors.push('Preencha o Clock do processador.');
    for (let i = 1; i <= 3; i++) {
      if (!document.getElementById(`a2-q${i}`).value.trim()) errors.push(`Responda a questão de pesquisa ${i}.`);
    }
    if (!document.getElementById('a2-main-question').value.trim()) errors.push('Responda a pergunta principal sobre os processadores de 2,8 GHz e 4,0 GHz.');
    return errors;
  }

  function handleSubmit() {
    const errors = validate();
    if (errors.length > 0) { App.Toast.show(errors[0], 'error', 5000); return; }
    App.Modal.show('Salvar atividade', 'Deseja salvar as respostas desta atividade?',
      () => {
        App.Storage.saveActivity('2', collectData());
        App.Toast.show('Atividade 02 salva com sucesso!', 'success');
        App.updateHomeStatus();
        App.Nav.showView('home');
      }, null, 'SALVAR', 'CANCELAR');
  }

  function loadSavedData() {
    const saved = App.Storage.getActivity('2');
    if (!saved) return;

    // Rádio da ferramenta utilizada
    if (saved['a2-tool-answer'] && saved['a2-tool-answer'].value) {
      const val = saved['a2-tool-answer'].value;
      const radio = document.querySelector(`input[name="${RADIO_FIELD}"][value="${val}"]`);
      if (radio) radio.checked = true;
    }

    // Campos diretos
    ALL_FIELDS.forEach(id => {
      if (saved[id] && saved[id].value !== undefined) {
        const el = document.getElementById(id);
        if (el) el.value = saved[id].value;
      }
    });

    // Compatibilidade com dados salvos em versões anteriores
    const modelEl = document.getElementById('a2-cpu-model');
    if (modelEl && !modelEl.value.trim()) {
      const oldModel = saved['a2-lscpu-model']?.value || saved['a2-cpux-name']?.value || saved['a2-hi-proc']?.value;
      if (oldModel) modelEl.value = oldModel;
    }

    const clockEl = document.getElementById('a2-cpu-clock');
    if (clockEl && !clockEl.value.trim()) {
      const oldClock = saved['a2-lscpu-mhz']?.value || saved['a2-cpux-corespeed']?.value || saved['a2-hi-freq']?.value || saved['a2-lscpu-maxmhz']?.value;
      if (oldClock) clockEl.value = oldClock;
    }

    const coresEl = document.getElementById('a2-cpu-cores');
    if (coresEl && !coresEl.value.trim()) {
      const oldCores = saved['a2-lscpu-cores']?.value;
      if (oldCores) coresEl.value = oldCores;
    }

    const threadsEl = document.getElementById('a2-cpu-threads');
    if (threadsEl && !threadsEl.value.trim()) {
      const oldThreads = saved['a2-lscpu-threads']?.value;
      if (oldThreads) threadsEl.value = oldThreads;
    }

    updateProgress();
  }

  return { start };
})();
