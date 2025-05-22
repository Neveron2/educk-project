const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema do usuário para o MongoDB
 * Define a estrutura dos documentos de usuário na coleção
 */
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, forneça um e-mail válido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  cart: [{
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  notifications: [{
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: Date
}, {
  timestamps: true
});

/**
 * Método para remover campos sensíveis ao converter para JSON
 * Útil para não expor senha e tokens em respostas da API
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.refreshToken;
  return user;
};

// Criação do modelo a partir do schema
const User = mongoose.model('User', userSchema);

module.exports = User;
