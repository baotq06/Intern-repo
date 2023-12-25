import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';
import TokenModel from '../models/token.mdel';
import { v4 as uuidv4 } from 'uuid';

// import { authenticateToken } from './authenticateTokens';

const logger = Logger.create('user_mongodb.ts');

const apis: ExpressHandler[] = [
    {
        path: '/login',
        method: 'POST',
        // preValidatorMiddlewares: [authenticateToken,],
        action: async (req, res) => {
            try {
                const { username, password } = req.body;
                console.log('Received login request with username:', username, 'and password:', password);

                const user = await TestModel.findOne({ username, password }).lean();
                console.log('MongoDB query result:', user);

                if (!user) {
                    return nextpayError(res, 'Invalid username or password', langs.UNAUTHORIZED);
                }

                // Generate a temporary token (UUID)
                const tempToken = uuidv4();
                console.log('Generated temporary token:', tempToken);

                await TokenModel.create({ userId: user._id, token: tempToken });
                console.log('Token saved to MongoDB');

                await TestModel.findByIdAndUpdate(user._id, { tempToken });
                console.log('User document updated with token');

                const userData = {
                    _id: user._id.toString(),
                    username: user.name,
                    age: user.age,
                    address: user.address,
                    tempToken,
                };

                return nextpayResponse(res, 'Login successful', 'LOGIN_SUCCESS', userData);
            } catch (error: any) {
                logger.error(req.originalUrl, req.method, 'error:', error);

                return nextpayError(res, error.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        },
    },
];

export default apis;
