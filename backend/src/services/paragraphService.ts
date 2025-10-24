import { PassageTranslationRepository, PassageTranslation } from '@/repositories/passageTranslationRepository'
import { pool } from '@/config/database'
import { logger } from '@/utils/logger'

export interface ParagraphCreateItem {
  source_text: string
  translated_text: string
  status?: 'active' | 'inactive' | 'pending' | 'failed'
}

export class ParagraphService {
  private repository: PassageTranslationRepository

  constructor() {
    const poolInstance = pool()
    this.repository = new PassageTranslationRepository(poolInstance)
  }

  /**
   * 批量保存段落翻译
   */
  async batchSave(paragraphs: ParagraphCreateItem[]): Promise<PassageTranslation[]> {
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return []
    }

    // 限制一次最多保存 100 条
    if (paragraphs.length > 100) {
      throw new Error('一次最多保存100条段落翻译')
    }

    // 清洗数据并设置默认状态
    const items: Omit<PassageTranslation, 'id' | 'created_at' | 'updated_at'>[] = paragraphs.map(p => ({
      source_text: (p.source_text || '').trim(),
      translated_text: (p.translated_text || '').trim(),
      status: p.status || 'active'
    })).filter(p => p.source_text && p.translated_text)

    if (items.length === 0) {
      return []
    }

    try {
      const results = await this.repository.batchCreate(items)
      logger.info(`批量保存段落翻译成功: ${results.length} 条`)
      return results
    } catch (error) {
      logger.error('批量保存段落翻译失败:', error)
      throw error
    }
  }
}
