**Sumário**

- **Descrição**: visão geral do projeto
- **Estrutura**: principais arquivos e pastas
- **Requisitos**: dependências necessárias
- **Como Rodar**: instruções para executar localmente
- **APIs Principais**: endpoints úteis para integração
- **Notas**: observações sobre o banco local

**Descrição**
Projeto de exemplo chamado Connexa: um sistema simples de chat em grupo para estudantes.
Backend em Node/Express com banco SQLite (local) e frontend estático em HTML/CSS/JS.

**Estrutura do Projeto**

- **backend/**: código do servidor Express ([backend/server.js](backend/server.js))
- **backend/database.js**: funções de acesso ao SQLite
- **backend/src/routes/**: rotas da API (`auth.js`, `chats.js`, `grupos.js`)
- **frontend/**: arquivos estáticos (HTML/CSS/JS)
- **frontend/chat.html**: página principal do chat
- **frontend/scripts/chat.js**: lógica do cliente para chat e lista de grupos

**Requisitos**

- Node.js >= 14
- npm (ou yarn)

**Instalação (uma vez)**

1. Abra um terminal na raiz do projeto.
2. Instale dependências:

```bash
npm install
```

**Como Rodar (desenvolvimento)**

1. Inicie o servidor backend (servirá também os arquivos estáticos do frontend):

```bash
node backend/server.js
# ou, se configurado no package.json:
npm start
```

2. Abra no navegador:

- `http://localhost:3000` → redireciona para `chat.html` (rotas desconhecidas também servem o frontend)

3. Faça login em `login.html` para usar as APIs autenticadas. O token JWT fica salvo em `localStorage` como `authToken`.

**Variáveis de Ambiente**

- `PORT` — porta do servidor (padrão `3000`)
- `JWT_SECRET` — segredo para assinar tokens JWT (padrão `conexxa-secret` se não definido)

Defina-as antes de iniciar se quiser comportamento diferente:

```bash
export PORT=4000
export JWT_SECRET=meu-segredo
node backend/server.js
```

**Banco de Dados**

- O projeto usa um arquivo SQLite local em `database/` (ex: `database/conexxa.db`).
- Este arquivo pode ser mantido localmente e idealmente adicionado ao `.gitignore` em ambientes de desenvolvimento.

**APIs Principais (resumo rápido)**

- `POST /api/usuarios/register` — criar usuário (body: `nome`, `email`, `senha`)
- `POST /api/usuarios/login` — autenticar (body: `email`, `senha`) → retorna `token`
- `GET /api/chats` — lista grupos que o usuário participa (autenticado)
- `GET /api/chats/:groupId` — obter mensagens de um grupo (autenticado)
- `POST /api/chats/:groupId/send` — enviar mensagem (autenticado, body: `conteudo`)
- `GET /api/grupos?search=termo` — buscar grupos por nome (autenticado)
- `POST /api/grupos` — criar novo grupo (autenticado, body: `nome`, `descricao`)
- `POST /api/grupos/:groupId/join` — entrar em grupo (autenticado)

Exemplo rápido (PowerShell / Invoke-RestMethod):

```powershell
$token = "<SEU_TOKEN>"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/grupos" -Headers $headers -ContentType "application/json" -Body (@{ nome = 'Grupo Teste'; descricao = 'Descrição' } | ConvertTo-Json)
```

Buscar grupos (exemplo):

```bash
# curl
curl "http://localhost:3000/api/grupos?search=algoritmos" -H "Authorization: Bearer <TOKEN>"
```

**Observações / Dicas**

- O servidor está configurado para servir `chat.html` para qualquer rota que não comece com `/api`, facilitando deep-links do frontend (ex.: `/chat.html?groupId=1` ou `/qualquer-coisa`).
- Se receber erro do Git ao trocar de branch por causa do arquivo do DB, pare o servidor (feche conexões com o arquivo SQLite), ou ignore o `database/conexxa.db` no `.gitignore`.
- Para desenvolvimento rápido, abra o console do navegador e recupere o token com: `localStorage.getItem('authToken')`.

**Comunicação em Tempo Real (Socket.IO)**

O chat agora suporta mensagens em tempo real via WebSocket. Quando uma mensagem é enviada:

1. O backend salva a mensagem no banco
2. Emite o evento `newMessage` para todos os usuários conectados no grupo
3. Os clientes recebem instantaneamente e atualizam a interface

Arquivos modificados:
- `backend/server.js` - Configuração do Socket.IO server
- `backend/src/routes/chats.js` - Emissão do evento após salvar mensagem
- `frontend/chat.html` - Inclusão do script socket.io
- `frontend/scripts/chat.js` - Lógica de conexão e recepção de mensagens

**Contribuição**

- Fork e pull requests são bem-vindos. Siga o padrão de código existente e mantenha alterações pequenas e testáveis.

**Licença**

- Repositório de exemplo para fins acadêmicos — adapte conforme necessário.
