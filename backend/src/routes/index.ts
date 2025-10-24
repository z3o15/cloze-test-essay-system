import { Router } from 'express';
import translationRoutes from './translationRoutes';
import wordRoutes from './wordRoutes';
import enhancedTranslationRoutes from './enhancedTranslation';
import paragraphRoutes from './paragraphRoutes';
import essayRoutes from './essayRoutes';
// import aiWordRoutes from './aiWordRoutes'; // 旧的复杂路由，已禁用
import simplifiedWordRoutes from './simplifiedWordRoutes'; // 新的简化路由
import wordPreQueryRoutes from './wordPreQueryRoutes'; // 单词预查询路由
import { testConnection, query } from '@/config/database';

const router = Router();

// 翻译相关路由
router.use('/', translationRoutes);

// 增强翻译相关路由 (新的分表存储和批处理翻译)
router.use('/enhanced', enhancedTranslationRoutes);

// 段落相关路由
router.use('/', paragraphRoutes);

// 文章处理路由
router.use('/', essayRoutes);

// 单词相关路由
router.use('/', wordRoutes);

// AI单词难度判断路由 - 简化版本
router.use('/ai-words', simplifiedWordRoutes);

// 单词预查询路由 - 优化查词翻译流程
router.use('/words', wordPreQueryRoutes);

// 健康检查路由
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cloze-test-backend'
  });
});

// 数据库测试路由
router.get('/test-db', async (_req, res) => {
  try {
    // 测试连接
    const isConnected = await testConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        error: '数据库连接失败'
      });
    }

    // 测试查询
    const result = await query('SELECT * FROM words ORDER BY created_at DESC LIMIT 5');
    
    res.json({
      success: true,
      connection: 'ok',
      rowCount: result.rowCount,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
});

// API信息路由
router.get('/info', (_req, res) => {
  res.json({
    name: 'Cloze Test Backend API',
    version: '1.0.0',
    description: 'Backend API for Cloze Test Application',
    endpoints: {
      translation: {
        'POST /api/translate': '翻译文本',
        'POST /api/translate/batch': '批量翻译',
        'POST /api/translate/words': '批量单词翻译',
        'GET /api/translate/history': '获取翻译历史',
        'GET /api/translate/stats': '获取翻译统计',
        'POST /api/translate/cache/clear': '清除翻译缓存'
      },
      enhanced: {
        'POST /api/enhanced/paragraph': '增强段落翻译',
        'POST /api/enhanced/words/batch': '批量单词翻译',
        'GET /api/enhanced/history/passages': '段落翻译历史',
        'GET /api/enhanced/history/words': '单词翻译历史',
        'GET /api/enhanced/words/difficulty/:level': '根据难度查询单词',
        'GET /api/enhanced/stats': '翻译统计信息',
        'POST /api/enhanced/words/analyze': '单词难度分析'
      },
      paragraphs: {
        'POST /api/paragraphs/batch': '批量保存段落翻译'
      },
      words: {
        'GET /api/words': '获取单词列表',
        'GET /api/words/:word': '查询单词',
        'POST /api/words': '创建单词',
        'POST /api/words/batch': '批量创建单词',
        'GET /api/words/batch/check': '批量检查单词是否存在',
        'PUT /api/words/:id': '更新单词',
        'DELETE /api/words/:id': '删除单词'
      },
      aiWords: {
        'POST /api/ai-words/process': 'AI单词难度判断',
        'POST /api/ai-words/batch-process': 'AI批量单词处理',
        'POST /api/ai-words/filter-complex': '过滤复杂单词',
        'POST /api/ai-words/check-translation': '检查单词翻译需求',
        'GET /api/ai-words/config-status': '获取API配置状态'
      },
      system: {
        'GET /api/health': '健康检查',
        'GET /api/info': 'API信息'
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;