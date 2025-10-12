import { FastifyInstance } from 'fastify';
import { 
  createServiceCategory, 
  getServiceCategories, 
  getServiceCategory, 
  updateServiceCategory, 
  deleteServiceCategory,
  addServiceToCategory,
  removeServiceFromCategory
} from '../controllers/serviceCategoryController';

export const serviceCategoryRoutes = async (app: FastifyInstance) => {
  app.post('/', createServiceCategory);
  app.get('/', getServiceCategories);
  app.get('/:id', getServiceCategory);
  app.put('/:id', updateServiceCategory);
  app.delete('/:id', deleteServiceCategory);
  app.post('/:id/services', addServiceToCategory);
  app.delete('/:id/services/:serviceId', removeServiceFromCategory);
};