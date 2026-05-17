const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'conexxa-secret';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido.' 
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Formato inválido. Use: Authorization: Bearer <token>' 
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado.' 
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
