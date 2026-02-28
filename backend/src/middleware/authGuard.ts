import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';
import { AppError } from './errorHandler';

interface JwtPayload {
  userId: string;
  email: string;
}

export const authGuard = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authorization token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Authorization token is required');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid access token');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
