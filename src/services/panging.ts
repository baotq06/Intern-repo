import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';

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
            const { page, pageSize = 1, filters } = req.body;
            const offset = (page - 1) * pageSize;

            // filters: dùng để tìm theo username or age or address ........
            const query: Record<string, any> = {};
            if (filters) {
                if (filters.username) {
                    query.username = { $regex: new RegExp(filters.username, 'i') };
                }
                if (filters.name) {
                    query.name = { $regex: new RegExp(filters.name, 'i') };
                }
                if (filters.age) {
                    query.age = filters.age;
                }
                if (filters.address) {
                    query.address = { $regex: new RegExp(filters.address, 'i') };
                }
            }

            const filteredDocuments = await TestModel.find(query).skip(offset).limit(parseInt(pageSize)).lean();

            const mappedFilters = filteredDocuments.map((filter) => ({
                _id: filter._id.toString(),
                name: filter.name,
                age: filter.age,
                address: filter.address,
                team: filter.team,
                role: filter.role,
                username: filter.username,
                password: filter.password,
            }));

            // const users = await TestModel.find()
            //     .skip(offset)
            //     .limit(parseInt(pageSize))
            //     .lean();

            // count record
            const totalUser = await TestModel.countDocuments();

            // count page
            const totalPage = Math.ceil(totalUser / pageSize);

            const paginationInfo = {
                currentPage: parseInt(page),
                pageSize: parseInt(page),
                totalUser,
                totalPage,
                // users,
                filters: mappedFilters
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
