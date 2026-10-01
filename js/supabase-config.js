/**
 * =====================================================================
 * supabase-config.js — Conexão Direta com o Supabase (Nuvem Vercel)
 * Plataforma Educacional de Hardware — Professor Anderson Andrade | IFCE
 * =====================================================================
 * 
 * INSTRUÇÕES:
 * 1. No painel do seu Supabase (https://supabase.com/dashboard)
 * 2. Acesse seu projeto -> Settings (ícone de engrenagem) -> API
 * 3. Copie a "Project URL" e a chave pública "anon public"
 * 4. Cole nos campos abaixo entre as aspas:
 */

window.SUPABASE_CONFIG = {
  url: 'https://vqzxjzokdrcmfguctjbj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxenhqem9rZHJjbWZndWN0amJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTk1NzIsImV4cCI6MjEwNjQzNTU3Mn0.Lb_Mvt752mM4iVi0RscQ-_w5wkZjNtCixJX0fmJHID4'
};

const SupabaseClient = (() => {
  'use strict';

  let client = null;

  function getUrl() {
    return (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) 
      || localStorage.getItem('ifce_supabase_url') 
      || '';
  }

  function getKey() {
    return (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) 
      || localStorage.getItem('ifce_supabase_key') 
      || '';
  }

  function getClient() {
    if (client) return client;

    const url = getUrl().trim();
    const key = getKey().trim();

    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(url, key);
      } catch (err) {
        console.warn('Erro ao inicializar Supabase:', err);
      }
    }
    return client;
  }

  function isConfigured() {
    return !!getClient();
  }

  function setCredentials(url, key) {
    if (url) localStorage.setItem('ifce_supabase_url', url.trim());
    if (key) localStorage.setItem('ifce_supabase_key', key.trim());
    client = null;
    return getClient();
  }

  return { getClient, isConfigured, setCredentials, getUrl, getKey };
})();
