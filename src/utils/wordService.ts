// 单词服务模块 - 简化版本，优先使用数据库，然后本地词典
import { queryWordFromDatabase } from './databaseService'


// 单词信息接口
export interface WordInfo {
  phonetic: string
  definitions: string[]
  difficultyLevel?: number  // 难度级别 (1-10)
  partOfSpeech?: string     // 词性
}

// 分词结果接口
export interface Token {
  type: 'word' | 'punctuation' | 'space'
  text: string
}

// 单词缓存
const wordCache = new Map<string, WordInfo>()

// 待处理请求缓存（避免重复请求）
const pendingRequests = new Map<string, Promise<WordInfo | null>>()

// 本地词典 - 包含常用词汇
const localDictionary: Record<string, WordInfo> = {
  'hello': {
    phonetic: '/həˈloʊ/',
    definitions: ['你好', '问候语']
  },
  'world': {
    phonetic: '/wɜːrld/',
    definitions: ['世界', '地球']
  },
  'beautiful': {
    phonetic: '/ˈbjuːtɪfəl/',
    definitions: ['美丽的', '漂亮的', '美好的']
  },
  'the': {
    phonetic: '/ðə/',
    definitions: ['这个', '那个', '定冠词']
  },
  'and': {
    phonetic: '/ænd/',
    definitions: ['和', '与', '连词']
  },
  'is': {
    phonetic: '/ɪz/',
    definitions: ['是', '动词be的第三人称单数']
  },
  'in': {
    phonetic: '/ɪn/',
    definitions: ['在...里面', '介词']
  },
  'to': {
    phonetic: '/tuː/',
    definitions: ['到', '向', '介词']
  },
  'of': {
    phonetic: '/ʌv/',
    definitions: ['的', '属于', '介词']
  },
  'a': {
    phonetic: '/ə/',
    definitions: ['一个', '不定冠词']
  },
  'that': {
    phonetic: '/ðæt/',
    definitions: ['那个', '指示代词']
  },
  'cat': {
    phonetic: '/kæt/',
    definitions: ['猫', '猫咪']
  },
  'sleeping': {
    phonetic: '/ˈsliːpɪŋ/',
    definitions: ['睡觉', '正在睡觉']
  },
  'test': {
    phonetic: '/test/',
    definitions: ['测试', '试验']
  },
  'love': {
    phonetic: '/lʌv/',
    definitions: ['爱', '喜欢']
  },
  'programming': {
    phonetic: '/ˈproʊɡræmɪŋ/',
    definitions: ['编程', '程序设计']
  }
}

// 判断单词难度级别
export const determineWordLevel = (word: string): 'basic' | 'intermediate' | 'advanced' => {
  const basicWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are', 'you', 'this', 'be', 'at', 'by', 'not', 'or', 'have', 'from', 'they', 'we', 'say', 'her', 'she', 'an', 'each', 'which', 'do', 'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'what', 'see', 'him', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part']
  
  if (basicWords.includes(word.toLowerCase())) {
    return 'basic'
  }
  
  // 非基础词汇默认为中等难度
  return 'intermediate'
}

// 判断是否为高级词汇
export const isAdvancedWord = (word: string): boolean => {
  return determineWordLevel(word) === 'advanced'
}



// 内部查询函数 - 优先从数据库查询，然后本地词典，最后AI分析并存储
const queryWordInternal = async (word: string, contextText?: string): Promise<WordInfo | null> => {
  const normalizedWord = word.toLowerCase().trim()
  
  // 1. 检查缓存
  if (wordCache.has(normalizedWord)) {
    return wordCache.get(normalizedWord) || null
  }
  
  // 2. 检查本地词典（基本词汇）
  if (localDictionary[normalizedWord]) {
    return localDictionary[normalizedWord]
  }
  
  // 3. 检查是否有正在进行的请求
  if (pendingRequests.has(normalizedWord)) {
    return await pendingRequests.get(normalizedWord)!
  }
  
  // 4. 数据库查询 + AI分析存储
  const queryPromise = (async () => {
    try {
      // 先查询数据库
      const databaseResult = await queryWordFromDatabase(normalizedWord)
      if (databaseResult) {
        // 缓存结果
        wordCache.set(normalizedWord, databaseResult)
        return databaseResult
      }
      
      // 数据库没有，调用AI分析并自动存储
      console.log(`🤖 单词 "${normalizedWord}" 不在数据库中，调用AI分析...`)
      
      // 动态导入httpClient和API_URLS避免循环依赖
      const { default: httpClient } = await import('./httpClient')
      const { API_URLS } = await import('../config/api')
      
      // 调用AI单词处理接口
      const aiResponse = await httpClient.post(API_URLS.aiWords.processSingle(), {
        word: normalizedWord
      })
      
      if (aiResponse.data?.code === 'SUCCESS' && aiResponse.data?.data) {
        const aiResult = aiResponse.data.data
        
        // 转换为WordInfo格式
        const wordInfo: WordInfo = {
          phonetic: aiResult.pronunciation || '',
          definitions: aiResult.translations || [aiResult.translation || '暂无释义'],
          difficultyLevel: aiResult.difficultyLevel || aiResult.difficulty_level,
          partOfSpeech: aiResult.partOfSpeech || aiResult.part_of_speech
        }
        
        // 缓存结果
        wordCache.set(normalizedWord, wordInfo)
        console.log(`✅ 单词 "${normalizedWord}" AI分析完成并已存储到数据库`)
        
        return wordInfo
      }
    } catch (error) {
      console.warn(`查询单词 "${normalizedWord}" 失败:`, error)
    }
    
    // 如果都没有找到，返回null
    return null
  })()
  
  // 缓存请求Promise
  pendingRequests.set(normalizedWord, queryPromise)
  
  try {
    const result = await queryPromise
    return result
  } finally {
    // 清理pending请求
    pendingRequests.delete(normalizedWord)
  }
}

