// 增强翻译服务 - 实现"段落和单词分别翻译"方案
import httpClient from './httpClient'
import { API_URLS } from '../config/api'
import { saveTranslationToDatabase, queryWordFromDatabase } from './translation'

// 翻译结果接口
export interface TranslationResult {
  paragraphTranslation: string
  wordTranslations: WordTranslationResult[]
  conflicts: ConflictInfo[]
}

// 单词翻译结果接口
export interface WordTranslationResult {
  word: string
  translation: string
  source: 'database' | 'api' | 'local'
  cached: boolean
}

// 冲突信息接口
export interface ConflictInfo {
  word: string
  paragraphContext: string
  databaseTranslation: string
  apiTranslation: string
  recommendation: string
}

// 单词翻译缓存
const wordTranslationCache = new Map<string, WordTranslationResult>()
// 新增：段落翻译缓存（替代原映射服务中的缓存）
const paragraphTranslationCache = new Map<string, string>()

// 本地单词词典
const localWordDict: Record<string, string> = {
  'i': '我',
  'am': '是',
  'you': '你',
  'are': '是',
  'he': '他',
  'she': '她',
  'it': '它',
  'we': '我们',
  'they': '他们',
  'the': '这个',
  'a': '一个',
  'an': '一个',
  'and': '和',
  'or': '或者',
  'but': '但是',
  'in': '在',
  'on': '在',
  'at': '在',
  'to': '到',
  'for': '为了',
  'of': '的',
  'with': '和',
  'by': '通过',
  'from': '从',
  'up': '向上',
  'down': '向下',
  'out': '出去',
  'off': '关闭',
  'over': '在上面',
  'under': '在下面',
  'again': '再次',
  'further': '进一步',
  'then': '然后',
  'once': '一次'
}

// 提取文本中的单词
const extractWords = (text: string): string[] => {
  // 使用正则表达式提取单词，保留撇号
  const words = text.match(/\b[a-zA-Z']+\b/g) || []
  return words.map(word => word.toLowerCase().trim()).filter(word => word.length > 0)
}

// 查询单词翻译（优先级：数据库 > API > 本地词典）
const queryWordTranslation = async (word: string): Promise<WordTranslationResult> => {
  const normalizedWord = word.toLowerCase().trim()
  
  // 1. 检查缓存
  const cached = wordTranslationCache.get(normalizedWord)
  if (cached) {
    return { ...cached, cached: true }
  }

  // 2. 查询数据库
  try {
    const { queryWordFromDatabase } = await import('./translation')
    const dbResult = await queryWordFromDatabase(normalizedWord)
    if (dbResult && dbResult.translation) {
      const result: WordTranslationResult = {
        word: normalizedWord,
        translation: dbResult.translation,
        source: 'database',
        cached: false
      }
      wordTranslationCache.set(normalizedWord, result)
      return result
    }
  } catch (error) {
    console.warn(`数据库查询单词 "${normalizedWord}" 失败:`, error)
  }

  // 3. 通过API翻译单词
    try {
      const apiResponse = await httpClient.post(API_URLS.enhanced.words(), {
        text: normalizedWord,
        source_lang: 'en',
        target_lang: 'zh'
      })
    
    const apiTranslation = apiResponse?.data?.data?.target_text || 
                          apiResponse?.data?.data?.translation ||
                          apiResponse?.data?.translation ||
                          ''
    
    if (apiTranslation && apiTranslation.trim()) {
      const result: WordTranslationResult = {
        word: normalizedWord,
        translation: apiTranslation.trim(),
        source: 'api',
        cached: false
      }
      
      // 保存到数据库
      try {
        await saveWordToDatabase(normalizedWord, apiTranslation.trim())
      } catch (saveError) {
        console.warn(`保存单词 "${normalizedWord}" 到数据库失败:`, saveError)
      }
      
      wordTranslationCache.set(normalizedWord, result)
      return result
    }
  } catch (error) {
    console.warn(`API翻译单词 "${normalizedWord}" 失败:`, error)
  }

  // 4. 使用本地词典
  const localTranslation = localWordDict[normalizedWord]
  if (localTranslation) {
    const result: WordTranslationResult = {
      word: normalizedWord,
      translation: localTranslation,
      source: 'local',
      cached: false
    }
    wordTranslationCache.set(normalizedWord, result)
    return result
  }

  // 5. 如果都失败了，返回原词
  const result: WordTranslationResult = {
    word: normalizedWord,
    translation: normalizedWord,
    source: 'local',
    cached: false
  }
  return result
}

// 保存单词到数据库
const saveWordToDatabase = async (word: string, translation: string): Promise<void> => {
  try {
    await httpClient.post(API_URLS.words.query(), {
      word: word,
      translation: translation,
      pronunciation: '', // 可以后续扩展
      definition: ''
    })
  } catch (error) {
    console.error(`保存单词到数据库失败: ${word} -> ${translation}`, error)
    // 不再抛出错误，避免阻塞流程
  }
}

// 批量查询单词翻译（优化版本）
const batchQueryWordTranslations = async (words: string[]): Promise<WordTranslationResult[]> => {
  const results: WordTranslationResult[] = []
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().trim()))]
  
  // 1. 检查缓存
  const uncachedWords: string[] = []
  for (const word of uniqueWords) {
    const cached = wordTranslationCache.get(word)
    if (cached) {
      results.push({ ...cached, cached: true })
    } else {
      uncachedWords.push(word)
    }
  }
  
  if (uncachedWords.length === 0) {
    return results
  }
  
  // 2. 批量检查数据库
  let unknownWords: string[] = []
  try {
    const checkResponse = await httpClient.get(API_URLS.words.batch(), {
      params: { words: uncachedWords }
    })
    
    const existingWords = checkResponse?.data?.data?.existing || {}
    unknownWords = checkResponse?.data?.data?.unknown || uncachedWords
    
    // 处理数据库中已存在的单词
    for (const [word, wordData] of Object.entries(existingWords)) {
      const result: WordTranslationResult = {
        word,
        translation: (wordData as any).translation || word,
        source: 'database',
        cached: false
      }
      wordTranslationCache.set(word, result)
      results.push(result)
    }
  } catch (error) {
    console.warn('批量检查单词失败，使用单个查询:', error)
    unknownWords = uncachedWords
  }
  
  // 3. 处理未知单词
  for (const word of unknownWords) {
    // 先检查本地词典
    const localTranslation = localWordDict[word]
    if (localTranslation) {
      const result: WordTranslationResult = {
        word,
        translation: localTranslation,
        source: 'local',
        cached: false
      }
      wordTranslationCache.set(word, result)
      results.push(result)
      continue
    }
    
    // 使用API翻译
    try {
      const apiResponse = await httpClient.post(API_URLS.translate.translate(), {
        text: word,
        source_lang: 'en',
        target_lang: 'zh'
      })
      
      const apiTranslation = apiResponse?.data?.data?.target_text || 
                            apiResponse?.data?.data?.translation ||
                            apiResponse?.data?.translation ||
                            ''
      
      if (apiTranslation && apiTranslation.trim()) {
        const result: WordTranslationResult = {
          word,
          translation: apiTranslation.trim(),
          source: 'api',
          cached: false
        }
        
        // 异步保存到数据库，不阻塞流程
        saveWordToDatabase(word, apiTranslation.trim()).catch(error => {
          console.warn(`异步保存单词 "${word}" 失败:`, error)
        })
        
        wordTranslationCache.set(word, result)
        results.push(result)
      } else {
        // 翻译失败，返回原词
        const result: WordTranslationResult = {
          word,
          translation: word,
          source: 'local',
          cached: false
        }
        results.push(result)
      }
    } catch (error) {
      console.warn(`翻译单词 "${word}" 失败:`, error)
      // 翻译失败，返回原词
      const result: WordTranslationResult = {
        word,
        translation: word,
        source: 'local',
        cached: false
      }
      results.push(result)
    }
  }
  
  return results
}

