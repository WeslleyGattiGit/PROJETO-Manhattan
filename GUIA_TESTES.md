/**
 * ========================================
 * GUIA DE DEPLOY — RENDER
 * ========================================
 *
 * Este projeto usa SQLite (banco de dados em arquivo).
 * ATENÇÃO: No plano gratuito do Render, o disco é EFÊMERO.
 * Quando o servidor reinicia (após ~15 min de inatividade),
 * o arquivo database/conexxa.db é APAGADO. Todos os dados são perdidos.
 *
 * Para persistência real, troque SQLite por PostgreSQL
 * (o Render oferece banco gratuito).
 *
 * Passo a passo:
 *
 * 1. Faça push do código para o GitHub
 *    (certifique-se que package.json tem o script "start")
 *
 * 2. No Render: New + → Web Service
 *    - Conecte seu repositório GitHub
 *    - Nome: connexxa (ou o nome do seu repo)
 *
 * 3. Configurações:
 *    - Runtime: Node
 *    - Build Command: npm install
 *    - Start Command: node backend/server.js
 *
 * 4. Clique "Create Web Service"
 *    - Deploy leva ~3 minutos
 *    - Quando terminar, você ganha uma URL pública
 *      ex: https://connexxa.onrender.com
 *
 * 5. Acesse a URL de qualquer lugar do mundo:
 *    - https://seu-app.onrender.com/login.html
 *    - https://seu-app.onrender.com/chat.html
 *    - O frontend carrega do próprio Render
 *      (ele serve arquivos estáticos via app.use(express.static(...)))
 *
 * 6. Teste com outra pessoa:
 *    - Compartilhe a URL
 *    - Ela acessa, cria conta, entra em grupos, envia mensagens
 *    - Funciona desde que o servidor não tenha hibernado
 *
 * IMPORTANTE: No plano gratuito, o servidor "dorme" após 15 min.
 * A primeira pessoa que acessar após esse tempo vai esperar ~30s
 * até o servidor acordar. Depois disso funciona normalmente.
 */

/**
 * ========================================
 * GUIA DE TESTES - ENDPOINTS DE AUTENTICAÇÃO E CHATS
 * ========================================
 * 
 * Este arquivo contém exemplos de como testar todos os endpoints
 * implementados usando curl ou qualquer cliente HTTP (Postman, Insomnia, etc.)
 * 
 * IMPORTANTE: Substitua <token> pelos tokens reais obtidos no login
 * 
 * Para testar em produção (Render), substitua localhost:3000 pela URL do Render.
 * Exemplo: https://seu-app.onrender.com/api/usuarios/login
 */

/**
 * ========================================
 * TESTES DE USUÁRIOS E AUTENTICAÇÃO
 * ========================================
 */

// 1. REGISTRAR NOVO USUÁRIO
// POST /api/usuarios/register
/*
curl -X POST http://localhost:3000/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "Senha123"
  }'

Resposta esperada (201):
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@exemplo.com"
}
*/

// 2. FAZER LOGIN
// POST /api/usuarios/login
/*
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "senha": "Senha123"
  }'

Resposta esperada (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

SALVAR ESTE TOKEN PARA OS PRÓXIMOS TESTES!
Token dura 2 horas
*/

// 3. VERIFICAR SESSÃO DO USUÁRIO LOGADO
// GET /api/auth/me
/*
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta esperada (200):
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "foto_url": null,
  "criado_em": "2024-05-12T10:30:00Z",
  "authenticated": true
}

Se token inválido (401):
{
  "error": "Token inválido."
}
*/

/**
 * ========================================
 * TESTES DE GRUPOS
 * ========================================
 */

// 4. LISTAR TODOS OS GRUPOS DISPONÍVEIS
// GET /api/grupos
/*
curl -X GET http://localhost:3000/api/grupos \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta esperada (200):
{
  "grupos": [
    {
      "id": 1,
      "nome": "Algoritmos 2024",
      "descricao": "Grupo de estudo de algoritmos",
      "criador_id": 1,
      "criador_nome": "João Silva",
      "criado_em": "2024-05-12T10:30:00Z",
      "total_membros": 3
    }
  ],
  "total": 1
}
*/

// 5. LISTAR GRUPOS COM BUSCA
// GET /api/grupos?search=Algoritmos
/*
curl -X GET "http://localhost:3000/api/grupos?search=Algoritmos" \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta: Retorna apenas grupos com "Algoritmos" no nome
*/

// 6. CRIAR NOVO GRUPO
// POST /api/grupos
/*
curl -X POST http://localhost:3000/api/grupos \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Estruturas de Dados",
    "descricao": "Grupo para estudar estruturas de dados"
  }'

Resposta esperada (201):
{
  "grupo": {
    "id": 2,
    "nome": "Estruturas de Dados",
    "descricao": "Grupo para estudar estruturas de dados",
    "criador_id": 1,
    "criado_em": "2024-05-12T11:00:00Z"
  },
  "message": "Grupo criado com sucesso. Você foi adicionado automaticamente."
}

IMPORTANTE: O criador é automaticamente adicionado ao grupo!
*/

