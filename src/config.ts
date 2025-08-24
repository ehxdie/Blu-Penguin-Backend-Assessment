// Mapper for environment variables

export const environment = process.env.NODE_ENV;
export const port = process.env.PORT || 3000;

export const redis = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};
