// 单词翻译模块 - 处理单个单词的翻译逻辑
import type { IWordTranslator, TranslationConfig } from './types'
import httpClient from '../httpClient'
import { getCachedTranslation, cacheTranslation } from '../paragraphWordMappingService'
import { API_URLS } from '../../config/api'

export class WordTranslator implements IWordTranslator {
  private translationCache = new Map<string, string>()
  private pendingRequests = new Map<string, Promise<string>>()
  private config: TranslationConfig

  // 本地翻译词典
  private localTranslationDict: Record<string, string> = {
    'hello': '你好',
    'world': '世界',
    'good': '好的',
    'morning': '早上',
    'evening': '晚上',
    'night': '夜晚',
    'thank': '谢谢',
    'welcome': '欢迎',
    'please': '请',
    'sorry': '对不起',
    'excuse': '打扰',
    'me': '我',
    'yes': '是的',
    'no': '不',
    'ok': '好的',
    'fine': '很好',
    'great': '很棒',
    'wonderful': '精彩的',
    'beautiful': '美丽的',
    'the': '这个/那个',
    'and': '和/与',
    'is': '是',
    'are': '是',
    'was': '是/过去式',
    'were': '是/过去式',
    'in': '在...里',
    'on': '在...上',
    'at': '在',
    'to': '到/向',
    'of': '的',
    'for': '为了',
    'with': '和/用',
    'by': '通过/被',
    'from': '从',
    'up': '向上',
    'about': '关于',
    'into': '进入',
    'through': '通过',
    'during': '在...期间',
    'before': '在...之前',
    'after': '在...之后',
    'above': '在...上方',
    'below': '在...下方',
    'between': '在...之间',
    'among': '在...中间',
    'a': '一个',
    'an': '一个',
    'this': '这个',
    'that': '那个',
    'these': '这些',
    'those': '那些',
    'i': '我',
    'you': '你',
    'he': '他',
    'she': '她',
    'it': '它',
    'we': '我们',
    'they': '他们',
    'my': '我的',
    'your': '你的',
    'his': '他的',
    'her': '她的',
    'its': '它的',
    'our': '我们的',
    'their': '他们的'
  }

