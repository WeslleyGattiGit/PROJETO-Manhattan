const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createGroup, addUserToGroup, db } = require('../../database');

const router = express.Router();

/**
 * ROTA: GET /api/grupos
 * 
 * Responsabilidade: Listar todos os grupos disponíveis no sistema
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Query params (opcionais):
 * - search: Buscar grupos pelo nome (busca parcial)
 * 
 * Resposta de sucesso (200):
 * {
 *   "grupos": [
 *     {
 *       "id": 1,
 *       "nome": "Algoritmos 2024",
 *       "descricao": "Grupo de estudo de algoritmos",
 *       "criador_id": 2,
 *       "criador_nome": "Maria Silva",
 *       "criado_em": "2024-05-12T10:30:00Z",
 *       "total_membros": 5
 *     }
 *   ],
 *   "total": 1
 * }
 * 
 * Respostas de erro:
 * - 401: Não autenticado
 * - 500: Erro interno
 */
router.get('/', authMiddleware, (req, res) => {
  const { search } = req.query;

  // Query base para obter todos os grupos com informações do criador
  let query = `
    SELECT 
      g.id,
      g.nome,
      g.descricao,
      g.criador_id,
      u.nome as criador_nome,
      g.criado_em,
      COUNT(ug.id) as total_membros
    FROM grupos g
    LEFT JOIN usuarios u ON g.criador_id = u.id
    LEFT JOIN usuarios_grupos ug ON g.id = ug.grupo_id
  `;

  // Se houver busca, adicionar filtro WHERE
  if (search && search.trim()) {
    query += `WHERE g.nome LIKE ?`;
  }

  query += `
    GROUP BY g.id
    ORDER BY g.criado_em DESC
  `;

  // Parâmetros da query
  const params = search ? [`%${search.trim()}%`] : [];

  db.all(query, params, (err, grupos) => {
    if (err) {
      console.error('Erro ao obter grupos:', err);
      return res.status(500).json({ 
        error: 'Erro ao listar grupos' 
      });
    }

    return res.status(200).json({ 
      grupos: grupos || [],
      total: grupos ? grupos.length : 0
    });
  });
});

/**
 * ROTA: POST /api/grupos
 * 
 * Responsabilidade: Criar um novo grupo de estudo
 * 
 * Autenticação: Obrigatória (Bearer token)
 * O usuário autenticado será o criador do grupo
 * 
 * Body (JSON):
 * {
 *   "nome": "Algoritmos 2024",
 *   "descricao": "Grupo de estudo de algoritmos (opcional)"
 * }
 * 
 * Resposta de sucesso (201):
 * {
 *   "grupo": {
 *     "id": 1,
 *     "nome": "Algoritmos 2024",
 *     "descricao": "Grupo de estudo de algoritmos",
 *     "criador_id": 5,
 *     "criado_em": "2024-05-12T10:30:00Z"
 *   },
 *   "message": "Grupo criado com sucesso. Você foi adicionado automaticamente."
 * }
 * 
 * Respostas de erro:
 * - 400: Parâmetros inválidos
 * - 401: Não autenticado
 * - 500: Erro interno
 */
router.post('/', authMiddleware, (req, res) => {
  const { nome, descricao } = req.body || {};
  const userId = req.user.id;

  // Validar nome do grupo
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ 
      error: 'Nome do grupo é obrigatório' 
    });
  }

  // Validar comprimento do nome
  if (nome.length > 100) {
    return res.status(400).json({ 
      error: 'Nome do grupo muito longo (máximo 100 caracteres)' 
    });
  }

  // Validar descrição se fornecida
  if (descricao && descricao.length > 500) {
    return res.status(400).json({ 
      error: 'Descrição muito longa (máximo 500 caracteres)' 
    });
  }

  // Criar grupo
  createGroup(nome.trim(), descricao?.trim() || '', userId, (err, grupo) => {
    if (err) {
      console.error('Erro ao criar grupo:', err);
      return res.status(500).json({ 
        error: 'Erro ao criar grupo' 
      });
    }

    // Adicionar o criador automaticamente como membro do grupo
    addUserToGroup(userId, grupo.id, (errAdd) => {
      if (errAdd) {
        console.error('Erro ao adicionar criador ao grupo:', errAdd);
        // Não retorna erro aqui, grupo foi criado com sucesso
      }

      return res.status(201).json({ 
        grupo,
        message: 'Grupo criado com sucesso. Você foi adicionado automaticamente.'
      });
    });
  });
});

/**
 * ROTA: POST /api/grupos/:groupId/join
 * 
 * Responsabilidade: Adicionar o usuário autenticado a um grupo existente
 * 
 * Parâmetros:
 * - groupId: ID do grupo (obrigatório)
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Resposta de sucesso (200):
 * {
 *   "message": "Você entrou no grupo com sucesso",
 *   "success": true
 * }
 * 
 * Respostas de erro:
 * - 400: Parâmetros inválidos
 * - 401: Não autenticado
 * - 409: Usuário já está no grupo
 * - 500: Erro interno
 */
router.post('/:groupId/join', authMiddleware, (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Validar ID do grupo
  if (!groupId || isNaN(groupId)) {
    return res.status(400).json({ 
      error: 'ID do grupo inválido' 
    });
  }

  // Tentar adicionar usuário ao grupo
  addUserToGroup(userId, groupId, (err) => {
    if (err) {
      // Verificar se o erro é devido à restrição UNIQUE (usuário já está no grupo)
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(409).json({ 
          error: 'Você já está neste grupo' 
        });
      }

      console.error('Erro ao adicionar usuário ao grupo:', err);
      return res.status(500).json({ 
        error: 'Erro ao entrar no grupo' 
      });
    }

    return res.status(200).json({ 
      message: 'Você entrou no grupo com sucesso',
      success: true
    });
  });
});

module.exports = router;
