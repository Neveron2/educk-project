const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema da aula para o MongoDB
 * Define a estrutura dos documentos de aula na coleção
 */
const lessonSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Curso é obrigatório']
  },
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // em minutos
    default: 0
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'quiz', 'pdf', 'audio'],
    required: [true, 'Tipo de conteúdo é obrigatório']
  },
  content: {
    // Para vídeo, PDF e áudio, armazenamos a URL
    // Para texto, armazenamos o conteúdo em si
    type: String,
    required: [true, 'Conteúdo é obrigatório']
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  attachments: [{
    name: String,
    file: String, // URL do arquivo
    type: String
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctOption: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  completedBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    quizScore: Number
  }]
}, {
  timestamps: true
});

// Criação do modelo a partir do schema
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
