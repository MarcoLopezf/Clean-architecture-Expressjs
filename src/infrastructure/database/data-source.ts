import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import { databaseEntities } from './entities';
import { InitSchema1729020000000 } from './migrations/1729020000000-InitSchema';

dotenv.config();

const {
  DATABASE_URL,
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '5432',
  DATABASE_USERNAME = 'postgres',
  DATABASE_PASSWORD = 'postgres',
  DATABASE_NAME = 'subscription_express',
  TYPEORM_LOGGING = 'false'
} = process.env;

const baseOptions: DataSourceOptions =
  DATABASE_URL != null && DATABASE_URL.length > 0
    ? {
        type: 'postgres',
        url: DATABASE_URL
      }
    : {
        type: 'postgres',
        host: DATABASE_HOST,
        port: Number(DATABASE_PORT),
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        database: DATABASE_NAME
      };

export const AppDataSource = new DataSource({
  ...baseOptions,
  synchronize: false,
  logging: TYPEORM_LOGGING === 'true',
  entities: databaseEntities,
  migrations: [InitSchema1729020000000],
  subscribers: []
});
