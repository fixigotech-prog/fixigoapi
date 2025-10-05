import { FastifyInstance } from 'fastify';
import { uploadFile } from '../controllers/uploadController';
import { rbac } from '../middleware/rbac';


export const uploadRoutes = async (app: FastifyInstance) => {
  app.post('/', uploadFile);
 
};