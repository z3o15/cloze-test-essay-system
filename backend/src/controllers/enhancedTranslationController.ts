import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '@/utils/logger';
import { pool } from '@/config/database';
import { EnhancedPassageTranslationService } from '@/services/enhancedPassageTranslationService';
import { BatchTranslationService } from '@/services/batchTranslationService';
import { WordDifficultyService } from '@/services/wordDifficultyService';

export class EnhancedTranslationController {
  private translationService: EnhancedPassageTranslationService;

  constructor() {
    const poolInstance = pool();
    this.translationService = new EnhancedPassageTranslationService(poolInstance);
  }

  /**
   * 增强段落翻译接口
   * 支持段落翻译、单词提取、批量翻译和分表存储
   */
  async enhancedTranslateParagraph(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const {
        text,
        source_lang = 'en',
        target_lang = 'zh',
        enable_word_translation = true,
        enable_batch_translation = true
      } = req.body;

      logger.info(`增强翻译请求: ${text.substring(0, 50)}...`);

      const result = await this.translationService.enhancedTranslate(text, {
        sourceLang: source_lang,
        targetLang: target_lang,
        enableWordTranslation: enable_word_translation,
        enableBatchTranslation: enable_batch_translation
      });

      res.json({
        code: 'SUCCESS',
        data: {
          id: result.id,
          original: result.original,
          translated: result.translated,
          cached: result.cached,
          source: result.source,
          word_translations: result.wordTranslations,
          batch_stats: result.batchStats ? {
            total_words: result.batchStats.totalWords,
            success_count: result.batchStats.successCount,
            failure_count: result.batchStats.failureCount,
            processing_time: result.batchStats.processingTime,
            failed_words: result.batchStats.failedWords
          } : undefined,
          processing_time: result.processingTime
        },
        message: '增强翻译成功'
      });

    } catch (error) {
      logger.error('增强翻译失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: '翻译服务异常',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量单词翻译接口
   */
  async batchTranslateWords(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const {
        words,
        batch_size = 20,
        max_retries = 3,
        retry_delay = 1000,
        timeout = 30000
      } = req.body;

      logger.info(`批量翻译请求: ${words.length}个单词`);

      const result = await BatchTranslationService.batchTranslateWords(words, {
        batchSize: batch_size,
        maxRetries: max_retries,
        retryDelay: retry_delay,
        timeout
      });

      res.json({
        code: 'SUCCESS',
        data: {
          total_words: result.totalWords,
          success_count: result.successCount,
          failure_count: result.failureCount,
          results: result.results.map(r => ({
            source_word: r.sourceWord,
            translated_word: r.translatedWord,
            difficulty_level: r.difficultyLevel,
            success: r.success,
            error: r.error,
            retry_count: r.retryCount
          })),
          failed_words: result.failedWords,
          processing_time: result.processingTime,
          stats: BatchTranslationService.getTranslationStats(result)
        },
        message: '批量翻译完成'
      });

    } catch (error) {
      logger.error('批量翻译失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: '批量翻译服务异常',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取段落翻译历史
   */
  async getTranslationHistory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await this.translationService.getTranslationHistory(limit, offset);

      res.json({
        code: 'SUCCESS',
        data: {
          translations: history.map(t => ({
            id: t.id,
            source_text: t.source_text,
            translated_text: t.translated_text,
            status: t.status,
            created_at: t.created_at,
            updated_at: t.updated_at
          })),
          pagination: {
            limit,
            offset,
            total: history.length
          }
        },
        message: '获取翻译历史成功'
      });

    } catch (error) {
      logger.error('获取翻译历史失败:', error);
      res.status(500).json({
        code: 'ERROR_003',
        message: '数据库查询失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取单词翻译历史
   */
  async getWordTranslationHistory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await this.translationService.getWordTranslationHistory(limit, offset);

      res.json({
        code: 'SUCCESS',
        data: {
          words: history.map(w => ({
            id: w.id,
            source_word: w.source_word,
            translated_word: w.translated_word,
            difficulty_level: w.difficulty_level,
            phonetic: w.phonetic,
            part_of_speech: w.part_of_speech,
            definition: w.definition,
            example_sentence: w.example_sentence,
            frequency_rank: w.frequency_rank,
            created_at: w.created_at,
            updated_at: w.updated_at
          })),
          pagination: {
            limit,
            offset,
            total: history.length
          }
        },
        message: '获取单词翻译历史成功'
      });

    } catch (error) {
      logger.error('获取单词翻译历史失败:', error);
      res.status(500).json({
        code: 'ERROR_003',
        message: '数据库查询失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 根据难度等级查询单词
   */
  async getWordsByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const difficultyLevel = parseInt(req.params.level);
      const limit = parseInt(req.query.limit as string) || 100;

      if (difficultyLevel < 1 || difficultyLevel > 10) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '难度等级必须在1-10之间'
        });
        return;
      }

      const words = await this.translationService.getWordsByDifficulty(difficultyLevel, limit);

      res.json({
        code: 'SUCCESS',
        data: {
          difficulty_level: difficultyLevel,
          difficulty_description: WordDifficultyService.getDifficultyDescription(difficultyLevel),
          words: words.map(w => ({
            id: w.id,
            source_word: w.source_word,
            translated_word: w.translated_word,
            phonetic: w.phonetic,
            part_of_speech: w.part_of_speech,
            definition: w.definition,
            example_sentence: w.example_sentence,
            frequency_rank: w.frequency_rank,
            created_at: w.created_at
          })),
          total: words.length
        },
        message: '查询成功'
      });

    } catch (error) {
      logger.error('根据难度等级查询单词失败:', error);
      res.status(500).json({
        code: 'ERROR_003',
        message: '数据库查询失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取翻译统计信息
   */
  async getTranslationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.translationService.getTranslationStats();

      res.json({
        code: 'SUCCESS',
        data: {
          total_passages: stats.totalPassages,
          total_words: stats.totalWords,
          recent_translations: stats.recentTranslations,
          generated_at: new Date().toISOString()
        },
        message: '获取统计信息成功'
      });

    } catch (error) {
      logger.error('获取翻译统计信息失败:', error);
      res.status(500).json({
        code: 'ERROR_003',
        message: '数据库查询失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 单词难度分析接口
   */
  async analyzeWordDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const { words } = req.body;

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '单词数组不能为空'
        });
        return;
      }

      const analysis = words.map(word => {
        const difficultyLevel = WordDifficultyService.getWordDifficultyLevel(word);
        const isSimple = WordDifficultyService.isSimpleWord(word);
        
        return {
          word,
          difficulty_level: difficultyLevel,
          difficulty_description: WordDifficultyService.getDifficultyDescription(difficultyLevel),
          is_simple: isSimple,
          should_translate: !isSimple
        };
      });

      const complexWords = WordDifficultyService.filterComplexWords(words);

      res.json({
        code: 'SUCCESS',
        data: {
          total_words: words.length,
          complex_words_count: complexWords.length,
          simple_words_count: words.length - complexWords.length,
          analysis,
          complex_words: complexWords
        },
        message: '单词难度分析完成'
      });

    } catch (error) {
      logger.error('单词难度分析失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: '分析服务异常',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}

// 验证规则
export const enhancedTranslationValidators = {
  enhancedTranslateParagraph: [
    body('text')
      .notEmpty()
      .withMessage('文本不能为空')
      .isLength({ min: 1, max: 5000 })
      .withMessage('文本长度必须在1-5000字符之间'),
    body('source_lang')
      .optional()
      .isIn(['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko'])
      .withMessage('不支持的源语言'),
    body('target_lang')
      .optional()
      .isIn(['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko'])
      .withMessage('不支持的目标语言'),
    body('enable_word_translation')
      .optional()
      .isBoolean()
      .withMessage('enable_word_translation必须是布尔值'),
    body('enable_batch_translation')
      .optional()
      .isBoolean()
      .withMessage('enable_batch_translation必须是布尔值')
  ],

  batchTranslateWords: [
    body('words')
      .isArray({ min: 1, max: 100 })
      .withMessage('单词数组长度必须在1-100之间'),
    body('words.*')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('单词长度必须在1-50字符之间'),
    body('batch_size')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('批次大小必须在1-50之间'),
    body('max_retries')
      .optional()
      .isInt({ min: 0, max: 10 })
      .withMessage('最大重试次数必须在0-10之间'),
    body('retry_delay')
      .optional()
      .isInt({ min: 100, max: 10000 })
      .withMessage('重试延迟必须在100-10000毫秒之间'),
    body('timeout')
      .optional()
      .isInt({ min: 1000, max: 60000 })
      .withMessage('超时时间必须在1000-60000毫秒之间')
  ],

  getTranslationHistory: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit必须在1-100之间'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('offset必须大于等于0')
  ],

  getWordTranslationHistory: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('limit必须在1-200之间'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('offset必须大于等于0')
  ],

  getWordsByDifficulty: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('limit必须在1-500之间')
  ],

  analyzeWordDifficulty: [
    body('words')
      .isArray({ min: 1, max: 200 })
      .withMessage('单词数组长度必须在1-200之间'),
    body('words.*')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('单词长度必须在1-50字符之间')
  ]
};