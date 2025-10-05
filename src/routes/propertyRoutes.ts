import { FastifyInstance } from 'fastify';
import { getPropertyTypes, getPropertySizes } from '../controllers/propertyController';

export const propertyRoutes = async (app: FastifyInstance) => {
  app.get('/types', getPropertyTypes);
  app.get('/sizes', getPropertySizes);
};