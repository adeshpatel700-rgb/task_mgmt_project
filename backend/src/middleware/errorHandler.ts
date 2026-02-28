import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  logger.error('Prisma error details:', { code: error.code, message: error.message, meta: error.meta });
  switch (error.code) {
    case 'P2002':
      return new AppError(409, 'A record with this unique field already exists');
    case 'P2025':
      return new AppError(404, 'Record not found');
    case 'P2003':
      return new AppError(400, 'Invalid reference to related record');
    default:
      return new AppError(500, `Database operation failed (${error.code}: ${error.message})`);
  }
};

const handleZodError = (error: ZodError): AppError => {
  const messages = error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  return new AppError(400, `Validation failed: ${messages.join(', ')}`);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Log the actual error for debugging
  logger.error('Error caught:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Convert known errors to AppError
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Prisma initialization error:', err);
    error = new AppError(500, `Database connection failed: ${err.message}`);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Prisma unknown error:', err);
    error = new AppError(500, `Database error: ${err.message}`);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (!(err instanceof AppError)) {
    error = new AppError(500, 'Internal server error', false);
  }

  const appError = error as AppError;
  const statusCode = appError.statusCode || 500;
  const message = appError.message || 'Internal server error';

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  } else {
    logger.warn('Client error:', {
      message: err.message,
      url: req.url,
      method: req.method,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
