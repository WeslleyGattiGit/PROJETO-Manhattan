/**
 * ========================================
 * GUIA DE TESTES - ENDPOINTS DE AUTENTICAÇÃO E CHATS
 * ========================================
 * 
 * Este arquivo contém exemplos de como testar todos os endpoints
 * implementados usando curl ou qualquer cliente HTTP (Postman, Insomnia, etc.)
 * 
 * IMPORTANTE: Substitua <token> pelos tokens reais obtidos no login
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
*/

module.exports = {};
