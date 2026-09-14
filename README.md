# MyOrganizer

PWA pessoal para organização do mestrado em Engenharia Informática — combina gestão de tarefas estilo Jira com bloco de notas.

## Funcionalidades

- **Projetos** — organiza UCs, trabalhos, dissertação, etc.
- **Tarefas** — quadro Kanban (A fazer / Em progresso / Concluído) com prioridade e datas
- **Notas** — bloco de notas com tags, pesquisa e fixação
- **Dashboard** — visão geral do teu progresso
- **PWA** — instalável no iPhone como app nativa
- **Firebase** — dados sincronizados na cloud, acessíveis em qualquer dispositivo

## Configuração do Firebase

1. Cria um projeto em [Firebase Console](https://console.firebase.google.com)
2. Ativa **Authentication** → Email/Password
3. Cria uma base de dados **Firestore** (modo produção)
4. **Regista uma app Web** (ícone `</>`) → copia as credenciais
5. Deploy das regras de segurança (só uma vez):
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add    # escolhe o teu projeto
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```
6. Cria o ficheiro `.env` local:
   ```bash
   cp .env.example .env
   # Cola as credenciais da app Web Firebase
   ```
7. Em **Authentication → Settings → Authorized domains**, adiciona o domínio da Vercel (ex: `myorganizer.vercel.app`)

## Desenvolvimento local

```bash
npm install
node scripts/generate-icons.mjs
npm run dev
```

Abre http://localhost:5173

## Deploy (Vercel)

1. Faz push do repo para o GitHub
2. Vai a [vercel.com](https://vercel.com) → **Add New Project** → importa o repo
3. A Vercel deteta Vite automaticamente (Build: `npm run build`, Output: `dist`)
4. Em **Environment Variables**, adiciona as 6 variáveis do `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Clica **Deploy**
6. Depois do deploy, copia o URL (ex: `https://myorganizer.vercel.app`) e adiciona-o em **Firebase → Authentication → Authorized domains**

## Instalar no iPhone

1. Abre a app no Safari (URL da Vercel ou localhost em dev)
2. Toca no botão **Partilhar** (ícone de quadrado com seta)
3. Seleciona **Adicionar ao Ecrã Principal**
4. A app aparece como ícone no teu iPhone, sem App Store

## Estrutura de dados (Firestore)

```
users/{userId}/
  ├── projects/{projectId}
  ├── tasks/{taskId}
  └── notes/{noteId}
```

Cada utilizador só acede aos seus próprios dados (regras de segurança incluídas).

## Próximas funcionalidades

Esta app foi pensada para crescer contigo. Quando te lembrares de algo, pede para adicionar — calendário, lembretes, anexos, etc.
