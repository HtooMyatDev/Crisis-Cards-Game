import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'
export function generateJWTToken(payload: object) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}
interface JwtPayload {
    userId: string;
    email: string;
    role?: string;
}

export function verifyToken(
    req: Request,
    res: Response,
    next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or invalid format' })
    }

    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        // Attach user info to req with proper typing
        (req as Request & { user?: JwtPayload }).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}
