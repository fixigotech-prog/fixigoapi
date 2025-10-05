# Cleaning Services API

This is a Fastify API for a cleaning services application.

## Prerequisites

- Node.js
- PostgreSQL

## Getting Started

1. Clone the repository.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project and add your PostgreSQL connection string:

   ```
   DATABASE_URL=postgres://user:password@host:port/database
   JWT_SECRET=your-super-secret-key
   ```

4. Run the database migrations:

   ```bash
   npm run db:migrate
   ```

5. Start the server:

   ```bash
   npm start
   ```

The server will be running on `http://localhost:3000`.