// 主要的单词查询函数
export const queryWord = async (word: string, contextText?: string): Promise<WordInfo | null> => {
  if (!word || typeof word !== 'string') {
    return null
  }
  
  return await queryWordInternal(word, contextText)
}

// 提取文本中的单词
export const extractWords = (text: string): string[] => {
  // 直接提取所有英文单词
  const allWords = text.match(/\b[a-zA-Z]+\b/g) || []
  return [...new Set(allWords.map(word => word.toLowerCase()))]
}

// 文本分词函数
export const tokenizeText = (text: string): Token[] => {
  const tokens: Token[] = []
  const regex = /(\b[a-zA-Z]+\b)|(\s+)|([^\w\s])/g
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // 单词
      tokens.push({ type: 'word', text: match[1] })
    } else if (match[2]) {
      // 空格
      tokens.push({ type: 'space', text: match[2] })
    } else if (match[3]) {
      // 标点符号
      tokens.push({ type: 'punctuation', text: match[3] })
    }
  }
  
  return tokens
}

// 清空单词缓存
export const clearWordCache = (): void => {
  wordCache.clear()
  pendingRequests.clear()
}

// 获取缓存大小
export const getWordCacheSize = (): number => {
  return wordCache.size
}

// 添加到本地词典
export const addToLocalDictionary = (word: string, info: WordInfo): void => {
  const normalizedWord = word.toLowerCase().trim()
  localDictionary[normalizedWord] = info
}

// 数据对比机制：比较数据库查询结果与本地词典数据
export const compareWordData = (word: string, databaseResult: WordInfo | null, localResult: WordInfo | null): {
  source: 'database' | 'local' | 'both' | 'none'
  hasDifficultyLevel: boolean
  differences: string[]
} => {
  const differences: string[] = []
  
  if (databaseResult && localResult) {
    // 比较音标
    if (databaseResult.phonetic !== localResult.phonetic) {
      differences.push(`音标不同: 数据库[${databaseResult.phonetic}] vs 本地[${localResult.phonetic}]`)
    }
    
    // 比较释义
    const dbDefs = databaseResult.definitions.join(', ')
    const localDefs = localResult.definitions.join(', ')
    if (dbDefs !== localDefs) {
      differences.push(`释义不同: 数据库[${dbDefs}] vs 本地[${localDefs}]`)
    }
    
    return {
      source: 'both',
      hasDifficultyLevel: !!databaseResult.difficultyLevel,
      differences
    }
  } else if (databaseResult) {
    return {
      source: 'database',
      hasDifficultyLevel: !!databaseResult.difficultyLevel,
      differences: []
    }
  } else if (localResult) {
    return {
      source: 'local',
      hasDifficultyLevel: false,
      differences: []
    }
  } else {
    return {
      source: 'none',
      hasDifficultyLevel: false,
      differences: []
    }
  }
}

// 增强的单词查询函数，包含数据对比
export const queryWordWithComparison = async (word: string, contextText?: string): Promise<{
  result: WordInfo | null
  comparison: ReturnType<typeof compareWordData>
}> => {
  const normalizedWord = word.toLowerCase().trim()
  
  // 获取本地词典结果
  const localResult = localDictionary[normalizedWord] || null
  
  // 获取数据库结果
  let databaseResult: WordInfo | null = null
  try {
    databaseResult = await queryWordFromDatabase(normalizedWord)
  } catch (error) {
    console.warn(`数据库查询单词 "${normalizedWord}" 失败:`, error)
  }
  
  // 进行数据对比
  const comparison = compareWordData(normalizedWord, databaseResult, localResult)
  
  // 优先返回数据库结果（因为包含难度级别），其次是本地结果
  const result = databaseResult || localResult
  
  // 如果有结果，缓存它
  if (result) {
    wordCache.set(normalizedWord, result)
  }
  
  return {
    result,
    comparison
  }
}