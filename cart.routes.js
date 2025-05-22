const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas do carrinho requerem autenticação
router.use(authMiddleware.verifyToken);

// Obter o carrinho do usuário atual
router.get('/', cartController.getCart);

// Adicionar curso ao carrinho
router.post('/add', cartController.addToCart);

// Remover curso do carrinho
router.delete('/remove/:courseId', cartController.removeFromCart);

// Limpar o carrinho
router.delete('/clear', cartController.clearCart);

// Aplicar cupom de desconto
router.post('/apply-coupon', cartController.applyCoupon);

// Checkout - criar pedido a partir do carrinho
router.post('/checkout', cartController.checkout);

module.exports = router;
