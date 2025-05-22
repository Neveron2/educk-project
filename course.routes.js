const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas públicas
router.get('/', courseController.getAllCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/category/:categoryId', courseController.getCoursesByCategory);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/reviews', courseController.getCourseReviews);

// Rotas protegidas - requerem autenticação
router.use(authMiddleware.verifyToken);

// Rotas para alunos
router.post('/:id/enroll', courseController.enrollCourse);
router.post('/:id/review', courseController.addReview);
router.get('/enrolled/me', courseController.getEnrolledCourses);

// Rotas para professores - requerem papel de professor
router.use(authMiddleware.isTeacher);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.post('/:id/lesson', courseController.addLesson);
router.put('/:id/publish', courseController.publishCourse);
router.get('/created/me', courseController.getCreatedCourses);

// Rotas para administradores - requerem papel de administrador
router.use(authMiddleware.isAdmin);
router.put('/:id/approve', courseController.approveCourse);
router.put('/:id/reject', courseController.rejectCourse);
router.put('/:id/feature', courseController.featureCourse);

module.exports = router;
