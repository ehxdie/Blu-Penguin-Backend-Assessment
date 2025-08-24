import { redis } from '../config';  // make sure config.redis has host, port, password—and if you have a username, add that too
import Redis from 'ioredis';

export const redisClient = new Redis({
    host: redis.host,
    port: redis.port,
    password: redis.password,

    //tls: {},

    maxRetriesPerRequest: null,

    retryStrategy(times) {
        return 3600000;
    },

    reconnectOnError(err) {
        return err.message.includes('READONLY');
    },
});

redisClient.on('connect', () => {
  console.log(`✅ Redis (Aiven) connected to ${redis.host}:${redis.port}`);
});
redisClient.on('error', (err) => {
  console.error('⚠️ Redis error', err);
});
