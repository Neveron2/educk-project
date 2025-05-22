const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas protegidas - requerem autenticação
router.use(authMiddleware.verifyToken);

// Obter aula por ID (apenas para alunos matriculados)
router.get('/:id', lessonController.getLessonById);

// Marcar aula como concluída
router.post('/:id/complete', lessonController.markLessonAsCompleted);

// Enviar resposta de quiz
router.post('/:id/quiz', lessonController.submitQuizAnswers);

// Rotas para professores - requerem papel de professor
router.use(authMiddleware.isTeacher);
router.post('/', lessonController.createLesson);
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);
router.post('/:id/attachment', lessonController.addAttachment);
router.delete('/:id/attachment/:attachmentId', lessonController.removeAttachment);

module.exports = router;
