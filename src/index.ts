import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs';
import { db } from './db';
import { authRoutes } from './routes/auth';
import { serviceRoutes } from './routes/services';
import { categoryRoutes } from './routes/categoryRoutes';
import { bookingRoutes } from './routes/bookings';

import { uploadRoutes } from './routes/uploadRoutes';
import { offerRoutes } from './routes/offersRouter';
import {promoCodeRoutes} from './routes/promocodeRoutes';
import { adminUserRoutes } from './routes/adminUsers';
import { propertyRoutes } from './routes/propertyRoutes';
import { cityRoutes } from './routes/cityRoutes';
import { frequentServiceRoutes } from './routes/frequentServiceRoutes';
import { addressRoutes } from './routes/addressRoutes';

//declare module 'fastify
//declare module 'fastify' {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT || 4000

const fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024, // 50MB max, adjust as needed
});

const publicPath = path.join(__dirname, "public");
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

fastify.register(fastifyStatic, {
  root: publicPath,
  prefix: "/public/", // accessible at /public/*
});

fastify.register(multipart, {
  attachFieldsToBody: false,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max, adjust as needed
  }
});

// Middleware/Plugins
fastify.register(cors, {
  origin: true,
});

// Swagger setup
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Services API',
      description: 'API for managing services and bookings.',
      version: '1.0.0',
    },
    host: 'localhost:3001',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Categories', description: 'Category management endpoints' },
        { name: 'Sub-Categories', description: 'Sub-category management endpoints' },
        { name: 'Services', description: 'Service management endpoints' },
        { name: 'Bookings', description: 'Booking management endpoints' },
        { name: 'Offers', description: 'Offer management endpoints' },
        { name: 'Promocodes', description: 'Promocode management endpoints' },
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
});

fastify.decorate('db', db);
fastify.register(swaggerUi, {
  routePrefix: '/docs',
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(serviceRoutes, { prefix: '/api/services' });
fastify.register(categoryRoutes, { prefix: '/api/categories' });
fastify.register(bookingRoutes, { prefix: '/api/bookings' });
fastify.register(uploadRoutes, { prefix: '/api/upload' });
fastify.register(promoCodeRoutes, { prefix: '/api/promocodes' });
fastify.register(offerRoutes, { prefix: '/api/offers' });
fastify.register(adminUserRoutes, { prefix: '/api/admin-users' });
fastify.register(propertyRoutes, { prefix: '/api/properties' });
fastify.register(cityRoutes, { prefix: '/api/cities' });
fastify.register(frequentServiceRoutes, { prefix: '/api/frequent-services' });
fastify.register(addressRoutes, { prefix: '/api/addresses' });

const start = async () => {
  try {
    await fastify.listen({port: port, host: '0.0.0.0'});
    fastify.log.info(`Server running on http://localhost:${port}`);
    fastify.log.info(`Swagger docs at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();