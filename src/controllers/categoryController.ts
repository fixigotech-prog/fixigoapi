import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { categories, services } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

// Define a type for the decorated fastify instance
interface App extends FastifyInstance {
  db: any;
}

// Category Interfaces
interface CategoryBody {
  name: string;
  parentCategoryId?: number;
  imageUrl?: string;
}

interface CategoryParams {
  id: string;
}



// --- Category Controllers ---

export const createCategory = async (request: FastifyRequest<{ Body: CategoryBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { name, parentCategoryId, imageUrl } = request.body;
  try {
    const [newCategory] = await app.db
      .insert(categories)
      .values({ name, parentCategoryId, imageUrl })
      .returning();
    return reply.status(201).send(newCategory);
  } catch (error: any) {
    request.log.error(error, 'Error creating category');
    if (error.code === '23505') { // unique_violation
      return reply.status(409).send({ message: 'A category with this name already exists.' });
    }
    throw new Error('Failed to create category.');
  }
};

export const getCategories = async (request: FastifyRequest<{ Querystring: { parentId?: string } }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { parentId } = request.query;
  
  const queryOptions: any = {
    orderBy: [asc(categories.createdAt)],
  };
  
  if (parentId) {
    queryOptions.where = eq(categories.parentCategoryId, parseInt(parentId, 10));
  }
  
  const allCategories = await app.db.query.categories.findMany(queryOptions);
  return reply.send(allCategories);
};

export const getCategory = async (request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const category = await app.db.query.categories.findFirst({
    where: eq(categories.id, parseInt(id, 10)),
  });

  if (!category) {
    return reply.status(404).send({ message: 'Category not found' });
  }

  return reply.send(category);
};

export const updateCategory = async (request: FastifyRequest<{ Body: Partial<CategoryBody>, Params: CategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const { name, parentCategoryId, imageUrl } = request.body;

  const updatePayload: Partial<{ name: string; parentCategoryId: number | null; imageUrl: string; updatedAt: Date }> = {};
  if (name) updatePayload.name = name;
  if (parentCategoryId !== undefined) updatePayload.parentCategoryId = parentCategoryId;
  if (imageUrl) updatePayload.imageUrl = imageUrl;

  if (Object.keys(updatePayload).length === 0) {
    return reply.status(400).send({ message: 'No update data provided.' });
  }

  updatePayload.updatedAt = new Date();

  try {
    const [updatedCategory] = await app.db
      .update(categories)
      .set(updatePayload)
      .where(eq(categories.id, parseInt(id, 10)))
      .returning();

    if (!updatedCategory) {
      return reply.status(404).send({ message: 'Category not found' });
    }

    return reply.send(updatedCategory);
  } catch (error: any) {
    request.log.error(error, 'Error updating category');
    if (error.code === '23505') {
      return reply.status(409).send({ message: 'A category with this name already exists.' });
    }
    throw new Error('Failed to update category.');
  }
};

export const deleteCategory = async (request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const childCategories = await app.db.query.categories.findFirst({
    where: eq(categories.parentCategoryId, parseInt(id, 10)),
  });

  if (childCategories) {
    return reply.status(400).send({ message: 'Cannot delete category with child categories.' });
  }

  const service = await app.db.query.services.findFirst({
    where: eq(services.categoryId, parseInt(id, 10)),
  });

  if (service) {
    return reply.status(400).send({ message: 'Cannot delete category with associated services.' });
  }

  const [deletedCategory] = await app.db
    .delete(categories)
    .where(eq(categories.id, parseInt(id, 10)))
    .returning();

  if (!deletedCategory) {
    return reply.status(404).send({ message: 'Category not found' });
  }

  return reply.status(204).send();
};

export const getCategoriesByParent = async (request: FastifyRequest<{ Params: { parentId: string } }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { parentId } = request.params;

  const childCategories = await app.db.query.categories.findMany({
    where: eq(categories.parentCategoryId, parseInt(parentId, 10)),
    orderBy: [asc(categories.name)],
  });

  return reply.send(childCategories);
};




