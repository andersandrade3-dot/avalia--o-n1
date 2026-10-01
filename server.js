/**
 * ===================================================================
 * Servidor Backend da Plataforma Educacional de Hardware — IFCE
 * Professor Anderson Andrade — Semestre 2026.2
 *
 * Características:
 *  - 100% nativo em Node.js (sem necessidade de npm install obrigatório)
 *  - Sincronização em nuvem e persistência contínua (data/database.json)
 *  - Suporte multi-dispositivo: celular, tablet, computador de casa e lab
 *  - Detecção automática de IP para acesso via Wi-Fi no celular
 *  - API RESTful completa para login, salvamento em tempo real e relatórios
 * ===================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Configurações
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const PROFESSOR_PASSWORD = process.env.PROF_PASS || 'ifce2026';

// Garante pasta de dados
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializa banco de dados se não existir
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      meta: {
        created: new Date().toISOString(),
        version: '1.0.0',
        disciplina: 'Arquitetura e Montagens de Computador — IFCE',
        professor: 'Anderson Andrade'
      },
      students: {},
      submissions: []
    };
    saveDatabase(initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler database.json, recriando backup:', err);
    return { meta: {}, students: {}, submissions: [] };
  }
}

let db = initDatabase();

function saveDatabase(dataToSave = db) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Erro ao salvar database.json:', err);
  }
}

// Hash simples para senhas dos alunos
function hashPassword(pass) {
  return crypto.createHash('sha256').update(String(pass || '').trim()).digest('hex');
}

// MIME types para arquivos estáticos
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Obter IPs de rede local para celular
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Resposta JSON auxiliar
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// Ler body da requisição
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) { // Limite de 10MB
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  // =====================================================
  // ROTAS DA API REST
  // =====================================================

  // Status / Health
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'online',
      time: new Date().toISOString(),
      studentsCount: Object.keys(db.students || {}).length,
      submissionsCount: (db.submissions || []).length
    });
  }

  // Login / Cadastro de Aluno
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const matricula = String(body.matricula || '').trim().toLowerCase();
      const password = String(body.password || '').trim();
      const name = String(body.name || '').trim();
      const turma = String(body.turma || '').trim();

      if (!matricula) {
        return sendJson(res, 400, { error: 'Matrícula ou identificador é obrigatório.' });
      }

      if (!password) {
        return sendJson(res, 400, { error: 'Senha ou PIN é obrigatório para sincronização entre dispositivos.' });
      }

      const passHash = hashPassword(password);

      // Aluno já existe?
      if (db.students[matricula]) {
        const student = db.students[matricula];
        if (student.passwordHash && student.passwordHash !== passHash) {
          return sendJson(res, 401, {
            error: 'Senha incorreta para esta matrícula. Se você esqueceu, solicite a redefinição ao professor.'
          });
        }

        // Atualiza nome/turma se fornecidos
        if (name) student.name = name;
        if (turma) student.turma = turma;
        student.lastLogin = new Date().toISOString();
        saveDatabase();

        return sendJson(res, 200, {
          success: true,
          isNew: false,
          student: {
            matricula: student.matricula,
            name: student.name,
            turma: student.turma
          },
          activities: student.activities || {},
          submissions: student.submissions || []
        });
      }

      // Novo aluno
      if (!name) {
        return sendJson(res, 400, {
          error: 'Esta matrícula ainda não está cadastrada. Por favor, informe seu nome completo para criar seu acesso.'
        });
      }

      const newStudent = {
        matricula,
        name,
        turma,
        passwordHash: passHash,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        activities: body.initialActivities || {},
        submissions: []
      };

      db.students[matricula] = newStudent;
      saveDatabase();

      return sendJson(res, 201, {
        success: true,
        isNew: true,
        student: {
          matricula: newStudent.matricula,
          name: newStudent.name,
          turma: newStudent.turma
        },
        activities: newStudent.activities,
        submissions: []
      });
    } catch (err) {
      console.error('Erro em /api/auth/login:', err);
      return sendJson(res, 500, { error: 'Erro interno ao processar login.' });
    }
  }

  // Sincronizar atividade individual (chamado em tempo real ao digitar/salvar)
  if (pathname === '/api/sync' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const matricula = String(body.matricula || '').trim().toLowerCase();
      const password = String(body.password || '').trim();
      const activityKey = String(body.activityKey || '').trim();
      const data = body.data;

      if (!matricula || !activityKey || data === undefined) {
        return sendJson(res, 400, { error: 'Parâmetros insuficientes para sincronização.' });
      }

      const student = db.students[matricula];
      if (!student) {
        return sendJson(res, 404, { error: 'Aluno não encontrado no servidor.' });
      }

      // Validação de senha se cadastrada
      if (student.passwordHash && password) {
        if (student.passwordHash !== hashPassword(password)) {
          return sendJson(res, 401, { error: 'Credenciais inválidas.' });
        }
      }

      if (!student.activities) student.activities = {};
      student.activities[activityKey] = data;
      student.lastSyncAt = new Date().toISOString();
      saveDatabase();

      return sendJson(res, 200, {
        success: true,
        activityKey,
        syncedAt: student.lastSyncAt
      });
    } catch (err) {
      console.error('Erro em /api/sync:', err);
      return sendJson(res, 500, { error: 'Erro interno ao sincronizar atividade.' });
    }
  }

  // Obter dados sincronizados de um aluno
  if (pathname.startsWith('/api/student/') && req.method === 'GET') {
    const matricula = pathname.replace('/api/student/', '').trim().toLowerCase();
    const student = db.students[matricula];
    if (!student) {
      return sendJson(res, 404, { error: 'Aluno não encontrado.' });
    }

    return sendJson(res, 200, {
      matricula: student.matricula,
      name: student.name,
      turma: student.turma,
      activities: student.activities || {},
      lastSyncAt: student.lastSyncAt
    });
  }

  // Enviar relatório final consolidado
  if (pathname === '/api/submissions' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const matricula = String(body.matricula || '').trim().toLowerCase();

      const submission = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        matricula: matricula || 'anonimo',
        studentName: body.studentName || 'Não informado',
        turma: body.turma || '',
        submittedAt: new Date().toISOString(),
        activities: body.activities || {},
        reportText: body.reportText || '',
        status: 'enviada',
        grade: null,
        comment: ''
      };

      if (!db.submissions) db.submissions = [];
      db.submissions.push(submission);

      if (matricula && db.students[matricula]) {
        if (!db.students[matricula].submissions) db.students[matricula].submissions = [];
        db.students[matricula].submissions.push(submission);
      }

      saveDatabase();

      return sendJson(res, 201, {
        success: true,
        submissionId: submission.id,
        submittedAt: submission.submittedAt
      });
    } catch (err) {
      console.error('Erro em /api/submissions:', err);
      return sendJson(res, 500, { error: 'Erro ao registrar envio final.' });
    }
  }

  // Área do Professor: Listar todos os alunos e atividades
  if (pathname === '/api/admin/overview' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || urlObj.searchParams.get('token') || '';
    const providedPass = authHeader.replace('Bearer ', '').trim();

    if (providedPass !== PROFESSOR_PASSWORD) {
      return sendJson(res, 401, { error: 'Acesso não autorizado à Área do Professor.' });
    }

    const studentsSummary = Object.values(db.students || {}).map(s => {
      const acts = s.activities || {};
      return {
        matricula: s.matricula,
        name: s.name,
        turma: s.turma,
        createdAt: s.createdAt,
        lastSyncAt: s.lastSyncAt,
        a1_done: !!acts['1'],
        a2_done: !!acts['2'],
        a3_done: !!acts['3'],
        a4_done: !!acts['4'],
        submissionsCount: (s.submissions || []).length
      };
    });

    return sendJson(res, 200, {
      totalStudents: studentsSummary.length,
      totalSubmissions: (db.submissions || []).length,
      students: studentsSummary,
      submissions: db.submissions || []
    });
  }

  // Exportar dados dos alunos em CSV para o professor
  if (pathname === '/api/admin/export.csv' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || urlObj.searchParams.get('token') || '';
    const providedPass = authHeader.replace('Bearer ', '').trim();

    if (providedPass !== PROFESSOR_PASSWORD) {
      return sendJson(res, 401, { error: 'Acesso não autorizado.' });
    }

    let csv = 'Matricula;Nome;Turma;Data Cadastro;Ultima Sincronizacao;Atividade 1;Atividade 2;Atividade 3;Atividade 4;Envios\n';
    Object.values(db.students || {}).forEach(s => {
      const acts = s.activities || {};
      csv += `"${s.matricula}";"${s.name}";"${s.turma || ''}";"${s.createdAt || ''}";"${s.lastSyncAt || ''}";"${acts['1'] ? 'CONCLUIDA' : 'PENDENTE'}";"${acts['2'] ? 'CONCLUIDA' : 'PENDENTE'}";"${acts['3'] ? 'CONCLUIDA' : 'PENDENTE'}";"${acts['4'] ? 'CONCLUIDA' : 'PENDENTE'}";"${(s.submissions || []).length}"\n`;
    });

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="relatorio_alunos_ifce.csv"'
    });
    return res.end('\uFEFF' + csv); // BOM UTF-8 para Excel abrir sem quebra de acentos
  }

  // =====================================================
  // SERVIDOR DE ARQUIVOS ESTÁTICOS (HTML, CSS, JS)
  // =====================================================
  if (req.method === 'GET') {
    let filePath = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(__dirname, safePath);

    // Evita fuga de diretório
    if (!absolutePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('403 Proibido');
    }

    fs.stat(absolutePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Se não encontrar, tenta servir o index.html (SPA fallback)
        const fallbackPath = path.join(__dirname, 'index.html');
        fs.readFile(fallbackPath, (errFallback, content) => {
          if (errFallback) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Arquivo Não Encontrado');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(absolutePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(absolutePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('500 Erro ao ler arquivo');
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      });
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('405 Método Não Permitido');
});

// Inicialização do servidor
server.listen(PORT, HOST, () => {
  const localIps = getLocalIpAddresses();
  console.log('\n' + '='.repeat(68));
  console.log('  🎓 PLATAFORMA EDUCACIONAL — PROCESSADORES & RAM | IFCE');
  console.log('  Professor Anderson Andrade — Arquitetura e Montagens 2026.2');
  console.log('='.repeat(68));
  console.log(`\n  ✅ Servidor online e sincronização em tempo real ativa!`);
  console.log(`\n  💻 Acesso no computador local:`);
  console.log(`     http://localhost:${PORT}`);
  
  if (localIps.length > 0) {
    console.log(`\n  📱 Acesso no celular, tablet ou outros PCs da mesma rede (Wi-Fi/Lab):`);
    localIps.forEach(ip => {
      console.log(`     http://${ip}:${PORT}`);
    });
  }
  console.log(`\n  💾 Banco de dados salvo em: ${DB_FILE}`);
  console.log(`  🔑 Senha de acesso do professor: ${PROFESSOR_PASSWORD}`);
  console.log('='.repeat(68) + '\n');
});
