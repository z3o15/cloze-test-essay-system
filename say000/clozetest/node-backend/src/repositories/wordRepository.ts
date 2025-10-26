import { query } from '../config/database';
import { logger } from '../utils/logger';
import { Word, WordCreateRequest, WordUpdateRequest } from '../models/types';

export interface WordQueryOptions {
  limit?: number | undefined;
  offset?: number | undefined;
  orderBy?: string | undefined;
  search?: string | undefined;
}

export interface WordCountOptions {
  search?: string | undefined;
}

export class WordRepository {
  private readonly tableName = 'words';

  /**
   * 根据单词查找
   */
  async findByWord(word: string): Promise<Word | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE word = $1`;
    
    try {
      logger.debug('查找单词:', { word, sql });
      const result = await query(sql, [word.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Word;
    } catch (error) {
      logger.error('查找单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        word, 
        sql 
      });
      throw new Error('查找单词失败');
    }
  }

  /**
   * 根据ID查找
   */
  async findById(id: string): Promise<Word | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    
    try {
      logger.debug('根据ID查找单词:', { id, sql });
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Word;
    } catch (error) {
      logger.error('根据ID查找单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        id, 
        sql 
      });
      throw new Error('根据ID查找单词失败');
    }
  }

  /**
   * 查找多条单词记录
   */
  async findMany(options: WordQueryOptions = {}): Promise<Word[]> {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'created_at DESC',
      search
    } = options;

    let sql = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (search) {
      sql += ` WHERE (word ILIKE $${paramIndex} OR meaning ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // 添加排序
    sql += ` ORDER BY ${orderBy}`;

    // 添加分页
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
      logger.debug('查找多条单词记录:', { sql, values });
      const result = await query(sql, values);
      
      return result.rows as Word[];
    } catch (error) {
      logger.error('查找多条单词记录失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('查找多条单词记录失败');
    }
  }

