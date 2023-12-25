import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';

import langs from '../constants/langs';
import Logger from '../libs/logger';
// import { loggingConfig, acceptedLevel } from '../constants/logCfg';
import { authenticateToken } from '../middlewares/tokenValidation';

const logger = Logger.create('loggerCfg.ts');

const apis: ExpressHandler[] = [
    {
        path: '/login/check',
        method: 'GET',
        // params: {
        //     $$strict: true,
        // },
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

                const result = req.body.user;

                return nextpayResponse(res, '', '', result);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        },
    },
];
export default apis;
