const Category = require('../models/category.model');
const Course = require('../models/course.model');
const slugify = require('slugify');

/**
 * Controller para gerenciamento de categorias
 */
const categoryController = {
  /**
   * Obter todas as categorias
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({ isActive: true })
        .sort({ order: 1, name: 1 });
      
      res.status(200).json(categories);
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      res.status(500).json({ message: 'Erro ao obter categorias', error: error.message });
    }
  },
  
  /**
   * Obter categoria por ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      res.status(200).json(category);
    } catch (error) {
      console.error('Erro ao obter categoria:', error);
      res.status(500).json({ message: 'Erro ao obter categoria', error: error.message });
    }
  },
  
  /**
   * Obter cursos de uma categoria
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  getCategoryCourses: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      // Verificar se a categoria existe
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      // Calcular skip para paginação
      const skip = (page - 1) * limit;
      
      // Buscar cursos da categoria
      const courses = await Course.find({ 
        category: id,
        status: 'published',
        isPublished: true
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('instructor', 'name')
        .populate('category', 'name');
      
      // Contar total de cursos para paginação
      const total = await Course.countDocuments({ 
        category: id,
        status: 'published',
        isPublished: true
      });
      
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
      console.error('Erro ao obter cursos da categoria:', error);
      res.status(500).json({ message: 'Erro ao obter cursos da categoria', error: error.message });
    }
  },
  
  /**
   * Criar nova categoria (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  createCategory: async (req, res) => {
    try {
      const { name, description, icon, color, parent, order } = req.body;
      
      // Gerar slug a partir do nome
      const slug = slugify(name, { lower: true });
      
      // Verificar se já existe categoria com este slug
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({ message: 'Já existe uma categoria com este nome' });
      }
      
      // Criar nova categoria
      const newCategory = new Category({
        name,
        slug,
        description,
        icon,
        color,
        parent,
        order
      });
      
      await newCategory.save();
      
      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category: newCategory
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ message: 'Erro ao criar categoria', error: error.message });
    }
  },
  
  /**
   * Atualizar categoria (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon, color, parent, order, isActive } = req.body;
      
      // Verificar se a categoria existe
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      // Atualizar campos
      if (name) {
        category.name = name;
        category.slug = slugify(name, { lower: true });
      }
      
      if (description !== undefined) category.description = description;
      if (icon) category.icon = icon;
      if (color) category.color = color;
      if (parent !== undefined) category.parent = parent;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;
      
      await category.save();
      
      res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        category
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ message: 'Erro ao atualizar categoria', error: error.message });
    }
  },
  
  /**
   * Excluir categoria (admin)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a categoria existe
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      // Verificar se existem cursos associados a esta categoria
      const coursesCount = await Course.countDocuments({ category: id });
      if (coursesCount > 0) {
        // Em vez de excluir, apenas desativar
        category.isActive = false;
        await category.save();
        
        return res.status(200).json({
          message: 'Categoria desativada pois possui cursos associados',
          category
        });
      }
      
      // Excluir categoria
      await Category.findByIdAndDelete(id);
      
      res.status(200).json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ message: 'Erro ao excluir categoria', error: error.message });
    }
  }
};

module.exports = categoryController;
