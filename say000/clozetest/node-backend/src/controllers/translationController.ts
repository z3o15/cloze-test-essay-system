import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { TranslationService } from '../services/translationService';
import { VolcanoAIService } from '../services/volcanoAIService';
import { logger } from '../utils/logger';

export class TranslationController {
  private translationService: TranslationService;

  constructor() {
    this.translationService = new TranslationService();
  }

  /**
   * 翻译文本
   */
  async translate(req: Request, res: Response): Promise<void> {
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

      const { text, source_lang = 'auto', target_lang = 'zh', service = 'volcano' } = req.body;

      const result = await this.translationService.translate(text, source_lang, target_lang, service);

      res.json({
        code: 'SUCCESS',
        data: result,
        message: '翻译成功'
      });
    } catch (error) {
      logger.error('翻译请求失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: error instanceof Error ? error.message : '翻译服务异常',
        data: null
      });
    }
  }

  /**
   * 批量翻译
   */
  async batchTranslate(req: Request, res: Response): Promise<void> {
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

      const { texts, source_lang = 'auto', target_lang = 'zh', service = 'volcano' } = req.body;

      const results = await this.translationService.batchTranslate(texts, source_lang, target_lang, service);

      res.json({
        code: 'SUCCESS',
        data: results,
        message: '批量翻译完成'
      });
    } catch (error) {
      logger.error('批量翻译请求失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: error instanceof Error ? error.message : '翻译服务异常',
        data: null
      });
    }
  }

  /**
   * 获取翻译历史
   */
  async getHistory(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.translationService.getTranslationHistory(page, limit);

      res.json({
        code: 'SUCCESS',
        data: result,
        message: '获取翻译历史成功'
      });
    } catch (error) {
      logger.error('获取翻译历史失败:', error);
      res.status(500).json({
        code: 'ERROR_003',
        message: '获取翻译历史失败',
        data: null
      });
    }
  }

  /**
   * 段落翻译 - 使用封装的API调用逻辑
   */
  async translateParagraph(req: Request, res: Response): Promise<void> {
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

      const { text, source_lang = 'en', target_lang = 'zh' } = req.body;

      logger.info('收到段落翻译请求:', { 
        textLength: text.length,
        source_lang,
        target_lang 
      });

      const result = await VolcanoAIService.translateParagraph(text, source_lang, target_lang);

      res.json({
        code: 'SUCCESS',
        data: {
          original_text: text,
          translated_text: result,
          source_lang,
          target_lang
        },
        message: '段落翻译成功'
      });
    } catch (error) {
      logger.error('段落翻译失败:', error);
      res.status(500).json({
        code: 'ERROR_002',
        message: error instanceof Error ? error.message : '段落翻译服务异常',
        data: null
      });
    }
  }
}

// 验证规则
export const translateValidation = [
  body('text')
    .notEmpty()
    .withMessage('翻译文本不能为空')
    .isLength({ max: 5000 })
    .withMessage('翻译文本长度不能超过5000字符'),
  body('source_lang')
    .optional()
    .isString()
    .withMessage('源语言必须是字符串'),
  body('target_lang')
    .optional()
    .isString()
    .withMessage('目标语言必须是字符串'),
  body('service')
    .optional()
    .isIn(['tencent', 'volcano'])
    .withMessage('翻译服务必须是tencent或volcano')
];

export const batchTranslateValidation = [
  body('texts')
    .isArray({ min: 1, max: 50 })
    .withMessage('翻译文本数组长度必须在1-50之间'),
  body('texts.*')
    .isString()
    .isLength({ max: 1000 })
    .withMessage('每个翻译文本长度不能超过1000字符'),
  body('source_lang')
    .optional()
    .isString()
    .withMessage('源语言必须是字符串'),
  body('target_lang')
    .optional()
    .isString()
    .withMessage('目标语言必须是字符串'),
  body('service')
    .optional()
    .isIn(['tencent', 'volcano'])
    .withMessage('翻译服务必须是tencent或volcano')
];

export const paragraphTranslateValidation = [
  body('text')
    .notEmpty()
    .withMessage('翻译文本不能为空')
    .isLength({ max: 10000 })
    .withMessage('翻译文本长度不能超过10000字符'),
  body('source_lang')
    .optional()
    .isString()
    .withMessage('源语言必须是字符串'),
  body('target_lang')
    .optional()
    .isString()
    .withMessage('目标语言必须是字符串')
];