import { query } from '@/config/database';
import { TranslationHistory } from '@/models/types';
import { logger } from '@/utils/logger';

export interface TranslationCreateData {
  source_text: string;
  target_text: string;
  source_lang: string;
  target_lang: string;
  translation_service: string;
  user_ip?: string;
  user_agent?: string;
}

export interface TranslationQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  where?: Record<string, any>;
}

export class TranslationRepository {
  private tableName = 'translation_history';

  /**
   * 创建翻译记录
   */
  async create(data: TranslationCreateData): Promise<TranslationHistory> {
    const sql = `
      INSERT INTO ${this.tableName} 
      (source_text, target_text, source_lang, target_lang, translation_service, user_ip, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.source_text,
      data.target_text,
      data.source_lang,
      data.target_lang,
      data.translation_service,
      data.user_ip || null,
      data.user_agent || null
    ];

    try {
      const result = await query(sql, values);
      logger.debug('翻译记录创建成功:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('创建翻译记录失败:', error);
      throw new Error('创建翻译记录失败');
    }
  }

  /**
   * 根据ID查找翻译记录
   */
  async findById(id: string): Promise<TranslationHistory | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('查找翻译记录失败:', error);
      throw new Error('查找翻译记录失败');
    }
  }

  /**
   * 查找多条翻译记录
   */
  async findMany(options: TranslationQueryOptions = {}): Promise<TranslationHistory[]> {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'created_at DESC',
      where = {}
    } = options;

    let sql = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (Object.keys(where).length > 0) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // 添加排序
    sql += ` ORDER BY ${orderBy}`;

    // 添加分页
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
      logger.debug('执行查询:', { sql, values });
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('查找翻译记录失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('查找翻译记录失败');
    }
  }

  /**
   * 统计翻译记录数量
   */
  async count(where: Record<string, any> = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (Object.keys(where).length > 0) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    try {
      const result = await query(sql, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('统计翻译记录失败:', error);
      throw new Error('统计翻译记录失败');
    }
  }

  /**
   * 根据文本查找翻译记录
   */
  async findByText(sourceText: string, sourceLang: string, targetLang: string): Promise<TranslationHistory[]> {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE source_text = $1 AND source_lang = $2 AND target_lang = $3
      ORDER BY created_at DESC
      LIMIT 10
    `;

    try {
      const result = await query(sql, [sourceText, sourceLang, targetLang]);
      return result.rows;
    } catch (error) {
      logger.error('根据文本查找翻译记录失败:', error);
      throw new Error('根据文本查找翻译记录失败');
    }
  }

  /**
   * 获取翻译统计数据
   */
  async getStats(days: number = 7): Promise<any> {
    const sql = `
      SELECT 
        translation_service,
        source_lang,
        target_lang,
        COUNT(*) as translation_count,
        DATE_TRUNC('day', created_at) as date
      FROM ${this.tableName}
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY translation_service, source_lang, target_lang, DATE_TRUNC('day', created_at)
      ORDER BY date DESC, translation_count DESC
    `;

    try {
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      logger.error('获取翻译统计失败:', error);
      throw new Error('获取翻译统计失败');
    }
  }

  /**
   * 获取热门翻译文本
   */
  async getPopularTranslations(limit: number = 10): Promise<any> {
    const sql = `
      SELECT 
        source_text,
        target_text,
        source_lang,
        target_lang,
        COUNT(*) as frequency,
        MAX(created_at) as last_translated
      FROM ${this.tableName}
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY source_text, target_text, source_lang, target_lang
      ORDER BY frequency DESC, last_translated DESC
      LIMIT $1
    `;

    try {
      const result = await query(sql, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('获取热门翻译失败:', error);
      throw new Error('获取热门翻译失败');
    }
  }

  /**
   * 根据IP获取翻译历史
   */
  async findByUserIp(userIp: string, limit: number = 20): Promise<TranslationHistory[]> {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE user_ip = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await query(sql, [userIp, limit]);
      return result.rows;
    } catch (error) {
      logger.error('根据IP查找翻译记录失败:', error);
      throw new Error('根据IP查找翻译记录失败');
    }
  }

  /**
   * 删除过期的翻译记录
   */
  async deleteExpired(days: number = 90): Promise<number> {
    const sql = `
      DELETE FROM ${this.tableName}
      WHERE created_at < NOW() - INTERVAL '${days} days'
    `;

    try {
      const result = await query(sql);
      logger.info(`删除过期翻译记录: ${result.rowCount} 条`);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('删除过期翻译记录失败:', error);
      throw new Error('删除过期翻译记录失败');
    }
  }

  /**
   * 搜索翻译记录
   */
  async search(searchText: string, limit: number = 20): Promise<TranslationHistory[]> {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE source_text ILIKE $1 OR target_text ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await query(sql, [`%${searchText}%`, limit]);
      return result.rows;
    } catch (error) {
      logger.error('搜索翻译记录失败:', error);
      throw new Error('搜索翻译记录失败');
    }
  }

  /**
   * 获取翻译服务使用统计
   */
  async getServiceStats(): Promise<any> {
    const sql = `
      SELECT 
        translation_service,
        COUNT(*) as total_translations,
        COUNT(DISTINCT DATE_TRUNC('day', created_at)) as active_days,
        AVG(LENGTH(source_text)) as avg_source_length,
        AVG(LENGTH(target_text)) as avg_target_length,
        MIN(created_at) as first_used,
        MAX(created_at) as last_used
      FROM ${this.tableName}
      GROUP BY translation_service
      ORDER BY total_translations DESC
    `;

    try {
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      logger.error('获取翻译服务统计失败:', error);
      throw new Error('获取翻译服务统计失败');
    }
  }

  /**
   * 获取语言对使用统计
   */
  async getLanguagePairStats(): Promise<any> {
    const sql = `
      SELECT 
        source_lang,
        target_lang,
        COUNT(*) as translation_count,
        COUNT(DISTINCT DATE_TRUNC('day', created_at)) as active_days
      FROM ${this.tableName}
      GROUP BY source_lang, target_lang
      ORDER BY translation_count DESC
    `;

    try {
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      logger.error('获取语言对统计失败:', error);
      throw new Error('获取语言对统计失败');
    }
  }
}