/* ===================================================
   professor.js – Área do Professor
   =================================================== */

const Professor = (() => {
  'use strict';

  let currentFilter = 'all';

  function load() {
    renderList();
  }

  function renderList() {
    const container = document.getElementById('prof-content');
    const submissions = App.Storage.getSubmissions();

    const filtered = currentFilter === 'all'
      ? submissions
      : submissions.filter(s => s.activity === currentFilter);

    container.innerHTML = `
      <button class="back-btn" id="prof-back">&larr; Voltar ao início</button>

      <h1 class="activity-title">Área do Professor</h1>
      <p class="activity-subtitle">Visualize, corrija e atribua notas às atividades dos alunos.</p>

      <div class="prof-tabs">
        <button class="prof-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>
        <button class="prof-tab ${currentFilter === 'atividade1' ? 'active' : ''}" data-filter="atividade1">Atividade 01</button>
        <button class="prof-tab ${currentFilter === 'atividade2' ? 'active' : ''}" data-filter="atividade2">Atividade 02</button>
      </div>

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m5.25 0 .75 1.5m-.75-1.5-.75 1.5M9.75 16.5l.75 1.5m-.75-1.5-.75 1.5M5.625 4.5H3.75a1.125 1.125 0 0 0-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h16.5c.621 0 1.125-.504 1.125-1.125V5.625a1.125 1.125 0 0 0-1.125-1.125h-1.875" />
            </svg>
          </div>
          <h3>Nenhuma atividade encontrada</h3>
          <p>As atividades enviadas pelos alunos aparecerão aqui.</p>
        </div>
      ` : `
        <div class="prof-submissions-list">
          ${filtered.map(s => renderSubmissionCard(s)).join('')}
        </div>
      `}
    `;

    document.getElementById('prof-back').addEventListener('click', () => App.Nav.showView('home'));

    document.querySelectorAll('.prof-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentFilter = tab.dataset.filter;
        renderList();
      });
    });

    document.querySelectorAll('.btn-view-submission').forEach(btn => {
      btn.addEventListener('click', () => {
        viewSubmission(btn.dataset.id);
      });
    });
  }

  function renderSubmissionCard(s) {
    const statusBadge = getStatusBadge(s.status);
    return `
      <div class="submission-card">
        <div class="submission-info">
          <div class="student-name">${App.Utils.escapeHtml(s.studentName)}</div>
          ${s.studentTurma ? `<div class="student-turma">Turma: ${App.Utils.escapeHtml(s.studentTurma)}</div>` : ''}
          <div class="submission-meta">
            ${App.Utils.escapeHtml(s.activityName)} · ${App.Utils.formatDate(s.submittedAt)}
          </div>
        </div>
        <div class="submission-actions">
          ${statusBadge}
          ${s.grade !== null ? `<span style="font-weight:700;color:var(--success);font-size:0.88rem">${s.grade}/10</span>` : ''}
          <button class="btn btn-primary btn-sm btn-view-submission" data-id="${s.id}">Abrir</button>
        </div>
      </div>
    `;
  }

  function getStatusBadge(status) {
    const map = {
      'rascunho': '<span class="badge badge-draft">Rascunho</span>',
      'enviada': '<span class="badge badge-sent">Enviada</span>',
      'em_correcao': '<span class="badge badge-reviewing">Em correção</span>',
      'corrigida': '<span class="badge badge-graded">Corrigida</span>'
    };
    return map[status] || map['enviada'];
  }

  function viewSubmission(id) {
    const s = App.Storage.getSubmissionById(id);
    if (!s) {
      App.Toast.show('Atividade não encontrada.', 'error');
      return;
    }

    const container = document.getElementById('prof-content');

    let responsesHtml = '';

    if (s.activity === 'atividade1') {
      responsesHtml = renderAtividade1Responses(s.data);
    } else if (s.activity === 'atividade2') {
      responsesHtml = renderAtividade2Responses(s.data);
    }

    container.innerHTML = `
      <button class="back-btn" id="prof-detail-back">&larr; Voltar à lista</button>

      <h1 class="activity-title">${App.Utils.escapeHtml(s.activityName)}</h1>

      <div class="section-card" style="margin-bottom:var(--space-lg)">
        <div class="summary-row">
          <span class="label">Aluno</span>
          <span class="value">${App.Utils.escapeHtml(s.studentName)}</span>
        </div>
        <div class="summary-row">
          <span class="label">Turma</span>
          <span class="value">${s.studentTurma ? App.Utils.escapeHtml(s.studentTurma) : '—'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Data de envio</span>
          <span class="value">${App.Utils.formatDate(s.submittedAt)}</span>
        </div>
        <div class="summary-row">
          <span class="label">Status</span>
          <span class="value">${getStatusBadge(s.status)}</span>
        </div>
        ${s.grade !== null ? `
          <div class="summary-row">
            <span class="label">Nota</span>
            <span class="value" style="font-weight:800;color:var(--success)">${s.grade} / 10</span>
          </div>
        ` : ''}
      </div>

      <div class="section-card">
        <h3>Respostas do aluno</h3>
        <div style="margin-top:var(--space-lg)">
          ${responsesHtml}
        </div>
      </div>

      <div class="correction-panel">
        <h3>Correção</h3>

        <div class="form-group">
          <label class="form-label">Nota (0 a 10)</label>
          <input type="number" class="form-input" id="prof-grade" min="0" max="10" step="0.5" value="${s.grade !== null ? s.grade : ''}" placeholder="Ex: 8.5" style="max-width:150px">
        </div>

        <div class="form-group">
          <label class="form-label">Comentário do professor</label>
          <textarea class="form-textarea" id="prof-comment" rows="4" placeholder="Escreva observações sobre a atividade do aluno...">${App.Utils.escapeHtml(s.comment || '')}</textarea>
        </div>

        <div class="btn-group">
          <button class="btn btn-success" id="prof-save-correction" data-id="${s.id}">SALVAR CORREÇÃO</button>
          <button class="btn btn-outline" id="prof-cancel-correction">Voltar</button>
        </div>
      </div>
    `;

    document.getElementById('prof-detail-back').addEventListener('click', () => renderList());
    document.getElementById('prof-cancel-correction').addEventListener('click', () => renderList());
    document.getElementById('prof-save-correction').addEventListener('click', () => {
      saveCorrection(id);
    });
  }

  function saveCorrection(id) {
    const s = App.Storage.getSubmissionById(id);
    if (!s) return;

    const gradeInput = document.getElementById('prof-grade');
    const commentInput = document.getElementById('prof-comment');

    const gradeVal = gradeInput.value.trim();

    if (gradeVal === '') {
      App.Toast.show('Informe a nota do aluno.', 'warning');
      return;
    }

    const grade = parseFloat(gradeVal);
    if (isNaN(grade) || grade < 0 || grade > 10) {
      App.Toast.show('A nota deve ser entre 0 e 10.', 'error');
      return;
    }

    s.grade = grade;
    s.comment = commentInput.value.trim();
    s.status = 'corrigida';
    s.gradedAt = new Date().toISOString();

    App.Storage.saveSubmission(s);
    App.Toast.show('Correção salva com sucesso!', 'success');
    renderList();
  }

  function renderAtividade1Responses(data) {
    if (!data) return '<p style="color:var(--text-muted)">Sem dados.</p>';
    let html = '';

    if (data.processadores) {
      html += '<h4 style="margin-bottom:var(--space-md);color:#a5b4fc">Seção 1 – Pesquisa dos Processadores</h4>';
      html += '<div class="response-table-wrapper"><table class="response-table"><thead><tr><th>Característica</th><th>Processador 1</th><th>Processador 2</th><th>Processador 3</th></tr></thead><tbody>';
      
      const fields = ['Fabricante', 'Modelo', 'Núcleos', 'Threads', 'Frequência base', 'Frequência máxima', 'Cache', 'Soquete', 'Ano de lançamento', 'Preço aproximado', 'Perfil de uso'];
      fields.forEach(f => {
        html += `<tr><td style="font-weight:500">${f}</td>`;
        for (let p = 1; p <= 3; p++) {
          const val = data.processadores[`processador_${p}`] ? data.processadores[`processador_${p}`][f] || '—' : '—';
          html += `<td>${App.Utils.escapeHtml(val)}</td>`;
        }
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    }

    if (data.escolha) {
      html += '<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">Seção 2 – Escolha</h4>';
      html += renderResponseBlock('Processador escolhido', data.escolha.processador);
      html += renderResponseBlock('Justificativa', data.escolha.razao);
    }

    if (data.componentes) {
      html += '<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">Seção 3 – Monte Seu Computador</h4>';
      Object.keys(data.componentes).forEach(key => {
        const c = data.componentes[key];
        html += renderResponseBlock(c.label, `Modelo: ${c.modelo || '—'} | Preço: ${c.preco || '—'}`);
      });
    }

    if (data.finalidade) {
      html += '<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">Seção 4 – Finalidade</h4>';
      html += renderResponseBlock('Finalidade', data.finalidade.tipo);
      html += renderResponseBlock('Justificativa', data.finalidade.razao);
    }

    if (data.desafio500) {
      html += '<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">Seção 5 – Desafio dos R$ 500</h4>';
      html += renderResponseBlock('Componente a melhorar', data.desafio500.componente);
      html += renderResponseBlock('Justificativa', data.desafio500.razao);
    }

    if (data.conclusao !== undefined) {
      html += '<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">Seção 6 – Conclusão</h4>';
      html += renderResponseBlock('Conclusão', data.conclusao);
    }

    return html;
  }

  function renderAtividade2Responses(data) {
    if (!data) return '<p style="color:var(--text-muted)">Sem dados.</p>';
    let html = '';

    // Agrupar por ferramenta
    const groups = {
      'lscpu': [],
      'CPU-X': [],
      'Hardinfo': [],
      'Questões': [],
      'Desafios': []
    };

    Object.keys(data).forEach(key => {
      const item = data[key];
      if (key.startsWith('a2-lscpu')) groups['lscpu'].push(item);
      else if (key.startsWith('a2-cpux')) groups['CPU-X'].push(item);
      else if (key.startsWith('a2-hi')) groups['Hardinfo'].push(item);
      else if (key.startsWith('a2-q')) groups['Questões'].push(item);
      else groups['Desafios'].push(item);
    });

    Object.keys(groups).forEach(groupName => {
      if (groups[groupName].length > 0) {
        html += `<h4 style="margin:var(--space-lg) 0 var(--space-md);color:#a5b4fc">${groupName}</h4>`;
        groups[groupName].forEach(item => {
          html += renderResponseBlock(item.label, item.value);
        });
      }
    });

    return html;
  }

  function renderResponseBlock(question, answer) {
    return `
      <div class="response-block">
        <div class="response-question">${App.Utils.escapeHtml(question || '')}</div>
        <div class="response-answer">${App.Utils.escapeHtml(answer || '—')}</div>
      </div>
    `;
  }

  return { load };
})();
