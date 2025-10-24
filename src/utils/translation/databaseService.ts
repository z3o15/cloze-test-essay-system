// 数据库交互模块 - 负责与翻译数据库的读写操作
import type { IDatabaseService, WordInfo, DatabaseError } from './types'
import httpClient from '../httpClient'
import { isValidWord } from '../wordValidator'
import { API_URLS } from '../../config/api'

export class DatabaseService implements IDatabaseService {
  private requestCache = new Map<string, Promise<any>>()
  private wordExistsCache = new Map<string, boolean>()
  
  // 缓存配置
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存
  private readonly MAX_CACHE_SIZE = 1000

  /**
   * 保存单词翻译到数据库
   * @param word 单词
   * @param translation 翻译
   * @returns 是否保存成功
   */
  async saveTranslationToDatabase(word: string, translation: string): Promise<boolean> {
    try {
      // 验证输入
      const trimmedWord = word.trim().toLowerCase()
      const trimmedTranslation = translation.trim()
      
      if (!this.isValidWordInternal(trimmedWord)) {
        return false
      }
      
      if (!trimmedTranslation) {
        return false
      }

      // 检查缓存，避免重复请求
      const cacheKey = `save_${trimmedWord}`
      const existingRequest = this.requestCache.get(cacheKey)
      if (existingRequest) {
        return await existingRequest
      }

      // 创建保存请求
      const savePromise = this.performSaveOperation(trimmedWord, trimmedTranslation)
      this.requestCache.set(cacheKey, savePromise)

      try {
        const result = await savePromise
        
        // 更新存在性缓存
        if (result) {
          this.wordExistsCache.set(trimmedWord, true)
        }
        
        return result
      } finally {
        // 清理请求缓存
        this.requestCache.delete(cacheKey)
      }
    } catch (error) {
      console.error('保存单词到数据库失败:', error)
      return false
    }
  }

  /**
   * 批量保存单词翻译
   * @param translations 翻译数组
   * @returns 成功保存的数量
   */
  async saveTranslationsBatch(translations: Array<{word: string, translation: string}>): Promise<number> {
    let savedCount = 0
    
    // 过滤有效的翻译
    const validTranslations = translations.filter(({ word, translation }) => {
      const trimmedWord = word.trim().toLowerCase()
      const trimmedTranslation = translation.trim()
      return this.isValidWordInternal(trimmedWord) && trimmedTranslation
    })

    // 分批处理，避免过多并发请求
    const batchSize = 5
    for (let i = 0; i < validTranslations.length; i += batchSize) {
      const batch = validTranslations.slice(i, i + batchSize)
      
      const batchPromises = batch.map(({ word, translation }) => 
        this.saveTranslationToDatabase(word, translation)
      )
      
      const results = await Promise.allSettled(batchPromises)
      
      // 统计成功数量
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          savedCount++
        }
      })
      
      // 添加延迟，避免过于频繁的请求
      if (i + batchSize < validTranslations.length) {
        await this.delay(100)
      }
    }
    
    return savedCount
  }

  /**
   * 从数据库查询单词
   * @param word 单词
   * @returns 单词信息或null
   */
  async queryWordFromDatabase(word: string): Promise<WordInfo | null> {
    try {
      const trimmedWord = word.trim().toLowerCase()
      
      if (!this.isValidWordInternal(trimmedWord)) {
        return null
      }

      // 检查缓存
      const cacheKey = `query_${trimmedWord}`
      const existingRequest = this.requestCache.get(cacheKey)
      if (existingRequest) {
        return await existingRequest
      }

      // 创建查询请求
      const queryPromise = this.performQueryOperation(trimmedWord)
      this.requestCache.set(cacheKey, queryPromise)

      try {
        const result = await queryPromise
        
        // 更新存在性缓存
        this.wordExistsCache.set(trimmedWord, result !== null)
        
        return result
      } finally {
        // 清理请求缓存
        this.requestCache.delete(cacheKey)
      }
    } catch (error) {
      console.error('查询单词失败:', error)
      return null
    }
  }

  /**
   * 检查单词是否存在
   * @param word 单词
   * @returns 是否存在
   */
  async checkWordExists(word: string): Promise<boolean> {
    const trimmedWord = word.trim().toLowerCase()
    
    // 检查缓存
    const cached = this.wordExistsCache.get(trimmedWord)
    if (cached !== undefined) {
      return cached
    }
    
    // 通过查询检查存在性
    const wordInfo = await this.queryWordFromDatabase(trimmedWord)
    return wordInfo !== null
  }

  /**
   * 执行实际的保存操作
   * @param word 单词
   * @param translation 翻译
   * @returns 是否成功
   */
  private async performSaveOperation(word: string, translation: string): Promise<boolean> {
    try {
      // 先检查单词是否已存在
      const existingWord = await this.performQueryOperation(word)
      if (existingWord) {
        return true
      }

      const response = await httpClient.post(API_URLS.words.query(), {
        word: word,
        translation: translation,
        pronunciation: '' // 暂时为空，后续可以扩展
      })
      
      if (response.data && response.data.code === 'SUCCESS') {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      // 如果是单词已存在的错误，不需要报错
      if (error.response?.status === 400 && error.response?.data?.message?.includes('已存在')) {
        return true
      }
      
      throw new DatabaseError(
        `保存单词失败: ${error.message}`,
        'SAVE_WORD_FAILED',
        { word, translation, error: error.response?.data || error.message }
      )
    }
  }

  /**
   * 执行实际的查询操作
   * @param word 单词
   * @returns 单词信息或null
   */
  private async performQueryOperation(word: string): Promise<WordInfo | null> {
    try {
      const response = await httpClient.get(`${API_URLS.words.query()}/${encodeURIComponent(word)}`)
      
      if (response.data && response.data.code === 'SUCCESS' && response.data.data) {
        const wordData = response.data.data
        return {
          phonetic: wordData.pronunciation || '',
          definitions: wordData.translation ? [wordData.translation] : []
        }
      }
      
      return null
    } catch (error: any) {
      if (error.response?.status === 404) {
        // 单词不存在，返回null
        return null
      }
      
      throw new DatabaseError(
        `查询单词失败: ${error.message}`,
        'QUERY_WORD_FAILED',
        { word, error: error.response?.data || error.message }
      )
    }
  }

  /**
   * 验证单词是否有效
   * @param word 单词
   * @returns 是否有效
   */
  private isValidWordInternal(word: string): boolean {
    // 使用单词验证器进行验证
    return isValidWord(word)
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
   * 清理过期缓存
   */
  private cleanupCache(): void {
    // 简化的缓存清理逻辑
    if (this.wordExistsCache.size > this.MAX_CACHE_SIZE) {
      // 清理一半缓存
      const entries = Array.from(this.wordExistsCache.entries())
      const keepCount = Math.floor(this.MAX_CACHE_SIZE / 2)
      
      this.wordExistsCache.clear()
      
      // 保留最近的一半
      entries.slice(-keepCount).forEach(([key, value]) => {
        this.wordExistsCache.set(key, value)
      })
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getCacheStats(): { existsCache: number, requestCache: number } {
    return {
      existsCache: this.wordExistsCache.size,
      requestCache: this.requestCache.size
    }
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.wordExistsCache.clear()
    this.requestCache.clear()
  }
}

// 创建默认实例的工厂函数
export const createDatabaseService = (): DatabaseService => {
  return new DatabaseService()
}