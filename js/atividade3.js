/* ===================================================
   atividade3.js – Memória RAM: Aprenda e Investigue
   =================================================== */

const Atividade3 = (() => {
  'use strict';

  let currentStudent = null;

  function start(student) {
    currentStudent = student;
    render();
    loadSavedData();
    App.Nav.showView('view-atividade3');
  }

  function render() {
    const container = document.getElementById('a3-content');
    const e = App.Utils.escapeHtml;

    container.innerHTML = `
      <button class="back-btn" id="a3-back">&larr; Voltar ao início</button>
      <div class="student-banner">${e(currentStudent.name)}${currentStudent.turma ? ' — Turma: ' + e(currentStudent.turma) : ''}</div>

      <h1 class="activity-title">Memória RAM — Aprenda e Investigue</h1>
      <p class="activity-subtitle">Aprenda sobre memória RAM e depois investigue o computador que você está utilizando.</p>

      <div class="progress-container">
        <div class="progress-info"><span id="a3-progress-text">Progresso</span><span id="a3-progress-pct">0%</span></div>
        <div class="progress-bar"><div class="progress-fill" id="a3-progress-fill" style="width:0%"></div></div>
      </div>

      <!-- =============================================
           ETAPA 1 – O QUE É MEMÓRIA RAM?
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">1</span> O que é memória RAM?</h3>
        <div class="learn-content">
          <div class="learn-blockquote">
            <p>A memória RAM (Random Access Memory) é uma memória temporária utilizada pelo computador para armazenar dados e programas que estão sendo utilizados naquele momento.</p>
          </div>

          <h4>Pense na RAM como uma mesa de trabalho</h4>
          <div class="learn-blockquote">
            <p>Quando você está estudando, coloca sobre a mesa os livros, cadernos e materiais que está utilizando naquele momento.</p>
            <p>Quanto maior a mesa, mais coisas podem ficar disponíveis ao mesmo tempo.</p>
            <p>A RAM funciona de maneira parecida: ela mantém temporariamente os dados que o computador precisa acessar rapidamente enquanto os programas estão sendo executados.</p>
          </div>

          <h4>Pontos importantes</h4>
          <ul class="concept-list">
            <li><span class="concept-marker"></span> A RAM é uma memória de trabalho — armazena o que está sendo usado no momento.</li>
            <li><span class="concept-marker"></span> É temporária — os dados armazenados nela são perdidos quando o computador é desligado.</li>
            <li><span class="concept-marker"></span> É diferente do SSD ou HD — o SSD e o HD são utilizados para armazenamento permanente (seus arquivos, fotos, programas instalados).</li>
            <li><span class="concept-marker"></span> A RAM é muito mais rápida que o SSD/HD, mas não mantém os dados sem energia elétrica.</li>
          </ul>
        </div>
      </div>

      <!-- =============================================
           ETAPA 2 – CAPACIDADE DA RAM
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">2</span> Capacidade da RAM</h3>
        <div class="learn-content">
          <p>A capacidade da RAM é medida em GB (gigabytes). Veja como diferentes capacidades se comparam:</p>

          <div class="ram-visual">
            <div class="ram-bar-row">
              <span class="ram-bar-label">4 GB</span>
              <div class="ram-bar-track"><div class="ram-bar-fill gb4"></div></div>
              <span class="ram-bar-desc">Mesa pequena — uso básico</span>
            </div>
            <div class="ram-bar-row">
              <span class="ram-bar-label">8 GB</span>
              <div class="ram-bar-track"><div class="ram-bar-fill gb8"></div></div>
              <span class="ram-bar-desc">Mesa adequada para o dia a dia</span>
            </div>
            <div class="ram-bar-row">
              <span class="ram-bar-label">16 GB</span>
              <div class="ram-bar-track"><div class="ram-bar-fill gb16"></div></div>
              <span class="ram-bar-desc">Mesa confortável para várias tarefas</span>
            </div>
            <div class="ram-bar-row">
              <span class="ram-bar-label">32 GB</span>
              <div class="ram-bar-track"><div class="ram-bar-fill gb32"></div></div>
              <span class="ram-bar-desc">Mesa grande para tarefas pesadas</span>
            </div>
            <div class="ram-bar-row">
              <span class="ram-bar-label">64 GB</span>
              <div class="ram-bar-track"><div class="ram-bar-fill gb64"></div></div>
              <span class="ram-bar-desc">Mesa muito grande — uso profissional</span>
            </div>
          </div>

          <div class="warning-box" style="margin-top:var(--space-lg)">
            <strong>Atenção:</strong> mais RAM não significa automaticamente que o computador ficará mais rápido. Mais RAM permite manter mais dados e programas disponíveis ao mesmo tempo, mas o desempenho geral também depende do processador, do armazenamento (SSD/HD), da placa de vídeo e de outros componentes.
          </div>
        </div>
      </div>

      <!-- =============================================
           ETAPA 3 – DDR4, DDR5, LPDDR5
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">3</span> Tipos de memória: DDR4, DDR5 e LPDDR5</h3>
        <div class="learn-content">
          <p>Existem diferentes tipos (gerações) de memória RAM. Cada geração traz melhorias em velocidade e eficiência. As mais comuns atualmente são:</p>

          <div class="ddr-grid">
            <div class="ddr-card">
              <h4>DDR4</h4>
              <p>Geração anterior à DDR5, ainda muito utilizada em computadores de mesa e notebooks. Oferece bom desempenho a um custo acessível.</p>
            </div>
            <div class="ddr-card">
              <h4>DDR5</h4>
              <p>Geração mais recente, com maior taxa de transferência e melhorias de eficiência em relação ao DDR4. Presente em computadores mais novos.</p>
            </div>
            <div class="ddr-card">
              <h4>LPDDR5</h4>
              <p>Versão de baixo consumo de energia, muito utilizada em notebooks finos, tablets e smartphones. O "LP" significa Low Power.</p>
            </div>
          </div>

          <div class="info-box" style="margin-top:var(--space-md)">
            <strong>DDR4, DDR5 e LPDDR5 não são capacidades diferentes.</strong> São tecnologias diferentes de memória. Uma memória DDR4 de 16 GB e uma DDR5 de 16 GB possuem a mesma capacidade, mas funcionam com tecnologias distintas, com velocidades e características diferentes.
          </div>
        </div>
      </div>

      <!-- =============================================
           ETAPA 4 – COMPARAÇÃO INTERATIVA
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">4</span> Qual você escolheria?</h3>
        <div class="learn-content">
          <p>Considere a situação abaixo e reflita sobre qual configuração seria mais adequada:</p>

          <div class="scenario-grid">
            <div class="scenario-card">
              <h4>Computador A</h4>
              <div class="scenario-value">8 GB RAM</div>
              <p style="font-size:0.82rem;color:var(--text-muted)">Memória DDR4</p>
            </div>
            <div class="scenario-card">
              <h4>Computador B</h4>
              <div class="scenario-value">16 GB RAM</div>
              <p style="font-size:0.82rem;color:var(--text-muted)">Memória DDR4</p>
            </div>
          </div>

          <div class="form-group" style="margin-top:var(--space-lg)">
            <label class="form-label">Para um computador utilizado para estudar, navegar na internet, assistir vídeos e usar vários programas ao mesmo tempo, qual configuração você consideraria mais adequada? Explique.</label>
            <span class="form-hint">Não existe resposta certa ou errada. O objetivo é que você reflita sobre a relação entre capacidade de RAM e uso do computador.</span>
            <textarea class="form-textarea" id="a3-comparison" rows="5" placeholder="Escreva sua reflexão..."></textarea>
          </div>
        </div>
      </div>

      <!-- =============================================
           ETAPA 5 – DESCUBRA A RAM DO SEU COMPUTADOR
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">5</span> Descubra a RAM do seu computador</h3>
        <div class="learn-content">
          <p>Você já aprendeu o que é memória RAM. Agora descubra quanta memória possui o computador que você está utilizando.</p>
          <p>Você pode pesquisar usando o <strong>Terminal</strong>, o <strong>CPU-X</strong> ou o <strong>Hardinfo</strong>:</p>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-md); margin-top:var(--space-md);">
          <!-- Opção A: Terminal -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#059669; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção A: Terminal (Rápido)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">No Terminal (<kbd>Ctrl + Alt + T</kbd>), execute:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code><span class="code-prefix">$ </span>free -h</code></div>
            <p style="font-size:0.78rem; color:var(--text-muted); margin-top:var(--space-xs);">Veja as colunas <em>total</em>, <em>used</em> e <em>available</em> na linha <em>Mem:</em>.</p>
          </div>

          <!-- Opção B: CPU-X -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#0284c7; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção B: CPU-X (Interface gráfica)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Abra o <strong>CPU-X</strong> e clique na aba <strong>Memory</strong>:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code>Aba: Memory &rarr; Size, Type, Frequency</code></div>
            <p style="font-size:0.78rem; color:var(--text-muted); margin-top:var(--space-xs);">Mostra o total de RAM, a tecnologia (DDR4/DDR5) e a frequência.</p>
          </div>

          <!-- Opção C: Hardinfo -->
          <div style="background:var(--bg-section); border:1px solid var(--border); border-radius:var(--radius-lg); padding:var(--space-md);">
            <div style="font-weight:700; color:#4f46e5; margin-bottom:var(--space-xs); font-size:0.95rem;">Opção C: Hardinfo (System Profiler)</div>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Abra o <strong>Hardinfo</strong> no menu do Linux Mint:</p>
            <div class="code-block" style="margin:0; padding:var(--space-sm) var(--space-md); font-size:0.82rem;"><code>Devices &rarr; Memory (ou Summary)</code></div>
            <p style="font-size:0.78rem; color:var(--text-muted); margin-top:var(--space-xs);">Exibe a quantidade total de RAM instalada e memória livre.</p>
          </div>
        </div>

        <h4 style="font-size:0.88rem;font-weight:600;margin:var(--space-lg) 0 var(--space-md)">Preencha com os dados encontrados:</h4>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md)">
          <div class="form-group">
            <label class="form-label">Memória RAM total *</label>
            <input type="text" class="form-input" id="a3-free-total" placeholder="Ex: 8 GB ou 7,7 GiB">
          </div>
          <div class="form-group">
            <label class="form-label">Memória em uso</label>
            <input type="text" class="form-input" id="a3-free-used" placeholder="Ex: 3,2 GiB">
          </div>
          <div class="form-group">
            <label class="form-label">Memória disponível</label>
            <input type="text" class="form-input" id="a3-free-available" placeholder="Ex: 4,1 GiB">
          </div>
        </div>
      </div>

      <!-- =============================================
           ETAPA 6 – PERGUNTAS
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">6</span> Agora você já sabe — Responda</h3>
        <p class="section-desc">Responda as perguntas abaixo com base no que aprendeu e nas informações que encontrou no computador.</p>

        <div class="form-group">
          <label class="form-label">1. Quantos GB de RAM possui o computador que você está utilizando?</label>
          <input type="text" class="form-input" id="a3-q1" placeholder="Ex: 8 GB">
        </div>

        <div class="form-group">
          <label class="form-label">2. Quantos módulos de memória foram identificados?</label>
          <span class="form-hint">Caso identificado no CPU-X, Hardinfo ou Terminal (ou escreva "Não identificado")</span>
          <input type="text" class="form-input" id="a3-q2" placeholder="Ex: 1 módulo, 2 módulos ou Não identificado">
        </div>

        <div class="form-group">
          <label class="form-label">3. Qual é o tipo da memória?</label>
          <div class="option-group">
            <div class="option-item"><input type="radio" name="a3-memtype" id="a3-mt-ddr4" value="DDR4"><label for="a3-mt-ddr4">DDR4</label></div>
            <div class="option-item"><input type="radio" name="a3-memtype" id="a3-mt-ddr5" value="DDR5"><label for="a3-mt-ddr5">DDR5</label></div>
            <div class="option-item"><input type="radio" name="a3-memtype" id="a3-mt-lpddr5" value="LPDDR5"><label for="a3-mt-lpddr5">LPDDR5</label></div>
            <div class="option-item"><input type="radio" name="a3-memtype" id="a3-mt-other" value="Outro"><label for="a3-mt-other">Outro</label></div>
            <div class="option-item"><input type="radio" name="a3-memtype" id="a3-mt-ni" value="Não identificado"><label for="a3-mt-ni">Não identificado</label></div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">4. Qual é a velocidade da memória, caso tenha encontrado essa informação?</label>
          <input type="text" class="form-input" id="a3-q4" placeholder="Ex: 2666 MT/s, 3200 MHz ou Não identificado">
        </div>

        <div class="form-group">
          <label class="form-label">5. A quantidade de RAM encontrada é suficiente para as tarefas realizadas no laboratório? Explique.</label>
          <textarea class="form-textarea" id="a3-q5" rows="4" placeholder="Considere as tarefas que você realizou neste computador..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">6. Qual a diferença entre memória RAM e armazenamento (SSD/HD)?</label>
          <span class="form-hint">Explique com suas palavras, utilizando o que aprendeu nesta atividade.</span>
          <textarea class="form-textarea" id="a3-q7" rows="4" placeholder="Sua resposta..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">7. Por que a memória RAM é considerada uma memória volátil?</label>
          <textarea class="form-textarea" id="a3-q8" rows="3" placeholder="Sua resposta..."></textarea>
        </div>
      </div>

      <!-- =============================================
           ETAPA 7 – REFLEXÃO FINAL
           ============================================= -->
      <div class="section-card">
        <h3><span class="section-number green">7</span> Reflexão Final</h3>

        <div class="highlight-box">
          <p class="highlight-question">"Um computador com 32 GB de RAM será sempre mais rápido que um computador com 8 GB de RAM? Explique sua resposta considerando todos os componentes que influenciam no desempenho."</p>
        </div>

        <div class="form-group">
          <textarea class="form-textarea" id="a3-reflection" rows="6" placeholder="Escreva sua reflexão completa..."></textarea>
        </div>
      </div>

      <!-- SALVAR -->
      <div style="text-align:center;margin-top:var(--space-lg)">
        <button class="btn btn-emerald btn-lg" id="a3-submit">SALVAR ATIVIDADE</button>
      </div>
    `;

    bindEvents();
    updateProgress();
  }

  const ALL_FIELDS = [
    'a3-comparison',
    'a3-free-total', 'a3-free-used', 'a3-free-available',
    'a3-q1', 'a3-q2', 'a3-q4', 'a3-q5', 'a3-q7', 'a3-q8',
    'a3-reflection'
  ];

  // Campos tipo radio precisam de tratamento especial
  const RADIO_FIELD = 'a3-memtype';

  const LABELS = {
    'a3-comparison': 'Comparação 8 GB vs 16 GB — Reflexão',
    'a3-free-total': 'Memória RAM total',
    'a3-free-used': 'Memória em uso',
    'a3-free-available': 'Memória disponível',
    'a3-q1': '1. Quantos GB de RAM possui o computador?',
    'a3-q2': '2. Quantos módulos foram identificados?',
    'a3-memtype-answer': '3. Tipo da memória (seleção)',
    'a3-q4': '4. Velocidade da memória',
    'a3-q5': '5. A RAM encontrada é suficiente? Explique.',
    'a3-q7': '6. Diferença entre RAM e armazenamento (SSD/HD)',
    'a3-q8': '7. Por que a RAM é volátil?',
    'a3-reflection': 'Reflexão final — 32 GB vs 8 GB'
  };

  function bindEvents() {
    document.getElementById('a3-back').addEventListener('click', () => { App.updateHomeStatus(); App.Nav.showView('home'); });
    document.getElementById('a3-submit').addEventListener('click', handleSubmit);
    document.getElementById('a3-content').addEventListener('input', updateProgress);
    document.getElementById('a3-content').addEventListener('change', updateProgress);
  }

  function countAnswered() {
    let c = 0;
    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value.trim()) c++;
    });
    // Radio
    if (document.querySelector(`input[name="${RADIO_FIELD}"]:checked`)) c++;
    return c;
  }

  function updateProgress() {
    const a = countAnswered();
    const total = ALL_FIELDS.length + 1; // +1 for radio
    const pct = Math.round((a / total) * 100);
    document.getElementById('a3-progress-text').textContent = `${a} de ${total} respostas`;
    document.getElementById('a3-progress-pct').textContent = `${pct}%`;
    document.getElementById('a3-progress-fill').style.width = `${pct}%`;
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

    // Radio
    const radio = document.querySelector(`input[name="${RADIO_FIELD}"]:checked`);
    data['a3-memtype-answer'] = {
      label: LABELS['a3-memtype-answer'],
      value: radio ? radio.value : ''
    };

    return data;
  }

  function validate() {
    const errors = [];
    if (!document.getElementById('a3-free-total').value.trim()) errors.push('Preencha a memória RAM total (free -h).');
    if (!document.getElementById('a3-q1').value.trim()) errors.push('Responda a pergunta 1.');
    if (!document.getElementById('a3-q5').value.trim()) errors.push('Responda a pergunta 5.');
    if (!document.getElementById('a3-q7').value.trim()) errors.push('Responda a pergunta 7 — diferença entre RAM e SSD/HD.');
    if (!document.getElementById('a3-reflection').value.trim()) errors.push('Escreva a reflexão final.');
    if (!document.getElementById('a3-comparison').value.trim()) errors.push('Escreva sua reflexão na comparação 8 GB vs 16 GB.');
    return errors;
  }

  function handleSubmit() {
    const errors = validate();
    if (errors.length > 0) { App.Toast.show(errors[0], 'error', 5000); return; }

    App.Modal.show('Salvar atividade', 'Deseja salvar as respostas desta atividade?',
      () => {
        App.Storage.saveActivity('3', collectData());
        App.Toast.show('Atividade 03 salva com sucesso!', 'success');
        App.updateHomeStatus();
        App.Nav.showView('home');
      }, null, 'SALVAR', 'CANCELAR');
  }

  function loadSavedData() {
    const saved = App.Storage.getActivity('3');
    if (!saved) return;

    ALL_FIELDS.forEach(id => {
      if (saved[id] && saved[id].value !== undefined) {
        const el = document.getElementById(id);
        if (el) el.value = saved[id].value;
      }
    });

    if (saved['a3-memtype-answer'] && saved['a3-memtype-answer'].value) {
      const val = saved['a3-memtype-answer'].value;
      const radio = document.querySelector(`input[name="${RADIO_FIELD}"][value="${val}"]`);
      if (radio) radio.checked = true;
    }

    updateProgress();
  }

  return { start };
})();
