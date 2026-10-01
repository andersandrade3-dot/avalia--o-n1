-- =====================================================================
-- SCRIPT SQL DE CONFIGURAÇÃO DO BANCO DE DADOS NO SUPABASE
-- Plataforma Educacional de Hardware — Processadores & Memória RAM | IFCE
-- Professor Anderson Andrade — Semestre 2026.2
-- =====================================================================
-- INSTRUÇÕES:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor" (ícone de código)
-- 3. Cole todo o conteúdo deste arquivo e clique no botão verde "RUN"
-- =====================================================================

-- 1. Criação da tabela de Alunos
CREATE TABLE IF NOT EXISTS public.students (
    matricula TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    turma TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    activities JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sync_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação da tabela de Envios Finais / Relatórios
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    matricula TEXT NOT NULL,
    student_name TEXT NOT NULL,
    turma TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    activities JSONB DEFAULT '{}'::jsonb,
    report_text TEXT DEFAULT '',
    status TEXT DEFAULT 'enviada',
    grade NUMERIC DEFAULT NULL,
    comment TEXT DEFAULT ''
);

-- 3. Habilita Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso Público (via Anon Key para Alunos e Professor)
-- Permite leitura de alunos
DROP POLICY IF EXISTS "Permitir leitura anonima de alunos" ON public.students;
CREATE POLICY "Permitir leitura anonima de alunos" 
ON public.students FOR SELECT 
TO anon, authenticated 
USING (true);

-- Permite inserção de novos alunos (cadastro)
DROP POLICY IF EXISTS "Permitir cadastro anonimo de alunos" ON public.students;
CREATE POLICY "Permitir cadastro anonimo de alunos" 
ON public.students FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permite atualização das atividades salvas
DROP POLICY IF EXISTS "Permitir atualizacao anonima de atividades" ON public.students;
CREATE POLICY "Permitir atualizacao anonima de atividades" 
ON public.students FOR UPDATE 
TO anon, authenticated 
USING (true);

-- Permite envio de relatórios finais
DROP POLICY IF EXISTS "Permitir leitura anonima de envios" ON public.submissions;
CREATE POLICY "Permitir leitura anonima de envios" 
ON public.submissions FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir criacao anonima de envios" ON public.submissions;
CREATE POLICY "Permitir criacao anonima de envios" 
ON public.submissions FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Índices para buscas rápidas por matrícula e turma
CREATE INDEX IF NOT EXISTS idx_students_matricula ON public.students (matricula);
CREATE INDEX IF NOT EXISTS idx_submissions_matricula ON public.submissions (matricula);
