import { teardownTestDatabase } from './utils/database.utils';

afterAll(async () => {
  await teardownTestDatabase();
});
