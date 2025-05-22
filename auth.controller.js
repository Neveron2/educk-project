const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuração do JWT Secret
// Nota: Em um ambiente de produção, isso viria de variáveis de ambiente
const JWT_SECRET = 'educk_jwt_secret_key';
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '7d';

/**
 * Controller para autenticação de usuários
 * Responsável por registro, login, recuperação de senha e verificação de e-mail
 */
const authController = {
  /**
   * Registro de novos usuários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role = 'student' } = req.body;

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Gerar token de verificação de e-mail
      const verificationToken = crypto.randomBytes(20).toString('hex');

      // Criar novo usuário
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        emailVerificationToken: verificationToken,
        emailVerified: false
      });

      // Salvar usuário no banco de dados
      await newUser.save();

      // Enviar e-mail de verificação
      // Nota: Em um projeto real, configuraria um serviço de e-mail real
      // Para fins acadêmicos, apenas simulo o envio
      console.log(`E-mail de verificação enviado para ${email} com token: ${verificationToken}`);

      // Responder com sucesso
      res.status(201).json({ 
        message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar sua conta.',
        userId: newUser._id
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
  },

  /**
   * Login de usuários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Buscar usuário pelo e-mail
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Verificar se o e-mail foi confirmado
      if (!user.emailVerified) {
        return res.status(401).json({ message: 'E-mail não verificado. Por favor, verifique seu e-mail.' });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Gerar tokens JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
      );

      // Salvar refresh token no banco de dados
      user.refreshToken = refreshToken;
      await user.save();

      // Responder com tokens e informações do usuário
      res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
    }
  },

  /**
   * Solicitação de recuperação de senha
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Buscar usuário pelo e-mail
      const user = await User.findOne({ email });
      if (!user) {
        // Por segurança, não informamos se o e-mail existe ou não
        return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.' });
      }

      // Gerar token de recuperação de senha
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 hora

      // Salvar token no usuário
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpires;
      await user.save();

      // Enviar e-mail com instruções
      // Nota: Em um projeto real, configuraria um serviço de e-mail real
      console.log(`E-mail de recuperação enviado para ${email} com token: ${resetToken}`);

      // Responder com sucesso
      res.status(200).json({ message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.' });
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      res.status(500).json({ message: 'Erro ao processar solicitação de recuperação de senha', error: error.message });
    }
  },

  /**
   * Redefinição de senha
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Buscar usuário pelo token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualizar senha e limpar tokens
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Responder com sucesso
      res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      res.status(500).json({ message: 'Erro ao redefinir senha', error: error.message });
    }
  },

  /**
   * Verificação de e-mail
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      // Buscar usuário pelo token
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        return res.status(400).json({ message: 'Token de verificação inválido' });
      }

      // Marcar e-mail como verificado e limpar token
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      // Responder com sucesso
      res.status(200).json({ message: 'E-mail verificado com sucesso' });
    } catch (error) {
      console.error('Erro na verificação de e-mail:', error);
      res.status(500).json({ message: 'Erro ao verificar e-mail', error: error.message });
    }
  },

  /**
   * Refresh de token JWT
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verificar se o refresh token foi fornecido
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token não fornecido' });
      }

      // Verificar se o refresh token é válido
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Refresh token inválido' });
      }

      // Buscar usuário pelo ID
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
      }

      // Gerar novo token JWT
      const newToken = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Responder com novo token
      res.status(200).json({
        message: 'Token renovado com sucesso',
        token: newToken
      });
    } catch (error) {
      console.error('Erro no refresh token:', error);
      res.status(500).json({ message: 'Erro ao renovar token', error: error.message });
    }
  },

  /**
   * Logout de usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verificar se o refresh token foi fornecido
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token não fornecido' });
      }

      // Buscar usuário pelo refresh token
      const user = await User.findOne({ refreshToken });
      if (user) {
        // Limpar refresh token
        user.refreshToken = undefined;
        await user.save();
      }

      // Responder com sucesso
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ message: 'Erro ao realizar logout', error: error.message });
    }
  }
};

module.exports = authController;
