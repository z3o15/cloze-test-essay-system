/**
 * 单词预查询路由
 * 定义单词批量预查询相关的API端点
 */

import { Router } from 'express'
import { WordPreQueryController, batchPreQueryValidation, singleWordValidation } from '../controllers/wordPreQueryController'

const router = Router()
const wordPreQueryController = new WordPreQueryController()

/**
 * 批量预查询单词翻译
 * POST /batch-prequery
 * 
 * 请求体:
 * {
 *   "words": ["hello", "world", "example"],
 *   "include_details": true
 * }
 * 
 * 响应:
 * {
 *   "code": "SUCCESS",
 *   "data": {
 *     "known_words": [...],
 *     "unknown_words": [...],
 *     "cache_hit_rate": 0.67,
 *     "total_words": 3,
 *     "processing_time_ms": 45
 *   }
 * }
 */
router.post('/batch-prequery', batchPreQueryValidation, (req, res) => {
  wordPreQueryController.batchPreQuery(req, res)
})

/**
 * 健康检查
 * GET /prequery/health
 * 
 * 响应:
 * {
 *   "code": "SUCCESS",
 *   "data": {
 *     "status": "healthy",
 *     "timestamp": "2024-10-24T10:30:00Z",
 *     "services": {
 *       "database": "connected",
 *       "cache": "connected"
 *     }
 *   }
 * }
 */
router.get('/prequery/health', (req, res) => {
  wordPreQueryController.healthCheck(req, res)
})

/**
 * 清除预查询缓存
 * DELETE /prequery/cache
 * 
 * 响应:
 * {
 *   "code": "SUCCESS",
 *   "message": "缓存清除成功"
 * }
 */
router.delete('/prequery/cache', (req, res) => {
  wordPreQueryController.clearCache(req, res)
})

/**
 * 获取缓存统计信息
 * GET /prequery/cache/stats
 * 
 * 响应:
 * {
 *   "code": "SUCCESS",
 *   "data": {
 *     "total_keys": 150,
 *     "memory_usage": "2.5MB",
 *     "hit_rate": 0.85,
 *     "uptime": "2h 30m"
 *   }
 * }
 */
router.get('/prequery/cache/stats', (req, res) => {
  wordPreQueryController.getCacheStats(req, res)
})

/**
 * 获取单个单词翻译
 * GET /prequery/:word
 * 
 * 响应:
 * {
 *   "code": "SUCCESS",
 *   "data": {
 *     "word": "hello",
 *     "translation": "你好",
 *     "source": "database",
 *     "difficulty_level": 1,
 *     "phonetic": "/həˈloʊ/"
 *   }
 * }
 */
router.get('/prequery/:word', singleWordValidation, (req, res) => {
  wordPreQueryController.getSingleWord(req, res)
})

export default router