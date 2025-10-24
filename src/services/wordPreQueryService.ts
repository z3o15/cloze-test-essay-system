/**
 * 前端单词预查询服务
 * 实现优化的查词翻译流程：先查词提交后台对比数据库，同时进行段落翻译
 */

import httpClient from '../utils/httpClient'
import { API_URLS } from '../config/api'

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

export interface WordTranslationCache {
  [word: string]: string
}

export class WordPreQueryService {
  private static readonly MAX_BATCH_SIZE = 100
  private static readonly RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY = 1000

  /**
   * 批量预查询单词翻译
   * @param words 单词数组
   * @param includeDetails 是否包含详细信息
   * @returns 预查询结果
   */
  static async batchPreQuery(
    words: string[], 
    includeDetails: boolean = true
  ): Promise<BatchPreQueryResult> {
    if (!words || words.length === 0) {
      return {
        known_words: [],
        unknown_words: [],
        cache_hit_rate: 0,
        total_words: 0,
        processing_time_ms: 0
      }
    }

    // 标准化和去重
    const normalizedWords = [...new Set(words.map(word => word.toLowerCase().trim()))]
      .filter(word => word.length > 0 && word.length <= 50)
      .slice(0, this.MAX_BATCH_SIZE)

  

    try {
      const response = await this.retryRequest(async () => {
        return await httpClient.post(API_URLS.words.batchPrequery(), {
          words: normalizedWords,
          include_details: includeDetails
        }, {
          timeout: 10000 // 10秒超时
        })
      })

      const result = response.data?.data as BatchPreQueryResult

      if (result) {
    
        return result
      } else {
        throw new Error('预查询响应格式错误')
      }

    } catch (error) {
      console.error('❌ 批量预查询失败:', error)
      
      // 降级处理：返回所有单词为未知
      return {
        known_words: [],
        unknown_words: normalizedWords,
        cache_hit_rate: 0,
        total_words: normalizedWords.length,
        processing_time_ms: 0
      }
    }
  }

  /**
   * 获取单个单词翻译
   * @param word 单词
   * @returns 单词翻译结果
   */
  static async getSingleWordTranslation(word: string): Promise<PreQueryWordResult | null> {
    const normalizedWord = word.toLowerCase().trim()
    
    if (!normalizedWord || normalizedWord.length === 0 || normalizedWord.length > 50) {
      return null
    }

    try {
      const response = await this.retryRequest(async () => {
        return await httpClient.get(API_URLS.words.prequerySingle(normalizedWord), {
          timeout: 5000 // 5秒超时
        })
      })

      if (response.data?.code === 'SUCCESS' && response.data?.data) {
        return response.data.data as PreQueryWordResult
      } else if (response.data?.code === 'NOT_FOUND') {
        return null
      } else {
        throw new Error('单词查询响应格式错误')
      }

    } catch (error) {
      console.warn(`⚠️ 单词查询失败: ${normalizedWord}`, error)
      return null
    }
  }

  /**
   * 将预查询结果转换为翻译缓存格式
   * @param preQueryResult 预查询结果
   * @returns 翻译缓存对象
   */
  static convertToTranslationCache(preQueryResult: BatchPreQueryResult): WordTranslationCache {
    const cache: WordTranslationCache = {}
    
    preQueryResult.known_words.forEach(wordResult => {
      cache[wordResult.word.toLowerCase()] = wordResult.translation
    })
    
    return cache
  }

  /**
   * 异步补充未知单词翻译
   * @param unknownWords 未知单词数组
   * @param onWordTranslated 单词翻译完成回调
   * @returns Promise<void>
   */
  static async supplementUnknownWords(
    unknownWords: string[],
    onWordTranslated?: (word: string, translation: string) => void
  ): Promise<void> {
    if (!unknownWords || unknownWords.length === 0) {
      return
    }



    // 分批处理，避免过多并发请求
    const batchSize = 10
    const concurrencyLimit = 3

    for (let i = 0; i < unknownWords.length; i += batchSize) {
      const batch = unknownWords.slice(i, i + batchSize)
      
      // 限制并发数量
      const promises = batch.map(async (word, index) => {
        // 添加延迟，避免请求过于密集
        await new Promise(resolve => setTimeout(resolve, index * 200))
        
        try {
          const translation = await this.translateSingleWord(word)
          if (translation && onWordTranslated) {
            onWordTranslated(word, translation)
          }
          return { word, translation, success: true }
        } catch (error) {
          console.warn(`⚠️ 补充单词翻译失败: ${word}`, error)
          return { word, translation: null, success: false }
        }
      })

      // 等待当前批次完成
      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.success).length
      
      console.log(`📊 批次 ${Math.floor(i / batchSize) + 1} 完成: ${successCount}/${batch.length} 成功`)

      // 批次间添加短暂延迟
      if (i + batchSize < unknownWords.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }


  }

  /**
   * 翻译单个单词（使用现有翻译API）
   * @param word 单词
   * @returns 翻译结果
   */
  private static async translateSingleWord(word: string): Promise<string | null> {
    try {
      const response = await httpClient.post(API_URLS.translate.translate(), {
        text: word,
        source_lang: 'en',
        target_lang: 'zh'
      }, {
        timeout: 8000
      })

      const translation = response?.data?.data?.target_text || 
                         response?.data?.data?.translation ||
                         response?.data?.translation ||
                         ''

      return translation.trim() || null

    } catch (error) {
      console.warn(`单词翻译失败: ${word}`, error)
      return null
    }
  }

  /**
   * 重试请求机制
   * @param requestFn 请求函数
   * @param attempts 重试次数
   * @returns Promise<any>
   */
  private static async retryRequest(
    requestFn: () => Promise<any>,
    attempts: number = this.RETRY_ATTEMPTS
  ): Promise<any> {
    let lastError: any

    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        if (i < attempts - 1) {
          const delay = this.RETRY_DELAY * Math.pow(2, i) // 指数退避
          console.warn(`⚠️ 请求失败，${delay}ms后重试 (${i + 1}/${attempts})`, error)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  /**
   * 清除预查询缓存
   * @param words 要清除的单词数组，如果为空则清除所有
   */
  static async clearCache(words?: string[]): Promise<void> {
    try {
      await httpClient.delete(API_URLS.words.clearCache(), {
        data: words ? { words } : undefined
      })
      

    } catch (error) {
      console.error('❌ 清除缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(): Promise<any> {
    try {
      const response = await httpClient.get(API_URLS.words.cacheStats())
      return response.data?.data || {}
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error)
      return {}
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await httpClient.get(API_URLS.words.health())
      return response.data?.code === 'SUCCESS'
    } catch (error) {
      console.error('❌ 预查询服务健康检查失败:', error)
      return false
    }
  }
}

export default WordPreQueryService