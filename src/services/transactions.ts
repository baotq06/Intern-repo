import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import UserModel from '../models/test.model';
import { authenticateToken } from '../middlewares/tokenValidation';
// import { checkAdmin } from '../middlewares/checkAdmin';

const logger = Logger.create('users_mysql.ts');

const apis: ExpressHandler[] = [
    // Xem kho hàng của user xem có những món đồ gì
    {
        path: '/transactions/:userId',
        method: 'GET',
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { userId } = req.params;
                const user = await UserModel.findById(userId);

                if (!user) {
                    return nextpayError(res, 'User not found', '', null);
                }

                const inventory = user.inventory;
                console.log(`Inventory for user ${userId}:`, inventory);

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', inventory);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // Lấy lịch sử giao dịch + và - điểm
    {
        path: '/transaction-point/:userId',
        method: 'GET',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { userId } = req.params;
                const user = await UserModel.findById(userId);

                if (!user) {
                    return nextpayError(res, 'User not found', '', null);
                }

                const inventory = user.inventory;
                const transactions = user.transactions;
                console.log(`Inventory for user ${userId}:`, inventory);

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', { inventory, transactions });
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // // Ghi bút toán ( nạp tiền / trao đổi / mua vật phẩm)
    // {
    //     path: '/transactions/:userId',
    //     method: 'POST',
    //     action: async (req, res) => {
    //         try {
    //             logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

    //             const { userId, amount, adminName, itemName, purchaseTime } = req.body;

    //             const user = await UserModel.findById(userId);

    //             if (!user) {
    //                 return nextpayError(res, 'User not found', '', null);
    //             }

    //             if (adminName) {
    //                 const admin = await UserModel.findOne({ name: adminName, role: 'admin' });

    //                 if (!admin) {
    //                     return nextpayError(res, 'Admin not found', '', null);
    //                 }

    //                 user.transactions.push({
    //                     type: 'topup',
    //                     amount,
    //                     timestamp: new Date(),
    //                 });
    //             }

    //             if (itemName && purchaseTime) {
    //                 const itemPointValue = 0;

    //                 user.transactions.push({
    //                     type: 'exchange',
    //                     amount: -itemPointValue,
    //                     timestamp: new Date(),
    //                 });
    //             }

    //             await user.save();

    //             return nextpayResponse(res, 'Transaction recorded successfully', 'TRANSACTION_RECORDED', null);
    //         } catch (err: any) {
    //             logger.error(req.originalUrl, req.method, 'error:', err);

    //             return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
    //         }
    //     }
    // }
]

export default apis;


