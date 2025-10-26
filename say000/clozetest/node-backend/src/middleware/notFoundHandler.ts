import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/types';
import { logger } from '../utils/logger';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  const response: ApiResponse = {
    code: 'NOT_FOUND',
    message: `路由 ${req.method} ${req.originalUrl} 不存在`,
    timestamp: new Date()
  };

  res.status(404).json(response);
};