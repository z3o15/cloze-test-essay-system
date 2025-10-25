// 首先加载环境变量
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { logger } from '@/utils/logger';
import { connectRedis, testRedisConnection } from '@/config/redis';
import { testConnection } from '@/config/database';
import routes from '@/routes';

// 调试环境变量加载
console.log('Environment variables loaded:');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('VOLCANO_API_KEY:', process.env.VOLCANO_API_KEY ? '已配置' : '未配置');
console.log('VOLCANO_API_URL:', process.env.VOLCANO_API_URL);
console.log('VOLCANO_MODEL:', process.env.VOLCANO_MODEL);

const app = express();
const PORT = process.env.PORT || 8080;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'null'], // 允许file://协议访问（用于测试）
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env['API_RATE_LIMIT'] || '1000'), // 限制每个IP 1000次请求（开发环境增加限制）
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 开发环境跳过速率限制
  skip: (req) => {
    // 开发环境完全跳过限制
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    // 生产环境只对本地IP跳过
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost';
  }
});
app.use(limiter);

// 请求解析中间件 - 确保UTF-8编码
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// 确保请求体使用UTF-8编码
app.use((req, res, next) => {
  req.setEncoding('utf8');
  next();
});

// 请求日志
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api', routes);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 初始化数据库和Redis连接
const initializeConnections = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('数据库连接失败，服务器启动中止');
      process.exit(1);
    }

    // 连接Redis
    const redisConnected = await connectRedis();
    if (redisConnected) {
      await testRedisConnection();
    } else {
      logger.warn('Redis连接失败，缓存功能将不可用');
    }

    logger.info('所有连接初始化完成');
  } catch (error) {
    logger.error('连接初始化失败:', error);
    process.exit(1);
  }
};

// 启动服务器
app.listen(PORT, async () => {
  logger.info(`🚀 服务器启动成功`);
  logger.info(`📍 端口: ${PORT}`);
  logger.info(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 健康检查: http://localhost:${PORT}/health`);
  
  // 初始化连接
  await initializeConnections();
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

export default app;