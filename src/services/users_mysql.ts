import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import sqlConnection from '../libs/mysql';
import TestModel from '../models/test.model';


const logger = Logger.create('users_mysql.ts');
const apis: ExpressHandler[] = [
    {
        path: '/users_sql',
        method: 'GET',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const result = await sqlConnection.query('SELECT * FROM Users');

                if (result && result.rows) {
                    const { rows } = result;

                    return nextpayResponse(res, 'successful', '', rows);
                } else {
                    throw new Error('Invalid');
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    {
        path: '/users_sql',
        method: 'POST',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { name, age, address } = req.body;
                const result = await sqlConnection.query('INSERT INTO Users (name, age, address) VALUES ($1, $2, $3)', [name, age, address]);

                if (result && result.rowCount === 1) {
                    return nextpayResponse(res, 'User added successfully', 'USER_ADDED', null);
                } else {
                    throw new Error('Failed to add user');
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    {
        path: '/users_sql/:id',
        method: 'PUT',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const { name, age, address } = req.body;
                const userId = req.params.id;

                const result = await sqlConnection.query('UPDATE Users SET name = $1, age = $2, address = $3 WHERE id = $4', [name, age, address, userId]);

                if (result && result.rowCount === 1) {
                    return nextpayResponse(res, 'User updated successfully', 'USER_UPDATED', null);
                } else {
                    throw new Error('Failed to update user');
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
    {
        path: '/users_sql/:id',
        method: 'DELETE',
        action: async (req, res) => {
            try {
                logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

                const userId = req.params.id;
                const result = await sqlConnection.query('DELETE FROM Users WHERE id = $1', [userId]);

                if (result && result.rowCount === 1) {
                    return nextpayResponse(res, 'User deleted successfully', 'USER_DELETED', null);
                } else {
                    throw new Error('Failed to delete user');
                }
            } catch (err: any) {
                logger.error(req.originalUrl, req.method, 'error:', err);

                return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
            }
        }
    },
];

export default apis;
