/**
 * 单词预查询服务
 * 实现批量单词数据库查询，支持查词翻译流程优化
 */

import { WordRepository } from '../repositories/wordRepository'
import { CacheService } from '../config/redis'
import { logger } from '../utils/logger'

export interface PreQueryWordResult {
  word: string
  translation: string
  source: 'database' | 'cache'
  difficulty_level?: number
  phonetic?: string
}

export interface BatchPreQueryResult {
  known_words: PreQueryWordResult[]
  unknown_words: string[]
  cache_hit_rate: number
  total_words: number
  processing_time_ms: number
}

export class WordPreQueryService {
  private wordRepo: WordRepository
  private static readonly CACHE_PREFIX = 'word_prequery:'
  private static readonly CACHE_TTL = 3600 // 1小时

  constructor() {
    this.wordRepo = new WordRepository()
  }

  /**
   * 批量预查询单词翻译
   * @param words 单词数组
   * @param includeDetails 是否包含详细信息（音标、难度等）
   * @returns 预查询结果
   */
  async batchPreQuery(words: string[], includeDetails: boolean = true): Promise<BatchPreQueryResult> {
    const startTime = Date.now()
    
    if (!words || words.length === 0) {
      return {
        known_words: [],
        unknown_words: [],
        cache_hit_rate: 0,
        total_words: 0,
        processing_time_ms: 0
      }
    }

    // 标准化单词（小写、去重）
    const normalizedWords = [...new Set(words.map(word => word.toLowerCase().trim()))]
      .filter(word => word.length > 0)

    logger.info(`开始批量预查询 ${normalizedWords.length} 个单词`)

    const knownWords: PreQueryWordResult[] = []
    const unknownWords: string[] = []
    let cacheHits = 0

    try {
      // 1. 批量检查缓存
      const cacheResults = await this.batchCheckCache(normalizedWords)
      const wordsToQuery: string[] = []

      for (const word of normalizedWords) {
        const cached = cacheResults.get(word)
        if (cached) {
          knownWords.push({
            word,
            translation: cached.translation,
            source: 'cache',
            difficulty_level: cached.difficulty_level,
            phonetic: cached.phonetic
          })
          cacheHits++
        } else {
          wordsToQuery.push(word)
        }
      }

      // 2. 批量查询数据库（未命中缓存的单词）
      if (wordsToQuery.length > 0) {
        const dbResults = await this.wordRepo.batchFindByWords(wordsToQuery)
        
        for (const word of wordsToQuery) {
          const dbResult = dbResults[word]
          if (dbResult && dbResult.translation) {
            const wordResult: PreQueryWordResult = {
              word,
              translation: dbResult.translation,
              source: 'database',
              difficulty_level: includeDetails ? dbResult.difficulty_level : undefined,
              phonetic: includeDetails ? dbResult.phonetic : undefined
            }
            
            knownWords.push(wordResult)
            
            // 异步更新缓存
            this.updateCacheAsync(word, dbResult).catch(error => {
              logger.warn(`更新单词缓存失败: ${word}`, error)
            })
          } else {
            unknownWords.push(word)
          }
        }
      }

      const processingTime = Date.now() - startTime
      const cacheHitRate = normalizedWords.length > 0 ? cacheHits / normalizedWords.length : 0

      const result: BatchPreQueryResult = {
        known_words: knownWords,
        unknown_words: unknownWords,
        cache_hit_rate: cacheHitRate,
        total_words: normalizedWords.length,
        processing_time_ms: processingTime
      }

      logger.info(`批量预查询完成: 已知${knownWords.length}个, 未知${unknownWords.length}个, 缓存命中率${(cacheHitRate * 100).toFixed(1)}%, 耗时${processingTime}ms`)

      return result

    } catch (error) {
      logger.error('批量预查询失败:', error)
      
      // 降级处理：返回所有单词为未知
      return {
        known_words: [],
        unknown_words: normalizedWords,
        cache_hit_rate: 0,
        total_words: normalizedWords.length,
        processing_time_ms: Date.now() - startTime
      }
    }
  }

