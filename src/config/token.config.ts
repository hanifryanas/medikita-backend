import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined): number | undefined =>
  value === undefined ? undefined : Number(value);

export const tokenConfig = registerAs('token', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: toNumber(process.env.ACCESS_TOKEN_EXPIRATION_HOUR),
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: toNumber(process.env.REFRESH_TOKEN_EXPIRATION_HOUR),
}));
