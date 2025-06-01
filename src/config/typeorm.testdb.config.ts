import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { User } from '../users/entities/user.entity';

config();

export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'tundrai',
  password: process.env.DB_PASSWORD || 'tundrai_dev_password',
  database: process.env.DB_NAME_TEST || 'tundrai_test',
  entities: [User],
  synchronize: true,
  dropSchema: true,
  logging: false,
};

export const testDataSource = new DataSource(testDataSourceOptions);
