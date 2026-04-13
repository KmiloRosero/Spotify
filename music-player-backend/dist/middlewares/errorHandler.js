"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    const statusCode = typeof err === 'object' && err !== null && 'statusCode' in err
        ? Number(err.statusCode ?? 500)
        : 500;
    const message = err instanceof Error && typeof err.message === 'string' && err.message.length > 0
        ? err.message
        : 'Internal server error';
    const errorName = err instanceof Error && err.name ? err.name : 'Error';
    res.status(Number.isFinite(statusCode) ? statusCode : 500).json({
        success: false,
        error: errorName,
        message,
    });
}
