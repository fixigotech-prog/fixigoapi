import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { cities } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface CityBody {
  city: string;
  lat?: string;
  lng?: string;
  country?: string;
  iso2?: string;
  state?: string;
}

interface CityParams {
  id: string;
}

export const createCity = async (request: FastifyRequest<{ Body: CityBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { city, lat, lng, country, iso2, state } = request.body;

  const [newCity] = await app.db
    .insert(cities)
    .values({ city, lat, lng, country, iso2, state })
    .returning();

  return reply.status(201).send(newCity);
};

export const getCities = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  
  const allCities = await app.db.query.cities.findMany({
    orderBy: [asc(cities.city)],
  });

  return reply.send(allCities);
};

export const getCity = async (request: FastifyRequest<{ Params: CityParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const city = await app.db.query.cities.findFirst({
    where: eq(cities.id, parseInt(id, 10)),
  });

  if (!city) {
    return reply.status(404).send({ message: 'City not found' });
  }

  return reply.send(city);
};

export const updateCity = async (request: FastifyRequest<{ Body: Partial<CityBody>, Params: CityParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = request.body;

  const [updatedCity] = await app.db
    .update(cities)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(cities.id, parseInt(id, 10)))
    .returning();

  if (!updatedCity) {
    return reply.status(404).send({ message: 'City not found' });
  }

  return reply.send(updatedCity);
};

export const deleteCity = async (request: FastifyRequest<{ Params: CityParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedCity] = await app.db
    .delete(cities)
    .where(eq(cities.id, parseInt(id, 10)))
    .returning();

  if (!deletedCity) {
    return reply.status(404).send({ message: 'City not found' });
  }

  return reply.status(204).send();
};