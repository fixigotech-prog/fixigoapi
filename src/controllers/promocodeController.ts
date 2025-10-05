import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { promoCodes } from '../db/schema';
import { eq } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}
// Interfaces for Offer routes
export interface PromocodeParams {
  id: number;
}

export interface PromocodeBody {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: Date;
  usageLimit?: number;
  timesUsed?: number;
  serviceId?: number;
}




// GET all promocodes
export const getAllPromocodes = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  const allPromocodes = await app.db.query.promoCodes.findMany({
    // You can add relations here if needed, e.g., with: { offers: true }
  });
  return reply.send(allPromocodes);
};

// GET a single promocode by ID
export const getPromocode = async (request: FastifyRequest<{ Params: PromocodeParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const promocode = await app.db.query.promocodes.findFirst({
    where: eq(promoCodes.id, request.params.id),
  });

  if (!promocode) {
    return reply.status(404).send({ message: 'Promocode not found' });
  }
  return reply.send(promocode);
};

// POST a new promocode
export const createPromocode = async (request: FastifyRequest<{ Body: PromocodeBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { body } = request;
  try {
    const [newPromocode] = await app.db.insert(promoCodes).values(body).returning();
    return reply.status(201).send(newPromocode);
  } catch (error: any) {
    request.log.error(error, 'Error creating promocode');
    if (error.code === '23505') { // unique_violation
      return reply.status(409).send({ message: 'A promocode with this code already exists.' });
    }
    throw new Error('Failed to create promocode.');
  }
};

// PUT to update a promocode
export const updatePromocode = async (request: FastifyRequest<{ Params: PromocodeParams; Body: Partial<PromocodeBody> }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { params, body } = request;

  const updatePayload: Partial<PromocodeBody> = { ...body };

  // Drizzle's .set() method ignores undefined keys, so we only need to check if the body is empty.
  if (Object.keys(updatePayload).length === 0) {
    return reply.status(400).send({ message: 'No update data provided.' });
  }

  try {
    const [updatedPromocode] = await app.db
      .update(promoCodes)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(eq(promoCodes.id, params.id))
      .returning();

    if (!updatedPromocode) {
      return reply.status(404).send({ message: 'Promocode not found' });
    }
    return reply.send(updatedPromocode);
  } catch (error: any) {
    request.log.error(error, 'Error updating promocode');
    if (error.code === '23505') {
      return reply.status(409).send({ message: 'A promocode with this code already exists.' });
    }
    throw new Error('Failed to update promocode.');
  }
};

// DELETE a promocode
export const deletePromocode = async (request: FastifyRequest<{ Params: PromocodeParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { params } = request;
  try {
    const deletedPromocodes = await app.db.delete(promoCodes).where(eq(promoCodes.id, params.id)).returning();

    if (deletedPromocodes.length === 0) {
      return reply.status(404).send({ message: 'Promocode not found' });
    }

    return reply.status(204).send();
  } catch (error: any) {
    request.log.error(error, 'Error deleting promocode');
    // In a real app, you might check for foreign key constraints if promocodes are linked to other tables
    // e.g., if (error.code === '23503') { ... }
    throw new Error('Failed to delete promocode.');
  }
};