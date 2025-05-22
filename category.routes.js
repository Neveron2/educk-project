const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/courses', categoryController.getCategoryCourses);

// Rotas administrativas - requerem autenticação e papel de administrador
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
