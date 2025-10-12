import { FastifyInstance } from 'fastify';
import { register, login,verifyOtp,resendOtp } from '../controllers/userController';

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/verify-otp', verifyOtp);
  app.post('/resend-otp', resendOtp);
};
