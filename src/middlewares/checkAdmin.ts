import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/test.model';

export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const loggedInUserId = req.body.user.userId;
        const loggedInUser = await UserModel.findById(loggedInUserId).lean();

        if (!loggedInUser || loggedInUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
        }
        next();
    } catch (error) {
        console.error('Error checking admin:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}
