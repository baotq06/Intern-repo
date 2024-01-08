import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import TokenModel from '../models/token.model';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    // JWT or UUID
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Token is missing or invalid',
        });
    }

    let token: string;

    try {
        token = authHeader.replace('Bearer ', '');

        console.log('Received token:', token);

        const decoded: any = jwt.verify(token, 'your-secret-key');

        req.body.user = decoded;

        return next();
    } catch (jwtError) {
        console.error('Error validating JWT token:', jwtError);

        if (jwtError instanceof jwt.JsonWebTokenError) {
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

            if (isUuid) {
                const tokenDocument = await TokenModel.findOne({ token }).lean();

                if (!tokenDocument) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Invalid temporary token',
                    });
                }
                req.body.user = tokenDocument;

                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: 'Forbidden: Invalid token or UUID',
        });
    }
}

