import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { buildPostgresOptions } from '../config/database.config';

config({ quiet: true });

export default new DataSource(
  buildPostgresOptions(
    {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL),
    },
    join(__dirname, '..'),
  ),
);
