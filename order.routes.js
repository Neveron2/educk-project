const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas de pedidos requerem autenticação
router.use(authMiddleware.verifyToken);

// Obter pedidos do usuário atual
router.get('/me', orderController.getUserOrders);

// Obter detalhes de um pedido específico
router.get('/:id', orderController.getOrderById);

// Verificar status de pagamento de um pedido
router.get('/:id/payment-status', orderController.checkPaymentStatus);

// Gerar comprovante de um pedido
router.get('/:id/receipt', orderController.generateReceipt);

// Rotas para administradores
router.use('/admin', authMiddleware.isAdmin);
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
