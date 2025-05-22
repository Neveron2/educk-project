const Course = require('../models/course.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

/**
 * Controller para gerenciamento de cursos
 */
const courseController = {
  /**
   * Obter todos os cursos
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getAllCourses: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, category, level, sort = 'newest' } = req.query;
      
      // Construir filtro
      const filter = {
        status: 'published',
        isPublished: true
      };
      
      // Adicionar filtro de pesquisa
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      // Adicionar filtro de categoria
      if (category) {
        filter.category = category;
      }
      
      // Adicionar filtro de nível
      if (level) {
        filter.level = level;
      }
      
      // Definir ordenação
      let sortOption = {};
      switch (sort) {
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'price_low':
          sortOption = { price: 1 };
          break;
        case 'price_high':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'popular':
          sortOption = { salesCount: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar cursos com paginação
      const courses = await Course.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('instructor', 'name profileImage')
        .populate('category', 'name');
      
      // Contar total de cursos para paginação
      const total = await Course.countDocuments(filter);
      
      res.status(200).json({
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter cursos:', error);
      res.status(500).json({ message: 'Erro ao obter cursos', error: error.message });
    }
  },
  
  /**
   * Obter cursos em destaque
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getFeaturedCourses: async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      
      const courses = await Course.find({
        status: 'published',
        isPublished: true,
        isFeatured: true
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('instructor', 'name profileImage')
        .populate('category', 'name');
      
      res.status(200).json(courses);
    } catch (error) {
      console.error('Erro ao obter cursos em destaque:', error);
      res.status(500).json({ message: 'Erro ao obter cursos em destaque', error: error.message });
    }
  },
  
  /**
   * Obter cursos por categoria
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCoursesByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;
      
      // Verificar se a categoria existe
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      // Definir ordenação
      let sortOption = {};
      switch (sort) {
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'price_low':
          sortOption = { price: 1 };
          break;
        case 'price_high':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'popular':
          sortOption = { salesCount: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar cursos da categoria
      const courses = await Course.find({
        category: categoryId,
        status: 'published',
        isPublished: true
      })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('instructor', 'name profileImage')
        .populate('category', 'name');
      
      // Contar total de cursos para paginação
      const total = await Course.countDocuments({
        category: categoryId,
        status: 'published',
        isPublished: true
      });
      
      res.status(200).json({
        category: {
          id: category._id,
          name: category.name,
          description: category.description
        },
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter cursos por categoria:', error);
      res.status(500).json({ message: 'Erro ao obter cursos por categoria', error: error.message });
    }
  },
  
  /**
   * Pesquisar cursos
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  searchCourses: async (req, res) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Termo de pesquisa não fornecido' });
      }
      
      // Construir filtro de pesquisa
      const filter = {
        status: 'published',
        isPublished: true,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      };
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar cursos
      const courses = await Course.find(filter)
        .sort({ averageRating: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('instructor', 'name profileImage')
        .populate('category', 'name');
      
      // Contar total de cursos para paginação
      const total = await Course.countDocuments(filter);
      
      res.status(200).json({
        query: q,
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao pesquisar cursos:', error);
      res.status(500).json({ message: 'Erro ao pesquisar cursos', error: error.message });
    }
  },
  
  /**
   * Obter curso por ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await Course.findById(id)
        .populate('instructor', 'name profileImage bio')
        .populate('category', 'name')
        .populate({
          path: 'lessons',
          select: 'title description duration contentType isPreview order',
          options: { sort: { order: 1 } }
        });
      
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o curso está publicado
      if (course.status !== 'published' || !course.isPublished) {
        // Se o usuário estiver autenticado, verificar se é o instrutor ou admin
        if (req.user) {
          const isInstructor = course.instructor._id.toString() === req.user.userId;
          const isAdmin = req.user.role === 'admin';
          
          if (!isInstructor && !isAdmin) {
            return res.status(403).json({ message: 'Este curso não está disponível' });
          }
        } else {
          return res.status(403).json({ message: 'Este curso não está disponível' });
        }
      }
      
      res.status(200).json(course);
    } catch (error) {
      console.error('Erro ao obter curso:', error);
      res.status(500).json({ message: 'Erro ao obter curso', error: error.message });
    }
  },
  
  /**
   * Obter avaliações de um curso
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCourseReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar curso com avaliações populadas
      const courseWithReviews = await Course.findById(id)
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
   * Matricular-se em um curso
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  enrollCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário já está matriculado
      const user = await User.findById(userId);
      if (user.enrolledCourses.includes(id)) {
        return res.status(400).json({ message: 'Você já está matriculado neste curso' });
      }
      
      // Matricular usuário
      user.enrolledCourses.push(id);
      await user.save();
      
      // Adicionar usuário à lista de alunos do curso
      course.students.push(userId);
      await course.save();
      
      res.status(200).json({ message: 'Matrícula realizada com sucesso' });
    } catch (error) {
      console.error('Erro ao matricular-se no curso:', error);
      res.status(500).json({ message: 'Erro ao matricular-se no curso', error: error.message });
    }
  },
  
  /**
   * Adicionar avaliação a um curso
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addReview: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { rating, comment } = req.body;
      
      // Validar rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'A avaliação deve ser entre 1 e 5' });
      }
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário está matriculado no curso
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses.includes(id);
      
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
   * Obter cursos matriculados
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getEnrolledCourses: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId)
        .populate({
          path: 'enrolledCourses',
          select: 'title description thumbnail instructor price category averageRating',
          populate: [
            {
              path: 'instructor',
              select: 'name'
            },
            {
              path: 'category',
              select: 'name'
            }
          ]
        });
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.status(200).json(user.enrolledCourses);
    } catch (error) {
      console.error('Erro ao obter cursos matriculados:', error);
      res.status(500).json({ message: 'Erro ao obter cursos matriculados', error: error.message });
    }
  },
  
  /**
   * Criar novo curso (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  createCourse: async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        title,
        description,
        shortDescription,
        price,
        discountPrice,
        thumbnail,
        category,
        tags,
        level,
        language,
        requirements,
        whatYouWillLearn
      } = req.body;
      
      // Verificar se a categoria existe
      const categoryExists = await Category.findById(category);
      if (!category || !categoryExists) {
        return res.status(400).json({ message: 'Categoria inválida' });
      }
      
      // Criar novo curso
      const newCourse = new Course({
        title,
        description,
        shortDescription,
        instructor: userId,
        price,
        discountPrice,
        thumbnail,
        category,
        tags: tags || [],
        level,
        language,
        requirements: requirements || [],
        whatYouWillLearn: whatYouWillLearn || [],
        status: 'draft'
      });
      
      await newCourse.save();
      
      // Adicionar curso à lista de cursos criados pelo usuário
      await User.findByIdAndUpdate(userId, {
        $push: { createdCourses: newCourse._id }
      });
      
      res.status(201).json({
        message: 'Curso criado com sucesso',
        course: newCourse
      });
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      res.status(500).json({ message: 'Erro ao criar curso', error: error.message });
    }
  },
  
  /**
   * Atualizar curso (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const {
        title,
        description,
        shortDescription,
        price,
        discountPrice,
        thumbnail,
        category,
        tags,
        level,
        language,
        requirements,
        whatYouWillLearn
      } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Verificar se a categoria existe, se fornecida
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(400).json({ message: 'Categoria inválida' });
        }
      }
      
      // Atualizar campos
      if (title) course.title = title;
      if (description) course.description = description;
      if (shortDescription) course.shortDescription = shortDescription;
      if (price !== undefined) course.price = price;
      if (discountPrice !== undefined) course.discountPrice = discountPrice;
      if (thumbnail) course.thumbnail = thumbnail;
      if (category) course.category = category;
      if (tags) course.tags = tags;
      if (level) course.level = level;
      if (language) course.language = language;
      if (requirements) course.requirements = requirements;
      if (whatYouWillLearn) course.whatYouWillLearn = whatYouWillLearn;
      
      // Se o curso estava publicado, voltar para pendente após edição
      if (course.status === 'published') {
        course.status = 'pending';
      }
      
      await course.save();
      
      res.status(200).json({
        message: 'Curso atualizado com sucesso',
        course
      });
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      res.status(500).json({ message: 'Erro ao atualizar curso', error: error.message });
    }
  },
  
  /**
   * Excluir curso (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Verificar se o curso tem alunos matriculados
      if (course.students.length > 0) {
        return res.status(400).json({ message: 'Não é possível excluir um curso com alunos matriculados' });
      }
      
      // Remover curso da lista de cursos criados pelo usuário
      await User.findByIdAndUpdate(userId, {
        $pull: { createdCourses: id }
      });
      
      // Excluir curso
      await Course.findByIdAndDelete(id);
      
      res.status(200).json({ message: 'Curso excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      res.status(500).json({ message: 'Erro ao excluir curso', error: error.message });
    }
  },
  
  /**
   * Adicionar aula a um curso (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addLesson: async (req, res) => {
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
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Criar nova aula
      const Lesson = require('../models/lesson.model');
      const newLesson = new Lesson({
        title,
        description,
        course: id,
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
      
      // Atualizar duração total do curso
      course.duration = (course.duration || 0) + (duration || 0);
      
      await course.save();
      
      res.status(201).json({
        message: 'Aula adicionada com sucesso',
        lesson: newLesson
      });
    } catch (error) {
      console.error('Erro ao adicionar aula:', error);
      res.status(500).json({ message: 'Erro ao adicionar aula', error: error.message });
    }
  },
  
  /**
   * Publicar curso (professor)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  publishCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário é o instrutor do curso
      if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Você não é o instrutor deste curso.' });
      }
      
      // Verificar se o curso tem pelo menos uma aula
      if (!course.lessons || course.lessons.length === 0) {
        return res.status(400).json({ message: 'O curso precisa ter pelo menos uma aula para ser publicado' });
      }
      
      // Atualizar status do curso
      course.status = 'pending';
      
      await course.save();
      
      res.status(200).json({
        message: 'Curso enviado para aprovação com sucesso',
        course: {
          id: course._id,
          title: course.title,
          status: course.status
        }
      });
    } catch (error) {
      console.error('Erro ao publicar curso:', error);
      res.status(500).json({ message: 'Erro ao publicar curso', error: error.message });
    }
  },
  
  /**
   * Obter cursos criados pelo professor
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCreatedCourses: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const courses = await Course.find({ instructor: userId })
        .sort({ createdAt: -1 })
        .populate('category', 'name');
      
      res.status(200).json(courses);
    } catch (error) {
      console.error('Erro ao obter cursos criados:', error);
      res.status(500).json({ message: 'Erro ao obter cursos criados', error: error.message });
    }
  },
  
  // Rotas administrativas
  
  /**
   * Aprovar curso (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  approveCourse: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Atualizar status do curso
      course.status = 'published';
      course.isPublished = true;
      course.publishedAt = new Date();
      
      await course.save();
      
      // Notificar instrutor
      const instructor = await User.findById(course.instructor);
      if (instructor) {
        instructor.notifications.push({
          message: `Seu curso "${course.title}" foi aprovado e está agora disponível na plataforma.`,
          read: false,
          createdAt: new Date()
        });
        
        await instructor.save();
      }
      
      res.status(200).json({
        message: 'Curso aprovado com sucesso',
        course: {
          id: course._id,
          title: course.title,
          status: course.status,
          isPublished: course.isPublished,
          publishedAt: course.publishedAt
        }
      });
    } catch (error) {
      console.error('Erro ao aprovar curso:', error);
      res.status(500).json({ message: 'Erro ao aprovar curso', error: error.message });
    }
  },
  
  /**
   * Rejeitar curso (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  rejectCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Atualizar status do curso
      course.status = 'rejected';
      
      await course.save();
      
      // Notificar instrutor
      const instructor = await User.findById(course.instructor);
      if (instructor) {
        instructor.notifications.push({
          message: `Seu curso "${course.title}" foi rejeitado. Motivo: ${reason || 'Não especificado'}`,
          read: false,
          createdAt: new Date()
        });
        
        await instructor.save();
      }
      
      res.status(200).json({
        message: 'Curso rejeitado com sucesso',
        course: {
          id: course._id,
          title: course.title,
          status: course.status
        }
      });
    } catch (error) {
      console.error('Erro ao rejeitar curso:', error);
      res.status(500).json({ message: 'Erro ao rejeitar curso', error: error.message });
    }
  },
  
  /**
   * Destacar curso (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  featureCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Atualizar status de destaque
      course.isFeatured = isFeatured;
      
      await course.save();
      
      res.status(200).json({
        message: isFeatured ? 'Curso destacado com sucesso' : 'Curso removido dos destaques com sucesso',
        course: {
          id: course._id,
          title: course.title,
          isFeatured: course.isFeatured
        }
      });
    } catch (error) {
      console.error('Erro ao destacar curso:', error);
      res.status(500).json({ message: 'Erro ao destacar curso', error: error.message });
    }
  }
};

module.exports = courseController;
