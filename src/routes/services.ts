import { FastifyInstance } from 'fastify';
import { createService, getServices, getService, updateService, deleteService, searchServicesByCategory } from '../controllers/serviceController';
import { rbac } from '../middleware/rbac';

export const serviceRoutes = async (app: FastifyInstance) => {
  app.post('/', createService);
  app.get('/',  getServices);
  app.get('/search', searchServicesByCategory);
  app.get('/:id', getService);
  app.put('/:id',  updateService);
  app.delete('/:id',  deleteService);
};