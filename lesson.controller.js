const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

/**
 * Controller para gerenciamento de aulas
 */
const lessonController = {
  /**
   * Obter aula por ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getLessonById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      const isInstructor = course.instructor.toString() === userId;
      
      // Verificar se o usuário é um administrador
      const isAdmin = req.user.role === 'admin';
      
      // Verificar se o usuário está matriculado no curso ou se a aula é uma prévia
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses.includes(course._id);
      
      // Permitir acesso se o usuário for instrutor, admin, estiver matriculado ou a aula for prévia
      if (!isInstructor && !isAdmin && !isEnrolled && !lesson.isPreview) {
        return res.status(403).json({ message: 'Acesso negado. Você precisa estar matriculado neste curso.' });
      }
      
      // Verificar se o usuário já completou esta aula
      const completionRecord = lesson.completedBy.find(record => record.user.toString() === userId);
      const isCompleted = !!completionRecord;
      
      res.status(200).json({
        ...lesson.toObject(),
        isCompleted,
        completedAt: completionRecord ? completionRecord.completedAt : null,
        quizScore: completionRecord ? completionRecord.quizScore : null
      });
    } catch (error) {
      console.error('Erro ao obter aula:', error);
      res.status(500).json({ message: 'Erro ao obter aula', error: error.message });
    }
  },
  
  /**
   * Marcar aula como concluída
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  markLessonAsCompleted: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário está matriculado no curso
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses.includes(course._id);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Acesso negado. Você precisa estar matriculado neste curso.' });
      }
      
      // Verificar se o usuário já completou esta aula
      const completionIndex = lesson.completedBy.findIndex(record => record.user.toString() === userId);
      
      if (completionIndex === -1) {
        // Adicionar registro de conclusão
        lesson.completedBy.push({
          user: userId,
          completedAt: new Date()
        });
      } else {
        // Atualizar data de conclusão
        lesson.completedBy[completionIndex].completedAt = new Date();
      }
      
      await lesson.save();
      
      res.status(200).json({ message: 'Aula marcada como concluída com sucesso' });
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      res.status(500).json({ message: 'Erro ao marcar aula como concluída', error: error.message });
    }
  },
  
  /**
   * Enviar respostas de quiz
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  submitQuizAnswers: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { answers } = req.body;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Verificar se a aula é do tipo quiz
      if (lesson.contentType !== 'quiz') {
        return res.status(400).json({ message: 'Esta aula não é um quiz' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário está matriculado no curso
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses.includes(course._id);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Acesso negado. Você precisa estar matriculado neste curso.' });
      }
      
      // Verificar respostas
      let correctAnswers = 0;
      const quiz = lesson.quiz;
      
      if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return res.status(400).json({ message: 'Quiz não configurado corretamente' });
      }
      
      // Verificar se o número de respostas corresponde ao número de perguntas
      if (!answers || answers.length !== quiz.questions.length) {
        return res.status(400).json({ message: 'Número de respostas não corresponde ao número de perguntas' });
      }
      
      // Calcular pontuação
      for (let i = 0; i < quiz.questions.length; i++) {
        if (answers[i] === quiz.questions[i].correctOption) {
          correctAnswers++;
        }
      }
      
      const score = (correctAnswers / quiz.questions.length) * 100;
      const passed = score >= quiz.passingScore;
      
      // Atualizar registro de conclusão
      const completionIndex = lesson.completedBy.findIndex(record => record.user.toString() === userId);
      
      if (completionIndex === -1) {
        // Adicionar novo registro
        lesson.completedBy.push({
          user: userId,
          completedAt: new Date(),
          quizScore: score
        });
      } else {
        // Atualizar registro existente
        lesson.completedBy[completionIndex].completedAt = new Date();
        lesson.completedBy[completionIndex].quizScore = score;
      }
      
      await lesson.save();
      
      res.status(200).json({
        message: passed ? 'Quiz concluído com sucesso!' : 'Quiz concluído, mas você não atingiu a pontuação mínima.',
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore,
        passed
      });
    } catch (error) {
      console.error('Erro ao enviar respostas do quiz:', error);
      res.status(500).json({ message: 'Erro ao enviar respostas do quiz', error: error.message });
    }
  },
  
  /**
   * Criar nova aula (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  createLesson: async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        title,
        description,
        courseId,
        order,
        duration,
        contentType,
        content,
        isPreview,
        quiz
      } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Criar nova aula
      const newLesson = new Lesson({
        title,
        description,
        course: courseId,
        order,
        duration,
        contentType,
        content,
        isPreview,
        quiz: contentType === 'quiz' ? quiz : undefined
      });
      
      await newLesson.save();
      
      // Adicionar aula ao curso
      course.lessons.push(newLesson._id);
      await course.save();
      
      res.status(201).json({
        message: 'Aula criada com sucesso',
        lesson: newLesson
      });
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      res.status(500).json({ message: 'Erro ao criar aula', error: error.message });
    }
  },
  
  /**
   * Atualizar aula (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateLesson: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const {
        title,
        description,
        order,
        duration,
        contentType,
        content,
        isPreview,
        quiz
      } = req.body;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Atualizar campos
      if (title) lesson.title = title;
      if (description !== undefined) lesson.description = description;
      if (order !== undefined) lesson.order = order;
      if (duration !== undefined) lesson.duration = duration;
      if (contentType) lesson.contentType = contentType;
      if (content) lesson.content = content;
      if (isPreview !== undefined) lesson.isPreview = isPreview;
      if (quiz && contentType === 'quiz') lesson.quiz = quiz;
      
      await lesson.save();
      
      res.status(200).json({
        message: 'Aula atualizada com sucesso',
        lesson
      });
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      res.status(500).json({ message: 'Erro ao atualizar aula', error: error.message });
    }
  },
  
  /**
   * Excluir aula (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  deleteLesson: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Remover aula do curso
      const lessonIndex = course.lessons.indexOf(id);
      if (lessonIndex !== -1) {
        course.lessons.splice(lessonIndex, 1);
        await course.save();
      }
      
      // Excluir aula
      await Lesson.findByIdAndDelete(id);
      
      res.status(200).json({ message: 'Aula excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir aula:', error);
      res.status(500).json({ message: 'Erro ao excluir aula', error: error.message });
    }
  },
  
  /**
   * Adicionar anexo à aula (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addAttachment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { name, file, type } = req.body;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Adicionar anexo
      lesson.attachments.push({
        name,
        file,
        type
      });
      
      await lesson.save();
      
      res.status(200).json({
        message: 'Anexo adicionado com sucesso',
        attachment: lesson.attachments[lesson.attachments.length - 1]
      });
    } catch (error) {
      console.error('Erro ao adicionar anexo:', error);
      res.status(500).json({ message: 'Erro ao adicionar anexo', error: error.message });
    }
  },
  
  /**
   * Remover anexo da aula (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  removeAttachment: async (req, res) => {
    try {
      const { id, attachmentId } = req.params;
      const userId = req.user.userId;
      
      // Buscar aula
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: 'Aula não encontrada' });
      }
      
      // Buscar curso associado
      const course = await Course.findById(lesson.course);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Remover anexo
      const attachmentIndex = lesson.attachments.findIndex(attachment => attachment._id.toString() === attachmentId);
      if (attachmentIndex === -1) {
        return res.status(404).json({ message: 'Anexo não encontrado' });
      }
      
      lesson.attachments.splice(attachmentIndex, 1);
      await lesson.save();
      
      res.status(200).json({ message: 'Anexo removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      res.status(500).json({ message: 'Erro ao remover anexo', error: error.message });
    }
  }
};

module.exports = lessonController;
