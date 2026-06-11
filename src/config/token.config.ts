import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config({ quiet: true });

export const tokenConfig = registerAs('token', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION_HOUR,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION_HOUR,
}));
