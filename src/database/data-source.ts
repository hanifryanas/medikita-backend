import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config({ quiet: true });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [join(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*.ts')],
  subscribers: [
    join(__dirname, '../modules/**/subscribers/*.subscriber{.ts,.js}'),
  ],
  synchronize: false,
});
