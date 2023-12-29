import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import langs from '../constants/langs';
import Logger from '../libs/logger';
import { authenticateToken } from '../middlewares/tokenValidation';
import UserModel from '../models/test.model';

const logger = Logger.create('loggerCfg.ts');
const apis: ExpressHandler[] = [
    {
        path: '/user-profile',
        method: 'GET',
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
        }
    },
    {
        path: '/update-user-info',
        method: 'PUT',
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                const loggedInUserId = req.body.user.userId;
                const loggedInUser = await UserModel.findById(loggedInUserId);

                if (!loggedInUser) {
                    return nextpayError(res, 'Logged-in user not found', langs.INTERNAL_SERVER_ERROR);
                }

                const { userId, updatedData } = req.body;
                const userToUpdate = await UserModel.findById(userId);

                if (!userToUpdate) {
                    return nextpayError(res, 'User to update not found', langs.INTERNAL_SERVER_ERROR);
                }

                const isAdmin = loggedInUser.role === 'admin';

                if (isAdmin) {
                    userToUpdate.name = updatedData.name || userToUpdate.name;
                    userToUpdate.age = updatedData.age || userToUpdate.age;
                    userToUpdate.address = updatedData.address || userToUpdate.address;

                    await userToUpdate.save();

                    logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

                    return nextpayResponse(res, 'User information updated successfully', 'UPDATE_SUCCESS', null);
                } else {
                    if (loggedInUserId !== userId) {
                        return nextpayError(res, 'Unauthorized: Insufficient permissions', langs.UNAUTHORIZED);
                    }

                    userToUpdate.name = updatedData.name;
                    userToUpdate.age = updatedData.age;
                    userToUpdate.address = updatedData.address;

                    await userToUpdate.save();

                    logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

                    return nextpayResponse(res, 'User information updated successfully', 'UPDATE_SUCCESS', null);
                }

            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    {
        path: '/list-users',
        method: 'GET',
        preValidatorMiddlewares: [authenticateToken],
        action: async (req, res) => {
            try {
                const loggedInUserId = req.body.user.userId;
                const user = await UserModel.findById(loggedInUserId);

                if (!user) {
                    return nextpayError(res, 'User not found', langs.INTERNAL_SERVER_ERROR);
                }

                const isAdmin = user.role.trim().toLowerCase() === 'admin';
                if (isAdmin) {
                    // logger.info()
                    const allUsers = await UserModel.find().lean();

                    return nextpayResponse(res, 'User list retrieved successfully', 'LIST_SUCCESS', allUsers);
                } else {
                    console.log('1');

                    if (!user) {
                        return nextpayError(res, 'User not found', langs.INTERNAL_SERVER_ERROR);
                    }
                    const relatedUsers = await UserModel.find({ team: user.team });

                    const result = {
                        user: {
                            _id: user._id.toString(),
                            username: user.name,
                            age: user.age,
                            address: user.address,
                            team: user.team,
                            role: user.role,
                        },
                        relatedUsers: relatedUsers.map(relatedUser => ({
                            _id: relatedUser._id.toString(),
                            username: relatedUser.name,
                            age: relatedUser.age,
                            address: relatedUser.address,
                            team: relatedUser.team,
                            role: relatedUser.role,
                        })),
                    };

                    return nextpayResponse(res, 'User list retrieved successfully', 'LIST_SUCCESS', result);
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    }
];

export default apis;
