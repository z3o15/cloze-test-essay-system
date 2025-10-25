import { Router } from 'express';
import { WordController } from '@/controllers/wordController';

const router = Router();
const wordController = new WordController();

// 简化的单词API路由
router.get('/words', wordController.getWords);           // 获取单词列表
router.get('/words/:word', wordController.queryWord);    // 查询单词
router.post('/words', wordController.createWord);        // 创建单词
router.post('/words/batch', wordController.createWords); // 批量创建单词
router.put('/words/:id', wordController.updateWord);     // 更新单词
router.delete('/words/:id', wordController.deleteWord);  // 删除单词
// 批量检查单词是否存在
router.get('/words/batch/check', wordController.checkWords)
// 查找难度级别≥3的单词
router.post('/words/difficult', wordController.findDifficultWords)

export default router;