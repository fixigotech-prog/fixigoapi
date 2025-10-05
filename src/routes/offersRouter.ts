import { FastifyPluginAsync } from 'fastify';

import {
getOffers,
getOffer,
createOffer,
updateOffer,
deleteOffer,
} from '../controllers/offerController'  

export const offerRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // GET all offers
  fastify.get('/', getOffers);
  fastify.get('/all', getOffers);

  // GET a single offer by ID
  fastify.get('/:id', getOffer);

  // POST a new promocode
  fastify.post('/', createOffer);

  // PUT to update a promocode
  fastify.put('/:id', updateOffer);

  // DELETE a promocode
  fastify.delete('/:id', deleteOffer);
};
