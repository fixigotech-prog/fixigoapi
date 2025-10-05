import { FastifyInstance } from 'fastify';
import { createAdmin, getAdmins, getAdmin, updateAdmin, deleteAdmin } from '../controllers/adminUsers';

export const adminUserRoutes = async (app: FastifyInstance) => {
  app.post('/', createAdmin);
  app.get('/', getAdmins);
  app.get('/:id', getAdmin);
  app.put('/:id', updateAdmin);
  app.delete('/:id', deleteAdmin);
};