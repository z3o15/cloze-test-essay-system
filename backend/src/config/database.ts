import { Pool, PoolConfig } from 'pg';
import { logger } from '@/utils/logger';

// 延迟初始化数据库配置
const createDbConfig = (): PoolConfig => {
  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cloze_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // 最大连接数
    idleTimeoutMillis: 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 2000, // 连接超时时间
    // 设置字符编码为UTF-8
    options: '--client_encoding=UTF8',
  };



  return config;
};

// 延迟创建连接池
let pool: Pool | null = null;

const getPool = (): Pool => {
  // 强制重新创建连接池以确保使用最新的环境变量
  if (!pool || !process.env.DB_PASSWORD) {
    if (pool) {
      pool.end(); // 关闭现有连接池
    }
    const dbConfig = createDbConfig();
    pool = new Pool(dbConfig);
    
    // 连接池事件监听
    pool.on('connect', (client) => {
      logger.info('数据库连接建立成功');
      // 设置客户端编码为UTF-8
      client.query('SET client_encoding TO UTF8');
    });

    pool.on('error', (err) => {
      logger.error('数据库连接池错误:', err);
    });
  }
  return pool;
};

export { getPool as pool };

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
  try {
    const poolInstance = getPool();
    const client = await poolInstance.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('数据库连接测试成功:', result.rows[0]);
    return true;
  } catch (error) {
    logger.error('数据库连接测试失败:', error);
    return false;
  }
};

// 执行查询的辅助函数
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const poolInstance = getPool();
    const result = await poolInstance.query(text, params);
    const duration = Date.now() - start;
    logger.debug('执行查询', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('查询执行失败', { text, params, error });
    throw error;
  }
};

// 事务执行辅助函数
export const transaction = async (callback: (client: any) => Promise<any>): Promise<any> => {
  const poolInstance = getPool();
  const client = await poolInstance.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 优雅关闭数据库连接
export const closeDatabase = async (): Promise<void> => {
  try {
    const poolInstance = getPool();
    await poolInstance.end();
    logger.info('数据库连接池已关闭');
  } catch (error) {
    logger.error('关闭数据库连接池失败:', error);
  }
};