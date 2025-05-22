const Order = require('../models/order.model');
const User = require('../models/user.model');

/**
 * Controller para gerenciamento de pedidos
 */
const orderController = {
  /**
   * Obter pedidos do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'courses.course',
          select: 'title thumbnail'
        });
      
      res.status(200).json(orders);
    } catch (error) {
      console.error('Erro ao obter pedidos do usuário:', error);
      res.status(500).json({ message: 'Erro ao obter pedidos', error: error.message });
    }
  },
  
  /**
   * Obter detalhes de um pedido específico
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const order = await Order.findById(id)
        .populate({
          path: 'courses.course',
          select: 'title thumbnail description instructor',
          populate: {
            path: 'instructor',
            select: 'name'
          }
        });
      
      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      
      // Verificar se o pedido pertence ao usuário ou se é um admin
      if (order.user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      res.status(200).json(order);
    } catch (error) {
      console.error('Erro ao obter detalhes do pedido:', error);
      res.status(500).json({ message: 'Erro ao obter detalhes do pedido', error: error.message });
    }
  },
  
  /**
   * Verificar status de pagamento de um pedido
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  checkPaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      
      // Verificar se o pedido pertence ao usuário ou se é um admin
      if (order.user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Em um sistema real, aqui faríamos uma consulta ao gateway de pagamento
      // Para fins acadêmicos, apenas retornamos o status atual
      
      res.status(200).json({
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails
      });
    } catch (error) {
      console.error('Erro ao verificar status de pagamento:', error);
      res.status(500).json({ message: 'Erro ao verificar status de pagamento', error: error.message });
    }
  },
  
  /**
   * Gerar comprovante de um pedido
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  generateReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const order = await Order.findById(id)
        .populate({
          path: 'courses.course',
          select: 'title price discountPrice'
        })
        .populate('user', 'name email');
      
      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      
      // Verificar se o pedido pertence ao usuário ou se é um admin
      if (order.user._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Em um sistema real, aqui geramos um PDF ou HTML formatado
      // Para fins acadêmicos, apenas retornamos os dados do comprovante
      
      const receipt = {
        receiptNumber: `REC-${order._id.toString().substring(0, 8).toUpperCase()}`,
        orderDate: order.createdAt,
        customer: {
          name: order.user.name,
          email: order.user.email
        },
        items: order.courses.map(item => ({
          title: item.course.title,
          price: item.price,
          discountPrice: item.discountPrice
        })),
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        status: order.status
      };
      
      res.status(200).json(receipt);
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      res.status(500).json({ message: 'Erro ao gerar comprovante', error: error.message });
    }
  },
  
  // Rotas administrativas
  
  /**
   * Obter todos os pedidos (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getAllOrders: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      // Construir filtro
      const filter = {};
      if (status) {
        filter.status = status;
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar pedidos com paginação
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email')
        .populate('courses.course', 'title');
      
      // Contar total de pedidos para paginação
      const total = await Order.countDocuments(filter);
      
      res.status(200).json({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      res.status(500).json({ message: 'Erro ao obter pedidos', error: error.message });
    }
  },
  
  /**
   * Atualizar status de um pedido (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      
      // Verificar se o pedido existe
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      
      // Atualizar status
      if (status) {
        order.status = status;
      }
      
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        
        // Se o pagamento foi concluído, matricular o usuário nos cursos
        if (paymentStatus === 'completed' && order.paymentStatus !== 'completed') {
          const user = await User.findById(order.user);
          
          for (const item of order.courses) {
            if (!user.enrolledCourses.includes(item.course)) {
              user.enrolledCourses.push(item.course);
            }
          }
          
          await user.save();
        }
      }
      
      await order.save();
      
      res.status(200).json({
        message: 'Status do pedido atualizado com sucesso',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      res.status(500).json({ message: 'Erro ao atualizar status do pedido', error: error.message });
    }
  }
};

module.exports = orderController;
