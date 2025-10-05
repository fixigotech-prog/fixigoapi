import { FastifyInstance } from 'fastify';
import { register, login } from '../controllers/userController';

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', register);
  app.post('/login', login);
};
