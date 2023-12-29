import { ExpressHandler, nextpayResponse, nextpayError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import TestModel from '../models/test.model';
import mongoose from 'mongoose';

const logger = Logger.create('user_mongodb.ts');
const apis: ExpressHandler[] = [
  {
    // In ra thông tin của tất cả các users
    path: '/users',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

        const users = await TestModel.find().lean();
        logger.info(users);

        const formattedUsers = users.map(user => ({
          _id: user._id.toString(),
          name: user.name,
          age: user.age,
          address: user.address,
          team: user.team,
          role: user.role,
          username: user.username,
          password: user.password,
        }));

        return nextpayResponse(res, 'Users retrieved successfully', 'USERS_RETRIEVED', formattedUsers);
      } catch (err: any) {
        logger.error(req.originalUrl, req.method, 'error:', err);

        return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  // Add users
  {
    path: '/users',
    method: 'POST',
    action: async (req, res) => {
      try {
        const newUser = req.body;

        const { name, age, address } = newUser;
        const user = new TestModel({ name, age, address });
        // user._id = new mongoose.Types.ObjectId();
        await user.save();

        return nextpayResponse(res, 'User added successfully', 'USER_ADDED', user);
      } catch (error: any) {
        console.error('Error adding user:', error);
        logger.error(error.message);

        return nextpayError(res, 'Something went wrong while adding the user', langs.INTERNAL_SERVER_ERROR, null);
      }
    }
  },
  // Update users
  {
    path: '/users/:id',
    method: 'PUT',
    action: async (req, res) => {
      try {
        const { id } = req.params;
        const updatedUser = req.body;

        // ktra xem id đó có tồn tại không
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return nextpayError(res, 'Invalid user ID', langs.BAD_REQUEST);
        }

        const existingUser = await TestModel.findById(id);

        if (!existingUser) {
          return nextpayError(res, 'User not found', langs.RESOURCE_NOT_FOUND);
        }

        existingUser.name = updatedUser.name;
        existingUser.age = updatedUser.age;
        existingUser.address = updatedUser.address;
        existingUser.team = updatedUser.team;
        existingUser.role = updatedUser.role;

        await existingUser.save();

        return nextpayResponse(res, 'User updated successfully', 'USER_UPDATED', existingUser);
      } catch (error: any) {
        logger.error(req.originalUrl, req.method, 'error:', error);

        return nextpayError(res, error.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  // DELETE USERS
  {
    path: '/users/:id',
    method: 'DELETE',
    action: async (req, res) => {
      try {
        logger.debug(req.originalUrl, req.method, req.params, req.query, req.body);

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return nextpayError(res, 'Invalid user ID', langs.BAD_REQUEST);
        }

        const deletedUser = await TestModel.findByIdAndDelete(id);

        if (!deletedUser) {
          return nextpayError(res, 'User not found', langs.RESOURCE_NOT_FOUND);
        }

        return nextpayResponse(res, 'User deleted successfully', 'USER_DELETED', deletedUser);
      } catch (err: any) {
        logger.error(req.originalUrl, req.method, 'error:', err);

        return nextpayError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    }
  },
];

export default apis;
