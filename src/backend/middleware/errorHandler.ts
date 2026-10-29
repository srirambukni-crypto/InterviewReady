import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    error: `API route '${req.method} ${req.originalUrl}' not found.`
  });
}

export function centralErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled server error:', err);
  const statusCode = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  const message = err.message || 'An internal server error occurred. Please try again.';

  return res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
}
