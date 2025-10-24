/**
 * 优化的翻译协调服务
 * 实现先查词提交后台对比数据库，同时进行段落翻译的并行处理流程
 */

import WordPreQueryService, { BatchPreQueryResult, WordTranslationCache } from './wordPreQueryService'
import { translateText } from '../utils/translateService'
import { isValidWord } from '../utils/wordValidator'

export interface OptimizedTranslationResult {
  // 段落翻译结果
  paragraphTranslation: string
  paragraphCached: boolean
  
  // 单词翻译结果
  wordTranslations: WordTranslationCache
  wordStats: {
    total: number
    known: number
    unknown: number
    cache_hit_rate: number
  }
  
  // 性能统计
  performance: {
    total_time_ms: number
    prequery_time_ms: number
    paragraph_time_ms: number
    word_supplement_time_ms: number
    parallel_efficiency: number
  }
  
  // 处理状态
  status: {
    paragraph_success: boolean
    prequery_success: boolean
    supplement_success: boolean
    errors: string[]
  }
}

export interface TranslationOptions {
  // 是否启用并行处理
  enableParallel: boolean
  
  // 是否异步补充未知单词
  enableAsyncSupplement: boolean
  
  // 单词预查询选项
  includeWordDetails: boolean
  
  // 超时设置
  timeouts: {
    paragraph: number
    prequery: number
    supplement: number
  }
  
  // 并发控制
  concurrency: {
    maxParallelTasks: number
    wordBatchSize: number
  }
}

export class OptimizedTranslationService {
  private static readonly DEFAULT_OPTIONS: TranslationOptions = {
    enableParallel: true,
    enableAsyncSupplement: true,
    includeWordDetails: true,
    timeouts: {
      paragraph: 30000, // 30秒
      prequery: 10000,  // 10秒
      supplement: 60000 // 60秒
    },
    concurrency: {
      maxParallelTasks: 3,
      wordBatchSize: 50
    }
  }

  /**
   * 优化的段落翻译处理
   * 先查词提交后台对比数据库，同时进行段落翻译
   * @param text 待翻译的段落文本
   * @param options 翻译选项
   * @returns 优化的翻译结果
   */
  static async translateParagraphOptimized(
    text: string,
    options: Partial<TranslationOptions> = {}
  ): Promise<OptimizedTranslationResult> {
    const startTime = Date.now()
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    console.log(`🚀 开始优化翻译处理: ${text.substring(0, 50)}...`)

    // 初始化结果对象
    const result: OptimizedTranslationResult = {
      paragraphTranslation: '',
      paragraphCached: false,
      wordTranslations: {},
      wordStats: {
        total: 0,
        known: 0,
        unknown: 0,
        cache_hit_rate: 0
      },
      performance: {
        total_time_ms: 0,
        prequery_time_ms: 0,
        paragraph_time_ms: 0,
        word_supplement_time_ms: 0,
        parallel_efficiency: 0
      },
      status: {
        paragraph_success: false,
        prequery_success: false,
        supplement_success: false,
        errors: []
      }
    }

    try {
      // 1. 提取段落中的单词
      const words = this.extractWordsFromText(text)
      result.wordStats.total = words.length

      if (opts.enableParallel) {
        // 并行处理：同时进行段落翻译和单词预查询
        await this.processParallel(text, words, opts, result)
      } else {
        // 顺序处理：先预查询，再段落翻译
        await this.processSequential(text, words, opts, result)
      }

      // 3. 异步补充未知单词翻译（如果启用）
      if (opts.enableAsyncSupplement && result.wordStats.unknown > 0) {
        this.supplementUnknownWordsAsync(result, opts)
      }

      // 计算总处理时间和并行效率
      result.performance.total_time_ms = Date.now() - startTime
      result.performance.parallel_efficiency = this.calculateParallelEfficiency(result.performance)

      console.log(`✅ 优化翻译完成: 总时间${result.performance.total_time_ms}ms, 并行效率${(result.performance.parallel_efficiency * 100).toFixed(1)}%`)

      return result

    } catch (error) {
      console.error('❌ 优化翻译处理失败:', error)
      result.status.errors.push(`翻译处理失败: ${error instanceof Error ? error.message : String(error)}`)
      result.performance.total_time_ms = Date.now() - startTime
      return result
    }
  }

