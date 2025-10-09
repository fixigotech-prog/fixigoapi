import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { discountTypes, userRoles, bookingStatuses, orderStatuses, propertyTypes, propertySizes } from './schema';
dotenv.config();

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

async function seedLookupTables() {
  console.log('Seeding lookup tables...');
  
  try {
    // Seed discount types
    await db.insert(discountTypes).values([
      { name: 'percentage' },
      { name: 'fixed' }
    ]);

    // Seed user roles
    await db.insert(userRoles).values([
      { name: 'super_admin' },
      { name: 'admin' },
      { name: 'customer' },
      { name: 'expert' },
      { name: 'customer_service' }
    ]);

    // Seed booking statuses
    await db.insert(bookingStatuses).values([
      { name: 'pending' },
      { name: 'confirmed' },
      { name: 'cancelled' },
      { name: 'completed' }
    ]);

    // Seed order statuses
    await db.insert(orderStatuses).values([
      { name: 'pending' },
      { name: 'paid' },
      { name: 'failed' },
      { name: 'refunded' }
    ]);

    // Seed property types
    await db.insert(propertyTypes).values([
      { name: 'apartment' },
      { name: 'villa' },
      { name: 'bungalow' },
      { name: 'house' },
      { name: 'office' }
    ]);

    // Seed property sizes
    await db.insert(propertySizes).values([
      { name: 'Studio' },
      { name: '1 BHK' },
      { name: '2 BHK' },
      { name: '3 BHK' },
      { name: '4 BHK' },
      { name: '5 BHK' },
      { name: 'large' },
      { name: 'extra_large' },
      { name: 'Small Office' },
      { name: 'Medium Office' },
      { name: 'Large Office' }
    ]);

    console.log('Lookup tables seeded successfully!');
  } catch (error) {
    console.error('Error seeding lookup tables:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seedLookupTables().catch((err) => {
  console.error(err);
  process.exit(1);
});