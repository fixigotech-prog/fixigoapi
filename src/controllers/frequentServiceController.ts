import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { frequentServices, services, servicesDetails } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface FrequentServiceBody {
  serviceId: number;
  usageCount?: number;
  imageUrl:string;
  displayOrder?: number;
  isActive?: boolean;
}

interface FrequentServiceParams {
  id: string;
}

export const addFrequentService = async (request: FastifyRequest<{ Body: FrequentServiceBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { serviceId, usageCount, displayOrder, isActive } = request.body;

  const [newFrequentService] = await app.db
    .insert(frequentServices)
    .values({ serviceId, usageCount, displayOrder, isActive })
    .returning();

  return reply.status(201).send(newFrequentService);
};

export const getFrequentServices = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;

  const frequentServicesList = await app.db
    .select({
      id: frequentServices.id,
      serviceId: frequentServices.serviceId,
      serviceName: servicesDetails.name,
      usageCount: frequentServices.usageCount,
      imageUrl: frequentServices.imageUrl,
      displayOrder: frequentServices.displayOrder,
      isActive: frequentServices.isActive,
    })
    .from(frequentServices)
    .leftJoin(services, eq(frequentServices.serviceId, services.id))
    .leftJoin(servicesDetails, eq(services.id, servicesDetails.serviceId))
    .where(eq(frequentServices.isActive, true))
    .orderBy(desc(frequentServices.usageCount), frequentServices.displayOrder);

  return reply.send(frequentServicesList);
};

export const getFrequentServiceById = async (request: FastifyRequest<{ Params: FrequentServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [frequentService] = await app.db
    .select({
      id: frequentServices.id,
      serviceId: frequentServices.serviceId,
      usageCount: frequentServices.usageCount,
      imageUrl: frequentServices.imageUrl,
      displayOrder: frequentServices.displayOrder,
      isActive: frequentServices.isActive,
      createdAt: frequentServices.createdAt,
      updatedAt: frequentServices.updatedAt,
    })
    .from(frequentServices)
    .where(eq(frequentServices.id, parseInt(id, 10)));

  if (!frequentService) {
    return reply.status(404).send({ message: 'Frequent service not found' });
  }

  return reply.send(frequentService);
};



export const updateFrequentService = async (request: FastifyRequest<{ Body: Partial<FrequentServiceBody>, Params: FrequentServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = request.body;

  const [updatedFrequentService] = await app.db
    .update(frequentServices)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(frequentServices.id, parseInt(id, 10)))
    .returning();

  if (!updatedFrequentService) {
    return reply.status(404).send({ message: 'Frequent service not found' });
  }

  return reply.send(updatedFrequentService);
};

export const deleteFrequentService = async (request: FastifyRequest<{ Params: FrequentServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedFrequentService] = await app.db
    .delete(frequentServices)
    .where(eq(frequentServices.id, parseInt(id, 10)))
    .returning();

  if (!deletedFrequentService) {
    return reply.status(404).send({ message: 'Frequent service not found' });
  }

  return reply.status(204).send();
};