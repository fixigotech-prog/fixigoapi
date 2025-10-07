import { FastifyInstance } from 'fastify';
import { addFrequentService, getFrequentServices, getFrequentServiceById, updateFrequentService, deleteFrequentService } from '../controllers/frequentServiceController';

export const frequentServiceRoutes = async (app: FastifyInstance) => {
  app.post('/', addFrequentService);
  app.get('/', getFrequentServices);
  app.get('/:id', getFrequentServiceById);
  app.put('/:id', updateFrequentService);
  app.delete('/:id', deleteFrequentService);
};