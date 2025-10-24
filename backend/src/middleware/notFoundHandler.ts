import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/models/types';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  const response: ApiResponse = {
    success: false,
    error: `路由 ${req.method} ${req.originalUrl} 不存在`,
    timestamp: new Date()
  };

  res.status(404).json(response);
};