  constructor(config?: Partial<TranslationConfig>) {
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
        maxConcurrent: 5,
        requestDelay: 100
      },
      ...config
    }

    // 启动缓存清理定时器
    this.startCacheCleanup()
  }

  /**
   * 翻译单个单词
   * @param word 要翻译的单词
   * @param context 上下文（可选）
   * @returns 翻译结果
   */
  async translateWord(word: string, context?: string): Promise<string> {
    const normalizedWord = word.trim().toLowerCase()
    
    // 检查本地词典
    const localTranslation = this.getLocalTranslation(normalizedWord)
    if (localTranslation) {
      return localTranslation
    }

    // 检查缓存
    const cacheKey = context ? `${normalizedWord}_${context}` : normalizedWord
    const cachedTranslation = this.translationCache.get(cacheKey)
    if (cachedTranslation) {
      return cachedTranslation
    }

    // 检查是否有正在进行的请求
    const pendingRequest = this.pendingRequests.get(cacheKey)
    if (pendingRequest) {
      return pendingRequest
    }

    // 创建新的翻译请求
    const translationPromise = this.translateViaBackend(word, 'en', 'zh')
    this.pendingRequests.set(cacheKey, translationPromise)

    try {
      const translation = await translationPromise
      
      // 缓存结果
      this.translationCache.set(cacheKey, translation)
      
      // 清理待处理请求
      this.pendingRequests.delete(cacheKey)
      
      return translation
    } catch (error) {
      // 清理待处理请求
      this.pendingRequests.delete(cacheKey)
      throw error
    }
  }

  /**
   * 批量翻译单词
   * @param words 单词数组
   * @returns 翻译结果数组
   */
  async translateWords(words: string[]): Promise<string[]> {
    const translations: string[] = []
    
    // 使用并发控制
    for (let i = 0; i < words.length; i += this.config.concurrency.maxConcurrent) {
      const batch = words.slice(i, i + this.config.concurrency.maxConcurrent)
      const batchPromises = batch.map(word => this.translateWord(word))
      
      const batchResults = await Promise.all(batchPromises)
      translations.push(...batchResults)
      
      // 添加延迟以避免过于频繁的请求
      if (i + this.config.concurrency.maxConcurrent < words.length) {
        await this.delay(this.config.concurrency.requestDelay)
      }
    }
    
    return translations
  }

  /**
   * 翻译文本段落
   * @param text 要翻译的文本
   * @returns 翻译结果
   */
  async translateText(text: string): Promise<string> {
    // 检查段落缓存
    const cachedTranslation = getCachedTranslation(text)
    if (cachedTranslation) {
      return cachedTranslation
    }

    // 检查本地翻译
    const localTranslation = this.getLocalTranslation(text.trim().toLowerCase())
    if (localTranslation) {
      cacheTranslation(text, localTranslation)
      return localTranslation
    }

    // 通过后端翻译
    try {
      const translation = await this.translateViaBackend(text, 'en', 'zh')
      
      // 缓存翻译结果
      cacheTranslation(text, translation)
      
      return translation
    } catch (error) {
      console.error('翻译失败:', error)
      throw error
    }
  }

  /**
   * 批量翻译段落
   * @param texts 文本数组
   * @returns 翻译结果数组
   */
  async translateBatch(texts: string[]): Promise<string[]> {
    const translations: string[] = []
    
    for (let i = 0; i < texts.length; i += this.config.concurrency.maxConcurrent) {
      const batch = texts.slice(i, i + this.config.concurrency.maxConcurrent)
      const batchPromises = batch.map(text => this.translateText(text))
      
      const batchResults = await Promise.all(batchPromises)
      translations.push(...batchResults)
      
      // 添加延迟
      if (i + this.config.concurrency.maxConcurrent < texts.length) {
        await this.delay(this.config.concurrency.requestDelay)
      }
    }
    
    return translations
  }

  /**
   * 清除翻译缓存
   */
  clearTranslationCache(): void {
    this.translationCache.clear()
    this.pendingRequests.clear()
  }

  /**
   * 获取缓存大小
   * @returns 缓存条目数量
   */
  getTranslationCacheSize(): number {
    return this.translationCache.size
  }

  /**
   * 从本地词典获取翻译
   * @param text 要翻译的文本
   * @returns 翻译结果或null
   */
  private getLocalTranslation(text: string): string | null {
    return this.localTranslationDict[text.toLowerCase()] || null
  }

  /**
   * 通过后端API翻译
   * @param text 要翻译的文本
   * @param sourceLanguage 源语言
   * @param targetLanguage 目标语言
   * @returns 翻译结果
   */
  private async translateViaBackend(text: string, sourceLanguage = 'en', targetLanguage = 'zh'): Promise<string> {
    const timeoutPromise = this.createTimeoutPromise(10000) // 10秒超时
    
    const translationPromise = httpClient.post(API_URLS.translate.translate(), {
      text,
      source_lang: sourceLanguage,
      target_lang: targetLanguage
    })

    try {
      const response = await Promise.race([translationPromise, timeoutPromise])
      
      // 适配后端的实际响应格式: { success: true, data: { target_text: "翻译结果" } }
      if (response.data && response.data.success && response.data.data && response.data.data.target_text) {
        return response.data.data.target_text
      } else {
        console.error('翻译响应格式错误:', response.data)
        throw new Error('翻译响应格式错误')
      }
    } catch (error: any) {
      console.error('翻译API调用失败:', error)
      
      if (error.message === '请求超时') {
        throw new Error('翻译请求超时，请检查网络连接')
      }
      
      // 处理网络错误
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('翻译失败: 网络连接失败，请检查网络连接')
      }
      
      // 处理CORS错误
      if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
        throw new Error('翻译失败: 跨域访问被阻止，请联系管理员')
      }
      
      // 处理HTTP状态错误
      if (error.response) {
        const status = error.response.status
        const statusText = error.response.statusText || '未知错误'
        throw new Error(`翻译失败: 服务器错误 (${status}: ${statusText})`)
      }
      
      throw new Error(`翻译失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 创建超时Promise
   * @param ms 超时时间（毫秒）
   * @returns 超时Promise
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), ms)
    })
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
   * 启动缓存清理定时器
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache()
    }, this.config.cache.cleanupInterval)
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now()
    const maxAge = this.config.cache.maxAge
    
    // 这里简化处理，实际应该记录缓存时间戳
    if (this.translationCache.size > this.config.cache.maxSize) {
      // 清理一半缓存
      const entries = Array.from(this.translationCache.entries())
      const keepCount = Math.floor(this.config.cache.maxSize / 2)
      
      this.translationCache.clear()
      
      // 保留最近的一半
      entries.slice(-keepCount).forEach(([key, value]) => {
        this.translationCache.set(key, value)
      })
    }
  }
}

// 创建默认实例的工厂函数
export const createWordTranslator = (config?: Partial<TranslationConfig>): WordTranslator => {
  return new WordTranslator(config)
}

// 单词翻译器：去除段落-单词映射依赖，仅保留本地缓存 + 数据库 + API
import httpClient from '../httpClient'

// 本地缓存
const wordCache = new Map<string, string>()

export const translateWord = async (word: string): Promise<string> => {
  const normalized = (word || '').toLowerCase().trim()
  if (!normalized) return ''

  // 1) 缓存优先
  if (wordCache.has(normalized)) return wordCache.get(normalized) as string

  // 2) 数据库查询
  try {
    const { queryWordFromDatabase } = await import('../translation')
    const db = await queryWordFromDatabase(normalized)
    if (db?.translation) {
      wordCache.set(normalized, db.translation)
      return db.translation
    }
  } catch (e) {
    console.warn('查询数据库单词失败:', e)
  }

  // 3) 调用 API 翻译
  try {
    const res = await httpClient.post('/api/translate', {
      text: normalized,
      source_lang: 'en',
      target_lang: 'zh'
    })
    const t = res?.data?.data?.target_text || res?.data?.data?.translation || res?.data?.translation || ''
    if (t && t.trim()) {
      const tr = t.trim()
      wordCache.set(normalized, tr)
      // 异步保存数据库
      try {
        const { saveWordToDatabase } = await import('../translation')
        await saveWordToDatabase(normalized, tr)
      } catch (err) {
        console.warn('保存单词到数据库失败:', err)
      }
      return tr
    }
  } catch (e) {
    console.warn('API 翻译单词失败:', e)
  }

  // 4) 失败则返回原词
  wordCache.set(normalized, normalized)
  return normalized
}