  /**
   * 统计单词数量
   */
  async count(options: WordCountOptions = {}): Promise<number> {
    const { search } = options;

    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // 构建WHERE条件
    if (search) {
      sql += ` WHERE (word ILIKE $${paramIndex} OR meaning ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
    }

    try {
      logger.debug('统计单词数量:', { sql, values });
      const result = await query(sql, values);
      
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('统计单词数量失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('统计单词数量失败');
    }
  }

  /**
   * 创建单词
   */
  async create(wordData: WordCreateRequest): Promise<Word> {
    const { word, pronunciation, meaning } = wordData;
    
    const sql = `
      INSERT INTO ${this.tableName} (word, pronunciation, meaning)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [word.toLowerCase(), pronunciation, meaning];
    
    try {
      logger.debug('创建单词:', { sql, values });
      const result = await query(sql, values);
      
      return result.rows[0] as Word;
    } catch (error) {
      logger.error('创建单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('创建单词失败');
    }
  }

  /**
   * 创建完整的单词信息（支持AI判断的所有字段）
   */
  async createComplete(wordData: {
    word: string;
    pronunciation?: string;
    definition?: string;
    translation?: string;
    part_of_speech?: string;
    difficulty_level?: number;
    frequency_rank?: number;
    example_sentences?: string;
    synonyms?: string;
    antonyms?: string;
    etymology?: string;
  }): Promise<Word> {
    const {
      word,
      pronunciation,
      definition,
      translation,
      part_of_speech,
      difficulty_level,
      frequency_rank,
      example_sentences,
      synonyms,
      antonyms,
      etymology
    } = wordData;
    
    const sql = `
      INSERT INTO ${this.tableName} (
        word, pronunciation, translation, definition, part_of_speech,
        difficulty_level, frequency_rank, example_sentences, synonyms,
        antonyms, etymology
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      word.toLowerCase(),
      pronunciation || null,
      translation || null,
      definition || null,
      part_of_speech || null,
      difficulty_level || null,
      frequency_rank || null,
      example_sentences || null,
      synonyms || null,
      antonyms || null,
      etymology || null
    ];
    
    try {
      logger.debug('创建完整单词信息:', { word, sql });
      const result = await query(sql, values);
      
      return result.rows[0] as Word;
    } catch (error) {
      logger.error('创建完整单词信息失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        word,
        sql
      });
      throw new Error('创建完整单词信息失败');
    }
  }

  /**
   * 批量创建完整单词信息
   */
  async batchCreateComplete(wordsData: Array<{
    word: string;
    pronunciation?: string;
    definition?: string;
    translation?: string;
    part_of_speech?: string;
    difficulty_level?: number;
    frequency_rank?: number;
    example_sentences?: string;
    synonyms?: string;
    antonyms?: string;
    etymology?: string;
  }>): Promise<Word[]> {
    if (wordsData.length === 0) {
      return [];
    }

    // 构建批量插入SQL
    const placeholders = wordsData.map((_, index) => {
      const baseIndex = index * 11;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11})`;
    }).join(', ');

    const sql = `
      INSERT INTO ${this.tableName} (
        word, pronunciation, translation, definition, part_of_speech,
        difficulty_level, frequency_rank, example_sentences, synonyms,
        antonyms, etymology
      )
      VALUES ${placeholders}
      ON CONFLICT (word) DO UPDATE SET
        pronunciation = EXCLUDED.pronunciation,
        translation = EXCLUDED.translation,
        definition = EXCLUDED.definition,
        part_of_speech = EXCLUDED.part_of_speech,
        difficulty_level = EXCLUDED.difficulty_level,
        frequency_rank = EXCLUDED.frequency_rank,
        example_sentences = EXCLUDED.example_sentences,
        synonyms = EXCLUDED.synonyms,
        antonyms = EXCLUDED.antonyms,
        etymology = EXCLUDED.etymology,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    // 构建参数数组
    const values: any[] = [];
    for (const wordData of wordsData) {
      values.push(
        wordData.word.toLowerCase(),
        wordData.pronunciation || null,
        wordData.translation || null,
        wordData.definition || null,
        wordData.part_of_speech || null,
        wordData.difficulty_level || null,
        wordData.frequency_rank || null,
        wordData.example_sentences || null,
        wordData.synonyms || null,
        wordData.antonyms || null,
        wordData.etymology || null
      );
    }

    try {
      logger.debug(`批量创建 ${wordsData.length} 个单词信息`);
      const result = await query(sql, values);
      
      logger.info(`成功批量创建/更新 ${result.rows.length} 个单词`);
      return result.rows as Word[];
    } catch (error) {
      logger.error('批量创建完整单词信息失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        wordsCount: wordsData.length
      });
      throw new Error('批量创建完整单词信息失败');
    }
  }

  /**
   * 批量检查单词是否存在
   */
  async batchCheckExists(words: string[]): Promise<{ [word: string]: boolean }> {
    if (words.length === 0) {
      return {};
    }

    const normalizedWords = words.map(w => w.toLowerCase().trim());
    const placeholders = normalizedWords.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `SELECT word FROM ${this.tableName} WHERE word IN (${placeholders})`;
    
    try {
      logger.debug('批量检查单词存在性:', { words: normalizedWords, sql });
      const result = await query(sql, normalizedWords);
      
      const existingWords = new Set(result.rows.map((row: any) => row.word));
      const resultMap: { [word: string]: boolean } = {};
      
      normalizedWords.forEach(word => {
        resultMap[word] = existingWords.has(word);
      });
      
      return resultMap;
    } catch (error) {
      logger.error('批量检查单词存在性失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        words: normalizedWords,
        sql 
      });
      throw new Error('批量检查单词存在性失败');
    }
  }

  /**
   * 批量查询完整单词信息（优化版本）
   * 一次性查询所有存在的单词的完整信息，避免逐个查询
   */
  async batchFindByWords(words: string[]): Promise<{ [word: string]: Word | null }> {
    if (words.length === 0) {
      return {};
    }

    const normalizedWords = words.map(w => w.toLowerCase().trim());
    const placeholders = normalizedWords.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE word IN (${placeholders}) 
      AND is_active = true
      AND translation IS NOT NULL 
      AND pronunciation IS NOT NULL 
      AND difficulty_level IS NOT NULL
      AND difficulty_level >= 3
    `;
    
    try {
      logger.debug('批量查询完整单词信息:', { words: normalizedWords, sql });
      const result = await query(sql, normalizedWords);
      
      const resultMap: { [word: string]: Word | null } = {};
      
      // 初始化所有单词为null
      normalizedWords.forEach(word => {
        resultMap[word] = null;
      });
      
      // 填充查询到的单词信息
      result.rows.forEach((row: any) => {
        resultMap[row.word] = row as Word;
      });
      
      logger.info(`批量查询完成: 查询${normalizedWords.length}个单词，找到${result.rows.length}个完整记录`);
      
      return resultMap;
    } catch (error) {
      logger.error('批量查询完整单词信息失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        words: normalizedWords,
        sql 
      });
      throw new Error('批量查询完整单词信息失败');
    }
  }

  /**
   * 更新单词
   */
  async update(id: string, updateData: WordUpdateRequest): Promise<Word | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // 构建更新字段
    if (updateData.word !== undefined) {
      fields.push(`word = $${paramIndex}`);
      values.push(updateData.word.toLowerCase());
      paramIndex++;
    }
    
    if (updateData.pronunciation !== undefined) {
      fields.push(`pronunciation = $${paramIndex}`);
      values.push(updateData.pronunciation);
      paramIndex++;
    }
    
    if (updateData.translation !== undefined) {
      fields.push(`translation = $${paramIndex}`);
      values.push(updateData.translation);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('没有提供要更新的字段');
    }

    // 添加更新时间
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE ${this.tableName} 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    values.push(id);
    
    try {
      logger.debug('更新单词:', { sql, values });
      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Word;
    } catch (error) {
      logger.error('更新单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('更新单词失败');
    }
  }

  /**
   * 删除单词
   */
  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    
    try {
      logger.debug('删除单词:', { id, sql });
      const result = await query(sql, [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      logger.error('删除单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        id, 
        sql 
      });
      throw new Error('删除单词失败');
    }
  }

  /**
   * 查找难度级别≥3的单词
   */
  async findDifficultWords(words: string[]): Promise<Word[]> {
    if (words.length === 0) {
      return [];
    }

    // 构建参数占位符
    const placeholders = words.map((_, index) => `$${index + 2}`).join(', ');
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE word = ANY(ARRAY[${placeholders}]) 
      AND difficulty_level >= $1
      ORDER BY difficulty_level DESC, word ASC
    `;
    
    const values = [3, ...words.map(w => w.toLowerCase())];
    
    try {
      logger.debug('查找难度级别≥3的单词:', { sql, values });
      const result = await query(sql, values);
      
      return result.rows as Word[];
    } catch (error) {
      logger.error('查找难度级别≥3的单词失败:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        sql, 
        values 
      });
      throw new Error('查找难度级别≥3的单词失败');
    }
  }
}