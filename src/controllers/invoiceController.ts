import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { invoices } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

interface App extends FastifyInstance {
  db: any;
}

interface InvoiceBody {
  orderId: number;
  invoiceNumber: string;
  issueDate?: Date;
  dueDate?: Date;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  status?: string;
  notes?: string;
}

interface InvoiceParams {
  id: string;
}

export const createInvoice = async (request: FastifyRequest<{ Body: InvoiceBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const invoiceData = request.body;

  try {
    const [newInvoice] = await app.db
      .insert(invoices)
      .values(invoiceData)
      .returning();
    return reply.status(201).send(newInvoice);
  } catch (error: any) {
    request.log.error(error, 'Error creating invoice');
    if (error.code === '23505') {
      return reply.status(409).send({ message: 'Invoice number already exists.' });
    }
    throw new Error('Failed to create invoice.');
  }
};

export const getInvoices = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;
  
  const allInvoices = await app.db.query.invoices.findMany({
    orderBy: [desc(invoices.createdAt)],
    with: {
      order: {
        with: {
          booking: true,
          user: true
        }
      }
    }
  });
  
  return reply.send(allInvoices);
};

export const getInvoice = async (request: FastifyRequest<{ Params: InvoiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  
  const invoice = await app.db.query.invoices.findFirst({
    where: eq(invoices.id, parseInt(id, 10)),
    with: {
      order: {
        with: {
          booking: true,
          user: true
        }
      }
    }
  });

  if (!invoice) {
    return reply.status(404).send({ message: 'Invoice not found' });
  }

  return reply.send(invoice);
};

export const updateInvoice = async (request: FastifyRequest<{ Body: Partial<InvoiceBody>, Params: InvoiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = { ...request.body, updatedAt: new Date() };

  try {
    const [updatedInvoice] = await app.db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, parseInt(id, 10)))
      .returning();

    if (!updatedInvoice) {
      return reply.status(404).send({ message: 'Invoice not found' });
    }

    return reply.send(updatedInvoice);
  } catch (error: any) {
    request.log.error(error, 'Error updating invoice');
    throw new Error('Failed to update invoice.');
  }
};

export const markInvoicePaid = async (request: FastifyRequest<{ Params: InvoiceParams }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  try {
    const [updatedInvoice] = await app.db
      .update(invoices)
      .set({ 
        status: 'paid', 
        paidAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, parseInt(id, 10)))
      .returning();

    if (!updatedInvoice) {
      return reply.status(404).send({ message: 'Invoice not found' });
    }

    return reply.send(updatedInvoice);
  } catch (error: any) {
    request.log.error(error, 'Error marking invoice as paid');
    throw new Error('Failed to mark invoice as paid.');
  }
};