// 7. ENTRAR EM UM GRUPO EXISTENTE
// POST /api/grupos/:groupId/join
/*
curl -X POST http://localhost:3000/api/grupos/1/join \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta esperada (200):
{
  "message": "Você entrou no grupo com sucesso",
  "success": true
}

Resposta se já estiver no grupo (409):
{
  "error": "Você já está neste grupo"
}
*/

/**
 * ========================================
 * TESTES DE CHATS E MENSAGENS
 * ========================================
 */

// 8. OBTER LISTA DE GRUPOS DO USUÁRIO (SEUS CHATS)
// GET /api/chats
/*
curl -X GET http://localhost:3000/api/chats \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta esperada (200):
{
  "grupos": [
    {
      "id": 1,
      "nome": "Algoritmos 2024",
      "descricao": "Grupo de estudo de algoritmos",
      "criador_id": 1,
      "criado_em": "2024-05-12T10:30:00Z"
    },
    {
      "id": 2,
      "nome": "Estruturas de Dados",
      "descricao": "Grupo para estudar estruturas de dados",
      "criador_id": 1,
      "criado_em": "2024-05-12T11:00:00Z"
    }
  ],
  "total": 2
}
*/

// 9. OBTER MENSAGENS DE UM GRUPO
// GET /api/chats/:groupId
/*
curl -X GET "http://localhost:3000/api/chats/1?limit=50" \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json"

Resposta esperada (200):
{
  "mensagens": [
    {
      "id": 1,
      "grupo_id": 1,
      "usuario_id": 1,
      "conteudo": "Olá pessoal!",
      "criado_em": "2024-05-12T10:30:00Z",
      "usuario_nome": "João Silva",
      "usuario_email": "joao@exemplo.com",
      "usuario_foto": null
    }
  ],
  "total": 1
}

PARÂMETROS:
- limit: número máximo de mensagens (padrão 50, máximo 100)
*/

// 10. ENVIAR MENSAGEM PARA GRUPO
// POST /api/chats/:groupId/send
/*
curl -X POST http://localhost:3000/api/chats/1/send \
  -H "Authorization: Bearer <token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "conteudo": "Vocês fazem qual matéria?"
  }'

Resposta esperada (201):
{
  "mensagem": {
    "id": 2,
    "grupo_id": 1,
    "usuario_id": 1,
    "conteudo": "Vocês fazem qual matéria?",
    "criado_em": "2024-05-12T11:15:00Z",
    "usuario_nome": "João Silva",
    "usuario_email": "joao@exemplo.com",
    "usuario_foto": null
  },
  "success": true
}

Erro se mensagem vazia (400):
{
  "error": "Conteúdo da mensagem é obrigatório e não pode estar vazio"
}

Erro se mensagem muito longa (400):
{
  "error": "Mensagem muito longa (máximo 5000 caracteres)"
}
*/

/**
 * ========================================
 * CENÁRIO DE TESTE COMPLETO
 * ========================================
 * 
 * Siga estes passos para validar toda a integração:
 */

/*
PASSO 1: Registrar dois usuários diferentes
- User 1: joao@exemplo.com / Senha123
- User 2: maria@exemplo.com / Senha456

PASSO 2: Fazer login com User 1 e salvar o token
Usar este token para os próximos passos (como User 1)

PASSO 3: Criar um novo grupo
POST /api/grupos → "Algoritmos 2024"
Verificar que User 1 foi adicionado automaticamente

PASSO 4: Enviar uma mensagem no grupo
POST /api/chats/1/send → "Olá! Bem-vindo ao grupo!"

PASSO 5: Fazer login com User 2 (novo token)
POST /api/usuarios/login → User 2

PASSO 6: User 2 entra no grupo criado por User 1
POST /api/grupos/1/join

PASSO 7: User 2 obtém lista de seus chats
GET /api/chats → deve incluir "Algoritmos 2024"

PASSO 8: User 2 obtém mensagens do grupo
GET /api/chats/1 → deve incluir mensagem de User 1

PASSO 9: User 2 envia mensagem
POST /api/chats/1/send → "Oi! Que legal!"

PASSO 10: Verificar que ambos veem a mensagem
GET /api/chats/1 → deve ter 2 mensagens

SE TODOS ESSES TESTES PASSAREM, A INTEGRAÇÃO ESTÁ FUNCIONANDO! ✅

/**
 * ========================================
 * TESTES DE INTERFACE - SIDEBAR DE GRUPOS
 * ========================================
 * 
 * Este guia testa a nova funcionalidade de sidebar de grupos implementada
 * na página chat.html (frontend/chat.html)
 */

