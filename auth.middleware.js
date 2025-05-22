const authMiddleware = {
  /**
   * Middleware para verificar se o usuário está autenticado
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função para passar para o próximo middleware
   */
  verifyToken: (req, res, next) => {
    try {
      // Obter o token do cabeçalho Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verificar o token
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = 'educk_jwt_secret_key'; // Em produção, viria de variáveis de ambiente
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Adicionar informações do usuário ao objeto de requisição
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      console.error('Erro na verificação do token:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Middleware para verificar se o usuário é um professor
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função para passar para o próximo middleware
   */
  isTeacher: (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Acesso negado. Apenas professores podem realizar esta ação.' });
    }
  },

  /**
   * Middleware para verificar se o usuário é um administrador
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função para passar para o próximo middleware
   */
  isAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
  }
};

module.exports = authMiddleware;
