import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

export const rbac = (requiredRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.split(' ')?.[1];

    if (!token) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      const userRole = decoded.role;

      if (!requiredRoles.includes(userRole)) {
        return reply.status(403).send({ message: 'Forbidden' });
      }

    } catch (error) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
  };
};