/*
TESTE 1: Carregamento de grupos na sidebar
────────────────────────────────────────────
Pré-requisito: User logado com pelo menos 1 grupo

Passos:
1. Abrir http://localhost:3000/chat.html?groupId=1
2. Observar a lateral esquerda da página
3. Verificar que há uma sidebar com título "Chats"
4. Verificar que o grupo atual está listado

Resultado esperado:
✓ Sidebar visível com lista de grupos
✓ Nome do grupo exibido (ex: "Algoritmos 2024")
✓ Descrição do grupo abaixo do nome
✓ Grupo atual destaque com fundo azul claro
✓ Borda azul na esquerda do grupo ativo
*/

/*
TESTE 2: Alternar entre múltiplos grupos
─────────────────────────────────────────
Pré-requisito: User logado com pelo menos 2 grupos

Passos:
1. Abrir chat.html com um grupo ativo (ex: groupId=1)
2. Na sidebar, clicar no segundo grupo (ex: "Estruturas de Dados")
3. Observar a navegação

Resultado esperado:
✓ URL mudou para ?groupId=2
✓ Página recarregou
✓ Header atualizado: nome e descrição do novo grupo
✓ Mensagens do novo grupo carregadas
✓ Novo grupo destaque na sidebar
✓ Grupo anterior não está mais destacado
*/

/*
TESTE 3: Hover effects na sidebar
──────────────────────────────────
Pré-requisito: User com múltiplos grupos

Passos:
1. Abrir chat.html
2. Passar mouse sobre um grupo não ativo
3. Observar o efeito visual

Resultado esperado:
✓ Fundo muda levemente (mais azul)
✓ Cursor muda para pointer
✓ Transição suave (0.2s)
*/

/*
TESTE 4: Sidebar com grupos sem descrição
──────────────────────────────────────────
Pré-requisito: Ter um grupo sem descrição

Passos:
1. Criar grupo sem descrição via POST /api/grupos
2. Abrir chat.html
3. Verificar exibição na sidebar

Resultado esperado:
✓ Nome do grupo exibido normalmente
✓ Metadados mostram "Sem descrição"
✓ Sem erros no console
*/

/*
TESTE 5: Sidebar vazia (usuário sem grupos)
───────────────────────────────────────────
Pré-requisito: User novo sem nenhum grupo

Passos:
1. Criar novo usuário e logar
2. Abrir chat.html
3. Verificar sidebar

Resultado esperado:
✓ Sidebar exibida
✓ Mensagem: "Nenhum grupo disponível"
✓ Chat central desabilitado
✓ Mensagem: "Selecione um grupo para começar a conversar."
*/

/*
TESTE 6: Responsividade da sidebar
──────────────────────────────────
Pré-requisito: User com múltiplos grupos

Passos (Desktop - 1920x1080):
1. Abrir chat.html
2. Verificar largura da sidebar
3. Verificar layout

Resultado esperado:
✓ Sidebar com ~280px de largura
✓ Posicionada à esquerda
✓ Chat ao lado (flex layout)

Passos (Tablet - 900px):
1. Redimensionar navegador para 900px
2. Verificar layout

Resultado esperado:
✓ Sidebar agora acima do chat
✓ Ambos ocupam 100% da largura
✓ Scrollable se muitos grupos
✓ Max-height: 200px na sidebar

Passos (Mobile - 375px):
1. Redimensionar para 375px
2. Verificar sidebar

Resultado esperado:
✓ Sidebar em coluna
✓ Bem proporcionada no mobile
✓ Nenhum overflow
✓ Input de mensagem não truncado
*/

/*
TESTE 7: Prevensão de XSS (Segurança)
─────────────────────────────────────
Pré-requisito: Backend que permite criar grupos

Passos:
1. Tentar criar grupo com nome: <script>alert('XSS')</script>
2. Verificar sidebar

Resultado esperado:
✓ Script não executado
✓ Texto aparece como HTML escapado: &lt;script&gt;...
✓ Sem alertas JavaScript
✓ Console sem erros
*/

/*
TESTE 8: Integração completa (E2E)
──────────────────────────────────
Pré-requisito: Backend rodando, 2+ usuários com grupos

Roteiro:
1. User 1 cria grupo "Algoritmos"
2. User 2 entra no grupo "Algoritmos"
3. User 1 acessa chat.html?groupId=1
4. Verifica que "Algoritmos" aparece na sidebar
5. User 1 entra em outro grupo
6. Verifica que ambos grupos aparecem na sidebar
7. User 1 clica em "Algoritmos" na sidebar
8. Verifica que página recarregou com groupId=1
9. User 1 envia mensagem
10. User 2 entra em chat.html
11. User 2 vê ambos os grupos na sidebar
12. User 2 acessa "Algoritmos"
13. Verifica que mensagem de User 1 está lá

Resultado esperado:
✓ Todos os passos funcionam sem erros
✓ Sidebar sempre atualizada
✓ Mensagens sincronizadas
✓ Navigation fluida
✓ Sem refresh desnecessários
*/

module.exports = {};
*/

module.exports = {};
