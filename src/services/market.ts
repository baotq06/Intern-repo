import MarketModel from '../models/market.model';
import TestModel from '../models/test.model';
import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import mongoose from 'mongoose';
import { authenticateToken } from '../middlewares/tokenValidation';
import { checkAdmin } from '../middlewares/checkAdmin';

const logger = Logger.create('user_mongodb.ts');

// API Quản Lý Vật Phẩm Trao Đổi (Market)
const apis: ExpressHandler[] = [
    // Lấy tất cả các mặt hàng trên thị trường
    {
        path: '/market',
        method: 'GET',
        preValidatorMiddlewares: [authenticateToken, checkAdmin],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);


                const marketItems = await MarketModel.find().lean();
                logger.info(marketItems);

                const allMarketItems = marketItems.map(marketItem => ({
                    _id: marketItem._id.toString(),
                    itemname: marketItem.itemName,
                    point: marketItem.point,
                }));

                return nextpayResponse(res, 'Market successfully', 'MARKET', allMarketItems);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // add một mặt hàng 
    {
        path: '/market',
        method: 'POST',
        preValidatorMiddlewares: [authenticateToken, checkAdmin],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const newItem = req.body;
                const { itemName, point } = newItem;
                const marketItem = new MarketModel({ itemName, point });

                await marketItem.save();

                return nextpayResponse(res, 'Market add successfully', 'USERS_ADD', marketItem);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // Update một mặt hàng
    {
        path: '/market',
        method: 'PUT',
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const loggedInUserId = req.body.user?.userId;
                const loggedInUser = await TestModel.findById(loggedInUserId);

                if (!loggedInUser) {
                    return nextpayError(res, 'Logged-in user not found', langs.INTERNAL_SERVER_ERROR);
                }

                const { userId, updatedData } = req.body;
                const marketItem = await MarketModel.findById(userId);

                if (!marketItem) {
                    return nextpayError(res, 'Market item not found', langs.INTERNAL_SERVER_ERROR);
                }

                const isAdmin = loggedInUser.role === 'admin';

                if (isAdmin) {
                    marketItem.itemName = updatedData.name || marketItem.itemName;
                    marketItem.point = updatedData.point || marketItem.point;

                    await marketItem.save();

                    logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

                    return nextpayResponse(res, 'Market item updated successfully', 'UPDATE_SUCCESS', null);
                } else {
                    return nextpayError(res, 'Unauthorized: Insufficient permissions to update market item', langs.UNAUTHORIZED);
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    // Delete một mặt hàng
    {
        path: '/market/:id',
        method: 'DELETE',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { id } = req.params;

                // ktra xem id có tồn tại không
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return nextpayError(res, 'Invalid user ID', langs.BAD_REQUEST);
                }

                const deletedUser = await MarketModel.findByIdAndDelete(id);
                if (!deletedUser) {
                    return nextpayError(res, 'User not found', langs.RESOURCE_NOT_FOUND);
                }

                return nextpayResponse(res, 'Market delete successfully', 'MARKET_DELETE', deletedUser);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    }
]

export default apis;
