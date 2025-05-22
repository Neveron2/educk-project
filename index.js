// Arquivo de rotas principal que agrega todas as rotas da API
const express = require('express');
const router = express.Router();

// Importação das rotas específicas
// Nota: Estes arquivos serão criados em seguida
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const lessonRoutes = require('./routes/lesson.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');

// Definição das rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);

// Exportação do router
module.exports = router;
