import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: unknown }).statusCode ?? 500)
      : 500;

  const message =
    err instanceof Error && typeof err.message === 'string' && err.message.length > 0
      ? err.message
      : 'Internal server error';

  const errorName = err instanceof Error && err.name ? err.name : 'Error';

  res.status(Number.isFinite(statusCode) ? statusCode : 500).json({
    success: false,
    error: errorName,
    message,
  });
}
