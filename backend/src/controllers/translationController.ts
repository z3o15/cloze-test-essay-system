import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { TranslationService } from '@/services/translationService';
import { ApiResponse, TranslationRequest } from '@/models/types';
import { logger } from '@/utils/logger';
import { BatchTranslationService } from '@/services/batchTranslationService'

export class TranslationController {
  private translationService: TranslationService;

  constructor() {
    this.translationService = new TranslationService();
  }

  /**
   * 翻译文本
   */
  translate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: errors.array(),
          timestamp: new Date()
        } as ApiResponse);
        return;
      }

      const translationRequest: TranslationRequest = {
        text: req.body.text,
        source_lang: req.body.source_lang || 'auto',
        target_lang: req.body.target_lang || 'zh',
        service: req.body.service || 'tencent'
      };

      // 获取客户端信息
      const userIp = req.ip || req.connection.remoteAddress || '';
      const userAgent = req.get('User-Agent') || '';

      // 执行翻译
      const result = await this.translationService.translate(
        translationRequest,
        userIp,
        userAgent
      );

      res.json({
        success: true,
        data: result,
        message: '翻译成功',
        timestamp: new Date()
      } as ApiResponse);

    } catch (error) {
      logger.error('翻译请求失败:', error);
      next(error);
    }
  };

  /**
   * 批量翻译
   */
  batchTranslate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: errors.array(),
          timestamp: new Date()
        } as ApiResponse);
        return;
      }

      const {
        texts,
        source_lang = 'auto',
        target_lang = 'zh',
        service = 'tencent'
      } = req.body;

      const results = await this.translationService.batchTranslate(
        texts,
        source_lang,
        target_lang,
        service
      );

      res.json({
        success: true,
        data: results,
        message: '批量翻译完成',
        timestamp: new Date()
      } as ApiResponse);

    } catch (error) {
      logger.error('批量翻译请求失败:', error);
      next(error);
    }
  };

  /**
   * 获取翻译历史
   */
  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: '分页参数无效',
          timestamp: new Date()
        } as ApiResponse);
        return;
      }

      const result = await this.translationService.getTranslationHistory(page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          total_pages: Math.ceil(result.total / result.limit),
          has_next: page * limit < result.total,
          has_prev: page > 1
        },
        message: '获取翻译历史成功',
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('获取翻译历史失败:', error);
      next(error);
    }
  };

  /**
   * 获取翻译统计
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const days = parseInt(req.query['days'] as string) || 7;

      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          error: '统计天数参数无效（1-365）',
          timestamp: new Date()
        } as ApiResponse);
        return;
      }

      const stats = await this.translationService.getTranslationStats(days);

      res.json({
        success: true,
        data: stats,
        message: '获取翻译统计成功',
        timestamp: new Date()
      } as ApiResponse);

    } catch (error) {
      logger.error('获取翻译统计失败:', error);
      next(error);
    }
  };

  /**
   * 清除翻译缓存
   */
  clearCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pattern = req.body.pattern;
      const deletedCount = await this.translationService.clearTranslationCache(pattern);

      res.json({
        success: true,
        data: { deleted_count: deletedCount },
        message: '清除缓存成功',
        timestamp: new Date()
      } as ApiResponse);

    } catch (error) {
      logger.error('清除缓存失败:', error);
      next(error);
    }
  };

  /**
   * 批量翻译单词（适用于词汇级别的翻译与难度标注）
   * @route POST /api/translate/words
   */
  translateWords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: errors.array(),
          timestamp: new Date()
        } as ApiResponse)
        return
      }

      const { words, config } = req.body
      const batchService = new BatchTranslationService()
      const result = await batchService.translateWords(words, config)

      res.json({
        success: true,
        data: result,
        message: '批量单词翻译完成',
        timestamp: new Date()
      } as ApiResponse)
    } catch (error) {
      logger.error('批量单词翻译请求失败:', error)
      next(error)
    }
  }
}

// 创建并导出控制器实例
export const translationController = new TranslationController()

export const translateValidation = [
  body('text')
    .notEmpty()
    .withMessage('翻译文本不能为空')
    .isLength({ max: 5000 })
    .withMessage('翻译文本长度不能超过5000字符'),
  body('source_lang')
    .optional()
    .isIn(['auto', 'en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ru'])
    .withMessage('不支持的源语言'),
  body('target_lang')
    .optional()
    .isIn(['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ru'])
    .withMessage('不支持的目标语言'),
  body('service')
    .optional()
    .isIn(['tencent', 'volcano'])
    .withMessage('不支持的翻译服务')
];

export const batchTranslateValidation = [
  body('texts')
    .isArray({ min: 1, max: 10 })
    .withMessage('texts必须是包含1-10个元素的数组'),
  body('texts.*')
    .notEmpty()
    .withMessage('翻译文本不能为空')
    .isLength({ max: 5000 })
    .withMessage('翻译文本长度不能超过5000字符'),
  body('source_lang')
    .optional()
    .isIn(['auto', 'en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ru'])
    .withMessage('不支持的源语言'),
  body('target_lang')
    .optional()
    .isIn(['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ru'])
    .withMessage('不支持的目标语言'),
  body('service')
    .optional()
    .isIn(['tencent', 'volcano'])
    .withMessage('不支持的翻译服务')
];

export const translateWordsValidation = [
  body('words')
    .isArray({ min: 1, max: 100 })
    .withMessage('words必须是包含1-100个元素的数组'),
  body('words.*')
    .isString()
    .withMessage('每个元素必须为字符串')
    .isLength({ min: 1, max: 50 })
    .withMessage('单词长度需在1-50之间'),
  body('config')
    .optional()
    .isObject()
]