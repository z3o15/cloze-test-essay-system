import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 记录错误日志
  logger.error('API错误:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 默认错误状态码
  let statusCode = error.statusCode || 500;
  let message = error.message || '服务器内部错误';

  // 处理特定类型的错误
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '请求参数验证失败';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = '无效的请求参数';
  } else if (error.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = '数据已存在';
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = '关联数据不存在';
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = '服务暂时不可用';
  } else if (error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = '外部服务不可达';
  } else if (error.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = '请求超时';
  }

  // 在生产环境中隐藏敏感错误信息
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = '服务器内部错误';
  }

  const errorResponse: any = {
    success: false,
    error: message,
    timestamp: new Date()
  };

  // 在开发环境中包含错误堆栈
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: error.stack,
      name: error.name,
      code: error.code
    };
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};