import { Request, Response } from 'express'
import { ParagraphService } from '@/services/paragraphService'
import { logger } from '@/utils/logger'

export class ParagraphController {
  private service: ParagraphService

  constructor() {
    this.service = new ParagraphService()
  }

  /**
   * 批量保存段落翻译 - POST /api/paragraphs/batch
   */
  batchSave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paragraphs } = req.body

      if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        res.status(400).json({
          code: 'ERROR_001',
          message: '请提供要保存的段落数组',
          timestamp: new Date()
        })
        return
      }

      logger.info('收到批量保存段落请求:', { count: paragraphs.length })

      const results = await this.service.batchSave(paragraphs)

      res.status(201).json({
        code: 'SUCCESS',
        data: {
          created: results.length,
          paragraphs: results
        },
        message: `成功保存${results.length}条段落翻译`
      })
    } catch (error) {
      logger.error('批量保存段落翻译控制器错误:', {
        error: error instanceof Error ? error.message : error
      })
      res.status(500).json({
        code: 'ERROR_500',
        message: '服务器内部错误',
        timestamp: new Date()
      })
    }
  }
}
