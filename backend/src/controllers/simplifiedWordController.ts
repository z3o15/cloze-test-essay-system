import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { SimplifiedWordService } from '@/services/simplifiedWordService';
import { logger } from '@/utils/logger';

/**
 * 简化的AI单词控制器
 * 对应四步流程的API接口
 */
export class SimplifiedWordController {

  /**
   * 批量处理单词（主要接口）
   * POST /api/ai-words/batch-process
   */
  static async batchProcessWords(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { words } = req.body;
      logger.info(`📝 收到批量处理请求: ${words.length} 个单词`);

      const result = await SimplifiedWordService.batchProcessWords(words);

      res.json({
        code: 'SUCCESS',
        message: '批量处理完成',
        data: {
          complexWords: result.complexWords, // 只返回难度 > 3 的单词
          stats: result.stats
        }
      });

    } catch (error) {
      logger.error('批量处理单词失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 增强版批量处理单词（包含翻译信息）
   * POST /api/ai-words/batch-analyze
   */
  static async batchAnalyzeWords(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { words } = req.body;
      logger.info(`🔍 收到增强版批量分析请求: ${words.length} 个单词`);

      const result = await SimplifiedWordService.batchAnalyzeWords(words);

      res.json({
        code: 'SUCCESS',
        message: '批量分析完成',
        data: {
          words: result.words.map(word => ({
            word: word.word,
            translation: word.translation,
            pronunciation: word.pronunciation || '未提供',
            partOfSpeech: word.partOfSpeech || '未提供',
            difficultyLevel: word.difficultyLevel,
            isComplex: word.isComplex,
            translations: word.translations || []
          })),
          stats: {
            total: result.words.length,
            complexCount: result.words.filter(w => w.isComplex).length,
            simpleCount: result.words.filter(w => !w.isComplex).length
          }
        }
      });

    } catch (error) {
      logger.error('增强版批量分析失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 检查单词是否需要显示智能提示
   * POST /api/ai-words/check-translation
   */
  static async checkDisplayNeeded(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { word } = req.body;
      logger.info(`🔍 检查智能提示需求: ${word}`);

      const result = await SimplifiedWordService.checkDisplayNeeded(word);
      const needsDisplay = result.data.needsDisplay;

      res.json({
        code: 'SUCCESS',
        message: '检查完成',
        data: {
          word,
          needsDisplay,
          reason: needsDisplay ? '难度等级 > 3' : '难度等级 ≤ 3'
        }
      });

    } catch (error) {
      logger.error('检查智能提示需求失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 过滤复杂单词
   * POST /api/ai-words/filter-complex
   */
  static async filterComplexWords(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { words } = req.body;
      logger.info(`🔍 过滤复杂单词: ${words.length} 个输入`);

      const complexWords = await SimplifiedWordService.filterComplexWords(words);

      res.json({
        code: 'SUCCESS',
        message: '过滤完成',
        data: complexWords
      });

    } catch (error) {
      logger.error('过滤复杂单词失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 处理单个单词（调试用）
   * POST /api/ai-words/process-single
   */
  static async processSingleWord(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { word } = req.body;
      logger.info(`🔄 处理单个单词: ${word}`);

      const result = await SimplifiedWordService.processSingleWord(word);

      res.json({
        code: 'SUCCESS',
        message: '处理完成',
        data: result
      });

    } catch (error) {
      logger.error('处理单个单词失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取配置状态
   * GET /api/ai-words/config-status
   */
  static async getConfigStatus(req: Request, res: Response) {
    try {
      logger.info('📊 检查配置状态');

      const status = await SimplifiedWordService.getConfigStatus();

      res.json({
        success: true,
        code: 'SUCCESS',
        message: '配置状态检查完成',
        data: status
      });

    } catch (error) {
      logger.error('获取配置状态失败:', error);
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}

// 验证中间件
export const validateBatchProcess = [
  body('words')
    .isArray({ min: 1 })
    .withMessage('words必须是非空数组')
    .custom((words) => {
      if (!words.every((word: any) => typeof word === 'string' && word.trim().length > 0)) {
        throw new Error('words数组中的每个元素必须是非空字符串');
      }
      return true;
    })
];

export const validateSingleWord = [
  body('word')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('word必须是非空字符串')
];

export const validateCheckDisplay = [
  body('word')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('word必须是非空字符串')
];