import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { serviceCategories, serviceCategoryItems, services } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface ServiceCategoryBody {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface ServiceCategoryParams {
  id: string;
}

interface AddServiceToCategoryBody {
  serviceId: number;
  displayOrder?: number;
}

export const createServiceCategory = async (request: FastifyRequest<{ Body: ServiceCategoryBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { title, subtitle, imageUrl, displayOrder, isActive } = request.body;
  
  try {
    const [newCategory] = await app.db
      .insert(serviceCategories)
      .values({ title, subtitle, imageUrl, displayOrder, isActive })
      .returning();
    return reply.status(201).send(newCategory);
  } catch (error: any) {
    request.log.error(error, 'Error creating service category');
    throw new Error('Failed to create service category.');
  }
};

export const getServiceCategories = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  
  const categories = await app.db.query.serviceCategories.findMany({
    where: eq(serviceCategories.isActive, true),
    orderBy: [asc(serviceCategories.displayOrder), asc(serviceCategories.title)],
    with: {
      items: {
        with: {
          service: true
        },
        orderBy: [asc(serviceCategoryItems.displayOrder)]
      }
    }
  });
  
  return reply.send(categories);
};

export const getServiceCategory = async (request: FastifyRequest<{ Params: ServiceCategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  
  const category = await app.db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, parseInt(id, 10)),
    with: {
      items: {
        with: {
          service: true
        },
        orderBy: [asc(serviceCategoryItems.displayOrder)]
      }
    }
  });

  if (!category) {
    return reply.status(404).send({ message: 'Service category not found' });
  }

  return reply.send(category);
};

export const updateServiceCategory = async (request: FastifyRequest<{ Body: Partial<ServiceCategoryBody>, Params: ServiceCategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = { ...request.body, updatedAt: new Date() };

  try {
    const [updatedCategory] = await app.db
      .update(serviceCategories)
      .set(updateData)
      .where(eq(serviceCategories.id, parseInt(id, 10)))
      .returning();

    if (!updatedCategory) {
      return reply.status(404).send({ message: 'Service category not found' });
    }

    return reply.send(updatedCategory);
  } catch (error: any) {
    request.log.error(error, 'Error updating service category');
    throw new Error('Failed to update service category.');
  }
};

export const deleteServiceCategory = async (request: FastifyRequest<{ Params: ServiceCategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedCategory] = await app.db
    .delete(serviceCategories)
    .where(eq(serviceCategories.id, parseInt(id, 10)))
    .returning();

  if (!deletedCategory) {
    return reply.status(404).send({ message: 'Service category not found' });
  }

  return reply.status(204).send();
};

export const addServiceToCategory = async (request: FastifyRequest<{ Body: AddServiceToCategoryBody, Params: ServiceCategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const { serviceId, displayOrder } = request.body;

  try {
    const [newItem] = await app.db
      .insert(serviceCategoryItems)
      .values({ 
        categoryId: parseInt(id, 10), 
        serviceId, 
        displayOrder 
      })
      .returning();
    return reply.status(201).send(newItem);
  } catch (error: any) {
    request.log.error(error, 'Error adding service to category');
    if (error.code === '23505') {
      return reply.status(409).send({ message: 'Service already exists in this category.' });
    }
    throw new Error('Failed to add service to category.');
  }
};

export const removeServiceFromCategory = async (request: FastifyRequest<{ Params: ServiceCategoryParams & { serviceId: string } }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id, serviceId } = request.params;

  const [deletedItem] = await app.db
    .delete(serviceCategoryItems)
    .where(eq(serviceCategoryItems.categoryId, parseInt(id, 10)) && eq(serviceCategoryItems.serviceId, parseInt(serviceId, 10)))
    .returning();

  if (!deletedItem) {
    return reply.status(404).send({ message: 'Service not found in category' });
  }

  return reply.status(204).send();
};