const User = require('../models/user.model');
const Course = require('../models/course.model');
const Order = require('../models/order.model');
const bcrypt = require('bcrypt');

/**
 * Controller para gerenciamento de usuários
 */
const userController = {
  /**
   * Obter perfil do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId)
        .select('-password -refreshToken -emailVerificationToken -passwordResetToken -passwordResetExpires');
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ message: 'Erro ao obter perfil', error: error.message });
    }
  },
  
  /**
   * Atualizar perfil do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name, bio, profileImage } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Atualizar campos
      if (name) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (profileImage) user.profileImage = profileImage;
      
      await user.save();
      
      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          profileImage: user.profileImage,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
    }
  },
  
  /**
   * Alterar senha do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  changePassword: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar senha atual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }
      
      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Atualizar senha
      user.password = hashedPassword;
      await user.save();
      
      res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
    }
  },
  
  /**
   * Obter cursos matriculados do usuário atual
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
   * Obter lista de desejos do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId)
        .populate({
          path: 'wishlist',
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
      
      res.status(200).json(user.wishlist);
    } catch (error) {
      console.error('Erro ao obter lista de desejos:', error);
      res.status(500).json({ message: 'Erro ao obter lista de desejos', error: error.message });
    }
  },
  
  /**
   * Adicionar curso à lista de desejos
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addToWishlist: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { courseId } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se o curso já está na lista de desejos
      if (user.wishlist.includes(courseId)) {
        return res.status(400).json({ message: 'Este curso já está na sua lista de desejos' });
      }
      
      // Adicionar à lista de desejos
      user.wishlist.push(courseId);
      await user.save();
      
      res.status(200).json({ message: 'Curso adicionado à lista de desejos com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar à lista de desejos:', error);
      res.status(500).json({ message: 'Erro ao adicionar à lista de desejos', error: error.message });
    }
  },
  
  /**
   * Remover curso da lista de desejos
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { courseId } = req.params;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se o curso está na lista de desejos
      const courseIndex = user.wishlist.indexOf(courseId);
      if (courseIndex === -1) {
        return res.status(400).json({ message: 'Este curso não está na sua lista de desejos' });
      }
      
      // Remover da lista de desejos
      user.wishlist.splice(courseIndex, 1);
      await user.save();
      
      res.status(200).json({ message: 'Curso removido da lista de desejos com sucesso' });
    } catch (error) {
      console.error('Erro ao remover da lista de desejos:', error);
      res.status(500).json({ message: 'Erro ao remover da lista de desejos', error: error.message });
    }
  },
  
  /**
   * Obter notificações do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId).select('notifications');
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.status(200).json(user.notifications);
    } catch (error) {
      console.error('Erro ao obter notificações:', error);
      res.status(500).json({ message: 'Erro ao obter notificações', error: error.message });
    }
  },
  
  /**
   * Marcar notificação como lida
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  markNotificationAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Encontrar a notificação
      const notification = user.notifications.id(notificationId);
      if (!notification) {
        return res.status(404).json({ message: 'Notificação não encontrada' });
      }
      
      // Marcar como lida
      notification.read = true;
      await user.save();
      
      res.status(200).json({ message: 'Notificação marcada como lida' });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ message: 'Erro ao marcar notificação como lida', error: error.message });
    }
  },
  
  /**
   * Obter dashboard do professor
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getTeacherDashboard: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Verificar se o usuário é professor
      const user = await User.findById(userId);
      if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Obter cursos criados pelo professor
      const courses = await Course.find({ instructor: userId });
      
      // Obter estatísticas de vendas
      const totalSales = courses.reduce((total, course) => total + course.salesCount, 0);
      
      // Obter avaliações
      const totalReviews = courses.reduce((total, course) => total + course.totalReviews, 0);
      const averageRating = totalReviews > 0 
        ? courses.reduce((total, course) => total + (course.averageRating * course.totalReviews), 0) / totalReviews 
        : 0;
      
      // Obter pedidos recentes
      const recentOrders = await Order.find({
        'courses.course': { $in: courses.map(course => course._id) },
        status: 'completed'
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email');
      
      res.status(200).json({
        coursesCount: courses.length,
        totalSales,
        totalStudents: courses.reduce((total, course) => total + course.students.length, 0),
        totalReviews,
        averageRating,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          user: {
            id: order.user._id,
            name: order.user.name,
            email: order.user.email
          },
          amount: order.finalAmount,
          date: order.createdAt
        })),
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          status: course.status,
          salesCount: course.salesCount,
          studentsCount: course.students.length,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews
        }))
      });
    } catch (error) {
      console.error('Erro ao obter dashboard do professor:', error);
      res.status(500).json({ message: 'Erro ao obter dashboard do professor', error: error.message });
    }
  },
  
  /**
   * Obter lista de professores
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getTeachers: async (req, res) => {
    try {
      const teachers = await User.find({ role: 'teacher' })
        .select('name bio profileImage')
        .populate({
          path: 'createdCourses',
          select: 'title'
        });
      
      res.status(200).json(teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.name,
        bio: teacher.bio,
        profileImage: teacher.profileImage,
        coursesCount: teacher.createdCourses.length
      })));
    } catch (error) {
      console.error('Erro ao obter lista de professores:', error);
      res.status(500).json({ message: 'Erro ao obter lista de professores', error: error.message });
    }
  },
  
  // Rotas administrativas
  
  /**
   * Obter todos os usuários (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find()
        .select('-password -refreshToken -emailVerificationToken -passwordResetToken -passwordResetExpires');
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      res.status(500).json({ message: 'Erro ao obter usuários', error: error.message });
    }
  },
  
  /**
   * Obter usuário por ID (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id)
        .select('-password -refreshToken -emailVerificationToken -passwordResetToken -passwordResetExpires');
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      res.status(500).json({ message: 'Erro ao obter usuário', error: error.message });
    }
  },
  
  /**
   * Atualizar usuário (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, bio, profileImage, emailVerified } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Atualizar campos
      if (name) user.name = name;
      if (email) user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (profileImage) user.profileImage = profileImage;
      if (emailVerified !== undefined) user.emailVerified = emailVerified;
      
      await user.save();
      
      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          profileImage: user.profileImage,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
  },
  
  /**
   * Excluir usuário (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o usuário existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
   
(Content truncated due to size limit. Use line ranges to read in chunks)