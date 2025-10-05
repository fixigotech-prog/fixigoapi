import { FastifyInstance } from 'fastify';
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory, getCategoriesByParent } from '../controllers/categoryController';
import { rbac } from '../middleware/rbac';

export const categoryRoutes = async (app: FastifyInstance) => {
  app.post('/', createCategory);
  app.get('/',  getCategories);
  app.get('/parent/:parentId', getCategoriesByParent);
  app.get('/:id',  getCategory);
  app.put('/:id',  updateCategory);
  app.delete('/:id',  deleteCategory);
};