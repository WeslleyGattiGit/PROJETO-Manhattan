const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getUserById } = require('../../database');

const router = express.Router();

/**
 * ROTA: GET /api/auth/me
 * 
 * Responsabilidade: Verificar se a sessão (token) é válida e retornar dados do usuário
 * 
 * Uso: Frontend faz esta chamada ao carregar para validar se usuário está logado
 * 
 * Autenticação: Obrigatória (Bearer token)
 * 
 * Resposta de sucesso (200):
 * {
 *   "id": 5,
 *   "nome": "João Silva",
 *   "email": "joao@exemplo.com",
 *   "foto_url": null,
 *   "criado_em": "2024-05-12T09:00:00Z",
 *   "authenticated": true
 * }
 * 
 * Respostas de erro:
 * - 401: Token não fornecido ou inválido
 * - 500: Erro ao buscar dados do usuário
 */
router.get('/me', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Buscar dados completos do usuário (sem a senha)
  getUserById(userId, (err, user) => {
    if (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados do usuário' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    // Retornar dados do usuário com flag de autenticação
    return res.status(200).json({
      ...user,
      authenticated: true
    });
  });
});

module.exports = router;
