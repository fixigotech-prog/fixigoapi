import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {  offers } from '../db/schema';
import { and, eq, gte, isNull, lte, or,asc } from 'drizzle-orm';

// Define a type for the decorated fastify instance
interface App extends FastifyInstance {
  db: any;
}

// Interfaces for Offer routes
interface OfferParams {
  id: number;
}

interface OfferBody {
  imageUrl: string;
  link?: string;
  promocodeId?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const createOffer= async (request: FastifyRequest<{ Body: OfferBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const {  imageUrl,link, promocodeId, isActive, startDate, endDate} = request.body;
  try {
    const [newOffer] = await app.db
      .insert(offers)
      .values({ 
        imageUrl,
        link, 
        promocodeId, 
        isActive, 
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      })
      .returning();
    return reply.status(201).send(newOffer);
  } catch (error: any) {
    request.log.error(error, 'Error creating Offer');
    if (error.code === '23505') { // unique_violation
      return reply.status(409).send({ message: 'A Offer with this name already exists.' });
    }
    throw new Error('Failed to create Offer.');
  }
};

export const getOffers = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  const allOffers = await app.db.query.offers.findMany({
 
    orderBy: [asc(offers.createdAt)],
  });
  return reply.send(allOffers);
};

export const getOffer = async (request: FastifyRequest<{ Params: OfferParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const newOffers = await app.db.query.offers.findFirst({
    where: eq(offers.id, id),
    });

  if (!newOffers) {
    return reply.status(404).send({ message: 'offer not found' });
  }

  return reply.send(newOffers);
};

export const updateOffer= async (request: FastifyRequest<{ Body: Partial<OfferBody>, Params: OfferParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
 const {  imageUrl,link, promocodeId, isActive, startDate, endDate} = request.body;

  const updatePayload: Partial<{ imageUrl: string; link: string; promocodeId: number; isActive: boolean; startDate: Date; endDate: Date; }> = {};
  if (imageUrl) updatePayload.imageUrl = imageUrl;
  if (promocodeId) updatePayload.promocodeId = promocodeId;
  if (link) updatePayload.link = link;
  if (isActive !== undefined) updatePayload.isActive = isActive;
  if (startDate) updatePayload.startDate = new Date(startDate);
  if (endDate) updatePayload.endDate = new Date(endDate);


  if (Object.keys(updatePayload).length === 0) {
    return reply.status(400).send({ message: 'No update data provided.' });
  }

  

  try {
    const [updatedCategory] = await app.db
      .update(offers)
      .set(updatePayload)
      .where(eq(offers.id, id))
      .returning();

    if (!updatedCategory) {
      return reply.status(404).send({ message: 'Offer not found' });
    }

    return reply.send(updatedCategory);
  } catch (error: any) {
    request.log.error(error, 'Error updating offer');
    if (error.code === '23505') {
      return reply.status(409).send({ message: 'A offer with this name already exists.' });
    }
    throw new Error('Failed to update offer.');
  }
};

export const deleteOffer = async (request: FastifyRequest<{ Params: OfferParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedOffer] = await app.db
    .delete(offers)
    .where(eq(offers.id, id))
    .returning();

  if (!deletedOffer) {
    return reply.status(404).send({ message: 'Offer not found' });
  }

  return reply.status(204).send();
};
