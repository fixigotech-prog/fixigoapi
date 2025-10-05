import { FastifyInstance } from 'fastify';
import { createCity, getCities, getCity, updateCity, deleteCity } from '../controllers/cityController';

export const cityRoutes = async (app: FastifyInstance) => {
  app.post('/', createCity);
  app.get('/', getCities);
  app.get('/:id', getCity);
  app.put('/:id', updateCity);
  app.delete('/:id', deleteCity);
};