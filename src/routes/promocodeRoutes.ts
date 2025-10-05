import { FastifyPluginAsync } from 'fastify';
import {
  getAllPromocodes,
  getPromocode,
  createPromocode,
  updatePromocode,
  deletePromocode,
} from '../controllers/promocodeController';

export const promoCodeRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // GET all promocodes
  fastify.get('/', getAllPromocodes);
  fastify.get('/all', getAllPromocodes);

  // GET a single promocode by ID
  fastify.get('/:id', getPromocode);

  // POST a new promocode
  fastify.post('/', createPromocode);

  // PUT to update a promocode
  fastify.put('/:id', updatePromocode);

  // DELETE a promocode
  fastify.delete('/:id', deletePromocode);
};



  