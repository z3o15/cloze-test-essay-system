import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

// Redis配置
const redisConfig: any = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  database: parseInt(process.env.REDIS_DB || '0'),
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

// 创建Redis客户端
export const redisClient: RedisClientType = createClient(redisConfig);

// Redis事件监听
redisClient.on('connect', () => {
  logger.info('Redis连接建立成功');
});

redisClient.on('ready', () => {
  logger.info('Redis客户端准备就绪');
});

redisClient.on('error', (err) => {
  logger.error('Redis连接错误:', err);
});

redisClient.on('end', () => {
  logger.info('Redis连接已断开');
});

// 连接Redis
export const connectRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    logger.info('Redis连接成功');
    return true;
  } catch (error) {
    logger.error('Redis连接失败:', error);
    return false;
  }
};

// 测试Redis连接
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const pong = await redisClient.ping();
    logger.info('Redis连接测试成功:', pong);
    return true;
  } catch (error) {
    logger.error('Redis连接测试失败:', error);
    return false;
  }
};

// 缓存操作辅助函数
export class CacheService {
  // 设置缓存
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
      logger.debug(`缓存设置成功: ${key}`);
      return true;
    } catch (error) {
      logger.error(`缓存设置失败: ${key}`, error);
      return false;
    }
  }

  // 获取缓存
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (value === null) {
        return null;
      }
      const parsedValue = JSON.parse(value);
      logger.debug(`缓存获取成功: ${key}`);
      return parsedValue as T;
    } catch (error) {
      logger.error(`缓存获取失败: ${key}`, error);
      return null;
    }
  }

  // 删除单个缓存
  static async delSingle(key: string): Promise<boolean> {
    try {
      const result = await redisClient.del(key);
      logger.debug(`缓存删除: ${key}, 结果: ${result}`);
      return result > 0;
    } catch (error) {
      logger.error(`缓存删除失败: ${key}`, error);
      return false;
    }
  }

  // 检查缓存是否存在
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`缓存检查失败: ${key}`, error);
      return false;
    }
  }

  // 设置缓存过期时间
  static async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redisClient.expire(key, ttl);
      return Boolean(result);
    } catch (error) {
      logger.error(`设置缓存过期时间失败: ${key}`, error);
      return false;
    }
  }

  // 获取缓存剩余过期时间
  static async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error(`获取缓存过期时间失败: ${key}`, error);
      return -1;
    }
  }

  // 批量获取缓存
  static async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      if (keys.length === 0) {
        return [];
      }
      const values = await redisClient.mGet(keys);
      const results = values.map((value, index) => {
        if (value === null) {
          return null;
        }
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.error(`解析缓存值失败: ${keys[index]}`, error);
          return null;
        }
      });
      logger.debug(`批量获取缓存成功: ${keys.length} 个键`);
      return results;
    } catch (error) {
      logger.error(`批量获取缓存失败:`, error);
      return keys.map(() => null);
    }
  }

  // 批量删除缓存（指定键数组）
  static async del(keys: string | string[]): Promise<number> {
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      if (keyArray.length === 0) {
        return 0;
      }
      const result = await redisClient.del(keyArray);
      logger.debug(`批量删除缓存: ${keyArray.length} 个键, 删除数量: ${result}`);
      return result;
    } catch (error) {
      logger.error(`批量删除缓存失败:`, error);
      return 0;
    }
  }

  // 批量删除缓存（支持模式匹配）
  static async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      const result = await redisClient.del(keys);
      logger.debug(`批量删除缓存: ${pattern}, 删除数量: ${result}`);
      return result;
    } catch (error) {
      logger.error(`批量删除缓存失败: ${pattern}`, error);
      return 0;
    }
  }
}

// 优雅关闭Redis连接
export const closeRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis连接已关闭');
  } catch (error) {
    logger.error('关闭Redis连接失败:', error);
  }
};