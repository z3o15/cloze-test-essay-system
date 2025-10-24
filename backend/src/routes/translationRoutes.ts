import { Router } from 'express';
import { translationController, translateValidation, batchTranslateValidation, translateWordsValidation } from '@/controllers/translationController';

const router = Router();

/**
 * @route POST /api/translate
 * @desc 翻译文本
 * @access Public
 */
router.post('/translate', translateValidation, translationController.translate);

/**
 * @route POST /api/translate/batch
 * @desc 批量翻译
 * @access Public
 */
router.post('/translate/batch', batchTranslateValidation, translationController.batchTranslate);

/**
 * @route POST /api/translate/words
 * @desc 批量翻译单词
 * @access Public
 */
router.post('/translate/words', translateWordsValidation, translationController.translateWords);

/**
 * @route GET /api/translate/history
 * @desc 获取翻译历史
 * @access Public
 */
router.get('/translate/history', translationController.getHistory);

/**
 * @route GET /api/translate/stats
 * @desc 获取翻译统计
 * @access Public
 */
router.get('/translate/stats', translationController.getStats);

/**
 * @route POST /api/translate/cache/clear
 * @desc 清除翻译缓存
 * @access Public
 */
router.post('/translate/cache/clear', translationController.clearCache);

export default router;