import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { userAddresses } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface AddressBody {
  userId: number;
  cityId?: number;
  propertyTypeId: number;
  propertySizeId: number;
  label: string;
  address: string;
  lat?: string;
  lng?: string;
  is_default?: boolean;
}

interface AddressParams {
  id: string;
}

interface UserParams {
  userId: string;
}

export const addAddress = async (request: FastifyRequest<{ Body: AddressBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { userId, cityId, propertyTypeId, propertySizeId, label, address, lat, lng, is_default } = request.body;

  const [newAddress] = await app.db
    .insert(userAddresses)
    .values({ userId, cityId, propertyTypeId, propertySizeId, label, address, lat, lng, is_default })
    .returning();

  return reply.status(201).send(newAddress);
};

export const getUserAddresses = async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { userId } = request.params;

  const addresses = await app.db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, parseInt(userId, 10)))
    .orderBy(desc(userAddresses.usageCount));

  return reply.send(addresses);
};

export const getFrequentAddresses = async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { userId } = request.params;

  const addresses = await app.db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, parseInt(userId, 10)))
    .orderBy(desc(userAddresses.usageCount))
    .limit(5);

  return reply.send(addresses);
};

export const updateAddress = async (request: FastifyRequest<{ Body: Partial<AddressBody>, Params: AddressParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = request.body;

  const [updatedAddress] = await app.db
    .update(userAddresses)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(userAddresses.id, parseInt(id, 10)))
    .returning();

  if (!updatedAddress) {
    return reply.status(404).send({ message: 'Address not found' });
  }

  return reply.send(updatedAddress);
};

export const deleteAddress = async (request: FastifyRequest<{ Params: AddressParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedAddress] = await app.db
    .delete(userAddresses)
    .where(eq(userAddresses.id, parseInt(id, 10)))
    .returning();

  if (!deletedAddress) {
    return reply.status(404).send({ message: 'Address not found' });
  }

  return reply.status(204).send();
};