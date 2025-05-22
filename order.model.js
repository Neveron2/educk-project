const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema do pedido para o MongoDB
 * Define a estrutura dos documentos de pedido na coleção
 */
const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  courses: [{
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Valor total é obrigatório']
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: [true, 'Valor final é obrigatório']
  },
  coupon: {
    code: String,
    discount: Number
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'pix', 'boleto'],
    required: [true, 'Método de pagamento é obrigatório']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    cardLastFour: String,
    pixCode: String,
    boletoUrl: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  invoice: {
    number: String,
    url: String,
    issuedAt: Date
  }
}, {
  timestamps: true
});

// Método para calcular o valor final do pedido
orderSchema.methods.calculateFinalAmount = function() {
  this.totalAmount = this.courses.reduce((total, item) => total + item.price, 0);
  this.discountAmount = this.courses.reduce((total, item) => total + (item.discountPrice || 0), 0);
  
  // Aplicar desconto de cupom, se houver
  if (this.coupon && this.coupon.discount) {
    this.discountAmount += (this.totalAmount * this.coupon.discount / 100);
  }
  
  this.finalAmount = this.totalAmount - this.discountAmount;
  
  // Garantir que o valor final não seja negativo
  if (this.finalAmount < 0) {
    this.finalAmount = 0;
  }
};

// Middleware para calcular o valor final antes de salvar
orderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('courses') || this.isModified('coupon')) {
    this.calculateFinalAmount();
  }
  next();
});

// Criação do modelo a partir do schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
