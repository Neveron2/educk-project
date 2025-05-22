const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota para registro de novos usuários
router.post('/register', authController.register);

// Rota para login
router.post('/login', authController.login);

// Rota para recuperação de senha
router.post('/forgot-password', authController.forgotPassword);

// Rota para redefinição de senha
router.post('/reset-password', authController.resetPassword);

// Rota para verificação de e-mail
router.get('/verify-email/:token', authController.verifyEmail);

// Rota para refresh do token
router.post('/refresh-token', authController.refreshToken);

// Rota para logout
router.post('/logout', authController.logout);

module.exports = router;
