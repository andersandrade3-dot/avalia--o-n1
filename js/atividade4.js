/* ===================================================
   atividade4.js – Estudo de Caso: O Dilema da Agência Criativa "Pixel Rápido"
   Arquitetura e Montagens de Computador — IFCE — Prof. Anderson
   =================================================== */

const Atividade4 = (() => {
  'use strict';

  let currentStudent = null;

  function start(student) {
    currentStudent = student;
    render();
    loadSavedData();
    App.Nav.showView('view-atividade4');
  }

  function render() {
    const container = document.getElementById('a4-content');
    const e = App.Utils.escapeHtml;

    container.innerHTML = `
      <button class="back-btn" id="a4-back">&larr; Voltar ao início</button>
      <div class="student-banner">${e(currentStudent.name)}${currentStudent.turma ? ' — Turma: ' + e(currentStudent.turma) : ''}</div>

      <h1 class="activity-title">Estudo de Caso: O Dilema da Agência Criativa "Pixel Rápido"</h1>
      <p class="activity-subtitle">Analise o problema real de lentidão de uma agência de marketing, diagnostique os gargalos de hardware e tome a decisão técnica mais eficiente com base na arquitetura de computadores.</p>

      <div class="progress-container">
        <div class="progress-info"><span id="a4-progress-text">Progresso</span><span id="a4-progress-pct">0%</span></div>
        <div class="progress-bar"><div class="progress-fill" id="a4-progress-fill" style="width:0%"></div></div>
      </div>

      <!-- =============================================
           SEÇÃO 1 – CONTEXTO DO PROBLEMA
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number" style="background:linear-gradient(135deg,#f59e0b,#d97706)">1</span> Contexto da Agência Pixel Rápido</h3>
        <div class="learn-content">
          <p>A <strong>Pixel Rápido</strong>, uma agência de marketing digital, está enfrentando sérios problemas de lentidão nas estações de trabalho de seus editores de vídeo e designers gráficos.</p>
          <p>Ao tentar <strong>renderizar vídeos em 4K</strong> e manter <strong>softwares pesados abertos ao mesmo tempo</strong> (como Adobe Photoshop, Premiere Pro e navegadores web com dezenas de abas de pesquisa), as máquinas travam frequentemente e o sistema operacional exibe avisos de <strong>falta de memória</strong>.</p>
        </div>

        <div class="warning-box" style="margin-top:var(--space-md); margin-bottom:0;">
          <strong>Sintomas relatados pela equipe:</strong>
          <ul style="margin-top:var(--space-xs); padding-left:var(--space-lg);">
            <li>Travamentos constantes e congelamento da interface ao trabalhar com vídeos 4K e imagens em alta resolução.</li>
            <li>Avisos recorrentes do sistema operacional alertando: <em>"Memória insuficiente para continuar"</em>.</li>
            <li>Tempo excessivo para abrir arquivos de projetos e iniciar softwares de edição.</li>
          </ul>
        </div>
      </div>

      <!-- =============================================
           SEÇÃO 2 – ESPECIFICAÇÕES ATUAIS E PROPOSTAS
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number" style="background:linear-gradient(135deg,#f59e0b,#d97706)">2</span> Especificações da Máquina Atual e Propostas de Upgrade</h3>
        <p class="section-desc">Analise o hardware em uso e as duas propostas apresentadas pelo departamento de TI:</p>

        <!-- Hardware Atual -->
        <div style="background:#ffffff; border:2px solid #e2e8f0; border-radius:var(--radius-xl); padding:var(--space-lg); margin-bottom:var(--space-xl); box-shadow:var(--shadow-sm);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-md); flex-wrap:wrap; gap:var(--space-xs);">
            <div style="font-weight:800; font-size:1.05rem; color:#0f172a; display:flex; align-items:center; gap:var(--space-xs);">
              <span>💻 Estação de Trabalho Atual (Máquina A)</span>
            </div>
            <span class="card-badge" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca;">Configuração Atual em Uso</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-md);">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); padding:var(--space-md);">
              <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#64748b; margin-bottom:4px;">Processador (CPU)</div>
              <div style="font-weight:700; color:#0f172a; font-size:0.95rem;">Intel Core i3</div>
              <div style="font-size:0.82rem; color:#475569; margin-top:2px;">4 núcleos · 4 threads<br>Clock base: 3.6 GHz · 6 MB Cache L3</div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); padding:var(--space-md);">
              <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#64748b; margin-bottom:4px;">Memória RAM</div>
              <div style="font-weight:700; color:#0f172a; font-size:0.95rem;">8 GB DDR4</div>
              <div style="font-size:0.82rem; color:#475569; margin-top:2px;">Frequência: 2400 MHz<br>Módulo único</div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); padding:var(--space-md);">
              <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#64748b; margin-bottom:4px;">Armazenamento</div>
              <div style="font-weight:700; color:#0f172a; font-size:0.95rem;">HDD de 1 TB</div>
              <div style="font-size:0.82rem; color:#475569; margin-top:2px;">Mecânico · 7200 RPM<br>Interface SATA III</div>
            </div>
          </div>
        </div>

        <p class="section-desc" style="margin-bottom:var(--space-md)">Para resolver o problema com um <strong>orçamento limitado</strong>, o departamento de TI apresentou duas propostas concorrentes:</p>

        <!-- Propostas de TI Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:var(--space-lg);">
          <!-- Opção 1 -->
          <div style="background:#ffffff; border:2px solid #bae6fd; border-radius:var(--radius-xl); padding:var(--space-lg); box-shadow:0 2px 8px rgba(2,132,199,0.06); position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#0284c7,#38bdf8);"></div>
            <div style="font-size:0.72rem; text-transform:uppercase; font-weight:800; color:#0369a1; letter-spacing:0.06em; margin-bottom:4px;">PROPOSTA TI 01</div>
            <h4 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin-bottom:var(--space-sm);">Opção 1: Upgrade de RAM + SSD NVMe</h4>
            <ul class="concept-list" style="margin-bottom:0;">
              <li><span class="concept-marker" style="background:#0284c7"></span> <strong>Memória RAM:</strong> Upgrade para <strong>32 GB DDR4</strong> (4x mais capacidade).</li>
              <li><span class="concept-marker" style="background:#0284c7"></span> <strong>Armazenamento:</strong> Substituição do HDD por um <strong>SSD NVMe de altíssima velocidade</strong>.</li>
              <li><span class="concept-marker" style="background:#0284c7"></span> <strong>Processador:</strong> Mantém o <strong>Intel Core i3 atual</strong> (4C / 4T).</li>
            </ul>
          </div>

          <!-- Opção 2 -->
          <div style="background:#ffffff; border:2px solid #ddd6fe; border-radius:var(--radius-xl); padding:var(--space-lg); box-shadow:0 2px 8px rgba(124,58,237,0.06); position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#7c3aed,#a78bfa);"></div>
            <div style="font-size:0.72rem; text-transform:uppercase; font-weight:800; color:#6d28d9; letter-spacing:0.06em; margin-bottom:4px;">PROPOSTA TI 02</div>
            <h4 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin-bottom:var(--space-sm);">Opção 2: Troca do Processador por Topo de Linha</h4>
            <ul class="concept-list" style="margin-bottom:0;">
              <li><span class="concept-marker" style="background:#7c3aed"></span> <strong>Processador:</strong> Novo processador de última geração topo de linha com <strong>8 núcleos e 16 threads</strong>.</li>
              <li><span class="concept-marker" style="background:#7c3aed"></span> <strong>Memória RAM:</strong> Mantém os <strong>8 GB de RAM DDR4</strong> atuais.</li>
              <li><span class="concept-marker" style="background:#7c3aed"></span> <strong>Armazenamento:</strong> Mantém o <strong>HDD de 1 TB mecânico (7200 RPM)</strong> atual.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- =============================================
           SEÇÃO 3 – QUESTÕES PARA RESOLUÇÃO
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number" style="background:linear-gradient(135deg,#f59e0b,#d97706)">3</span> Questões para Resolução</h3>
        <p class="section-desc">Responda as questões abaixo fundamentando sua análise técnica nos conceitos de hardware estudados:</p>

        <!-- Questão 1 -->
        <div class="form-group">
          <label class="form-label">1. Diagnóstico de Gargalo:</label>
          <span class="form-hint">Considerando a rotina de trabalho descrita (multitarefa pesada e edição de vídeo em 4K), qual é o principal componente que está causando o gargalo mais crítico de desempenho na máquina atual? Justifique sua resposta analisando o impacto conjunto da memória RAM e do tipo de armazenamento.</span>
          <textarea class="form-textarea" id="a4-q1" rows="6" placeholder="Identifique o componente que causa o principal gargalo e justifique o impacto conjunto da RAM de 8 GB e do HDD mecânico..."></textarea>
        </div>

        <!-- Questão 2 -->
        <div class="form-group">
          <label class="form-label">2. O Papel da Memória Cache:</label>
          <span class="form-hint">Explique qual é a função da memória cache L3 presente no processador e de que maneira ela ajuda (ou limita) a execução rápida de instruções durante a edição de vídeos pesados.</span>
          <textarea class="form-textarea" id="a4-q2" rows="6" placeholder="Explique a função da cache L3, sua velocidade em relação à memória RAM e seu comportamento em tarefas pesadas de edição/renderização..."></textarea>
        </div>

        <!-- Questão 3 -->
        <div class="form-group">
          <label class="form-label">3. Tomada de Decisão e Recomendação:</label>
          <span class="form-hint">Entre a Opção 1 e a Opção 2, qual delas você recomendaria para a agência? Justifique sua escolha baseando-se na hierarquia de memórias e no impacto prático que cada alteração trará para o fluxo de trabalho dos designers.</span>
          <textarea class="form-textarea" id="a4-q3" rows="6" placeholder="Apresente sua decisão técnica entre a Opção 1 e a Opção 2, justificando com base na hierarquia de memórias, memória virtual/swap e fluxo diário dos designers..."></textarea>
        </div>
      </div>

      <!-- SALVAR -->
      <div style="text-align:center;margin-top:var(--space-lg)">
        <button class="btn btn-primary btn-lg" id="a4-submit">SALVAR ATIVIDADE</button>
      </div>
    `;

    bindEvents();
    updateProgress();
  }

  const ALL_FIELDS = ['a4-q1', 'a4-q2', 'a4-q3'];

  const LABELS = {
    'a4-q1': '1. Diagnóstico de Gargalo (RAM x Armazenamento)',
    'a4-q2': '2. O Papel da Memória Cache L3',
    'a4-q3': '3. Tomada de Decisão e Recomendação (Opção 1 vs Opção 2)'
  };

  function bindEvents() {
    document.getElementById('a4-back').addEventListener('click', () => {
      App.updateHomeStatus();
      App.Nav.showView('home');
    });
    document.getElementById('a4-submit').addEventListener('click', handleSubmit);
    document.getElementById('a4-content').addEventListener('input', updateProgress);
    document.getElementById('a4-content').addEventListener('change', updateProgress);
  }

  function countAnswered() {
    let c = 0;
    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value.trim()) c++;
    });
    return c;
  }

  function updateProgress() {
    const a = countAnswered();
    const total = ALL_FIELDS.length;
    const pct = Math.round((a / total) * 100);
    document.getElementById('a4-progress-text').textContent = `${a} de ${total} respostas`;
    document.getElementById('a4-progress-pct').textContent = `${pct}%`;
    document.getElementById('a4-progress-fill').style.width = `${pct}%`;
  }

  function collectData() {
    const data = {};
    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      data[id] = {
        label: LABELS[id] || id,
        value: el ? el.value.trim() : ''
      };
    });
    return data;
  }

  function validate() {
    const errors = [];
    if (!document.getElementById('a4-q1').value.trim()) errors.push('Responda a questão 1 — Diagnóstico de Gargalo.');
    if (!document.getElementById('a4-q2').value.trim()) errors.push('Responda a questão 2 — O Papel da Memória Cache.');
    if (!document.getElementById('a4-q3').value.trim()) errors.push('Responda a questão 3 — Tomada de Decisão.');
    return errors;
  }

  function handleSubmit() {
    const errors = validate();
    if (errors.length > 0) {
      App.Toast.show(errors[0], 'error', 5000);
      return;
    }

    App.Modal.show(
      'Salvar atividade',
      'Deseja salvar as respostas do Estudo de Caso?',
      () => {
        App.Storage.saveActivity('4', collectData());
        App.Toast.show('Atividade 04 salva com sucesso!', 'success');
        App.updateHomeStatus();
        App.Nav.showView('home');
      },
      null,
      'SALVAR',
      'CANCELAR'
    );
  }

  function loadSavedData() {
    const saved = App.Storage.getActivity('4');
    if (!saved) return;

    ALL_FIELDS.forEach(id => {
      if (saved[id] && saved[id].value !== undefined) {
        const el = document.getElementById(id);
        if (el) el.value = saved[id].value;
      }
    });

    updateProgress();
  }

  return { start };
})();
