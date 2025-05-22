const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.get('/course/:courseId', reviewController.getCourseReviews);

// Rotas protegidas - requerem autenticação
router.use(authMiddleware.verifyToken);

// Adicionar avaliação a um curso
router.post('/', reviewController.addReview);

// Atualizar avaliação
router.put('/:id', reviewController.updateReview);

// Excluir avaliação
router.delete('/:id', reviewController.deleteReview);

// Rotas para administradores
router.use('/admin', authMiddleware.isAdmin);
router.get('/', reviewController.getAllReviews);
router.delete('/admin/:id', reviewController.adminDeleteReview);

module.exports = router;
