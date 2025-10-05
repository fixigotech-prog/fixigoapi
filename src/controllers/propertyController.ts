import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface App extends FastifyInstance {
  db: any;
}

export const getPropertyTypes = async (request: FastifyRequest, reply: FastifyReply) => {
  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'house', label: 'House' },
    { value: 'office', label: 'Office' }
  ];
  
  return reply.status(200).send({ propertyTypes });
};

export const getPropertySizes = async (request: FastifyRequest, reply: FastifyReply) => {
  const propertySizes = [
    { value: 'small', label: 'Small (< 1000 sq ft)' },
    { value: 'medium', label: 'Medium (1000-2000 sq ft)' },
    { value: 'large', label: 'Large (2000-3000 sq ft)' },
    { value: 'extra_large', label: 'Extra Large (> 3000 sq ft)' }
  ];
  
  return reply.status(200).send({ propertySizes });
};