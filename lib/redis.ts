import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not defined');
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var redis: ReturnType<typeof createClient> | undefined;
}

const redis = global.redis || createClient({ url: redisUrl });

if (process.env.NODE_ENV !== 'production') global.redis = redis;

if (!redis.isOpen) {
    redis.connect().catch(err => {
        console.error('Could not connect to Redis:', err);
    });
}

export default redis;