const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema do curso para o MongoDB
 * Define a estrutura dos documentos de curso na coleção
 */
const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória']
  },
  shortDescription: {
    type: String,
    required: [true, 'Descrição curta é obrigatória'],
    maxlength: [200, 'A descrição curta deve ter no máximo 200 caracteres']
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instrutor é obrigatório']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'O preço não pode ser negativo']
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Categoria é obrigatória']
  },
  tags: [{
    type: String,
    trim: true
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'pt-BR'
  },
  duration: {
    type: Number, // em minutos
    default: 0
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  requirements: [{
    type: String
  }],
  whatYouWillLearn: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Método para calcular a média de avaliações
 * Atualiza os campos averageRating e totalReviews
 */
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = sum / this.reviews.length;
  this.totalReviews = this.reviews.length;
};

// Middleware para calcular a média de avaliações antes de salvar
courseSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }
  next();
});

// Criação do modelo a partir do schema
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
