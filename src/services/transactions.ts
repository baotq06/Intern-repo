import TransactionModel from '../models/transaction.model';
import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('users_mysql.ts');

const apis: ExpressHandler[] = [
    // Lấy lịch sử giao dịch của người dùng
    {
        path: '/transactions/:userId',
        method: 'GET',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { userId } = req.params;
                const transactions = await TransactionModel.find({ userId });

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', transactions);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // Ghi lại một giao dịch (nạp tiền/trao đổi)
    {
        path: '/transactions',
        method: 'POST',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { userId, type, amount } = req.body;
                const transaction = await TransactionModel.create({ userId, type, amount });

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', transaction);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    }
]

export default apis;


