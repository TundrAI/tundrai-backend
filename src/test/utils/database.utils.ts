import { DataSource } from 'typeorm';

import { testDataSource } from '../../config/typeorm.testdb.config';

let connection: DataSource;

export const setupTestDatabase = async (): Promise<DataSource> => {
  if (!connection) {
    connection = testDataSource;
    await connection.initialize();
  }
  return connection;
};

export const teardownTestDatabase = async (): Promise<void> => {
  if (connection && connection.isInitialized) {
    await connection.destroy();
  }
};

export const cleanTestDatabase = async (): Promise<void> => {
  if (connection && connection.isInitialized) {
    const entities = connection.entityMetadatas;
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');

    if (tableNames) {
      await connection.query(
        `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    }
  }
};
