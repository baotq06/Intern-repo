import slowDown from 'express-slow-down';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import redis from '../libs/redis';
import Logger from '../libs/logger';

const logger = Logger.create('slowDown');
let redisClient;
let bool = false;
if (process.env.REDIS_STORE_SLOW_DOWN_ENABLED === 'true') {
  try {
    redisClient = redis.getClient();
    await redisClient.setex('key', 10, 'true');
    bool = (await redisClient.get('key')) === 'true';
  } catch (e: any) {
    logger.error('Redis Error', e.message);
  }
}

const config: slowDown.Options = {
  windowMs: 60 * 1000, // 1 minutes
  delayAfter: 100,
  delayMs: 100,
  maxDelayMs: 1000,
  keyGenerator: (request) => request.headers.authorization,
  onLimitReached: (req) => {
    logger.error(
      'REQ SLOWDOWN THRESHOLD REACHED',
      req.headers.authorization ? <string>req.headers.authorization.split('@')[0] : '',
      req.originalUrl,
    );
  },
};
if (bool) {
  logger.info('Redis Store Enabled');
  config.store = new RedisStore({
    client: redisClient,
    prefix: 'SlowDown_',
  });
} else {
  logger.info('Memory Store Enabled');
}
const speedLimiter = slowDown(config);
interface SpeedLimitConfig {
  /** How long to keep records of requests in memory. Defaults to 60000 (1 minute) */
  windowMs?: number;
  /** Max number of connections during windowMs before starting to delay responses. Defaults to 100. Set to 0 to disable delaying. */
  delayAfter?: number;
  /** How long to delay the response, multiplied by (number recent hits - delayAfter). Defaults to 100 (0.1 second). Set to 0 to disable delaying. */
  delayMs?: number;
  /** Maximum value for delayMs after many consecutive attempts, that is, after the n-th request, the delay will be always maxDelayMs. Important when your application is running behind a load balancer or reverse proxy that has a request timeout. Defaults to 1s. */
  maxDelayMs?: number;
  /** Function used to generate keys. By default user IP address (req.headers.authorization) is used. Default: (req, res) => req.headers.authorization */
  keyGenerator?: (req: Request, res?: Response) => string;
  onLimitReached?: (req: Request, res?: Response, optionsUsed?: slowDown.Options) => void;
}
const speedLimiterWithConfig = (customConfig: SpeedLimitConfig) => {
  const { windowMs, delayAfter, delayMs, maxDelayMs, keyGenerator, onLimitReached } = customConfig;
  const slowDownConfig = { ...config };
  if (windowMs) slowDownConfig.windowMs = windowMs;
  if (delayAfter) slowDownConfig.delayAfter = delayAfter;
  if (delayMs) slowDownConfig.delayMs = delayMs;
  if (maxDelayMs) slowDownConfig.maxDelayMs = maxDelayMs;
  if (keyGenerator) slowDownConfig.keyGenerator = keyGenerator;
  if (onLimitReached) slowDownConfig.onLimitReached = onLimitReached;

  return slowDown(slowDownConfig);
};
export default speedLimiter;
export { speedLimiterWithConfig };
