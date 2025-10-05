import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

interface App extends FastifyInstance {
  db: any;
}

interface CreateAdminBody {
  fullName: string;
  email?: string;
  password: string;
  phone: string;
  role: 'admin' | 'super_admin' | 'master';
}

interface UpdateAdminBody {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'super_admin' | 'master';
}

export const createAdmin = async (request: FastifyRequest<{ Body: CreateAdminBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { fullName, email, password, phone, role } = request.body;

  if (email) {
    const existingUser = await app.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return reply.status(409).send({ message: 'User with this email already exists' });
    }
  }

  const existingPhone = await app.db.query.users.findFirst({
    where: eq(users.phone, phone),
  });

  if (existingPhone) {
    return reply.status(409).send({ message: 'User with this phone already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newAdmin] = await app.db.insert(users).values({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role,
    isVerified: true
  }).returning();

  const { password: _, ...adminWithoutPassword } = newAdmin;
  return reply.status(201).send({ message: 'Admin user created successfully', admin: adminWithoutPassword });
};

export const getAdmins = async (request: FastifyRequest, reply: FastifyReply) => {
  const app = request.server as App;

  const admins = await app.db.query.users.findMany({
    where: (users: any, { inArray }: any) => inArray(users.role, ['admin', 'super_admin', 'master']),
    columns: {
      password: false
    }
  });

  return reply.status(200).send( admins );
};

export const getAdmin = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const admin = await app.db.query.users.findFirst({
    where: eq(users.id, parseInt(id)),
    columns: {
      password: false
    }
  });

  if (!admin || !['admin', 'super_admin', 'master'].includes(admin.role)) {
    return reply.status(404).send({ message: 'Admin user not found' });
  }

  return reply.status(200).send({ admin });
};

export const updateAdmin = async (request: FastifyRequest<{ Params: { id: string }, Body: UpdateAdminBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;
  const updateData = request.body;

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const [updatedAdmin] = await app.db.update(users)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(users.id, parseInt(id)))
    .returning();

  if (!updatedAdmin) {
    return reply.status(404).send({ message: 'Admin user not found' });
  }

  const { password: _, ...adminWithoutPassword } = updatedAdmin;
  return reply.status(200).send({ message: 'Admin user updated successfully', admin: adminWithoutPassword });
};

export const deleteAdmin = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { id } = request.params;

  const [deletedAdmin] = await app.db.delete(users)
    .where(eq(users.id, parseInt(id)))
    .returning();

  if (!deletedAdmin) {
    return reply.status(404).send({ message: 'Admin user not found' });
  }

  return reply.status(200).send({ message: 'Admin user deleted successfully' });
};