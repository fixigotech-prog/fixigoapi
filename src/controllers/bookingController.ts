import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { bookings, promoCodes } from '../db/schema';
import { eq } from 'drizzle-orm';

// Define a type for the decorated fastify instance
interface App extends FastifyInstance {
  db: any;
}
interface BookingBody {
  userId: number;
  serviceId: number;
  addressId: number;
  bookingDate: string;
  statusId: number;
  tipAmount?: number;
  notes?: string;
  promocode?: string;
}

interface BookingParams {
  id: string;
}

interface UpdateBookingBody {
  statusId?: number;
  addressId?: number;
  tipAmount?: number;
  notes?: string;
}

export const createBooking = async (request: FastifyRequest<{ Body: BookingBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { userId, serviceId, addressId, bookingDate, statusId, tipAmount, notes, promocode } = request.body;

  try {
    const newBooking = await app.db.transaction(async (tx: any) => {
      let promocodeId: number | null = null;

      if (promocode) {
        const promo = await tx.query.promocodes.findFirst({
          where: eq(promoCodes.code, promocode),
        });

        if (!promo) {
          throw { code: 'PROMO_NOT_FOUND', message: 'Invalid promocode.' };
        }

        if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
          throw { code: 'PROMO_EXPIRED', message: 'Promocode has expired.' };
        }

        if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
          throw { code: 'PROMO_LIMIT_REACHED', message: 'Promocode has reached its usage limit.' };
        }

        if (promo.serviceId !== null && promo.serviceId !== serviceId) {
          throw { code: 'PROMO_SERVICE_INVALID', message: 'Promocode is not valid for this service.' };
        }

        promocodeId = promo.id;

        await tx.update(promoCodes).set({
          timesUsed: promo.timesUsed + 1,
          updatedAt: new Date(),
        }).where(eq(promoCodes.id, promo.id));
      }

      const [booking] = await tx.insert(bookings).values({
        userId,
        serviceId,
        addressId,
        bookingDate: new Date(bookingDate),
        statusId,
        tipAmount: tipAmount || 0,
        notes,
        promocodeId,
      }).returning();

      return booking;
    });

    return reply.status(201).send(newBooking);
  } catch (error: any) {
    if (error.code && error.code.startsWith('PROMO_')) {
      return reply.status(400).send({ message: error.message });
    }
    console.error('Booking creation failed:', error);
    return reply.status(500).send({ message: 'Failed to create booking.' });
  }
};

export const getBookings = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  const allBookings = await app.db.query.bookings.findMany();
  return reply.send(allBookings);
};

export const getBooking = async (request: FastifyRequest<{ Params: BookingParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const booking = await app.db.query.bookings.findFirst({
    where: eq(bookings.id, parseInt(id, 10)),
  });

  if (!booking) {
    return reply.status(404).send({ message: "Booking not found" });
  }

  return reply.send(booking);
};

export const updateBooking = async (request: FastifyRequest<{ Body: UpdateBookingBody, Params: BookingParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const { statusId, addressId, tipAmount, notes } = request.body;

  const [updatedBooking] = await app.db.update(bookings).set({
    statusId,
    addressId,
    tipAmount,
    notes,
    updatedAt: new Date(),
  }).where(eq(bookings.id, parseInt(id, 10))).returning();

  if (!updatedBooking) {
    return reply.status(404).send({ message: 'Booking not found' });
  }

  return reply.send(updatedBooking);
};

export const deleteBooking = async (request: FastifyRequest<{ Params: BookingParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const deletedBooking = await app.db.delete(bookings).where(eq(bookings.id, parseInt(id, 10))).returning();

  if (deletedBooking.length === 0) {
    return reply.status(404).send({ message: 'Booking not found' });
  }

  return reply.status(204).send();
};