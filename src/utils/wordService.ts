// 单词服务模块
import httpClient from './httpClient'

// 单词信息接口
export interface WordInfo {
  phonetic: string
  definitions: string[]
}

// 分词结果接口
export interface Token {
  type: 'word' | 'punctuation' | 'space'
  text: string
}

// 单词缓存
const wordCache = new Map<string, WordInfo>()

// 并发请求控制
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
  }
}

// 判断单词难度级别
export const determineWordLevel = (word: string): 'basic' | 'intermediate' | 'advanced' => {
  const basicWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are', 'you', 'this', 'be', 'at', 'by', 'not', 'or', 'have', 'from', 'they', 'we', 'say', 'her', 'she', 'an', 'each', 'which', 'do', 'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'what', 'see', 'him', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part']
  
  if (basicWords.includes(word.toLowerCase())) {
    return 'basic'
  }
  
  if (word.length <= 6) {
    return 'intermediate'
  }
  
  return 'advanced'
}

// 判断是否为高级词汇
export const isAdvancedWord = (word: string): boolean => {
  return determineWordLevel(word) === 'advanced'
}

// 验证API响应数据
const isValidResponseData = (data: any): boolean => {
  return data && 
         typeof data === 'object' && 
         Array.isArray(data.definitions) && 
         data.definitions.length > 0
}

// 调用本地单词查询API
const callLocalWordQueryAPI = async (word: string): Promise<WordInfo | null> => {
  try {
    const response = await httpClient.get(`/api/word-query?word=${encodeURIComponent(word)}`)
    
    // 处理开发服务器的直接响应格式 - {phonetic: string, definitions: string[]}
    if (response.data && response.data.phonetic && response.data.definitions) {
      return {
        phonetic: response.data.phonetic || '',
        definitions: response.data.definitions || []
      }
    }
    
    // 处理Edge Functions的嵌套响应格式 - {success: true, data: {success: true, data: {...}}}
    if (response.data && response.data.success && response.data.data) {
      const apiData = response.data.data
      if (apiData.success && apiData.data && isValidResponseData(apiData.data)) {
        return {
          phonetic: apiData.data.phonetic || '',
          definitions: apiData.data.definitions || []
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('单词查询API调用失败:', error)
    return null
  }
}

// 内部查询函数
const queryWordInternal = async (word: string): Promise<WordInfo | null> => {
  const normalizedWord = word.toLowerCase().trim()
  
  // 检查本地词典
  if (localDictionary[normalizedWord]) {
    return localDictionary[normalizedWord]
  }
  
  // 检查缓存
  if (wordCache.has(normalizedWord)) {
    return wordCache.get(normalizedWord) || null
  }
  
  // 检查是否有正在进行的请求
  if (pendingRequests.has(normalizedWord)) {
    return await pendingRequests.get(normalizedWord) || null
  }
  
  // 创建新的请求
  const requestPromise = callLocalWordQueryAPI(normalizedWord)
  pendingRequests.set(normalizedWord, requestPromise)
  
  try {
    const result = await requestPromise
    
    // 缓存结果
    if (result) {
      wordCache.set(normalizedWord, result)
    }
    
    return result
  } finally {
    // 清理pending请求
    pendingRequests.delete(normalizedWord)
  }
}

// 主要的单词查询函数
export const queryWord = async (word: string): Promise<WordInfo | null> => {
  if (!word || typeof word !== 'string') {
    return null
  }
  
  return await queryWordInternal(word)
}

// 提取文本中的单词
export const extractWords = (text: string): string[] => {
  return text.match(/\b[a-zA-Z]+\b/g) || []
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