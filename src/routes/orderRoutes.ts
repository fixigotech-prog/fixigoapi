import { FastifyInstance } from 'fastify';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrder,
  addOrderLog
} from '../controllers/orderController';

export const orderRoutes = async (app: FastifyInstance) => {
  app.post('/', createOrder);
  app.get('/', getOrders);
  app.get('/:id', getOrder);
  app.put('/:id', updateOrder);
  app.post('/:id/logs', addOrderLog);
};