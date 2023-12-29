import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import TokenModel from '../models/token.model';

export async function authenticateTokenUuid(req: Request, res: Response, next: NextFunction) {
    //UUID
    const token = req.headers.authorization.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Token is missing',
        });
    }

    try {
        console.log('token: ', token);
        // const decoded: any = jwt.verify(token.split(' ')[1], 'your-secret-key');

        const tokenDocument = await TokenModel.findOne({ token }).lean();

        if (!tokenDocument) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Invalid temporary token',
            });
        }

        req.body.user = tokenDocument;

        next();
    } catch (err) {
        console.error('Error validating token:', err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Invalid token',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}