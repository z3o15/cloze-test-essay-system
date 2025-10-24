/**
 * 增强翻译服务 - 按照新的业务流程设计
 * 
 * 新流程：
 * 1. 启动并行处理：段落翻译 + 61个单词预查询
 * 2. 段落翻译 -> 成功
 * 3. 61个单词预查询 -> 匹配到15个数据库已有单词(有1-10级别)，跳过腾讯翻译
 * 4. 剩余单词去重，假如去掉4个重复，剩余44个
 * 5. 剩余44个使用腾讯翻译获取音标翻译，同步（并行）将这些单词输入到火山大模型获取级别1-10
 * 6. 最后将这些单词44个导入数据库
 * 7. 最后按照4级难度以上显示，以下不显示完成单词部分单词翻译工作
 */

import WordPreQueryService, { BatchPreQueryResult, WordTranslationCache } from './wordPreQueryService'
import { translateText } from '../utils/translateService'
import { isValidWord } from '../utils/wordValidator'
import httpClient from '../utils/httpClient'
import { API_URLS } from '../config/api'

// 火山大模型API配置
interface VolcanoModelConfig {
  apiKey: string
  endpoint: string
  model: string
}

// 腾讯翻译API配置
interface TencentTranslationConfig {
  secretId: string
  secretKey: string
  region: string
}

// 单词详细信息
export interface WordDetail {
  english: string
  chinese: string
  phonetic?: string
  difficulty_level: number // 1-10级别
  source: 'database' | 'tencent_api' | 'volcano_model'
  created_at?: string
}

// 增强翻译结果
export interface EnhancedTranslationResult {
  // 段落翻译结果
  paragraphTranslation: string
  paragraphSuccess: boolean
  
  // 单词处理结果
  wordProcessing: {
    totalWords: number
    databaseMatched: WordDetail[] // 数据库匹配的单词
    newWordsProcessed: WordDetail[] // 新处理的单词
    duplicatesRemoved: number
    displayedWords: WordDetail[] // 2级以上显示的单词
  }
  
  // 性能统计
  performance: {
    totalTimeMs: number
    paragraphTimeMs: number
    prequeryTimeMs: number
    tencentTranslationTimeMs: number
    volcanoModelTimeMs: number
    databaseInsertTimeMs: number
  }
  
  // 状态信息
  status: {
    paragraphSuccess: boolean
    prequerySuccess: boolean
    tencentTranslationSuccess: boolean
    volcanoModelSuccess: boolean
    databaseInsertSuccess: boolean
    errors: string[]
  }
}

// 翻译选项
export interface EnhancedTranslationOptions {
  // 显示难度阈值
  difficultyThreshold: number // 默认2级以上显示
  
  // API配置
  volcanoConfig?: VolcanoModelConfig
  tencentConfig?: TencentTranslationConfig
  
  // 超时设置
  timeouts: {
    paragraph: number
    prequery: number
    tencentTranslation: number
    volcanoModel: number
    databaseInsert: number
  }
  
  // 并发控制
  concurrency: {
    maxParallelWords: number
    batchSize: number
  }
}

export class EnhancedTranslationService {
  private static readonly DEFAULT_OPTIONS: EnhancedTranslationOptions = {
    difficultyThreshold: 2,
    timeouts: {
      paragraph: 60000,      // 60秒 - 增加到60秒以处理长文本
      prequery: 10000,       // 10秒
      tencentTranslation: 60000, // 60秒
      volcanoModel: 45000,   // 45秒
      databaseInsert: 15000  // 15秒
    },
    concurrency: {
      maxParallelWords: 50,
      batchSize: 20
    }
  }

  // 存储火山AI返回的单词数据
  private static volcanoWordData: Map<string, any> = new Map()

