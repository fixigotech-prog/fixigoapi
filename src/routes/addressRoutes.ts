import { FastifyInstance } from 'fastify';
import { addAddress, getUserAddresses, getFrequentAddresses, updateAddress, deleteAddress } from '../controllers/addressController';

export const addressRoutes = async (app: FastifyInstance) => {
  app.post('/', addAddress);
  app.get('/user/:userId', getUserAddresses);
  app.get('/user/:userId/frequent', getFrequentAddresses);
  app.put('/:id', updateAddress);
  app.delete('/:id', deleteAddress);
};