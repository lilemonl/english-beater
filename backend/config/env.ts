import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  wxAppId: process.env.WX_APPID ?? '',
  wxSecret: process.env.WX_SECRET ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret'
};