  /**
   * 存储火山AI返回的单词数据
   */
  private static storeVolcanoWordData(wordTranslations: any[]): void {
    console.log('存储火山AI单词数据:', wordTranslations)
    
    wordTranslations.forEach(wordData => {
      if (wordData.word && wordData.word.trim()) {
        const key = wordData.word.toLowerCase().trim()
        this.volcanoWordData.set(key, wordData)
        console.log(`存储单词数据: ${key} ->`, wordData)
      }
    })
  }

  /**
   * 获取火山AI单词数据
   */
  private static getVolcanoWordData(word: string): any | null {
    const key = word.toLowerCase().trim()
    return this.volcanoWordData.get(key) || null
  }

  /**
   * 清空火山AI单词数据缓存
   */
  private static clearVolcanoWordData(): void {
    this.volcanoWordData.clear()
  }

  /**
   * 处理火山AI返回的单词数据
   */
  private static async processVolcanoWordData(
    words: string[],
    result: EnhancedTranslationResult,
    opts: EnhancedTranslationOptions
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      console.log('开始处理火山AI单词数据...')
      
      // 处理每个单词
      for (const word of words) {
        const volcanoData = this.getVolcanoWordData(word)
        
        if (volcanoData) {
          // 火山AI有数据
          const wordDetail: WordDetail = {
            english: word,
            chinese: volcanoData.translatedWord || volcanoData.translation || word,
            phonetic: volcanoData.phonetic || '',
            difficulty_level: volcanoData.difficultyLevel || 1,
            source: volcanoData.source === 'database' ? 'database' : 'volcano_model'
          }
          
          if (volcanoData.source === 'database') {
            result.wordProcessing.databaseMatched.push(wordDetail)
          } else {
            result.wordProcessing.newWordsProcessed.push(wordDetail)
          }
          
          console.log(`处理单词: ${word} -> ${wordDetail.chinese} (难度: ${wordDetail.difficulty_level}, 来源: ${wordDetail.source})`)
        } else {
          // 火山AI没有数据，创建默认条目
          const wordDetail: WordDetail = {
            english: word,
            chinese: word, // 保持原词
            phonetic: '',
            difficulty_level: 1,
            source: 'database'
          }
          
          result.wordProcessing.databaseMatched.push(wordDetail)
          console.log(`单词无火山AI数据: ${word} (使用默认)`)
        }
      }
      
      // 合并所有单词数据
      const allWords = [...result.wordProcessing.databaseMatched, ...result.wordProcessing.newWordsProcessed]
      
      // 根据难度阈值过滤显示的单词
      result.wordProcessing.displayedWords = allWords.filter(word => 
        word.difficulty_level >= opts.difficultyThreshold
      )
      
      result.performance.volcanoModelTimeMs = Date.now() - startTime
      result.status.volcanoModelSuccess = true
      
    } catch (error) {
      console.error('处理火山AI单词数据失败:', error)
      result.status.errors.push(`火山AI单词处理失败: ${error}`)
      result.performance.volcanoModelTimeMs = Date.now() - startTime
    }
  }

  /**
   * 主要翻译方法 - 按照新流程处理
   */
  static async translateWithEnhancedFlow(
    text: string,
    options: Partial<EnhancedTranslationOptions> = {}
  ): Promise<EnhancedTranslationResult> {
    const startTime = Date.now()
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    
    // 初始化结果对象
    const result: EnhancedTranslationResult = {
      paragraphTranslation: '',
      paragraphSuccess: false,
      wordProcessing: {
        totalWords: 0,
        databaseMatched: [],
        newWordsProcessed: [],
        duplicatesRemoved: 0,
        displayedWords: []
      },
      performance: {
        totalTimeMs: 0,
        paragraphTimeMs: 0,
        prequeryTimeMs: 0,
        tencentTranslationTimeMs: 0,
        volcanoModelTimeMs: 0,
        databaseInsertTimeMs: 0
      },
      status: {
        paragraphSuccess: false,
        prequerySuccess: false,
        tencentTranslationSuccess: false,
        volcanoModelSuccess: false,
        databaseInsertSuccess: false,
        errors: []
      }
    }

    try {
      // 清空之前的火山AI数据缓存
      this.clearVolcanoWordData()
      
      // 提取单词
      const words = this.extractWordsFromText(text)
      result.wordProcessing.totalWords = words.length
      
      console.log(`开始段落翻译....`)
      console.log(`提取到 ${words.length} 个单词:`, words)

      // 步骤1: 调用增强翻译API（包含段落翻译和单词处理）
      const paragraphStartTime = Date.now()
      result.paragraphTranslation = await this.translateParagraphTask(text, opts.timeouts.paragraph)
      result.performance.paragraphTimeMs = Date.now() - paragraphStartTime
      result.paragraphSuccess = true
      result.status.paragraphSuccess = true
      
      console.log('段落翻译完成，开始处理火山AI单词数据...')
      
      // 步骤2: 处理火山AI返回的单词数据
      await this.processVolcanoWordData(words, result, opts)

      console.log(`段落翻译成功......`)
      console.log(`火山AI单词处理完成......`)

      // 计算总耗时
      result.performance.totalTimeMs = Date.now() - startTime
      
      console.log(`增强翻译完成: 段落翻译=${result.paragraphSuccess ? '成功' : '失败'}, 单词处理=${result.status.volcanoModelSuccess ? '成功' : '失败'}, 总耗时=${result.performance.totalTimeMs}ms`)
      console.log(`单词统计: 总计${result.wordProcessing.totalWords}个, 数据库匹配${result.wordProcessing.databaseMatched.length}个, 新处理${result.wordProcessing.newWordsProcessed.length}个, 显示${result.wordProcessing.displayedWords.length}个`)

    } catch (error) {
      result.status.errors.push(`翻译流程失败: ${error.message}`)
    }

    return result
  }

  /**
   * 步骤1: 并行处理段落翻译和单词预查询
   */
  private static async processParallelTasks(
    text: string,
    words: string[],
    opts: EnhancedTranslationOptions,
    result: EnhancedTranslationResult
  ): Promise<void> {
    const tasks = []

    // 任务1: 段落翻译
    const paragraphTask = this.translateParagraphTask(text, opts.timeouts.paragraph)
      .then(translation => {
        result.paragraphTranslation = translation
        result.paragraphSuccess = true
        result.status.paragraphSuccess = true
      })
      .catch(error => {
        result.status.errors.push(`段落翻译失败: ${error.message}`)
      })

    tasks.push(paragraphTask)

    // 任务2: 单词预查询
    if (words.length > 0) {
      const prequeryTask = this.prequeryWordsTask(words, opts)
        .then(prequeryData => {
          if (prequeryData && typeof prequeryData.timeMs === 'number') {
            result.performance.prequeryTimeMs = prequeryData.timeMs
            // 将预查询结果暂存，后续处理
            (result as any)._prequeryResult = prequeryData.result
            result.status.prequerySuccess = true
          } else {
            result.status.prequerySuccess = false
            result.performance.prequeryTimeMs = 0
          }
        })
        .catch(error => {
          result.status.errors.push(`单词预查询失败: ${error.message}`)
          result.status.prequerySuccess = false
          result.performance.prequeryTimeMs = 0 // 设置默认值
        })

      tasks.push(prequeryTask)
    } else {
      result.status.prequerySuccess = true
    }

    // 等待所有并行任务完成
    await Promise.allSettled(tasks)
  }

  /**
   * 段落翻译任务 - 调用增强翻译API
   */
  private static async translateParagraphTask(
    text: string,
    timeout: number
  ): Promise<string> {
    const startTime = Date.now()

    try {
      console.log('开始调用增强翻译API...')
      
      // 调用增强翻译API而不是基础翻译API
      const response = await Promise.race([
        httpClient.post(API_URLS.enhanced.paragraph(), {
          text: text,
          source_lang: 'en',
          target_lang: 'zh',
          enableWordTranslation: true,
          enableBatchTranslation: true
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('段落翻译超时')), timeout)
        )
      ]) as any

      console.log('增强翻译API响应:', response)
      
      // 解析增强翻译API的响应格式
      const data = response?.data
      if (data && data.code === 'SUCCESS' && data.data) {
        const translation = data.data.translated || data.data.target_text || ''
        console.log('增强翻译API调用成功，返回结果:', translation)
        console.log('单词翻译数据:', data.data.word_translations)
        console.log('批量统计:', data.data.batch_stats)
        
        // 存储火山AI返回的单词数据到全局变量，供后续处理使用
        if (data.data.word_translations && Array.isArray(data.data.word_translations)) {
          this.storeVolcanoWordData(data.data.word_translations)
        }
        
        return translation
      } else {
        console.error('增强翻译API响应格式错误:', data)
        throw new Error('增强翻译API返回格式错误')
      }

    } catch (error) {
      console.error('增强翻译任务失败:', error)
      // 降级到基础翻译API
      console.log('降级到基础翻译API...')
      try {
        const fallbackTranslation = await translateText(text)
        console.log('基础翻译API调用成功，返回结果:', fallbackTranslation)
        return fallbackTranslation || ''
      } catch (fallbackError) {
        console.error('基础翻译API也失败:', fallbackError)
        throw error
      }
    }
  }

  /**
   * 单词预查询任务
   */
  private static async prequeryWordsTask(
    words: string[],
    opts: EnhancedTranslationOptions
  ): Promise<{ result: BatchPreQueryResult; timeMs: number }> {
    const startTime = Date.now()

    try {
      const result = await Promise.race([
        WordPreQueryService.batchPreQuery(words),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('单词预查询超时')), opts.timeouts.prequery)
        )
      ]) as BatchPreQueryResult

      const timeMs = Date.now() - startTime
      return { result, timeMs }

    } catch (error) {
      throw error
    }
  }

  /**
   * 步骤2: 处理预查询结果，分离已知和未知单词
   */
  private static processPrequeryResults(
    result: EnhancedTranslationResult
  ): { knownWords: WordDetail[]; unknownWords: string[] } {
    const prequeryResult = (result as any)._prequeryResult as BatchPreQueryResult
    
    if (!prequeryResult) {
      return { knownWords: [], unknownWords: [] }
    }

    // 处理已知单词（数据库匹配的）
    const knownWords: WordDetail[] = Object.entries(prequeryResult.known_words || {})
      .map(([word, translation]) => ({
        english: word,
        chinese: translation,
        difficulty_level: this.extractDifficultyFromTranslation(translation),
        source: 'database' as const
      }))

    result.wordProcessing.databaseMatched = knownWords

    // 未知单词列表
    const unknownWords = prequeryResult.unknown_words || []

    return { knownWords, unknownWords }
  }

  /**
   * 步骤3: 去重单词
   */
  private static deduplicateWords(words: string[]): string[] {
    return [...new Set(words.map(word => word.toLowerCase()))]
  }

  /**
   * 步骤4: 并行处理未知单词 - 腾讯翻译 + 火山大模型
   */
  private static async processUnknownWordsParallel(
    words: string[],
    opts: EnhancedTranslationOptions,
    result: EnhancedTranslationResult
  ): Promise<void> {


    const tasks = []

    // 任务1: 腾讯翻译获取音标和翻译
    const tencentTask = this.translateWordsWithTencent(words, opts)
      .then(translations => {
        result.performance.tencentTranslationTimeMs = Date.now() - Date.now()
        result.status.tencentTranslationSuccess = true
        // 暂存腾讯翻译结果
        (result as any)._tencentTranslations = translations
      })
      .catch(error => {
        result.status.errors.push(`腾讯翻译失败: ${error.message}`)
      })

    tasks.push(tencentTask)

    // 任务2: 火山大模型获取难度级别
    const volcanoTask = this.getWordDifficultyFromVolcano(words, opts)
      .then(difficulties => {
        result.performance.volcanoModelTimeMs = Date.now() - Date.now()
        result.status.volcanoModelSuccess = true
        // 暂存火山大模型结果
        (result as any)._volcanoDifficulties = difficulties
      })
      .catch(error => {
        result.status.errors.push(`火山大模型失败: ${error.message}`)
      })

    tasks.push(volcanoTask)

    // 等待并行任务完成
    await Promise.allSettled(tasks)

    // 合并结果
    this.mergeTranslationResults(result)
  }

  /**
   * 腾讯翻译API调用 (模拟实现)
   */
  private static async translateWordsWithTencent(
    words: string[],
    opts: EnhancedTranslationOptions
  ): Promise<Array<{ english: string; chinese: string; phonetic?: string }>> {
    const startTime = Date.now()
    
    // TODO: 实际调用腾讯翻译API
    // 这里先模拟实现
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const translations = words.map(word => ({
      english: word,
      chinese: `${word}的中文翻译`, // 模拟翻译结果
      phonetic: `/${word}/` // 模拟音标
    }))


    return translations
  }

  /**
   * 火山大模型API调用 (模拟实现)
   */
  private static async getWordDifficultyFromVolcano(
    words: string[],
    opts: EnhancedTranslationOptions
  ): Promise<Record<string, number>> {
    const startTime = Date.now()
    
    // TODO: 实际调用火山大模型API
    // 这里先模拟实现
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const difficulties: Record<string, number> = {}
    words.forEach(word => {
      // 模拟难度级别 1-10
      difficulties[word] = Math.floor(Math.random() * 10) + 1
    })


    return difficulties
  }

  /**
   * 合并翻译结果
   */
  private static mergeTranslationResults(result: EnhancedTranslationResult): void {
    const tencentTranslations = (result as any)._tencentTranslations || []
    const volcanoDifficulties = (result as any)._volcanoDifficulties || {}

    const newWordsProcessed: WordDetail[] = tencentTranslations.map((translation: any) => ({
      english: translation.english,
      chinese: translation.chinese,
      phonetic: translation.phonetic,
      difficulty_level: volcanoDifficulties[translation.english] || 5, // 默认5级
      source: 'tencent_api' as const,
      created_at: new Date().toISOString()
    }))

    result.wordProcessing.newWordsProcessed = newWordsProcessed
  }

  /**
   * 步骤5: 批量导入数据库
   */
  private static async batchInsertToDatabase(
    words: WordDetail[],
    opts: EnhancedTranslationOptions,
    result: EnhancedTranslationResult
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // TODO: 实际的数据库批量插入操作
      // 这里先模拟实现
      await new Promise(resolve => setTimeout(resolve, 500))
      
      result.performance.databaseInsertTimeMs = Date.now() - startTime
      result.status.databaseInsertSuccess = true
      
    } catch (error) {
      result.status.errors.push(`数据库导入失败: ${error.message}`)
    }
  }

  /**
   * 步骤6: 按难度级别过滤显示
   */
  private static filterWordsByDifficulty(
    result: EnhancedTranslationResult,
    threshold: number
  ): void {
    const allWords = [
      ...result.wordProcessing.databaseMatched,
      ...result.wordProcessing.newWordsProcessed
    ]

    result.wordProcessing.displayedWords = allWords.filter(
      word => word.difficulty_level >= threshold
    )


  }

  /**
   * 从文本中提取单词
   */
  private static extractWordsFromText(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return []
    }

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .filter(word => isValidWord(word))

    return [...new Set(words)].slice(0, 200) // 最多处理200个单词
  }

  /**
   * 从翻译结果中提取难度级别 (临时方法)
   */
  private static extractDifficultyFromTranslation(translation: string): number {
    // 这里可以根据实际的数据库字段来提取难度级别
    // 暂时返回默认值
    return 5
  }
}

export default EnhancedTranslationService