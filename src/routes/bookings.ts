import { FastifyInstance } from 'fastify';
import { createBooking, getBookings, getBooking, updateBooking, deleteBooking } from '../controllers/bookingController';
import { rbac } from '../middleware/rbac';

export const bookingRoutes = async (app: FastifyInstance) => {
  app.post('/',  createBooking);
  app.get('/',  getBookings);
  app.get('/:id',  getBooking);
  app.put('/:id',  updateBooking);
  app.delete('/:id', deleteBooking);
};
