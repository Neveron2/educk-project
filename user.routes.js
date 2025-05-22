const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.get('/teachers', userController.getTeachers);

// Rotas protegidas - requerem autenticação
router.use(authMiddleware.verifyToken);

// Rotas para usuários (perfil próprio)
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.get('/me/courses', userController.getEnrolledCourses);
router.get('/me/wishlist', userController.getWishlist);
router.post('/me/wishlist', userController.addToWishlist);
router.delete('/me/wishlist/:courseId', userController.removeFromWishlist);
router.get('/me/notifications', userController.getNotifications);
router.put('/me/notifications/:notificationId/read', userController.markNotificationAsRead);

// Rotas para professores
router.get('/me/dashboard', authMiddleware.isTeacher, userController.getTeacherDashboard);

// Rotas para administradores - requerem papel de administrador
router.use('/admin', authMiddleware.isAdmin);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.changeUserRole);

module.exports = router;
