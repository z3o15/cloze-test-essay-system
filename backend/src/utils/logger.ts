import winston from 'winston';
import path from 'path';

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';
    if (Object.keys(meta).length) {
      try {
        metaStr = JSON.stringify(meta, (key, value) => {
          // 处理循环引用
          if (typeof value === 'object' && value !== null) {
            if (value.constructor && value.constructor.name === 'ClientRequest') {
              return '[ClientRequest]';
            }
            if (value.constructor && value.constructor.name === 'IncomingMessage') {
              return '[IncomingMessage]';
            }
          }
          return value;
        }, 2);
      } catch (error) {
        metaStr = '[无法序列化的对象]';
      }
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// 控制台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';
    if (Object.keys(meta).length) {
      try {
        metaStr = JSON.stringify(meta, (key, value) => {
          // 处理循环引用
          if (typeof value === 'object' && value !== null) {
            if (value.constructor && value.constructor.name === 'ClientRequest') {
              return '[ClientRequest]';
            }
            if (value.constructor && value.constructor.name === 'IncomingMessage') {
              return '[IncomingMessage]';
            }
          }
          return value;
        }, 2);
      } catch (error) {
        metaStr = '[无法序列化的对象]';
      }
    }
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// 创建传输器
const transports: winston.transport[] = [
  // 控制台输出
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat,
  }),
];

// 在生产环境中添加文件输出
if (process.env.NODE_ENV === 'production') {
  const logDir = path.join(process.cwd(), 'logs');
  
  transports.push(
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 组合日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// 创建logger实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// 处理未捕获的异常
logger.exceptions.handle(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', { reason, promise });
});

// 导出日志方法
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logError = (message: string, meta?: any) => logger.error(message, meta);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);

export default logger;