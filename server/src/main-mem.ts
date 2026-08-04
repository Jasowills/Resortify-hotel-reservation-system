import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { bootstrap } from './main';

/**
 * Boots the API against an in-memory MongoDB (no install required).
 * Seeds demo data on first start. Great for local dev + verification.
 *
 *   npm run dev:mem
 */
async function bootMem() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('resortify');

  const app = await bootstrap();

  const connection = app.get(getConnectionToken());
  const { seed } = await import('./seed/seed');
  await seed(connection);

  console.log(`→ MongoDB (memory): ${mongod.getUri('resortify')}`);
  return app;
}

if (require.main === module) {
  bootMem();
}
