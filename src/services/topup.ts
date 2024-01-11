import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';
import { authenticateToken } from '../middlewares/tokenValidation';
import { checkAdmin } from '../middlewares/checkAdmin';

const logger = Logger.create('users_mysql.ts');

//API Quản Lý Tài Khoản Cá Nhân
const apis: ExpressHandler[] = [
    // Lấy thông tin tài khoản người dùng
    {
        path: '/account/:id',
        method: 'GET',
        preValidatorMiddlewares: [authenticateToken, checkAdmin],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const userId = req.params.id;
                const account = await TestModel.findById(userId).lean();
                logger.info(account);

                if (!account) {
                    return nextpayError(res, 'Account not found', 'ACCOUNT_NOT_FOUND', null);
                }

                const formattedUser = {
                    _id: account._id.toString(),
                    name: account.name,
                    age: account.age,
                    address: account.address,
                    team: account.team,
                    role: account.role,
                    username: account.username,
                    password: account.password,
                    point: account.point,
                    type: account.type,
                    inventory: account.inventory,
                };

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', formattedUser);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // Nạp điểm cho tk user bởi admin.
    // B1: Nếu là admin thì update điểm cho user.
    // B2: Nếu là user thì không làm được gì.
    {
        path: '/topup',
        method: 'PUT',
        preValidatorMiddlewares: [authenticateToken, checkAdmin],
        action: async (req, res) => {
            try {
                const { userId, updatedData } = req.body;
                const userToUpdate = await TestModel.findById(userId);

                if (!userToUpdate) {
                    return nextpayError(res, 'User to update not found', langs.INTERNAL_SERVER_ERROR);
                }

                const { point } = updatedData;
                const pointToAdd = +point || 0;
                if (isNaN(pointToAdd)) {
                    return nextpayError(res, 'Invalid point value provided', langs.BAD_REQUEST);
                }

                userToUpdate.transactions.push({
                    type: 'topup',
                    amount: pointToAdd,
                    timestamp: new Date(),
                });

                userToUpdate.point += pointToAdd;

                await userToUpdate.save();

                logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

                return nextpayResponse(res, 'User information updated successfully', 'UPDATE_SUCCESS', userToUpdate);


            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },

]

export default apis;
