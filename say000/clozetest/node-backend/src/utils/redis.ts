import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

// Redis配置接口
interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

/**
 * Redis客户端工具类
 * 提供统一的Redis操作接口，包含连接管理和错误处理
 */
export class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(config: RedisConfig = {}) {
    const redisUrl = `redis://${config.host || process.env.REDIS_HOST || 'localhost'}:${config.port || process.env.REDIS_PORT || 6379}`;
    
    const clientConfig: any = {
      url: redisUrl,
      database: config.db || parseInt(process.env.REDIS_DB || '0'),
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Redis重连次数超过限制，停止重连');
            return false;
          }
          const delay = Math.min(retries * 100, 3000);
          logger.warn(`Redis连接失败，${delay}ms后重试 (第${retries}次)`);
          return delay;
        }
      }
    };

    // 只有当password存在时才添加到配置中
    const password = config.password || process.env.REDIS_PASSWORD;
    if (password) {
      clientConfig.password = password;
    }

    this.client = createClient(clientConfig);

    // 监听连接事件
    this.client.on('connect', () => {
      logger.info('Redis客户端连接中...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis客户端连接成功');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis客户端错误:', error);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis客户端连接断开');
    });
  }

  /**
   * 连接Redis
   */
  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      logger.error('Redis连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开Redis连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('Redis断开连接失败:', error);
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      logger.debug(`Redis SET: ${key}`);
    } catch (error) {
      logger.error(`Redis SET失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      logger.debug(`Redis GET: ${key} = ${value ? '有值' : '无值'}`);
      return value;
    } catch (error) {
      logger.error(`Redis GET失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<number> {
    try {
      const result = await this.client.del(key);
      logger.debug(`Redis DEL: ${key}`);
      return result;
    } catch (error) {
      logger.error(`Redis DEL失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error(`Redis EXPIRE失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 批量设置
   */
  async mset(keyValues: Record<string, string>): Promise<void> {
    try {
      const pairs: string[] = [];
      Object.entries(keyValues).forEach(([key, value]) => {
        pairs.push(key, value);
      });
      await this.client.mSet(pairs);
      logger.debug(`Redis MSET: ${Object.keys(keyValues).length} keys`);
    } catch (error) {
      logger.error('Redis MSET失败:', error);
      throw error;
    }
  }

  /**
   * 批量获取
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const values = await this.client.mGet(keys);
      logger.debug(`Redis MGET: ${keys.length} keys`);
      return values;
    } catch (error) {
      logger.error('Redis MGET失败:', error);
      throw error;
    }
  }

  /**
   * 增加数值
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 减少数值
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`Redis DECR失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取匹配的键
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS失败: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * 清空当前数据库
   */
  async flushdb(): Promise<void> {
    try {
      await this.client.flushDb();
      logger.info('Redis数据库已清空');
    } catch (error) {
      logger.error('Redis FLUSHDB失败:', error);
      throw error;
    }
  }

  /**
   * 获取原始Redis客户端（用于高级操作）
   */
  getClient(): RedisClientType {
    return this.client;
  }
}

// 创建默认的Redis客户端实例
export const redisClient = new RedisClient();

// 缓存工具函数
export class CacheUtils {
  /**
   * 生成缓存键
   */
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * 缓存JSON对象
   */
  static async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await redisClient.set(key, jsonString, ttl);
  }

  /**
   * 获取JSON对象
   */
  static async getJSON<T = any>(key: string): Promise<T | null> {
    const jsonString = await redisClient.get(key);
    if (!jsonString) return null;
    
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.error(`JSON解析失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 缓存翻译结果
   */
  static async cacheTranslation(sourceText: string, translatedText: string, ttl: number = 3600): Promise<void> {
    const key = this.generateKey('translation', Buffer.from(sourceText).toString('base64'));
    await this.setJSON(key, { sourceText, translatedText, cachedAt: Date.now() }, ttl);
  }

  /**
   * 获取缓存的翻译结果
   */
  static async getCachedTranslation(sourceText: string): Promise<{ sourceText: string; translatedText: string; cachedAt: number } | null> {
    const key = this.generateKey('translation', Buffer.from(sourceText).toString('base64'));
    return await this.getJSON(key);
  }

  /**
   * 缓存单词翻译
   */
  static async cacheWordTranslation(word: string, translation: any, ttl: number = 7200): Promise<void> {
    const key = this.generateKey('word', word.toLowerCase());
    await this.setJSON(key, { word, translation, cachedAt: Date.now() }, ttl);
  }

  /**
   * 获取缓存的单词翻译
   */
  static async getCachedWordTranslation(word: string): Promise<{ word: string; translation: any; cachedAt: number } | null> {
    const key = this.generateKey('word', word.toLowerCase());
    return await this.getJSON(key);
  }
}

export default redisClient;