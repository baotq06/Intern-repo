import Redis from 'ioredis';
import Logger from './logger';

const logger = Logger.create('redis');

class RedisConnection {
  private client: Redis;

  getClient(): Redis {
    const { REDIS_PORT, REDIS_HOST } = process.env;
    if (!this.client) {
      this.client = new Redis({
        port: +REDIS_PORT, // Redis port
        host: REDIS_HOST, // Redis host
        // username: 'default', // needs Redis >= 6
        // password: 'my-top-secret',
        // db: 0, // Defaults to 0
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);

          return delay;
        },
      });
      this.client.on('connect', () => {
        logger.info('connected to redis: ', this.client.status);
      });
      this.client.on('connecting', () => {
        logger.info('connecting to redis: ', this.client.status);
      });
    }

    return this.client;
  }
}

export default new RedisConnection();
