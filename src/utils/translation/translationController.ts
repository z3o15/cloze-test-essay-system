// 主控模块 - 协调各模块工作流程
import type { 
  ITranslationController, 
  IParagraphProcessor, 
  IWordTranslator, 
  IDatabaseService,
  EssayProcessResult,
  ParagraphProcessResult,
  WordTranslation,
  TranslationConfig
} from './types'

export class TranslationController implements ITranslationController {
  private paragraphProcessor: IParagraphProcessor
  private wordTranslator: IWordTranslator
  private databaseService: IDatabaseService
  private config: TranslationConfig

  constructor(
    paragraphProcessor: IParagraphProcessor,
    wordTranslator: IWordTranslator,
    databaseService: IDatabaseService,
    config?: Partial<TranslationConfig>
  ) {
    this.paragraphProcessor = paragraphProcessor
    this.wordTranslator = wordTranslator
    this.databaseService = databaseService
    
    this.config = {
      autoSave: {
        enabled: true,
        minTextLength: 10,
        saveDelay: 1000
      },
      cache: {
        maxSize: 1000,
        maxAge: 24 * 60 * 60 * 1000,
        cleanupInterval: 60 * 60 * 1000
      },
      concurrency: {
        maxConcurrent: 3,
        requestDelay: 200
      },
      ...config
    }
  }

  /**
   * 处理作文保存后的翻译和单词提取
   * @param content 作文内容
   * @returns 处理结果
   */
  async processEssayAfterSave(content: string): Promise<EssayProcessResult> {
    const result: EssayProcessResult = {
      success: false,
      processedParagraphs: 0,
      totalWords: 0,
      savedWords: 0,
      errors: []
    }

    try {
      // 分割段落
      const paragraphs = this.splitIntoParagraphs(content)

      if (paragraphs.length === 0) {
        result.success = true
        return result
      }

      // 处理每个段落
      const paragraphResults: ParagraphProcessResult[] = []
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i]
        
        try {
          const paragraphResult = await this.paragraphProcessor.processParagraph(paragraph)
          paragraphResults.push(paragraphResult)
          
          result.processedParagraphs++
          result.totalWords += paragraphResult.wordTranslations.length
          
          // 添加延迟，避免过于频繁的请求
          if (i < paragraphs.length - 1) {
            await this.delay(this.config.concurrency.requestDelay)
          }
        } catch (error: any) {
          console.error(`处理第 ${i + 1} 个段落失败:`, error)
          result.errors.push(`段落 ${i + 1}: ${error.message}`)
        }
      }

      // 收集所有单词翻译
      const allWordTranslations: WordTranslation[] = []
      paragraphResults.forEach(result => {
        allWordTranslations.push(...result.wordTranslations)
      })

      // 保存单词到数据库
      if (allWordTranslations.length > 0) {
        const savedCount = await this.saveWordTranslationsToDatabase(allWordTranslations)
        result.savedWords = savedCount
      }

      result.success = result.errors.length === 0
      
      return result
    } catch (error: any) {
      console.error('处理作文失败:', error)
      result.errors.push(`系统错误: ${error.message}`)
      return result
    }
  }

  /**
   * 异步处理作文
   * @param content 作文内容
   */
  async processEssayAsync(content: string): Promise<void> {
    try {
      await this.processEssayAfterSave(content)
    } catch (error) {
      console.error('异步处理作文失败:', error)
    }
  }

  /**
   * 预加载单词翻译
   * @param content 作文内容
   */
  async preloadWordTranslations(content: string): Promise<void> {
    try {
      console.log('开始预加载单词翻译...')
      
      // 提取所有单词
      const words = this.paragraphProcessor.extractWords(content)
      const uniqueWords = Array.from(new Set(words))
      
      console.log(`提取到 ${uniqueWords.length} 个唯一单词`)

      // 分批预加载翻译
      const batchSize = this.config.concurrency.maxConcurrent
      for (let i = 0; i < uniqueWords.length; i += batchSize) {
        const batch = uniqueWords.slice(i, i + batchSize)
        
        const promises = batch.map(word => 
          this.wordTranslator.translateWord(word).catch(error => {
            console.warn(`预加载单词 "${word}" 失败:`, error.message)
            return ''
          })
        )
        
        await Promise.all(promises)
        
        // 添加延迟
        if (i + batchSize < uniqueWords.length) {
          await this.delay(this.config.concurrency.requestDelay)
        }
      }
      
      console.log('单词翻译预加载完成')
    } catch (error) {
      console.error('预加载单词翻译失败:', error)
    }
  }

  /**
   * 分割文本为段落
   * @param content 文本内容
   * @returns 段落数组
   */
  private splitIntoParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/) // 按双换行分割
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }

  /**
   * 保存单词翻译到数据库
   * @param wordTranslations 单词翻译数组
   * @returns 成功保存的数量
   */
  private async saveWordTranslationsToDatabase(wordTranslations: WordTranslation[]): Promise<number> {
    try {
      // 去重处理
      const uniqueTranslations = this.deduplicateWordTranslations(wordTranslations)

      // 转换为数据库格式
      const dbTranslations = uniqueTranslations.map(wt => ({
        word: wt.word,
        translation: wt.translation
      }))

      // 批量保存
      const savedCount = await this.databaseService.saveTranslationsBatch(dbTranslations)
      
      return savedCount
    } catch (error) {
      console.error('保存单词翻译到数据库失败:', error)
      return 0
    }
  }

  /**
   * 去重单词翻译
   * @param wordTranslations 单词翻译数组
   * @returns 去重后的数组
   */
  private deduplicateWordTranslations(wordTranslations: WordTranslation[]): WordTranslation[] {
    const seen = new Set<string>()
    const unique: WordTranslation[] = []
    
    for (const wt of wordTranslations) {
      const key = `${wt.word}_${wt.translation}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(wt)
      }
    }
    
    return unique
  }

  /**
   * 延迟函数
   * @param ms 延迟时间（毫秒）
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取处理统计信息
   * @returns 统计信息
   */
  getStats(): {
    translatorCacheSize: number
    databaseCacheStats: { existsCache: number, requestCache: number }
  } {
    return {
      translatorCacheSize: this.wordTranslator.getTranslationCacheSize(),
      databaseCacheStats: this.databaseService.getCacheStats()
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCaches(): void {
    this.wordTranslator.clearTranslationCache()
    this.databaseService.clearCache()
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  updateConfig(newConfig: Partial<TranslationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    }
  }
}

// 创建默认实例的工厂函数
export const createTranslationController = (
  paragraphProcessor: IParagraphProcessor,
  wordTranslator: IWordTranslator,
  databaseService: IDatabaseService,
  config?: Partial<TranslationConfig>
): TranslationController => {
  return new TranslationController(paragraphProcessor, wordTranslator, databaseService, config)
}