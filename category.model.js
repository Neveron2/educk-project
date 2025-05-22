const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema da categoria para o MongoDB
 * Define a estrutura dos documentos de categoria na coleção
 */
const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: [true, 'Slug é obrigatório'],
    trim: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#6C63FF' // Cor padrão do Educk (roxo)
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para cursos relacionados a esta categoria
categorySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'category'
});

// Criação do modelo a partir do schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