  /**
   * 并行处理：同时进行段落翻译和单词预查询
   */
  private static async processParallel(
    text: string,
    words: string[],
    opts: TranslationOptions,
    result: OptimizedTranslationResult
  ): Promise<void> {
    console.log(`⚡ 启动并行处理: 段落翻译 + ${words.length}个单词预查询`)

    const tasks = []

    // 任务1: 段落翻译
    const paragraphTask = this.translateParagraphTask(text, opts.timeouts.paragraph)
      .then(paragraphResult => {
        result.paragraphTranslation = paragraphResult.translation
        result.paragraphCached = paragraphResult.cached
        result.status.paragraph_success = true
        console.log(`📝 段落翻译完成: ${paragraphResult.cached ? '缓存命中' : 'API调用'}`)
      })
      .catch(error => {
        console.error('❌ 段落翻译失败:', error)
        result.status.errors.push(`段落翻译失败: ${error.message}`)
      })

    tasks.push(paragraphTask)

    // 任务2: 单词预查询
    if (words.length > 0) {
      const prequeryTask = this.prequeryWordsTask(words, opts)
        .then(prequeryResult => {
          this.processPrequeryResult(prequeryResult, result)
          result.status.prequery_success = true
          console.log(`🔍 单词预查询完成: 已知${result.wordStats.known}个, 未知${result.wordStats.unknown}个`)
        })
        .catch(error => {
          console.error('❌ 单词预查询失败:', error)
          result.status.errors.push(`单词预查询失败: ${error.message}`)
        })

      tasks.push(prequeryTask)
    } else {
      result.status.prequery_success = true
    }

    // 等待所有并行任务完成
    await Promise.allSettled(tasks)
  }

