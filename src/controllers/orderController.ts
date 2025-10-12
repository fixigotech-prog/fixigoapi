import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { orders, orderLogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface OrderBody {
  bookingId: number;
  userId: number;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  statusId: number;
  paymentMethod?: string;
  paymentReference?: string;
}

interface OrderParams {
  id: string;
}

interface OrderLogBody {
  statusId: number;
  notes?: string;
}

export const createOrder = async (request: FastifyRequest<{ Body: OrderBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const orderData = request.body;

  try {
    const [newOrder] = await app.db
      .insert(orders)
      .values(orderData)
      .returning();
    return reply.status(201).send(newOrder);
  } catch (error: any) {
    request.log.error(error, 'Error creating order');
    throw new Error('Failed to create order.');
  }
};

export const getOrders = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  
  const allOrders = await app.db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      booking: true,
      user: true,
      status: true,
      invoice: true,
      logs: {
        orderBy: [desc(orderLogs.createdAt)]
      }
    }
  });
  
  return reply.send(allOrders);
};

export const getOrder = async (request: FastifyRequest<{ Params: OrderParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  
  const order = await app.db.query.orders.findFirst({
    where: eq(orders.id, parseInt(id, 10)),
    with: {
      booking: true,
      user: true,
      status: true,
      invoice: true,
      logs: {
        orderBy: [desc(orderLogs.createdAt)]
      }
    }
  });

  if (!order) {
    return reply.status(404).send({ message: 'Order not found' });
  }

  return reply.send(order);
};

export const updateOrder = async (request: FastifyRequest<{ Body: Partial<OrderBody>, Params: OrderParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = { ...request.body, updatedAt: new Date() };

  try {
    const [updatedOrder] = await app.db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, parseInt(id, 10)))
      .returning();

    if (!updatedOrder) {
      return reply.status(404).send({ message: 'Order not found' });
    }

    return reply.send(updatedOrder);
  } catch (error: any) {
    request.log.error(error, 'Error updating order');
    throw new Error('Failed to update order.');
  }
};

export const addOrderLog = async (request: FastifyRequest<{ Body: OrderLogBody, Params: OrderParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const { statusId, notes } = request.body;

  try {
    const [newLog] = await app.db
      .insert(orderLogs)
      .values({ 
        orderId: parseInt(id, 10), 
        statusId, 
        notes 
      })
      .returning();
    return reply.status(201).send(newLog);
  } catch (error: any) {
    request.log.error(error, 'Error adding order log');
    throw new Error('Failed to add order log.');
  }
};