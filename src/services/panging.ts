import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import AdminModel from '../models/test.model';

const logger = Logger.create('pagination_api.ts');

const paginateAPI: ExpressHandler[] = [{
    // Phân trang
    // Chuyển giữa các trang 
    // Chia record cho mỗi trang
    // Tổng số record
    path: '/api-panging',
    method: 'POST',
    action: async (req, res) => {
        try {
            const { page, pageSize, filters } = req.body;
            const offset = (page - 1) * pageSize;

            const query: Record<string, any> = {};
            if (filters) {
                if (filters.username) {
                    query.username = filters.username;
                }
                if (filters.name) {
                    query.name = filters.name;
                }
                if (filters.age) {
                    query.age = filters.age;
                }
                if (filters.address) {
                    query.address = filters.address;
                }
            }

            const filteredDocument = await AdminModel.find(filters).skip(offset).limit(pageSize).lean();

            // count record
            const totalUser = await AdminModel.countDocuments(filters);

            // count page
            const totalPage = Math.ceil(totalUser / pageSize);

            const paginationInfo = {
                currentPage: page,
                pageSize: page,
                totalPage: totalPage,
                totalUser: totalUser,
                filters: filteredDocument
            }

            return nextpayResponse(res, 'Pagination successful', 'PAGINATION_SUCCESS', paginationInfo);
        } catch (error: any) {
            logger.error(req.originalUrl, req.method, 'error:', error);

            return nextpayError(res, error.message, langs.INTERNAL_SERVER_ERROR, null);
        }
    },
},
]
export default paginateAPI;
