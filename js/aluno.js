/* ===================================================
   aluno.js – Minhas Atividades (consulta do aluno)
   =================================================== */

const Aluno = (() => {
  'use strict';

  function load() {
    renderResults();
  }

  function renderResults() {
    const container = document.getElementById('student-content');
    const student = App.getStudent();

    if (!student) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h3>Faça login primeiro</h3>
          <p>Identifique-se na tela inicial para consultar suas atividades.</p>
        </div>
      `;
      return;
    }

    const all = App.Storage.getSubmissions();
    const mine = all.filter(s => s.studentName.toLowerCase() === student.name.toLowerCase());

    container.innerHTML = `
      <button class="back-btn" id="student-back">&larr; Voltar ao início</button>

      <h1 class="activity-title">Minhas Atividades</h1>
      <p class="activity-subtitle">Acompanhe o status das atividades enviadas.</p>

      <div class="student-banner">
        ${App.Utils.escapeHtml(student.name)}${student.turma ? ' — Turma: ' + App.Utils.escapeHtml(student.turma) : ''}
      </div>

      ${mine.length === 0 ? `
        <div class="empty-state" style="padding:var(--space-xl) 0">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m5.25 0 .75 1.5m-.75-1.5-.75 1.5M9.75 16.5l.75 1.5m-.75-1.5-.75 1.5M5.625 4.5H3.75a1.125 1.125 0 0 0-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h16.5c.621 0 1.125-.504 1.125-1.125V5.625a1.125 1.125 0 0 0-1.125-1.125h-1.875" />
            </svg>
          </div>
          <h3>Nenhuma atividade enviada</h3>
          <p>Suas atividades enviadas aparecerão aqui.</p>
        </div>
      ` : `
        <div class="student-activities-list">
          ${mine.map(s => renderStudentActivityCard(s)).join('')}
        </div>
      `}
    `;

    const backBtn = document.getElementById('student-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => App.Nav.showView('home'));
    }
  }

  function renderStudentActivityCard(s) {
    const statusBadge = getStatusBadge(s.status);

    let gradeHtml = '';
    if (s.status === 'corrigida' && s.grade !== null) {
      gradeHtml = `
        <div class="grade-display" style="margin-top:var(--space-md)">
          <div class="grade-value">${s.grade}</div>
          <div class="grade-max">/ 10</div>
        </div>
      `;
    }

    let commentHtml = '';
    if (s.comment) {
      commentHtml = `
        <div class="prof-comment">
          <div class="comment-heading">Comentário do professor</div>
          ${App.Utils.escapeHtml(s.comment)}
        </div>
      `;
    }

    return `
      <div class="student-activity-card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-sm)">
          <div class="activity-name">${App.Utils.escapeHtml(s.activityName)}</div>
          ${statusBadge}
        </div>
        <div class="activity-meta">
          Enviado em: ${App.Utils.formatDate(s.submittedAt)}
          ${s.gradedAt ? ' · Corrigido em: ' + App.Utils.formatDate(s.gradedAt) : ''}
        </div>
        ${gradeHtml}
        ${commentHtml}
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

  return { load };
})();
