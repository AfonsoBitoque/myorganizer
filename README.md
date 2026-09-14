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
4. Deploy das regras de segurança:
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```
5. Regista uma app Web e copia as credenciais para `.env`:
   ```bash
   cp .env.example .env
   # Edita .env com as tuas credenciais Firebase
   ```

## Desenvolvimento local

```bash
npm install
node scripts/generate-icons.mjs
npm run dev
```

Abre http://localhost:5173

## Deploy (Firebase Hosting)

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Instalar no iPhone

1. Abre a app no Safari (URL do Firebase Hosting ou localhost em dev)
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
