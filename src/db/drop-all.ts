import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

async function dropAllTables() {
  console.log('Dropping all tables and types...');
  
  try {
    // Drop all tables in correct order (reverse dependency order)
    await client`DROP TABLE IF EXISTS booking_logs CASCADE`;
    await client`DROP TABLE IF EXISTS order_logs CASCADE`;
    await client`DROP TABLE IF EXISTS orders CASCADE`;
    await client`DROP TABLE IF EXISTS bookings CASCADE`;
    await client`DROP TABLE IF EXISTS role_permissions CASCADE`;
    await client`DROP TABLE IF EXISTS role_settings CASCADE`;
    await client`DROP TABLE IF EXISTS user_addresses CASCADE`;
    await client`DROP TABLE IF EXISTS user_wallets CASCADE`;
    await client`DROP TABLE IF EXISTS users CASCADE`;
    await client`DROP TABLE IF EXISTS offers CASCADE`;
    await client`DROP TABLE IF EXISTS promocodes CASCADE`;
    await client`DROP TABLE IF EXISTS services_pricing CASCADE`;
    await client`DROP TABLE IF EXISTS services_details CASCADE`;
    await client`DROP TABLE IF EXISTS frequent_services CASCADE`;
    await client`DROP TABLE IF EXISTS services CASCADE`;
    await client`DROP TABLE IF EXISTS categories CASCADE`;
    await client`DROP TABLE IF EXISTS cities CASCADE`;
    await client`DROP TABLE IF EXISTS permissions CASCADE`;
    await client`DROP TABLE IF EXISTS user_roles CASCADE`;
    await client`DROP TABLE IF EXISTS booking_statuses CASCADE`;
    await client`DROP TABLE IF EXISTS order_statuses CASCADE`;
    await client`DROP TABLE IF EXISTS property_types CASCADE`;
    await client`DROP TABLE IF EXISTS property_sizes CASCADE`;
    await client`DROP TABLE IF EXISTS discount_types CASCADE`;
    await client`DROP TABLE IF EXISTS roles CASCADE`;
    
    // Drop enum types if they exist
    await client`DROP TYPE IF EXISTS discount_type CASCADE`;
    await client`DROP TYPE IF EXISTS user_role CASCADE`;
    await client`DROP TYPE IF EXISTS booking_status CASCADE`;
    await client`DROP TYPE IF EXISTS order_status CASCADE`;
    await client`DROP TYPE IF EXISTS property_type CASCADE`;
    await client`DROP TYPE IF EXISTS property_size CASCADE`;
    
    // Drop drizzle migration table
    await client`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`;
    
    console.log('All tables and types dropped successfully!');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

dropAllTables().catch((err) => {
  console.error(err);
  process.exit(1);
});