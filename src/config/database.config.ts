import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

config({ quiet: true });

export interface DatabaseEnv {
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl: boolean;
}

const readDatabaseEnv = (): DatabaseEnv => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL),
});

export const databaseConfig = registerAs('database', readDatabaseEnv);

/**
 * Builds the Postgres connection options shared by the Nest runtime and the
 * standalone TypeORM CLI DataSource. `srcDir` should be the `src` (or compiled
 * `dist`) directory so entity / migration / subscriber globs resolve correctly.
 */
export const buildPostgresOptions = (
  env: DatabaseEnv,
  srcDir: string,
): PostgresConnectionOptions => {
  const connection = env.url
    ? { url: env.url }
    : {
        host: env.host,
        port: env.port,
        database: env.database,
        username: env.username,
        password: env.password,
      };

  return {
    type: 'postgres',
    ...connection,
    ...(env.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
    entities: [join(srcDir, 'modules/**/entities/*.entity{.ts,.js}')],
    migrations: [join(srcDir, 'database/migrations/*.{ts,js}')],
    subscribers: [join(srcDir, 'modules/**/subscribers/*.subscriber{.ts,.js}')],
    synchronize: false,
  };
};
