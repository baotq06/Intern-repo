import InventoryModel from '../models/inventory.model';
import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';
import MarketModel from '../models/market.model';
import { authenticateToken } from '../middlewares/tokenValidation';

const logger = Logger.create('users_mysql.ts');
// API Quản Lý Hành Trang Cá Nhân
const apis: ExpressHandler[] = [
    // Khi người dùng đổi điểm
    // Thêm vật phẩm vào kho của người dùng
    // tạo ra 1 trường dữ liệu là thời gian khi trao đổi điểm
    {
        path: '/exchange-points',
        method: 'POST',
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const loggedInUserId = req.body.user?.userId;
                const loggedInUser = await TestModel.findById(loggedInUserId);

                if (!loggedInUser) {
                    return nextpayError(res, 'Logged-in user not found', langs.INTERNAL_SERVER_ERROR);
                }

                const { itemId } = req.body;

                // Kiểm tra xem mặt hàng đó có tồn tại trên thị trường không
                const marketItem = await MarketModel.findById(itemId).lean();

                if (!marketItem) {
                    return nextpayError(res, 'Item not found in the market', langs.INTERNAL_SERVER_ERROR);
                }

                const point = marketItem.point;

                // Kiểm tra xem người dùng có đủ điểm không
                if (loggedInUser.point < point) {
                    return nextpayError(res, 'Insufficient points', langs.UNAUTHORIZED);
                }

                // Trừ điểm của người dùng
                loggedInUser.point -= point;
                await loggedInUser.save();

                // Thêm vật phẩm vào kho của người dùng (cần có model Người dùng có trường tồn kho)
                loggedInUser.inventory.push({
                    itemId: marketItem._id.toString(),
                    itemName: marketItem.itemName,
                    points: marketItem.point,
                    timestamp: new Date(),
                });

                await loggedInUser.save();

                return nextpayResponse(res, 'Point exchange successful', 'EXCHANGE_SUCCESS', loggedInUser);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        },
    },
    // Lấy kho của người dùng
    {
        path: '/inventory/:userId',
        method: 'GET',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { userId } = req.params;
                const inventory = await InventoryModel.find({ userId });

                return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', inventory);
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    }
]
export default apis;
