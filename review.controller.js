const Course = require('../models/course.model');
const User = require('../models/user.model');

/**
 * Controller para gerenciamento de avaliações
 */
const reviewController = {
  /**
   * Obter avaliações de um curso
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      // Verificar se o curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar curso com avaliações populadas
      const courseWithReviews = await Course.findById(courseId)
        .populate({
          path: 'reviews.user',
          select: 'name profileImage'
        })
        .select('reviews');
      
      // Extrair avaliações e aplicar paginação
      const reviews = courseWithReviews.reviews || [];
      const paginatedReviews = reviews
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + parseInt(limit));
      
      res.status(200).json({
        reviews: paginatedReviews,
        pagination: {
          total: reviews.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(reviews.length / limit)
        },
        averageRating: course.averageRating,
        totalReviews: course.totalReviews
      });
    } catch (error) {
      console.error('Erro ao obter avaliações do curso:', error);
      res.status(500).json({ message: 'Erro ao obter avaliações do curso', error: error.message });
    }
  },
  
  /**
   * Adicionar avaliação a um curso
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addReview: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { courseId, rating, comment } = req.body;
      
      // Validar rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'A avaliação deve ser entre 1 e 5' });
      }
      
      // Verificar se o curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário está matriculado no curso
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses.includes(courseId);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Você precisa estar matriculado no curso para avaliá-lo' });
      }
      
      // Verificar se o usuário já avaliou este curso
      const existingReviewIndex = course.reviews.findIndex(review => review.user.toString() === userId);
      
      if (existingReviewIndex !== -1) {
        return res.status(400).json({ message: 'Você já avaliou este curso. Use a rota de atualização para modificar sua avaliação.' });
      }
      
      // Adicionar avaliação
      course.reviews.push({
        user: userId,
        rating,
        comment,
        createdAt: new Date()
      });
      
      // Recalcular média de avaliações
      course.calculateAverageRating();
      
      await course.save();
      
      res.status(201).json({
        message: 'Avaliação adicionada com sucesso',
        review: {
          user: {
            id: user._id,
            name: user.name,
            profileImage: user.profileImage
          },
          rating,
          comment,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      res.status(500).json({ message: 'Erro ao adicionar avaliação', error: error.message });
    }
  },
  
  /**
   * Atualizar avaliação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { rating, comment } = req.body;
      
      // Validar rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'A avaliação deve ser entre 1 e 5' });
      }
      
      // Buscar curso que contém a avaliação
      const course = await Course.findOne({ 'reviews._id': id });
      if (!course) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Encontrar a avaliação
      const reviewIndex = course.reviews.findIndex(review => review._id.toString() === id);
      if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Verificar se o usuário é o autor da avaliação
      if (course.reviews[reviewIndex].user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o autor desta avaliação.' });
      }
      
      // Atualizar avaliação
      course.reviews[reviewIndex].rating = rating;
      course.reviews[reviewIndex].comment = comment;
      
      // Recalcular média de avaliações
      course.calculateAverageRating();
      
      await course.save();
      
      res.status(200).json({
        message: 'Avaliação atualizada com sucesso',
        review: course.reviews[reviewIndex]
      });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      res.status(500).json({ message: 'Erro ao atualizar avaliação', error: error.message });
    }
  },
  
  /**
   * Excluir avaliação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Buscar curso que contém a avaliação
      const course = await Course.findOne({ 'reviews._id': id });
      if (!course) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Encontrar a avaliação
      const reviewIndex = course.reviews.findIndex(review => review._id.toString() === id);
      if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Verificar se o usuário é o autor da avaliação
      if (course.reviews[reviewIndex].user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o autor desta avaliação.' });
      }
      
      // Remover avaliação
      course.reviews.splice(reviewIndex, 1);
      
      // Recalcular média de avaliações
      course.calculateAverageRating();
      
      await course.save();
      
      res.status(200).json({ message: 'Avaliação excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ message: 'Erro ao excluir avaliação', error: error.message });
    }
  },
  
  /**
   * Obter todas as avaliações (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getAllReviews: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      // Buscar todos os cursos com avaliações
      const courses = await Course.find({ 'reviews.0': { $exists: true } })
        .select('title reviews')
        .populate({
          path: 'reviews.user',
          select: 'name email'
        });
      
      // Extrair todas as avaliações
      let allReviews = [];
      courses.forEach(course => {
        course.reviews.forEach(review => {
          allReviews.push({
            id: review._id,
            courseId: course._id,
            courseTitle: course.title,
            user: review.user,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
          });
        });
      });
      
      // Ordenar por data (mais recentes primeiro)
      allReviews.sort((a, b) => b.createdAt - a.createdAt);
      
      // Aplicar paginação
      const skip = (page - 1) * limit;
      const paginatedReviews = allReviews.slice(skip, skip + parseInt(limit));
      
      res.status(200).json({
        reviews: paginatedReviews,
        pagination: {
          total: allReviews.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(allReviews.length / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter todas as avaliações:', error);
      res.status(500).json({ message: 'Erro ao obter todas as avaliações', error: error.message });
    }
  },
  
  /**
   * Excluir avaliação (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  adminDeleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar curso que contém a avaliação
      const course = await Course.findOne({ 'reviews._id': id });
      if (!course) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Encontrar a avaliação
      const reviewIndex = course.reviews.findIndex(review => review._id.toString() === id);
      if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Avaliação não encontrada' });
      }
      
      // Remover avaliação
      course.reviews.splice(reviewIndex, 1);
      
      // Recalcular média de avaliações
      course.calculateAverageRating();
      
      await course.save();
      
      res.status(200).json({ message: 'Avaliação excluída com sucesso pelo administrador' });
    } catch (error) {
      console.error('Erro ao excluir avaliação (admin):', error);
      res.status(500).json({ message: 'Erro ao excluir avaliação', error: error.message });
    }
  }
};

module.exports = reviewController;