// 翻译段落
const translateParagraph = async (text: string): Promise<string> => {
  const trimmedText = text.trim()
  
  // 检查本地段落缓存
  const cachedTranslation = paragraphTranslationCache.get(trimmedText)
  if (cachedTranslation) {
    return cachedTranslation
  }

  // 通过API翻译段落（带超时和重试）
  try {
    // 创建超时Promise
    const createTimeoutPromise = (ms: number): Promise<never> => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('翻译请求超时')), ms)
      })
    }

    // 重试机制
    let lastError: any
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await Promise.race([
          httpClient.post(API_URLS.enhanced.paragraph(), {
            text: trimmedText,
            source_lang: 'en',
            target_lang: 'zh'
          }, {
            timeout: 30000 // 30秒超时
          }),
          createTimeoutPromise(30000) // 30秒超时
        ])
        
        const translation = response?.data?.data?.translated || 
                           response?.data?.data?.target_text || 
                           response?.data?.data?.translation ||
                           response?.data?.translation ||
                           ''
        
        if (translation && translation.trim()) {
          // 缓存翻译结果（本地缓存，不再依赖映射服务）
          paragraphTranslationCache.set(trimmedText, translation.trim())
          
          // 保存到数据库
          try {
            const { saveTranslationToDatabase } = await import('./translation')
            await saveTranslationToDatabase(trimmedText, translation.trim())
          } catch (saveError) {
            console.warn('保存段落翻译到数据库失败:', saveError)
          }
          
          return translation.trim()
        }
        break // 成功获取响应，退出重试循环
      } catch (error) {
        lastError = error
        console.warn(`段落翻译第${attempt}次尝试失败:`, error)
        
        if (attempt < 3) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        }
      }
    }
    
    throw lastError || new Error('翻译失败')
  } catch (error) {
    console.error('段落翻译失败:', error)
    // 重新抛出错误，让调用方知道翻译失败了
    throw error
  }
}

// 检测翻译冲突
const detectTranslationConflicts = (
  paragraphTranslation: string,
  wordTranslations: WordTranslationResult[]
): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = []
  
  // 这里可以实现更复杂的冲突检测逻辑
  // 目前简化为检查单词翻译是否在段落翻译中出现
  
  return conflicts
}

// 主要的增强翻译函数
export const enhancedTranslate = async (text: string): Promise<TranslationResult> => {
  if (!text || typeof text !== 'string') {
    return {
      paragraphTranslation: '',
      wordTranslations: [],
      conflicts: []
    }
  }

  const trimmedText = text.trim()
  if (!trimmedText) {
    return {
      paragraphTranslation: '',
      wordTranslations: [],
      conflicts: []
    }
  }

  // 翻译段落
  const paragraphTranslation = await translateParagraph(trimmedText)
  
  // 提取单词
  const words = extractWords(trimmedText)
  
  // 批量查询单词翻译（优化：使用批量接口）
  const wordTranslations = await batchQueryWordTranslations(words)

  // 冲突检测（占位实现）
  const conflicts = detectTranslationConflicts(paragraphTranslation, wordTranslations)
  
  return {
    paragraphTranslation,
    wordTranslations,
    conflicts
  }
}

export const clearEnhancedTranslationCache = (): void => {
  wordTranslationCache.clear()
  paragraphTranslationCache.clear()
}

export const getEnhancedTranslationStats = () => {
  return {
    wordCacheSize: wordTranslationCache.size,
    paragraphCacheSize: paragraphTranslationCache.size
  }
}