  /**
   * 顺序处理：先预查询，再段落翻译
   */
  private static async processSequential(
    text: string,
    words: string[],
    opts: TranslationOptions,
    result: OptimizedTranslationResult
  ): Promise<void> {
    console.log(`🔄 启动顺序处理: 先预查询 ${words.length}个单词，再段落翻译`)

    try {
      // 1. 单词预查询
      if (words.length > 0) {
        const prequeryResult = await this.prequeryWordsTask(words, opts)
        this.processPrequeryResult(prequeryResult, result)
        result.status.prequery_success = true
        console.log(`🔍 单词预查询完成: 已知${result.wordStats.known}个, 未知${result.wordStats.unknown}个`)
      } else {
        result.status.prequery_success = true
      }

      // 2. 段落翻译
      const paragraphResult = await this.translateParagraphTask(text, opts.timeouts.paragraph)
      result.paragraphTranslation = paragraphResult.translation
      result.paragraphCached = paragraphResult.cached
      result.status.paragraph_success = true
      console.log(`📝 段落翻译完成: ${paragraphResult.cached ? '缓存命中' : 'API调用'}`)

    } catch (error) {
      console.error('❌ 顺序处理失败:', error)
      result.status.errors.push(`顺序处理失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 段落翻译任务
   */
  private static async translateParagraphTask(
    text: string,
    timeout: number
  ): Promise<{ translation: string; cached: boolean }> {
    const startTime = Date.now()

    try {
      const response = await Promise.race([
        translateText(text),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('段落翻译超时')), timeout)
        )
      ]) as any

      const translation = response || ''
      const cached = false // translateText 不提供缓存信息，暂时设为false

      console.log(`⏱️ 段落翻译耗时: ${Date.now() - startTime}ms`)

      return { translation, cached }

    } catch (error) {
      console.error('段落翻译任务失败:', error)
      throw error
    }
  }

  /**
   * 单词预查询任务
   */
  private static async prequeryWordsTask(
    words: string[],
    opts: TranslationOptions
  ): Promise<{ result: BatchPreQueryResult; time_ms: number }> {
    const startTime = Date.now()

    try {
      const result = await Promise.race([
        WordPreQueryService.batchPreQuery(words, opts.includeWordDetails),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('单词预查询超时')), opts.timeouts.prequery)
        )
      ]) as BatchPreQueryResult

      const time_ms = Date.now() - startTime
      console.log(`⏱️ 单词预查询耗时: ${time_ms}ms`)

      return { result, time_ms }

    } catch (error) {
      console.error('单词预查询任务失败:', error)
      throw error
    }
  }

  /**
   * 处理预查询结果
   */
  private static processPrequeryResult(
    prequeryData: { result: BatchPreQueryResult; time_ms: number },
    result: OptimizedTranslationResult
  ): void {
    const { result: prequeryResult, time_ms } = prequeryData

    // 更新性能统计
    result.performance.prequery_time_ms = time_ms

    // 更新单词统计
    result.wordStats.known = prequeryResult.known_words.length
    result.wordStats.unknown = prequeryResult.unknown_words.length
    result.wordStats.cache_hit_rate = prequeryResult.cache_hit_rate

    // 转换为翻译缓存格式
    result.wordTranslations = WordPreQueryService.convertToTranslationCache(prequeryResult)
  }

  /**
   * 异步补充未知单词翻译
   */
  private static supplementUnknownWordsAsync(
    result: OptimizedTranslationResult,
    opts: TranslationOptions
  ): void {
    const unknownWords = Object.keys(result.wordTranslations)
      .filter(word => !result.wordTranslations[word])

    if (unknownWords.length === 0) {
      result.status.supplement_success = true
      return
    }

    console.log(`🔄 开始异步补充 ${unknownWords.length} 个未知单词`)

    const supplementStartTime = Date.now()

    // 异步执行，不阻塞主流程
    WordPreQueryService.supplementUnknownWords(
      unknownWords,
      (word: string, translation: string) => {
        // 更新翻译缓存
        result.wordTranslations[word] = translation
        console.log(`📚 补充单词翻译: ${word} -> ${translation}`)
      }
    ).then(() => {
      result.performance.word_supplement_time_ms = Date.now() - supplementStartTime
      result.status.supplement_success = true
      console.log(`✅ 异步单词补充完成，耗时: ${result.performance.word_supplement_time_ms}ms`)
    }).catch(error => {
      console.error('❌ 异步单词补充失败:', error)
      result.status.errors.push(`异步单词补充失败: ${error.message}`)
    })
  }

  /**
   * 从文本中提取单词
   */
  private static extractWordsFromText(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return []
    }

    // 使用现有的单词验证器提取有效单词
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 移除标点符号
      .split(/\s+/)
      .filter(word => word.length > 0)
      .filter(word => isValidWord(word))

    // 去重并限制数量
    return [...new Set(words)].slice(0, 200) // 最多处理200个单词
  }

  /**
   * 计算并行效率
   */
  private static calculateParallelEfficiency(performance: OptimizedTranslationResult['performance']): number {
    const { prequery_time_ms, paragraph_time_ms, total_time_ms } = performance

    if (total_time_ms === 0) return 0

    // 理论顺序执行时间
    const sequentialTime = prequery_time_ms + paragraph_time_ms
    
    if (sequentialTime === 0) return 1

    // 并行效率 = (顺序时间 - 实际时间) / 顺序时间
    const efficiency = Math.max(0, (sequentialTime - total_time_ms) / sequentialTime)
    
    return Math.min(1, efficiency) // 限制在0-1之间
  }

  /**
   * 批量处理多个段落（优化版本）
   */
  static async batchTranslateParagraphs(
    paragraphs: string[],
    options: Partial<TranslationOptions> = {}
  ): Promise<OptimizedTranslationResult[]> {
    if (!paragraphs || paragraphs.length === 0) {
      return []
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    const results: OptimizedTranslationResult[] = []

    console.log(`📦 开始批量翻译 ${paragraphs.length} 个段落`)

    // 控制并发数量
    const concurrencyLimit = opts.concurrency.maxParallelTasks
    
    for (let i = 0; i < paragraphs.length; i += concurrencyLimit) {
      const batch = paragraphs.slice(i, i + concurrencyLimit)
      
      const batchPromises = batch.map(async (paragraph, index) => {
        try {
          const result = await this.translateParagraphOptimized(paragraph, opts)
          console.log(`✅ 批次段落 ${i + index + 1} 翻译完成`)
          return result
        } catch (error) {
          console.error(`❌ 批次段落 ${i + index + 1} 翻译失败:`, error)
          // 返回错误结果而不是抛出异常
          return {
            paragraphTranslation: '',
            paragraphCached: false,
            wordTranslations: {},
            wordStats: { total: 0, known: 0, unknown: 0, cache_hit_rate: 0 },
            performance: { total_time_ms: 0, prequery_time_ms: 0, paragraph_time_ms: 0, word_supplement_time_ms: 0, parallel_efficiency: 0 },
            status: { paragraph_success: false, prequery_success: false, supplement_success: false, errors: [error instanceof Error ? error.message : String(error)] }
          } as OptimizedTranslationResult
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // 批次间添加短暂延迟，避免过载
      if (i + concurrencyLimit < paragraphs.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`🎉 批量翻译完成: ${results.length} 个段落`)
    return results
  }
}

export default OptimizedTranslationService