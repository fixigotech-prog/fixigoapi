import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log('Migrating database...');
  await migrate(db, { migrationsFolder: 'src/migrations' });
  console.log('Database migrated successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
