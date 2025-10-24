import { Pool } from 'pg';
import { logger } from '@/utils/logger';

export interface PassageTranslation {
  id?: number;
  source_text: string;
  translated_text: string;
  created_at?: Date;
  updated_at?: Date;
  status: 'active' | 'inactive' | 'pending' | 'failed';
}

export interface PassageTranslationQuery {
  id?: number;
  source_text?: string;
  status?: string;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'updated_at';
  order_direction?: 'ASC' | 'DESC';
}

export class PassageTranslationRepository {
  constructor(private pool: Pool) {}

  /**
   * 创建段落翻译记录
   * @param translation 段落翻译数据
   * @returns 创建的记录
   */
  async create(translation: Omit<PassageTranslation, 'id' | 'created_at' | 'updated_at'>): Promise<PassageTranslation> {
    const query = `
      INSERT INTO passage_translations (source_text, translated_text, status)
      VALUES ($1, $2, $3)
      RETURNING id, source_text, translated_text, status, created_at, updated_at
    `;
    
    try {
      const result = await this.pool.query(query, [
        translation.source_text,
        translation.translated_text,
        translation.status
      ]);
      
      logger.debug('段落翻译记录创建成功', { id: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error('创建段落翻译记录失败:', error);
      throw new Error('创建段落翻译记录失败');
    }
  }

  /**
   * 根据ID获取段落翻译记录
   * @param id 记录ID
   * @returns 段落翻译记录或null
   */
  async findById(id: number): Promise<PassageTranslation | null> {
    const query = `
      SELECT id, source_text, translated_text, status, created_at, updated_at
      FROM passage_translations
      WHERE id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('查询段落翻译记录失败:', error);
      throw new Error('查询段落翻译记录失败');
    }
  }

  /**
   * 根据原文查找段落翻译记录
   * @param sourceText 原文
   * @returns 段落翻译记录或null
   */
  async findBySourceText(sourceText: string): Promise<PassageTranslation | null> {
    const query = `
      SELECT id, source_text, translated_text, status, created_at, updated_at
      FROM passage_translations
      WHERE source_text = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await this.pool.query(query, [sourceText]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('根据原文查询段落翻译记录失败:', error);
      throw new Error('根据原文查询段落翻译记录失败');
    }
  }

  /**
   * 查询段落翻译记录列表
   * @param query 查询条件
   * @returns 段落翻译记录列表
   */
  async findMany(query: PassageTranslationQuery = {}): Promise<PassageTranslation[]> {
    let sql = `
      SELECT id, source_text, translated_text, status, created_at, updated_at
      FROM passage_translations
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (query.id) {
      conditions.push(`id = $${paramIndex++}`);
      params.push(query.id);
    }

    if (query.source_text) {
      conditions.push(`source_text ILIKE $${paramIndex++}`);
      params.push(`%${query.source_text}%`);
    }

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // 排序
    const orderBy = query.order_by || 'created_at';
    const orderDirection = query.order_direction || 'DESC';
    sql += ` ORDER BY ${orderBy} ${orderDirection}`;

    // 分页
    if (query.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(query.limit);
    }

    if (query.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(query.offset);
    }

    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      logger.error('查询段落翻译记录列表失败:', error);
      throw new Error('查询段落翻译记录列表失败');
    }
  }

  /**
   * 更新段落翻译记录
   * @param id 记录ID
   * @param updates 更新数据
   * @returns 更新后的记录
   */
  async update(id: number, updates: Partial<Omit<PassageTranslation, 'id' | 'created_at'>>): Promise<PassageTranslation> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 构建SET子句
    if (updates.source_text !== undefined) {
      fields.push(`source_text = $${paramIndex++}`);
      params.push(updates.source_text);
    }

    if (updates.translated_text !== undefined) {
      fields.push(`translated_text = $${paramIndex++}`);
      params.push(updates.translated_text);
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(updates.status);
    }

    if (fields.length === 0) {
      throw new Error('没有提供更新字段');
    }

    // updated_at会通过触发器自动更新
    const query = `
      UPDATE passage_translations
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, source_text, translated_text, status, created_at, updated_at
    `;
    
    params.push(id);

    try {
      const result = await this.pool.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error('段落翻译记录不存在');
      }
      
      logger.debug('段落翻译记录更新成功', { id });
      return result.rows[0];
    } catch (error) {
      logger.error('更新段落翻译记录失败:', error);
      throw new Error('更新段落翻译记录失败');
    }
  }

  /**
   * 删除段落翻译记录
   * @param id 记录ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM passage_translations WHERE id = $1`;
    
    try {
      const result = await this.pool.query(query, [id]);
      const deleted = result.rowCount > 0;
      
      if (deleted) {
        logger.debug('段落翻译记录删除成功', { id });
      }
      
      return deleted;
    } catch (error) {
      logger.error('删除段落翻译记录失败:', error);
      throw new Error('删除段落翻译记录失败');
    }
  }

  /**
   * 获取记录总数
   * @param query 查询条件
   * @returns 记录总数
   */
  async count(query: Omit<PassageTranslationQuery, 'limit' | 'offset' | 'order_by' | 'order_direction'> = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM passage_translations`;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (query.id) {
      conditions.push(`id = $${paramIndex++}`);
      params.push(query.id);
    }

    if (query.source_text) {
      conditions.push(`source_text ILIKE $${paramIndex++}`);
      params.push(`%${query.source_text}%`);
    }

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    try {
      const result = await this.pool.query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('查询段落翻译记录总数失败:', error);
      throw new Error('查询段落翻译记录总数失败');
    }
  }

  /**
   * 批量创建段落翻译记录
   * @param translations 段落翻译数据数组
   * @returns 创建的记录数组
   */
  async batchCreate(translations: Omit<PassageTranslation, 'id' | 'created_at' | 'updated_at'>[]): Promise<PassageTranslation[]> {
    if (translations.length === 0) {
      return [];
    }

    const values: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    translations.forEach(translation => {
      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(translation.source_text, translation.translated_text, translation.status);
    });

    const query = `
      INSERT INTO passage_translations (source_text, translated_text, status)
      VALUES ${values.join(', ')}
      RETURNING id, source_text, translated_text, status, created_at, updated_at
    `;

    try {
      const result = await this.pool.query(query, params);
      logger.debug(`批量创建段落翻译记录成功: ${result.rows.length}条`);
      return result.rows;
    } catch (error) {
      logger.error('批量创建段落翻译记录失败:', error);
      throw new Error('批量创建段落翻译记录失败');
    }
  }
}