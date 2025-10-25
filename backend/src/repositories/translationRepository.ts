import { Pool } from 'pg';
import { logger } from '@/utils/logger';

export interface Translation {
  id?: number;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  service: string;
  cache_key: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface FindManyOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
}

export class TranslationRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cloze_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  /**
   * 创建翻译记录
   */
  async create(translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>): Promise<Translation> {
    const query = `
      INSERT INTO translations (source_text, translated_text, source_lang, target_lang, service, cache_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    try {
      const result = await this.pool.query(query, [
        translation.source_text,
        translation.translated_text,
        translation.source_lang,
        translation.target_lang,
        translation.service,
        translation.cache_key
      ]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('创建翻译记录失败:', error);
      throw error;
    }
  }

  /**
   * 根据缓存键查找翻译
   */
  async findByKey(cacheKey: string): Promise<Translation | null> {
    const query = 'SELECT * FROM translations WHERE cache_key = $1 ORDER BY created_at DESC LIMIT 1';
    
    try {
      const result = await this.pool.query(query, [cacheKey]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('查找翻译记录失败:', error);
      throw error;
    }
  }

  /**
   * 查找多条翻译记录
   */
  async findMany(options: FindManyOptions = {}): Promise<Translation[]> {
    const { limit = 20, offset = 0, orderBy = 'created_at DESC' } = options;
    
    const query = `
      SELECT * FROM translations 
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const result = await this.pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('查找翻译记录失败:', error);
      throw error;
    }
  }

  /**
   * 统计翻译记录总数
   */
  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM translations';
    
    try {
      const result = await this.pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('统计翻译记录失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID删除翻译记录
   */
  async deleteById(id: number): Promise<boolean> {
    const query = 'DELETE FROM translations WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('删除翻译记录失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期的翻译缓存
   */
  async cleanupExpired(daysOld: number = 30): Promise<number> {
    const query = `
      DELETE FROM translations 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;
    
    try {
      const result = await this.pool.query(query);
      return result.rowCount;
    } catch (error) {
      logger.error('清理过期翻译记录失败:', error);
      throw error;
    }
  }
}