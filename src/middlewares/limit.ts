import rateLimit, { Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
// import { Request, Response } from 'express';
import redis from '../libs/redis';
import Logger from '../libs/logger';

// Troubleshooting Proxy Issues
// app.set('trust proxy', numberOfProxies)

// Where numberOfProxies is the number of proxies between the user and the server. To find the correct number, create a test endpoint that returns the client IP:

// app.set('trust proxy', 1)
// app.get('/ip', (request, response) => response.send(request.ip))

const logger = Logger.create('Limit');
let redisClient;
let bool = false;
if (process.env.REDIS_STORE_RATE_LIMIT_ENABLED === 'true') {
  try {
    redisClient = redis.getClient();
    await redisClient.setex('key', 10, 'true');
    bool = (await redisClient.get('key')) === 'true';
  } catch (e: any) {
    logger.error('Redis Error', e.message);
  }
}

const config: Partial<Options> = {
  windowMs: 60 * 1000, // 1 minutes
  max: 500, // Limit each request.headers.authorization to 500 requests per `window` (here, per 1 minute)
  message: 'Too many request, please try again after $time minute(s)',
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (request) => request.headers.authorization,
  handler: (request, response, next, options) => {
    logger.error(
      'REQ LIMIT REACHED',
      request.headers.authorization ? <string>request.headers.authorization.split('@')[0] : '',
      request.originalUrl,
    );

    return response
      .status(options.statusCode)
      .send(options.message.replace('$time', options.windowMs / 60 / 1000));
  },
};
if (bool) {
  logger.info('Redis Store Enabled');
  config.store = new RedisStore({
    client: redisClient,
    prefix: 'Limit_',
  });
} else {
  logger.info('Memory Store Enabled');
}
const rateLimiter = rateLimit(config);
// interface SpeedLimitConfig {
//   /** How long to keep records of requests in memory. Defaults to 60000 (1 minute) */
//   windowMs?: number;
//   /** Max number of connections during windowMs before starting to delay responses. Defaults to 100. Set to 0 to disable delaying. */
//   delayAfter?: number;
//   /** How long to delay the response, multiplied by (number recent hits - delayAfter). Defaults to 100 (0.1 second). Set to 0 to disable delaying. */
//   delayMs?: number;
//   /** Maximum value for delayMs after many consecutive attempts, that is, after the n-th request, the delay will be always maxDelayMs. Important when your application is running behind a load balancer or reverse proxy that has a request timeout. Defaults to 1s. */
//   maxDelayMs?: number;
//   /** Function used to generate keys. By default user IP address (req.headers.authorization) is used. Default: (req, res) => req.headers.authorization */
//   keyGenerator?: (req: Request, res?: Response) => string;
// }
// const speedLimiterWithConfig = (customConfig: SpeedLimitConfig) => {
//   const { windowMs, delayAfter, delayMs, maxDelayMs, keyGenerator } = customConfig;
//   const slowDownConfig = { ...config };
//   if (windowMs) slowDownConfig.windowMs = windowMs;
//   if (delayAfter) slowDownConfig.delayAfter = delayAfter;
//   if (delayMs) slowDownConfig.delayMs = delayMs;
//   if (maxDelayMs) slowDownConfig.maxDelayMs = maxDelayMs;
//   if (keyGenerator) slowDownConfig.keyGenerator = keyGenerator;
//   return slowDown(slowDownConfig);
// };
export default rateLimiter;
// export { speedLimiterWithConfig };
