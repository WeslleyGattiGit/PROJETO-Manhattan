const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getGroupMessages, saveMessage, getUserGroups, getUserById } = require('../../database');

const router = express.Router();

/**
 * ROTA: GET /api/chats
 * 
 * Responsabilidade: Listar todos os grupos (com chats) em que o usuário participa
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Resposta de sucesso (200):
 * {
 *   "grupos": [
 *     {
 *       "id": 1,
 *       "nome": "Algoritmos 2024",
 *       "descricao": "Grupo de estudo de algoritmos",
 *       "criador_id": 2,
 *       "criado_em": "2024-05-12T10:30:00Z"
 *     }
 *   ]
 * }
 * 
 * Respostas de erro:
 * - 401: Não autenticado
 * - 500: Erro interno
 */
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Obter todos os grupos do usuário
  getUserGroups(userId, (err, grupos) => {
    if (err) {
      console.error('Erro ao obter grupos do usuário:', err);
      return res.status(500).json({ 
        error: 'Erro ao obter grupos' 
      });
    }

    return res.status(200).json({ 
      grupos: grupos || [],
      total: grupos ? grupos.length : 0
    });
  });
});

/**
 * ROTA: GET /api/chats/:groupId
 * 
 * Responsabilidade: Obter todas as mensagens de um grupo específico
 * 
 * Parâmetros:
 * - groupId: ID do grupo (obrigatório)
 * 
 * Query params (opcionais):
 * - limit: Número máximo de mensagens (padrão: 50, máximo: 100)
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Resposta de sucesso (200):
 * {
 *   "mensagens": [
 *     {
 *       "id": 1,
 *       "grupo_id": 1,
 *       "usuario_id": 5,
 *       "conteudo": "Olá pessoal!",
 *       "criado_em": "2024-05-12T10:30:00Z",
 *       "usuario_nome": "João Silva",
 *       "usuario_email": "joao@exemplo.com",
 *       "usuario_foto": null
 *     }
 *   ],
 *   "total": 1
 * }
 * 
 * Respostas de erro:
 * - 400: Parâmetros inválidos
 * - 401: Não autenticado
 * - 500: Erro interno
 */
router.get('/:groupId', authMiddleware, (req, res) => {
  const { groupId } = req.params;
  let { limit } = req.query;

  // Validar ID do grupo
  if (!groupId || isNaN(groupId)) {
    return res.status(400).json({ 
      error: 'ID do grupo inválido' 
    });
  }

  // Validar limite (máximo 100)
  limit = Math.min(parseInt(limit) || 50, 100);

  // Obter mensagens do grupo
  getGroupMessages(groupId, limit, (err, mensagens) => {
    if (err) {
      console.error('Erro ao obter mensagens:', err);
      return res.status(500).json({ 
        error: 'Erro ao obter mensagens do grupo' 
      });
    }

    return res.status(200).json({ 
      mensagens: mensagens || [],
      total: mensagens ? mensagens.length : 0
    });
  });
});

/**
 * ROTA: POST /api/chats/:groupId/send
 * 
 * Responsabilidade: Enviar uma nova mensagem para um grupo
 * 
 * Parâmetros:
 * - groupId: ID do grupo (obrigatório)
 * 
 * Body (JSON):
 * {
 *   "conteudo": "Mensagem do usuário aqui"
 * }
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Resposta de sucesso (201):
 * {
 *   "mensagem": {
 *     "id": 2,
 *     "grupo_id": 1,
 *     "usuario_id": 5,
 *     "conteudo": "Mensagem do usuário aqui",
 *     "criado_em": "2024-05-12T11:00:00Z"
 *   }
 * }
 * 
 * Respostas de erro:
 * - 400: Parâmetros inválidos ou conteúdo vazio
 * - 401: Não autenticado
 * - 500: Erro interno
 */
router.post('/:groupId/send', authMiddleware, (req, res) => {
  const { groupId } = req.params;
  const { conteudo } = req.body || {};
  const userId = req.user.id;

  // Validar ID do grupo
  if (!groupId || isNaN(groupId)) {
    return res.status(400).json({ 
      error: 'ID do grupo inválido' 
    });
  }

  // Validar conteúdo da mensagem
  if (!conteudo || typeof conteudo !== 'string' || conteudo.trim() === '') {
    return res.status(400).json({ 
      error: 'Conteúdo da mensagem é obrigatório e não pode estar vazio' 
    });
  }

  // Limitar tamanho da mensagem (máximo 5000 caracteres)
  if (conteudo.length > 5000) {
    return res.status(400).json({ 
      error: 'Mensagem muito longa (máximo 5000 caracteres)' 
    });
  }

  // Salvar mensagem no banco
  saveMessage(groupId, userId, conteudo.trim(), (err, mensagem) => {
    if (err) {
      console.error('Erro ao salvar mensagem:', err);
      return res.status(500).json({ 
        error: 'Erro ao enviar mensagem' 
      });
    }

    // Retornar mensagem criada com os dados do usuário
    getUserById(userId, (errUser, user) => {
      if (!errUser && user) {
        mensagem.usuario_nome = user.nome;
        mensagem.usuario_email = user.email;
        mensagem.usuario_foto = user.foto_url;
      }

      return res.status(201).json({ 
        mensagem,
        success: true
      });
    });
  });
});

module.exports = router;
