import { FastifyInstance } from 'fastify';
import { 
  createInvoice, 
  getInvoices, 
  getInvoice, 
  updateInvoice,
  markInvoicePaid
} from '../controllers/invoiceController';

export const invoiceRoutes = async (app: FastifyInstance) => {
  app.post('/', createInvoice);
  app.get('/', getInvoices);
  app.get('/:id', getInvoice);
  app.put('/:id', updateInvoice);
  app.patch('/:id/pay', markInvoicePaid);
};