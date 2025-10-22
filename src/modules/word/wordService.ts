import httpClient from '../../utils/httpClient'
// 本地WordInfo类型，不包含examples属性
interface WordInfo {
  phonetic: string
  definitions: string[]
  level?: string // 添加单词难度级别
}

// 单词查询缓存
const wordCache = new Map<string, WordInfo>()

// 查询单词信息
interface QueryWordOptions {
  contextSentence?: string
}

// 判断单词难度级别的函数
const determineWordLevel = (word: string): string => {
  // 简单的难度判断逻辑，可以根据需要扩展
  // 这里使用一些基本规则：
  // 1. 短单词（<=3个字母）通常是基础词汇（小学/初中水平）
  // 2. 常见基础词汇判断
  // 3. 其他单词默认为四级及以上
  
  const normalizedWord = word.toLowerCase().trim();
  
  // 太短的单词通常是基础词汇
  if (normalizedWord.length <= 3) {
    return 'elementary';
  }
  
  // 常见基础词汇列表（小学/初中/高中水平）
  const basicWords = new Set([
    'the', 'and', 'is', 'in', 'it', 'to', 'of', 'a', 'for', 'with',
    'on', 'at', 'by', 'i', 'you', 'he', 'she', 'we', 'they', 'that',
    'this', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'cannot', 'not',
    'yes', 'no', 'but', 'or', 'if', 'then', 'than', 'because', 'so',
    'when', 'where', 'why', 'how', 'what', 'who', 'which', 'from', 'into',
    'about', 'like', 'as', 'are', 'was', 'were', 'been', 'being', 'be',
    'all', 'some', 'any', 'each', 'every', 'their', 'his', 'her', 'its',
    'our', 'your', 'my', 'one', 'two', 'three', 'four', 'five', 'six',
    'seven', 'eight', 'nine', 'ten', 'first', 'second', 'third',
    'more', 'most', 'less', 'least', 'now', 'then', 'there', 'here',
    'up', 'down', 'left', 'right', 'big', 'small', 'good', 'bad',
    'new', 'old', 'high', 'low', 'long', 'short', 'fast', 'slow'
    // 可以根据需要添加更多基础词汇
  ]);
  
  // 如果是基础词汇，返回elementary
  if (basicWords.has(normalizedWord)) {
    return 'elementary';
  }
  
  // 其他单词默认为四级及以上
  return 'cet4+';
}

// 检查单词是否为四级及以上难度
export const isAdvancedWord = (word: string): boolean => {
  return determineWordLevel(word) === 'cet4+';
}

export const queryWord = async (word: string, options?: QueryWordOptions | boolean): Promise<WordInfo> => {
  // 处理forceRefresh参数 - 支持两种调用方式：对象形式或直接boolean
  const forceRefresh = typeof options === 'boolean' ? options : false
  
  // 转换为小写以统一缓存键
  const normalizedWord = word.toLowerCase().trim()
  
  // 检查缓存，除非强制刷新
  if (!forceRefresh && wordCache.has(normalizedWord)) {
    console.log(`从wordService缓存返回单词: ${normalizedWord}`)
    return wordCache.get(normalizedWord)! as WordInfo
  }
  
  console.log(`查询单词: ${normalizedWord}${forceRefresh ? ' (强制刷新)' : ''}`)

  try {
    // 直接调用API端点
    const response = await httpClient.get(`/api/word-query?word=${encodeURIComponent(normalizedWord)}`)
    
    // 检查响应数据
    if (!response.data || !response.data.phonetic || !Array.isArray(response.data.definitions)) {
      throw new Error('Invalid API response format')
    }
    
    // 只保留需要的字段，过滤掉examples
    const wordInfo: WordInfo = {
      phonetic: response.data.phonetic || '',
      definitions: response.data.definitions || [],
      level: determineWordLevel(word) // 添加难度级别
    }
    
    // 无论是否强制刷新，都更新缓存
    wordCache.set(normalizedWord, wordInfo)
    console.log(`更新单词缓存: ${normalizedWord}`)
    return wordInfo
  } catch (error) {
    console.error(`单词查询失败: ${word}`, error)
    // 如果有缓存，即使查询失败也返回缓存内容（除非是强制刷新）
    if (!forceRefresh && wordCache.has(normalizedWord)) {
      console.log(`查询失败，使用缓存内容: ${normalizedWord}`)
      return wordCache.get(normalizedWord)! as WordInfo
    }
    
    // 返回默认信息，不包含examples
    return {
      phonetic: '',
      definitions: [`未找到单词 "${word}" 的释义`],
      level: determineWordLevel(word) // 添加难度级别
    }
  }
}

// 从文本中提取单词
export const extractWords = (text: string): string[] => {
  // 简单的单词提取正则，匹配英文单词
  const wordMatches = text.match(/[a-zA-Z]+/g)
  if (!wordMatches) return []
  
  // 去重并转换为小写
  const uniqueWords = new Set(wordMatches.map(word => word.toLowerCase()))
  return Array.from(uniqueWords)
}

// 文本分词（用于高亮显示）
export const tokenizeText = (text: string): Array<{ type: 'word' | 'punctuation' | 'space', text: string }> => {
  const tokens: Array<{ type: 'word' | 'punctuation' | 'space', text: string }> = []
  
  // 如果文本为空，直接返回空数组
  if (!text || text.length === 0) {
    return tokens
  }
  
  // 简单分词：单词、标点和空格
  let i = 0
  while (i < text.length) {
    const char = text[i]
    
    if (char && char.match(/[a-zA-Z]/)) {
      // 单词 - 连续的英文字母
      let word = ''
      while (i < text.length && text[i] && typeof text[i] === 'string' && text[i]!.match(/[a-zA-Z]/)) {
        word += text[i]
        i++
      }
      tokens.push({ type: 'word', text: word })
    } else if (char && char.match(/\s/)) {
      // 空格 - 连续的空白字符
      let space = ''
      while (i < text.length && text[i] && typeof text[i] === 'string' && text[i]!.match(/\s/)) {
        space += text[i]
        i++
      }
      tokens.push({ type: 'space', text: space })
    } else if (char) {
      // 标点或其他字符 - 单个非字母非空白字符
      tokens.push({ type: 'punctuation', text: char })
      i++
    } else {
      // 处理未定义或空字符的情况
      i++
    }
  }
  
  return tokens
}

// 清理单词查询缓存
export const clearWordCache = (): void => {
  wordCache.clear()
  console.log('单词查询缓存已清理')
}

// 获取缓存大小
export const getWordCacheSize = (): number => {
  return wordCache.size
}