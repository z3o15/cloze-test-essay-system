/**
 * 单词预查询控制器
 * 处理单词批量预查询相关的HTTP请求
 */

import { Request, Response } from 'express'
import { WordPreQueryService } from '../services/wordPreQueryService'
import { logger } from '../utils/logger'
import { body, query, validationResult } from 'express-validator'

export class WordPreQueryController {
  private wordPreQueryService: WordPreQueryService

  constructor() {
    this.wordPreQueryService = new WordPreQueryService()
  }

  /**
   * 批量预查询单词翻译
   * POST /api/v1/words/batch-prequery
   */
  async batchPreQuery(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求参数
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数验证失败',
          data: null,
          errors: errors.array()
        })
        return
      }

      const { words, include_details = true } = req.body

      if (!words || !Array.isArray(words) || words.length === 0) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数错误：words字段必须是非空数组',
          data: null
        })
        return
      }

      // 限制批量查询数量
      if (words.length > 100) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数错误：单次查询单词数量不能超过100个',
          data: null
        })
        return
      }

      // 验证单词格式
      const invalidWords = words.filter(word => 
        typeof word !== 'string' || 
        word.trim().length === 0 || 
        word.length > 50 ||
        !/^[a-zA-Z\s'-]+$/.test(word.trim())
      )

      if (invalidWords.length > 0) {
        res.status(400).json({
          code: 'ERROR_001',
          message: `参数错误：包含无效单词格式: ${invalidWords.slice(0, 5).join(', ')}`,
          data: null
        })
        return
      }

      logger.info(`收到批量预查询请求: ${words.length} 个单词`)

      const result = await this.wordPreQueryService.batchPreQuery(words, include_details)

      res.json({
        code: 'SUCCESS',
        message: '批量预查询成功',
        data: result
      })

    } catch (error) {
      logger.error('批量预查询失败:', error)
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        data: null
      })
    }
  }

  /**
   * 获取单个单词翻译
   * GET /api/v1/words/prequery/:word
   */
  async getSingleWord(req: Request, res: Response): Promise<void> {
    try {
      const { word } = req.params

      if (!word || typeof word !== 'string' || word.trim().length === 0) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数错误：单词不能为空',
          data: null
        })
        return
      }

      // 验证单词格式
      if (word.length > 50 || !/^[a-zA-Z\s'-]+$/.test(word.trim())) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数错误：单词格式无效',
          data: null
        })
        return
      }

      const result = await this.wordPreQueryService.getSingleWordTranslation(word)

      if (result) {
        res.json({
          code: 'SUCCESS',
          message: '查询成功',
          data: result
        })
      } else {
        res.json({
          code: 'NOT_FOUND',
          message: '未找到该单词的翻译',
          data: null
        })
      }

    } catch (error) {
      logger.error('单词查询失败:', error)
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        data: null
      })
    }
  }

  /**
   * 清除缓存
   * DELETE /api/v1/words/prequery/cache
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const { words } = req.body

      if (words && (!Array.isArray(words) || words.some(w => typeof w !== 'string'))) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '参数错误：words必须是字符串数组',
          data: null
        })
        return
      }

      await this.wordPreQueryService.clearCache(words)

      res.json({
        code: 'SUCCESS',
        message: words ? `清除了 ${words.length} 个单词的缓存` : '清除了所有缓存',
        data: null
      })

    } catch (error) {
      logger.error('清除缓存失败:', error)
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        data: null
      })
    }
  }

  /**
   * 获取缓存统计
   * GET /api/v1/words/prequery/cache/stats
   */
  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.wordPreQueryService.getCacheStats()

      res.json({
        code: 'SUCCESS',
        message: '获取缓存统计成功',
        data: stats
      })

    } catch (error) {
      logger.error('获取缓存统计失败:', error)
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        data: null
      })
    }
  }

  /**
   * 健康检查
   * GET /api/v1/words/prequery/health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // 简单的健康检查：尝试查询一个测试单词
      const testResult = await this.wordPreQueryService.getSingleWordTranslation('test')
      
      res.json({
        code: 'SUCCESS',
        message: '预查询服务正常',
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          test_query_success: testResult !== null
        }
      })

    } catch (error) {
      logger.error('预查询服务健康检查失败:', error)
      res.status(500).json({
        code: 'ERROR_500',
        message: '预查询服务异常',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error)
        }
      })
    }
  }
}

// 验证中间件
export const batchPreQueryValidation = [
  body('words')
    .isArray({ min: 1, max: 100 })
    .withMessage('words必须是包含1-100个元素的数组'),
  body('words.*')
    .isString()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('单词格式无效'),
  body('include_details')
    .optional()
    .isBoolean()
    .withMessage('include_details必须是布尔值')
]

export const singleWordValidation = [
  query('word')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('单词格式无效')
]

export default WordPreQueryController