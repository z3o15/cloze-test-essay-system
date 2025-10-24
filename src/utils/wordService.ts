// 单词服务模块 - 简化版本，优先使用数据库，然后本地词典（移除段落-单词映射依赖）
import { queryWordFromDatabase } from './translation'


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
  
  if (word.length <= 6) {
    return 'intermediate'
  }
  
  return 'advanced'
}

// 判断是否为高级词汇
export const isAdvancedWord = (word: string): boolean => {
  return determineWordLevel(word) === 'advanced'
}



// 内部查询函数 - 优先从数据库查询，然后本地词典
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
  
  // 3. 优先从数据库查询已有翻译
  try {
    const databaseResult = await queryWordFromDatabase(normalizedWord)
    if (databaseResult) {
      // 缓存结果
      wordCache.set(normalizedWord, databaseResult)
      return databaseResult
    }
  } catch (error) {
    console.warn(`数据库查询单词 "${normalizedWord}" 失败:`, error)
  }
  
  // 4. 如果都没有找到，返回null
  return null
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