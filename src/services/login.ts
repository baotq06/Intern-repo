import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';
import TokenModel from '../models/token.model';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = 'your-secret-key';
const logger = Logger.create('user_mongodb.ts');

const apis: ExpressHandler[] = [
    // login : đăng nhập tk mk => sinh ra token uuid để bảo mật
    {
        path: '/login-uuid',
        method: 'POST',
        action: async (req, res) => {
            try {
                const { username, password } = req.body;
                console.log('username:', username, '\npassword:', password);

                // nhập user name password và tạo ra hash password lưu vào db. b1: Nếu có thì user info. b2: compare password

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                console.log('hash password: ', hashedPassword);

                const user = await TestModel.findOne({ username, password }).lean();
                console.log('MongoDB query result:', user);

                if (!user) {
                    return nextpayError(res, 'Invalid username or password', langs.UNAUTHORIZED);
                }

                const passwordMatch = await bcrypt.compare(user.password, hashedPassword);
                console.log('compare: ', passwordMatch);

                if (!passwordMatch) {
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
                    team: user.team,
                    role: user.role,
                    tempToken,
                };

                return nextpayResponse(res, 'Login successful', 'LOGIN_SUCCESS', userData);
            } catch (error: any) {
                logger.error(req.originalUrl, req.method, 'error:', error);

                return nextpayError(res, error.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        },
    },
    // đăng nhập tk mk => sinh ra token jwt để bảo mật
    {
        path: '/login-jwt',
        method: 'POST',
        action: async (req, res) => {
            try {
                const { username, password } = req.body;
                console.log('username:', username, '\npassword:', password);

                const user = await TestModel.findOne({ username, password }).lean();
                console.log('MongoDB query result:', user);

                // ktra xem user có lỗi hay null không
                if (!user) {
                    return nextpayError(res, 'Invalid username or password', langs.UNAUTHORIZED);
                }

                const iat = Math.floor(Date.now() / 1000);
                const exp = iat + 3600;

                const jwtToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
                console.log('Generated JWT token:', jwtToken);

                await TokenModel.create({ userId: user._id, token: jwtToken });
                console.log('Token saved to MongoDB');

                const userData = {
                    _id: user._id.toString(),
                    username: user.name,
                    age: user.age,
                    address: user.address,
                    team: user.team,
                    role: user.role,
                    iat,
                    exp,
                    jwtToken,
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
