import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';

const logger = Logger.create('pagination_api.ts');

const paginateAPI: ExpressHandler[] = [{
    path: '/api-panging',
    method: 'POST',
    action: async (req, res) => {
        try {
            const { page, pageSize } = req.body;

            const offset = (page - 1) * pageSize;

            // Lấy danh sách người dùng cho trang hiện tại
            const users = await TestModel.find()
                .skip(offset)
                .limit(parseInt(pageSize))
                .lean();

            // Lấy tổng số người dùng trong cơ sở dữ liệu
            const totalUsers = await TestModel.countDocuments();

            // Tính toán tổng số trang
            const totalPages = Math.ceil(totalUsers / pageSize);

            // Tạo đối tượng chứa thông tin phân trang
            const paginationInfo = {
                currentPage: parseInt(page),
                pageSize: parseInt(pageSize),
                totalUsers,
                totalPages,
                users,
            };

            return nextpayResponse(res, 'Pagination successful', 'PAGINATION_SUCCESS', paginationInfo);
        } catch (error: any) {
            logger.error(req.originalUrl, req.method, 'error:', error);

            return nextpayError(res, error.message, langs.INTERNAL_SERVER_ERROR, null);
        }
    },
},
]
export default paginateAPI;
