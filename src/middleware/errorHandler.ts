import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Error) {
    const statusCode = (err as Error & { statusCode?: number }).statusCode ?? 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
  });
};


export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
