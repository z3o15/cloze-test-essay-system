import { Request, Response } from 'express'
import { query } from '../config/database'

export class ParagraphController {
  /**
   * 获取所有段落
   */
  static async getAllParagraphs(req: Request, res: Response) {
    try {
      console.log('开始查询段落列表...')
      const result = await query(
        'SELECT id, title, english_content, translation FROM paragraphs ORDER BY id'
      )
      console.log('查询成功，返回行数:', result.rowCount)
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rowCount
      })
    } catch (error) {
      console.error('获取段落列表失败:', error)
      console.error('错误详情:', JSON.stringify(error, null, 2))
      res.status(500).json({
        success: false,
        error: '获取段落列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  /**
   * 根据ID获取段落
   */
  static async getParagraphById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await query(
        'SELECT id, title, english_content, translation FROM paragraphs WHERE id = $1',
        [id]
      )
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: '段落未找到'
        });
        return;
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      })
    } catch (error) {
      console.error('获取段落失败:', error)
      res.status(500).json({
        success: false,
        error: '获取段落失败'
      })
    }
  }

  /**
   * 创建新段落
   */
  static async createParagraph(req: Request, res: Response) {
    try {
      const { title, english_content, translation } = req.body
      
      if (!title || !english_content || !translation) {
        res.status(400).json({
          success: false,
          error: '缺少必要参数：title, english_content, translation'
        });
        return;
      }
      
      const result = await query(
        'INSERT INTO paragraphs (title, english_content, translation) VALUES ($1, $2, $3) RETURNING *',
        [title, english_content, translation]
      )
      
      res.status(201).json({
        success: true,
        data: result.rows[0]
      })
    } catch (error) {
      console.error('创建段落失败:', error)
      res.status(500).json({
        success: false,
        error: '创建段落失败'
      })
    }
  }

  /**
   * 更新段落
   */
  static async updateParagraph(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { title, english_content, translation } = req.body
      
      const result = await query(
        'UPDATE paragraphs SET title = $1, english_content = $2, translation = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [title, english_content, translation, id]
      )
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: '段落未找到'
        });
        return;
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      })
    } catch (error) {
      console.error('更新段落失败:', error)
      res.status(500).json({
        success: false,
        error: '更新段落失败'
      })
    }
  }

  /**
   * 删除段落
   */
  static async deleteParagraph(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await query(
        'DELETE FROM paragraphs WHERE id = $1 RETURNING id',
        [id]
      )
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: '段落未找到'
        });
        return;
      }
      
      res.json({
        success: true,
        message: '段落删除成功'
      })
    } catch (error) {
      console.error('删除段落失败:', error)
      res.status(500).json({
        success: false,
        error: '删除段落失败'
      })
    }
  }

  /**
   * 批量保存段落（用于作文处理）
   */
  static async batchSaveParagraphs(req: Request, res: Response) {
    try {
      const { paragraphs, essayId } = req.body
      
      if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length === 0) {
        res.status(400).json({
          success: false,
          error: '缺少段落数据'
        });
        return;
      }
      
      const { pool } = await import('../config/database')
      const client = await pool().connect()
      
      try {
        await client.query('BEGIN')
        
        const savedParagraphs = []
        
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i]
          const result = await client.query(
            'INSERT INTO paragraphs (title, english_content, translation) VALUES ($1, $2, $3) RETURNING *',
            [
              paragraph.title || `段落 ${i + 1}`,
              paragraph.english_content || paragraph.content,
              paragraph.translation || ''
            ]
          )
          savedParagraphs.push(result.rows[0])
        }
        
        await client.query('COMMIT')
        
        res.json({
          success: true,
          data: savedParagraphs,
          count: savedParagraphs.length
        })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('批量保存段落失败:', error)
      res.status(500).json({
        success: false,
        error: '批量保存段落失败'
      })
    }
  }
}