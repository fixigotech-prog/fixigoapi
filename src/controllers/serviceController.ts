import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { services,servicesDetails, servicesPricing } from '../db/schema';
import { eq } from 'drizzle-orm';

// Define a type for the decorated fastify instance
interface App extends FastifyInstance {
  db: any;
}

// New interfaces for creating a service with multiple language details
interface ServiceDetailPayload {
  name: string;
  description?: string;
  lang: string;
}

interface ServicePricingPayload {
  price: number;
  term: string;
  termUnit: string;
  cityId?: number;
  lang: string;
}

interface ServiceBody {
  categoryId?: number;
  cityId?: number;
  price?: number;
  term?: string;
  termUnit?: string;
  isActive: boolean;
  imageUrl?: string;
  videoUrl?: string;
  details: ServiceDetailPayload[];
  pricing: ServicePricingPayload[];
}

interface ServiceParams {
  id: string;
}

export const createService = async (request: FastifyRequest<{ Body: ServiceBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { details, pricing, categoryId, cityId, isActive, imageUrl, videoUrl, price, term, termUnit } = request.body;

  try {
    const newServiceWithDetails = await app.db.transaction(async (tx: any) => {
      // 1. Create the service to get an ID
      const [service] = await tx
        .insert(services)
        .values({
          categoryId,
          cityId,
          isActive,
          imageUrl,
          videoUrl,
          price,
          term,
          termUnit,
        })
        .returning();

      // If there are no details, we can just return the service
      if ((!details || details.length === 0) && (!pricing || pricing.length === 0)) {
        return { ...service, details: [], pricing: [] };
      }

      // 2. Prepare service details with the new service ID
      const serviceDetailsToInsert = details.map((detail) => ({
        ...detail,
        serviceId: service.id,
      }));

      const servicePricingToInsert = pricing.map((price) => ({
        ...price,
        serviceId: service.id,
      }));

      // 3. Insert all service details
      const newDetails = await tx
        .insert(servicesDetails)
        .values(serviceDetailsToInsert)
        .returning();
      
      // 4. Insert all service pricing
      const newPricing = await tx
        .insert(servicesPricing)
        .values(servicePricingToInsert)
        .returning();


      // 5. Combine and return
      return { ...service, details: newDetails, pricing: newPricing };
    });
    return reply.status(201).send(newServiceWithDetails);
  } catch (error) {
    request.log.error(error, 'Error creating service');
    throw new Error('Failed to create service.');
  }
};

export const getServices = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  const allServices = await app.db.query.services.findMany({
    with: {
      details: true,
      pricing: true,
    },
  });
  return reply.send(allServices);
};

export const getService = async (request: FastifyRequest<{ Params: ServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const service = await app.db.query.services.findFirst({
    where: eq(services.id, parseInt(id, 10)),
    with: {
      details: true,
      pricing: true,
    },
  });

  if (!service) {
    return reply.status(404).send({ message: "Service not found" });
  }

  return reply.send(service);
};

export const updateService = async (request: FastifyRequest<{ Body: Partial<ServiceBody>, Params: ServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  // For simplicity, this update only handles top-level service fields.
  // A more complex implementation would handle updating/adding/deleting details and pricing.
  const { categoryId: categoryIdBody, cityId, isActive, imageUrl, videoUrl, price, term, termUnit } = request.body;

  const updatePayload: Partial<typeof services.$inferInsert> = {};

  if (categoryIdBody !== undefined) updatePayload.categoryId = categoryIdBody;
  if (cityId !== undefined) updatePayload.cityId = cityId;
  if (isActive !== undefined) updatePayload.isActive = isActive;
  if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;
  if (videoUrl !== undefined) updatePayload.videoUrl = videoUrl;
  if (price !== undefined) updatePayload.price = price;
  if (term !== undefined) updatePayload.term = term;
  if (termUnit !== undefined) updatePayload.termUnit = termUnit;


  if (Object.keys(updatePayload).length === 0) {
    return reply.status(400).send({ message: 'No update data provided.' });
  }

  updatePayload.updatedAt = new Date();

  const [updatedService] = await app.db.update(services).set(updatePayload).where(eq(services.id, parseInt(id, 10))).returning();

  if (!updatedService) {
    return reply.status(404).send({ message: "Service not found" });
  }

  return reply.send(updatedService);
};

export const deleteService = async (request: FastifyRequest<{ Params: ServiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  try {
    await app.db.transaction(async (tx: any) => {
        // cascade delete is not set on FK, so we need to delete manually
        await tx.delete(servicesDetails).where(eq(servicesDetails.serviceId, parseInt(id, 10)));
        await tx.delete(servicesPricing).where(eq(servicesPricing.serviceId, parseInt(id, 10)));
        const deletedService = await tx.delete(services).where(eq(services.id, parseInt(id, 10))).returning();

        if (deletedService.length === 0) {
            // This will cause the transaction to rollback
            throw new Error('Service not found');
        }
    });
    return reply.status(204).send();
  } catch (error: any) {
    request.log.error(error, 'Error deleting service');
    if (error.message === 'Service not found') {
        return reply.status(404).send({ message: 'Service not found' });
    }
    throw new Error('Failed to delete service.');
  }
};