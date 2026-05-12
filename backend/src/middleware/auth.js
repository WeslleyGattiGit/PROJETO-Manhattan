const jwt = require('jsonwebtoken');

/**
 * MIDDLEWARE DE AUTENTICAÇÃO JWT
 * 
 * Responsabilidade: Validar token JWT presente no header da requisição
 * 
 * Comportamento:
 * - Verifica se o header Authorization está presente e formatado corretamente
 * - Extrai o token do formato "Bearer <token>"
 * - Valida a assinatura e expiração do token
 * - Inclui os dados do usuário no objeto request para uso nas rotas
 * - Retorna 401 se o token for inválido ou expirado
 * 
 * Uso nas rotas:
 *   app.get('/api/rota-protegida', authMiddleware, (req, res) => {
 *     // req.user contém { sub: userId, email: userEmail }
 *   });
 */

const JWT_SECRET = process.env.JWT_SECRET || 'conexxa-secret';

const authMiddleware = (req, res, next) => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido. Use: Authorization: Bearer <token>' 
      });
    }

    // Verifica o formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Formato inválido. Use: Authorization: Bearer <token>' 
      });
    }

    const token = parts[1];

    // Valida e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Armazena dados do usuário no request para uso posterior
    req.user = {
      id: decoded.sub,      // ID do usuário
      email: decoded.email   // Email do usuário
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Faça login novamente.' 
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido.' 
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro ao validar autenticação.' 
    });
  }
};

module.exports = authMiddleware;
