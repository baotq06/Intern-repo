import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';

import langs from '../constants/langs';
import Logger from '../libs/logger';
import { loggingConfig, acceptedLevel } from '../constants/logCfg';

const logger = Logger.create('loggerCfg.ts');

const apis: ExpressHandler[] = [
  {
    path: '/logger/cfg',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        logger.error(new Error('throw an test error'));
        logger.warn('warn', ['1', '2']);
        logger.info('info', { 1: true }, { 2: false });
        logger.info({ 1: true });
        logger.info([{ 1: true }]);
        logger.http('http');
        logger.verbose('verbose');
        logger.debug('debug');
        logger.silly('silly');
        // ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

        return nextpayResponse(res, '', '', loggingConfig);
      } catch (err: any) {
        logger.error(req.originalUrl, req.method, 'error:', err);

        return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/logger/cfg',
    method: 'POST',
    params: {
      $$strict: true,
      level: {
        type: 'enum',
        values: acceptedLevel,
      },
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        const { level } = req.body;
        if (level) {
          loggingConfig.level = level || loggingConfig.level;
          Logger.changeLogLevel(level);
        }

        return nextpayResponse(res, '', '', loggingConfig);
      } catch (err: any) {
        logger.error(req.originalUrl, req.method, 'error:', err);

        return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
];
export default apis;
