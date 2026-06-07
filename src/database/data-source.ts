import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

config({ quiet: true });

const url = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL === 'true' || Boolean(url);

const connection: Partial<PostgresConnectionOptions> = url
  ? { url }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    };

const options: PostgresConnectionOptions = {
  type: 'postgres',
  ...connection,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  entities: [join(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  subscribers: [
    join(__dirname, '../modules/**/subscribers/*.subscriber{.ts,.js}'),
  ],
  synchronize: false,
};

export default new DataSource(options);
