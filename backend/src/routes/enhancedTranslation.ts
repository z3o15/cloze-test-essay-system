import { Router } from 'express';
import { EnhancedTranslationController, enhancedTranslationValidators } from '@/controllers/enhancedTranslationController';
import { rateLimiter, translationRateLimiter, batchOperationRateLimiter } from '@/middleware/rateLimiter';

const router = Router();
const controller = new EnhancedTranslationController();

/**
 * 增强翻译路由
 * 支持段落翻译、单词提取、批量翻译和分表存储
 */

// 增强段落翻译接口
router.post(
  '/paragraph',
  translationRateLimiter,
  enhancedTranslationValidators.enhancedTranslateParagraph,
  controller.enhancedTranslateParagraph.bind(controller)
);

// 批量单词翻译接口
router.post(
  '/words/batch',
  batchOperationRateLimiter,
  enhancedTranslationValidators.batchTranslateWords,
  controller.batchTranslateWords.bind(controller)
);

// 获取段落翻译历史
router.get(
  '/history/passages',
  enhancedTranslationValidators.getTranslationHistory,
  controller.getTranslationHistory.bind(controller)
);

// 获取单词翻译历史
router.get(
  '/history/words',
  enhancedTranslationValidators.getWordTranslationHistory,
  controller.getWordTranslationHistory.bind(controller)
);

// 根据难度等级查询单词
router.get(
  '/words/difficulty/:level',
  enhancedTranslationValidators.getWordsByDifficulty,
  controller.getWordsByDifficulty.bind(controller)
);

// 获取翻译统计信息
router.get(
  '/stats',
  controller.getTranslationStats.bind(controller)
);

// 单词难度分析接口
router.post(
  '/words/analyze',
  rateLimiter,
  enhancedTranslationValidators.analyzeWordDifficulty,
  controller.analyzeWordDifficulty.bind(controller)
);

export default router;