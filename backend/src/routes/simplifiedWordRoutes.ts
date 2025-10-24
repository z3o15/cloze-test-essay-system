import { Router } from 'express';
import { 
  SimplifiedWordController,
  validateBatchProcess,
  validateSingleWord,
  validateCheckTranslation
} from '@/controllers/simplifiedWordController';

/**
 * 简化的AI单词路由
 * 清晰的四步流程API
 */
const router = Router();

// 主要接口：批量处理单词（返回难度 > 3 的单词）
router.post('/batch-process', validateBatchProcess, SimplifiedWordController.batchProcessWords);

// 检查单词是否需要显示翻译
router.post('/check-translation', validateCheckTranslation, SimplifiedWordController.checkTranslationNeeded);

// 过滤复杂单词
router.post('/filter-complex', validateBatchProcess, SimplifiedWordController.filterComplexWords);

// 处理单个单词（调试用）
router.post('/process-single', validateSingleWord, SimplifiedWordController.processSingleWord);

// 获取配置状态
router.get('/config-status', SimplifiedWordController.getConfigStatus);

export default router;