# Guia de Acesso Multi-Dispositivo & Nuvem
## Plataforma de Atividades — Processadores & Memória RAM | IFCE
**Professor Anderson Andrade — Arquitetura e Montagens de Computador**

---

Com esta nova atualização, a plataforma permite que qualquer aluno:
- Inicie a atividade no computador do laboratório;
- Continue ou revise pelo celular no intervalo;
- Termine em casa no computador ou notebook;
- **Todas as respostas salvas são sincronizadas em tempo real na nuvem/servidor central, sem nunca perder nada!**

---

## 1. Como Usar no Laboratório do IFCE (Celular + PCs do Lab)

Se o professor ou um computador do laboratório iniciar o servidor, todos os computadores e celulares conectados à mesma rede Wi-Fi terão acesso imediato:

1. **No computador do professor (ou qualquer PC do lab):**
   - Dê dois cliques no arquivo `iniciar_servidor.bat` (ou abra o terminal e digite `npm start` ou `node server.js`).
   - O servidor iniciará e mostrará na tela algo como:
     ```text
     ====================================================================
     🎓 PLATAFORMA EDUCACIONAL — PROCESSADORES & RAM | IFCE
     ====================================================================
     ✅ Servidor online e sincronização em tempo real ativa!

     💻 Acesso no computador local:
        http://localhost:3000

     📱 Acesso no celular, tablet ou outros PCs da rede Wi-Fi:
        http://192.168.1.15:3000
     ====================================================================
     ```
2. **Para os alunos acessarem:**
   - **Nos PCs do laboratório:** basta abrir o navegador e digitar `http://localhost:3000` (no próprio PC) ou o IP exibido (ex: `http://192.168.1.15:3000`).
   - **No celular:** o aluno conecta no mesmo Wi-Fi do laboratório, abre o Chrome/Safari no smartphone e digita o endereço (ex: `http://192.168.1.15:3000`).

---

## 2. Como Publicar na Internet para Acessar de Qualquer Lugar (4G / Casa / Nuvem Gratuita)

Para que os alunos acessem de **qualquer lugar do mundo** usando 4G, em casa ou em qualquer rede, você pode hospedar a aplicação gratuitamente em serviços como **Render**, **Railway** ou utilizar um túnel seguro como o **Localtunnel** ou **Cloudflare Tunnel**.

### Opção A: Render.com (Gratuito e Permanente na Nuvem)
1. Crie uma conta gratuita em [render.com](https://render.com).
2. Clique em **New +** e selecione **Web Service**.
3. Conecte o repositório Git deste projeto (ou faça upload para o GitHub).
4. Configure:
   - **Runtime:** `Node`
   - **Build Command:** `npm install` (ou deixe em branco)
   - **Start Command:** `node server.js`
5. Clique em **Deploy**. O Render gerará um link HTTPS seguro como:
   `https://ifce-hardware-atividades.onrender.com`
6. Pronto! Basta passar esse link para todos os alunos acessarem no celular ou em casa.

### Opção B: Acesso Instantâneo via Túnel (Sem criar conta, em 30 segundos)
Se você estiver com o servidor rodando no seu computador e quiser abrir para a internet instantaneamente:
1. Abra um segundo terminal e execute:
   ```bash
   npx localtunnel --port 3000
   ```
2. O terminal gerará um link público seguro (ex: `https://ifce-lab-2026.loca.lt`).
3. Qualquer aluno no celular com 4G em qualquer lugar pode abrir esse link.

---

## 3. Como Funciona o Login & Sincronização dos Alunos

1. **Primeiro Acesso:**
   - O aluno informa:
     - **Matrícula / ID:** (ex: `2024101234` ou email institucional)
     - **Senha ou PIN:** (ex: `1234` ou uma senha simples pessoal)
     - **Nome Completo:** (ex: `João Pedro Pereira`)
     - **Turma:** (ex: `Informática 2A`)
   - O sistema cria o perfil e vincula todas as 4 atividades.

2. **Acessando em outro aparelho (ex: abriu no celular depois de fazer no lab):**
   - O aluno digita apenas sua **Matrícula** e seu **PIN/Senha**.
   - O servidor carrega automaticamente todo o histórico:
     - Atividade 01 (processadores e montagem de R$ 5.000)
     - Atividade 02 (pesquisa de clock e Linux)
     - Atividade 03 (memória RAM e comandos)
     - Atividade 04 (estudo de caso Pixel Rápido)
   - Todos os campos, textos e seleções aparecem preenchidos exatamente como o aluno deixou.

3. **Salvamento em Tempo Real:**
   - Sempre que o aluno preenche uma resposta ou clica em Salvar, o sistema envia a atualização para o servidor.
   - No topo da tela, um indicador visual mostra:
     - 🟢 **Sincronizado na nuvem ✓**
     - 🟡 **Salvando...**
     - 🔵 **Salvo localmente (offline)** (se a internet oscilar, nada é perdido).

---

## 4. Painel do Professor & Exportação de Notas

1. O professor pode visualizar os relatórios e status de todos os alunos acessando a rota administrativa da API:
   - `http://localhost:3000/api/admin/overview?token=ifce2026`
2. Para baixar uma planilha Excel/CSV com todos os alunos e quais atividades foram concluídas:
   - `http://localhost:3000/api/admin/export.csv?token=ifce2026`