  /**
   * 获取单个单词的翻译（优先缓存）
   * @param word 单词
   * @returns 单词翻译结果
   */
  async getSingleWordTranslation(word: string): Promise<PreQueryWordResult | null> {
    const normalizedWord = word.toLowerCase().trim()
    
    try {
      // 1. 检查缓存
      const cacheKey = `${WordPreQueryService.CACHE_PREFIX}${normalizedWord}`
      const cached = await CacheService.get(cacheKey)
      
      if (cached) {
        return {
          word: normalizedWord,
          translation: cached.translation,
          source: 'cache',
          difficulty_level: cached.difficulty_level,
          phonetic: cached.phonetic
        }
      }

      // 2. 查询数据库
      const dbResult = await this.wordRepo.findByWord(normalizedWord)
      
      if (dbResult && dbResult.translation) {
        const result: PreQueryWordResult = {
          word: normalizedWord,
          translation: dbResult.translation,
          source: 'database',
          difficulty_level: dbResult.difficulty_level,
          phonetic: dbResult.phonetic
        }

        // 异步更新缓存
        this.updateCacheAsync(normalizedWord, dbResult).catch(error => {
          logger.warn(`更新单词缓存失败: ${normalizedWord}`, error)
        })

        return result
      }

      return null

    } catch (error) {
      logger.error(`获取单词翻译失败: ${normalizedWord}`, error)
      return null
    }
  }

  /**
   * 批量检查缓存
   * @param words 单词数组
   * @returns 缓存结果Map
   */
  private async batchCheckCache(words: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>()
    
    try {
      const cacheKeys = words.map(word => `${WordPreQueryService.CACHE_PREFIX}${word}`)
      const cacheValues = await CacheService.mget(cacheKeys)
      
      words.forEach((word, index) => {
        const cached = cacheValues[index]
        if (cached) {
          results.set(word, cached)
        }
      })
    } catch (error) {
      logger.warn('批量检查缓存失败:', error)
    }
    
    return results
  }

  /**
   * 异步更新缓存
   * @param word 单词
   * @param wordData 单词数据
   */
  private async updateCacheAsync(word: string, wordData: any): Promise<void> {
    try {
      const cacheKey = `${WordPreQueryService.CACHE_PREFIX}${word}`
      const cacheValue = {
        translation: wordData.translation,
        difficulty_level: wordData.difficulty_level,
        phonetic: wordData.phonetic,
        updated_at: new Date().toISOString()
      }
      
      await CacheService.set(cacheKey, cacheValue, WordPreQueryService.CACHE_TTL)
    } catch (error) {
      logger.warn(`更新缓存失败: ${word}`, error)
    }
  }

  /**
   * 清除单词缓存
   * @param words 要清除的单词数组，如果为空则清除所有
   */
  async clearCache(words?: string[]): Promise<void> {
    try {
      if (words && words.length > 0) {
        const cacheKeys = words.map(word => `${WordPreQueryService.CACHE_PREFIX}${word.toLowerCase()}`)
        await CacheService.del(cacheKeys)
        logger.info(`清除了 ${words.length} 个单词的缓存`)
      } else {
        await CacheService.delPattern(`${WordPreQueryService.CACHE_PREFIX}*`)
        logger.info('清除了所有单词预查询缓存')
      }
    } catch (error) {
      logger.error('清除缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{
    total_cached_words: number
    cache_size_mb: number
    hit_rate_24h: number
  }> {
    try {
      // 这里可以实现更详细的缓存统计
      // 当前返回基础信息
      return {
        total_cached_words: 0, // 需要实现计数逻辑
        cache_size_mb: 0,      // 需要实现大小计算
        hit_rate_24h: 0        // 需要实现命中率统计
      }
    } catch (error) {
      logger.error('获取缓存统计失败:', error)
      return {
        total_cached_words: 0,
        cache_size_mb: 0,
        hit_rate_24h: 0
      }
    }
  }
}

export default WordPreQueryService