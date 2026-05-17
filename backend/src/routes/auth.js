const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getUserById } = require('../../database');

const router = express.Router();

/**
 * ROTA: GET /api/auth/me
 * Responsabilidade: Verificar se a sessão (token) é válida e retornar dados do usuário
 * Uso: Frontend valida ao carregar a página
 * Autenticação: Obrigatória (Bearer token)
 */
router.get('/me', authMiddleware, (req, res) => {
  const userId = req.user.id;

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

    return res.status(200).json({
      ...user,
      authenticated: true
    });
  });
});

/**
 * ROTA: POST /api/auth/logout
 * Responsabilidade: Informar o backend que o usuário saiu
 * Nota: O token JWT não é invalidado no servidor; a invalidação ocorre no cliente
 *       via remoção do token da sessionStorage
 * Autenticação: Obrigatória (Bearer token)
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.status(200).json({ 
    message: 'Logout realizado com sucesso' 
  });
});

module.exports = router;
