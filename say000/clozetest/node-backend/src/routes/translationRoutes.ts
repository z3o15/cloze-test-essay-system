import { Router } from 'express';
import { TranslationController, translateValidation, batchTranslateValidation, paragraphTranslateValidation } from '../controllers/translationController';

const router = Router();
const translationController = new TranslationController();

/**
 * @route POST /api/v1/translate
 * @desc 翻译文本
 * @access Public
 */
router.post('/', translateValidation, translationController.translate.bind(translationController));

/**
 * @route POST /api/v1/translate/batch
 * @desc 批量翻译
 * @access Public
 */
router.post('/batch', batchTranslateValidation, translationController.batchTranslate.bind(translationController));

/**
 * @route GET /api/v1/translate/history
 * @desc 获取翻译历史
 * @access Public
 */
router.get('/history', translationController.getHistory.bind(translationController));

/**
 * @route POST /api/v1/translate/paragraph
 * @desc 段落翻译 - 使用封装的API调用逻辑
 * @access Public
 */
router.post('/paragraph', paragraphTranslateValidation, translationController.translateParagraph.bind(translationController));

export default router;