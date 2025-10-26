import rateLimit from 'express-rate-limit';
import { logger } from '@/utils/logger';

// 通用API限流中间件
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在窗口期内最多100次请求
  message: {
    code: 'ERROR_004',
    message: 'API请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true, // 返回标准的 `RateLimit` 头部
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 头部
  
  // 自定义键生成器（可以基于用户ID或IP）
  keyGenerator: (req) => {
    // 优先使用用户ID，如果没有则使用IP
    return req.ip || 'unknown';
  },
  
  // 请求被限制时的处理
  handler: (req, res) => {
    logger.warn(`API限流触发: IP=${req.ip}, URL=${req.originalUrl}, Method=${req.method}`);
    res.status(429).json({
      code: 'ERROR_004',
      message: 'API请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    });
  },
  
  // 开发环境跳过限流
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// 翻译API专用限流（更严格）
export const translationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10分钟
  max: 50, // 每个IP在窗口期内最多50次翻译请求
  message: {
    code: 'ERROR_004',
    message: '翻译请求过于频繁，请稍后再试',
    retryAfter: '10分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  
  handler: (req, res) => {
    logger.warn(`翻译API限流触发: IP=${req.ip}, URL=${req.originalUrl}`);
    res.status(429).json({
      code: 'ERROR_004',
      message: '翻译请求过于频繁，请稍后再试',
      retryAfter: '10分钟'
    });
  },
  
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// 批量操作限流（最严格）
export const batchOperationRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30分钟
  max: 10, // 每个IP在窗口期内最多10次批量操作
  message: {
    code: 'ERROR_004',
    message: '批量操作请求过于频繁，请稍后再试',
    retryAfter: '30分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  
  handler: (req, res) => {
    logger.warn(`批量操作限流触发: IP=${req.ip}, URL=${req.originalUrl}`);
    res.status(429).json({
      code: 'ERROR_004',
      message: '批量操作请求过于频繁，请稍后再试',
      retryAfter: '30分钟'
    });
  },
  
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// AI单词处理限流配置
export const aiWordRateLimiter = {
  // 单个单词AI处理
  aiWordProcess: rateLimit({
    windowMs: 5 * 60 * 1000, // 5分钟
    max: 30, // 每个IP在窗口期内最多30次单词处理
    message: {
      code: 'ERROR_004',
      message: 'AI单词处理请求过于频繁，请稍后再试',
      retryAfter: '5分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (req, res) => {
      logger.warn(`AI单词处理请求频率限制触发: ${req.ip}`);
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'AI单词处理请求过于频繁，请稍后再试'
      });
    },
    skip: (req) => process.env.NODE_ENV === 'development'
  }),

  // 批量单词AI处理（更严格）
  aiWordBatch: rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 每个IP在窗口期内最多5次批量处理
    message: {
      code: 'ERROR_004',
      message: 'AI批量单词处理请求过于频繁，请稍后再试',
      retryAfter: '15分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (req, res) => {
      logger.warn(`AI批量处理请求频率限制触发: ${req.ip}`);
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'AI批量处理请求过于频繁，请稍后再试'
      });
    },
    skip: (req) => process.env.NODE_ENV === 'development'
  }),

  // 单词过滤
  aiWordFilter: rateLimit({
    windowMs: 10 * 60 * 1000, // 10分钟
    max: 20, // 每个IP在窗口期内最多20次过滤操作
    message: {
      code: 'ERROR_004',
      message: '单词过滤请求过于频繁，请稍后再试',
      retryAfter: '10分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (req, res) => {
      logger.warn(`AI单词过滤请求频率限制触发: ${req.ip}`);
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'AI单词过滤请求过于频繁，请稍后再试'
      });
    },
    skip: (req) => process.env.NODE_ENV === 'development'
  }),

  // 单词翻译检查
  aiWordCheck: rateLimit({
    windowMs: 5 * 60 * 1000, // 5分钟
    max: 50, // 每个IP在窗口期内最多50次检查
    message: {
      code: 'ERROR_004',
      message: '单词翻译检查请求过于频繁，请稍后再试',
      retryAfter: '5分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (req, res) => {
      logger.warn(`翻译检查请求频率限制触发: ${req.ip}`);
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: '翻译检查请求过于频繁，请稍后再试'
      });
    },
    skip: (req) => process.env.NODE_ENV === 'development'
  }),

  // 配置状态查询
  configStatus: rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 10, // 每个IP在窗口期内最多10次查询
    message: {
      code: 'ERROR_004',
      message: '配置状态查询过于频繁，请稍后再试',
      retryAfter: '1分钟'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (req, res) => {
      logger.warn(`配置状态查询请求频率限制触发: ${req.ip}`);
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: '配置状态查询请求过于频繁，请稍后再试'
      });
    },
    skip: (req) => process.env.NODE_ENV === 'development'
  })
};