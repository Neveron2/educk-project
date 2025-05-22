const User = require('../models/user.model');
const Course = require('../models/course.model');
const Order = require('../models/order.model');

/**
 * Controller para gerenciamento do carrinho de compras
 */
const cartController = {
  /**
   * Obter o carrinho do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Buscar usuário com carrinho populado
      const user = await User.findById(userId)
        .populate({
          path: 'cart.course',
          select: 'title thumbnail price discountPrice instructor',
          populate: {
            path: 'instructor',
            select: 'name'
          }
        });
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Calcular valor total
      let totalAmount = 0;
      let items = [];
      
      if (user.cart && user.cart.length > 0) {
        items = user.cart.map(item => {
          const price = item.course.discountPrice > 0 ? item.course.discountPrice : item.course.price;
          totalAmount += price;
          
          return {
            courseId: item.course._id,
            title: item.course.title,
            thumbnail: item.course.thumbnail,
            price: item.course.price,
            discountPrice: item.course.discountPrice,
            finalPrice: price,
            instructor: item.course.instructor.name,
            addedAt: item.addedAt
          };
        });
      }
      
      res.status(200).json({
        items,
        totalAmount,
        itemCount: items.length
      });
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      res.status(500).json({ message: 'Erro ao obter carrinho', error: error.message });
    }
  },
  
  /**
   * Adicionar curso ao carrinho
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  addToCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { courseId } = req.body;
      
      // Verificar se o curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }
      
      // Verificar se o usuário já está matriculado no curso
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      if (user.enrolledCourses.includes(courseId)) {
        return res.status(400).json({ message: 'Você já está matriculado neste curso' });
      }
      
      // Verificar se o curso já está no carrinho
      const isInCart = user.cart.some(item => item.course.toString() === courseId);
      if (isInCart) {
        return res.status(400).json({ message: 'Este curso já está no seu carrinho' });
      }
      
      // Adicionar curso ao carrinho
      user.cart.push({
        course: courseId,
        addedAt: new Date()
      });
      
      await user.save();
      
      res.status(200).json({ message: 'Curso adicionado ao carrinho com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      res.status(500).json({ message: 'Erro ao adicionar ao carrinho', error: error.message });
    }
  },
  
  /**
   * Remover curso do carrinho
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { courseId } = req.params;
      
      // Buscar usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se o curso está no carrinho
      const cartItemIndex = user.cart.findIndex(item => item.course.toString() === courseId);
      if (cartItemIndex === -1) {
        return res.status(400).json({ message: 'Este curso não está no seu carrinho' });
      }
      
      // Remover curso do carrinho
      user.cart.splice(cartItemIndex, 1);
      await user.save();
      
      res.status(200).json({ message: 'Curso removido do carrinho com sucesso' });
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      res.status(500).json({ message: 'Erro ao remover do carrinho', error: error.message });
    }
  },
  
  /**
   * Limpar o carrinho
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  clearCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Buscar usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Limpar carrinho
      user.cart = [];
      await user.save();
      
      res.status(200).json({ message: 'Carrinho limpo com sucesso' });
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      res.status(500).json({ message: 'Erro ao limpar carrinho', error: error.message });
    }
  },
  
  /**
   * Aplicar cupom de desconto
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  applyCoupon: async (req, res) => {
    try {
      const { couponCode } = req.body;
      
      // Nota: Em um sistema real, teríamos um modelo de cupons
      // Para fins acadêmicos, simulamos alguns cupons fixos
      const validCoupons = {
        'WELCOME10': { discount: 10, description: '10% de desconto' },
        'EDUCK20': { discount: 20, description: '20% de desconto' },
        'STUDENT50': { discount: 50, description: '50% de desconto para estudantes' }
      };
      
      if (!validCoupons[couponCode]) {
        return res.status(400).json({ message: 'Cupom inválido ou expirado' });
      }
      
      const coupon = validCoupons[couponCode];
      
      res.status(200).json({
        message: 'Cupom aplicado com sucesso',
        coupon: {
          code: couponCode,
          discount: coupon.discount,
          description: coupon.description
        }
      });
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      res.status(500).json({ message: 'Erro ao aplicar cupom', error: error.message });
    }
  },
  
  /**
   * Checkout - criar pedido a partir do carrinho
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  checkout: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { paymentMethod, couponCode } = req.body;
      
      // Buscar usuário com carrinho populado
      const user = await User.findById(userId).populate('cart.course');
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se o carrinho está vazio
      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: 'Seu carrinho está vazio' });
      }
      
      // Preparar itens do pedido
      const orderItems = user.cart.map(item => ({
        course: item.course._id,
        price: item.course.price,
        discountPrice: item.course.discountPrice
      }));
      
      // Calcular valores
      const totalAmount = user.cart.reduce((total, item) => total + item.course.price, 0);
      const discountAmount = user.cart.reduce((total, item) => total + (item.course.discountPrice || 0), 0);
      let finalAmount = totalAmount - discountAmount;
      
      // Aplicar cupom, se fornecido
      let couponDiscount = 0;
      if (couponCode) {
        // Simulação de cupons para fins acadêmicos
        const validCoupons = {
          'WELCOME10': { discount: 10 },
          'EDUCK20': { discount: 20 },
          'STUDENT50': { discount: 50 }
        };
        
        if (validCoupons[couponCode]) {
          couponDiscount = (finalAmount * validCoupons[couponCode].discount) / 100;
          finalAmount -= couponDiscount;
        }
      }
      
      // Garantir que o valor final não seja negativo
      if (finalAmount < 0) finalAmount = 0;
      
      // Criar o pedido
      const order = new Order({
        user: userId,
        courses: orderItems,
        totalAmount,
        discountAmount: discountAmount + couponDiscount,
        finalAmount,
        paymentMethod,
        coupon: couponCode ? {
          code: couponCode,
          discount: validCoupons[couponCode]?.discount
        } : undefined
      });
      
      // Simular processamento de pagamento
      // Nota: Em um sistema real, integraríamos com um gateway de pagamento
      let paymentDetails = {};
      
      switch (paymentMethod) {
        case 'credit_card':
          paymentDetails = {
            transactionId: `TR${Date.now()}`,
            paymentDate: new Date(),
            cardLastFour: '4242' // Simulação
          };
          break;
        case 'pix':
          paymentDetails = {
            transactionId: `PIX${Date.now()}`,
            paymentDate: new Date(),
            pixCode: '00020126580014br.gov.bcb.pix0136a629532e-7693-4846-b028-f142a1dd1d55520400005303986540510.005802BR5913Educk Cursos6008Sorocaba62070503***63041234' // Simulação
          };
          break;
        case 'boleto':
          paymentDetails = {
            transactionId: `BOL${Date.now()}`,
            boletoUrl: 'https://exemplo.com/boleto/12345' // Simulação
          };
          break;
      }
      
      order.paymentDetails = paymentDetails;
      
      // Para fins de simulação, marcamos o pagamento como concluído
      // Em um sistema real, isso seria feito após confirmação do gateway
      if (paymentMethod === 'credit_card' || paymentMethod === 'pix') {
        order.paymentStatus = 'completed';
        order.status = 'completed';
        
        // Matricular usuário nos cursos
        for (const item of orderItems) {
          if (!user.enrolledCourses.includes(item.course)) {
            user.enrolledCourses.push(item.course);
          }
          
          // Incrementar contador de vendas do curso
          await Course.findByIdAndUpdate(item.course, {
            $inc: { salesCount: 1 },
            $addToSet: { students: userId }
          });
        }
      } else {
        order.paymentStatus = 'pending';
        order.status = 'pending';
      }
      
      // Salvar o pedido
      await order.save();
      
      // Limpar o carrinho do usuário
      user.cart = [];
      await user.save();
      
      res.status(201).json({
        message: 'Pedido criado com sucesso',
        order: {
          id: order._id,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          paymentDetails: order.paymentDetails
        }
      });
    } catch (error) {
      console.error('Erro no checkout:', error);
      res.status(500).json({ message: 'Erro ao processar checkout', error: error.message });
    }
  }
};

module.exports = cartController;
