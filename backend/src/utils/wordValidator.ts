// 后端单词有效性验证工具
// 用于过滤拼写错误和无效单词

/**
 * 常见的英文单词模式
 */
const VALID_WORD_PATTERNS = [
  /^[a-zA-Z]+$/, // 只包含字母
  /^[a-zA-Z]+[''][a-zA-Z]+$/, // 包含撇号的单词，如 don't, it's
]

/**
 * 无效单词模式（明显的拼写错误或无效组合）
 */
const INVALID_WORD_PATTERNS = [
  /\d/, // 包含数字
  /[^a-zA-Z'']/, // 包含非字母和撇号的字符
  /^.{1,2}$/, // 长度小于3的单词（除了常见的短单词）
  /^.{20,}$/, // 长度超过20的单词（可能是连写错误）
  /(.)\1{3,}/, // 连续重复字母超过3次
  /^[bcdfghjklmnpqrstvwxyz]{5,}$/i, // 连续5个或以上辅音字母
  /^[aeiou]{4,}$/i, // 连续4个或以上元音字母
]

/**
 * 常见的短单词白名单
 */
const SHORT_WORD_WHITELIST = new Set([
  'a', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 
  'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we'
])

/**
 * 常见的拼写错误模式
 */
const SPELLING_ERROR_PATTERNS = [
  /(.)\1{2,}/, // 重复字母（如 successd 中的 ss）
  /[aeiou]{3,}/, // 连续元音（如 satifaction）
  /[bcdfghjklmnpqrstvwxyz]{4,}/, // 连续辅音（如 needsconstant）
  /^.*[^aeiou][^aeiou][^aeiou][^aeiou].*$/i, // 4个连续辅音
]

/**
 * 连写单词分割模式
 */
const COMPOUND_WORD_PATTERNS = [
  /^([a-z]+)([A-Z][a-z]+)$/, // camelCase: needsConstant
  /^([a-z]+)([a-z]+)$/, // 可能的连写: needsconstant
]

/**
 * 检查单词是否有效
 * @param word 要检查的单词
 * @returns 是否为有效单词
 */
export const isValidWord = (word: string): boolean => {
  if (!word || typeof word !== 'string') {
    return false
  }

  const trimmedWord = word.trim().toLowerCase()
  
  // 空字符串无效
  if (!trimmedWord) {
    return false
  }

  // 检查是否匹配有效模式
  const matchesValidPattern = VALID_WORD_PATTERNS.some(pattern => pattern.test(trimmedWord))
  if (!matchesValidPattern) {
    return false
  }

  // 检查是否匹配无效模式
  const matchesInvalidPattern = INVALID_WORD_PATTERNS.some(pattern => pattern.test(trimmedWord))
  if (matchesInvalidPattern) {
    // 短单词白名单例外
    if (trimmedWord.length <= 2 && SHORT_WORD_WHITELIST.has(trimmedWord)) {
      return true
    }
    return false
  }

  // 检查拼写错误模式
  const hasSpellingError = SPELLING_ERROR_PATTERNS.some(pattern => pattern.test(trimmedWord))
  if (hasSpellingError) {
    return false
  }

  return true
}

/**
 * 检查单词是否可能是拼写错误
 * @param word 要检查的单词
 * @returns 是否可能是拼写错误
 */
export const isPossibleSpellingError = (word: string): boolean => {
  if (!word || typeof word !== 'string') {
    return true
  }

  const trimmedWord = word.trim().toLowerCase()
  
  // 检查明显的拼写错误模式
  return SPELLING_ERROR_PATTERNS.some(pattern => pattern.test(trimmedWord))
}

/**
 * 尝试分割连写单词
 * @param word 可能的连写单词
 * @returns 分割后的单词数组，如果无法分割则返回原单词
 */
export const splitCompoundWord = (word: string): string[] => {
  if (!word || typeof word !== 'string') {
    return []
  }

  const trimmedWord = word.trim()
  
  // 尝试各种连写模式
  for (const pattern of COMPOUND_WORD_PATTERNS) {
    const match = trimmedWord.match(pattern)
    if (match) {
      const parts = [match[1], match[2]].filter((part): part is string => Boolean(part && part.length >= 2))
      if (parts.length === 2) {
        return parts
      }
    }
  }

  // 如果无法分割，返回原单词
  return [trimmedWord]
}

/**
 * 过滤单词数组，移除无效单词
 * @param words 单词数组
 * @returns 过滤后的有效单词数组
 */
export const filterValidWords = (words: string[]): string[] => {
  const validWords: string[] = []
  
  for (const word of words) {
    if (isValidWord(word)) {
      validWords.push(word.toLowerCase().trim())
    } else {
      // 尝试分割连写单词
      const splitWords = splitCompoundWord(word)
      if (splitWords.length > 1) {
        // 检查分割后的单词是否有效
        const validSplitWords = splitWords.filter(isValidWord)
        validWords.push(...validSplitWords.map(w => w.toLowerCase().trim()))
      }
      // 如果单词无效且无法分割，则跳过
    }
  }
  
  // 去重
  return [...new Set(validWords)]
}

/**
 * 提取并验证文本中的单词
 * @param text 输入文本
 * @returns 有效单词数组
 */
export const extractValidWords = (text: string): string[] => {
  if (!text || typeof text !== 'string') {
    return []
  }

  // 使用正则表达式提取单词
  const words = text.match(/\b[a-zA-Z']+\b/g) || []
  
  // 过滤有效单词
  return filterValidWords(words)
}

/**
 * 检查单词是否为常见的基础词汇
 * @param word 要检查的单词
 * @returns 是否为基础词汇
 */
export const isBasicWord = (word: string): boolean => {
  const basicWords = new Set([
    'the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 
    'was', 'on', 'are', 'you', 'this', 'be', 'at', 'by', 'not', 'or', 'have', 
    'from', 'they', 'we', 'say', 'her', 'she', 'an', 'each', 'which', 'do', 
    'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 
    'these', 'so', 'some', 'what', 'see', 'him', 'two', 'more', 'go', 'no', 'way', 
    'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 
    'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
  ])
  
  return basicWords.has(word.toLowerCase().trim())
}

/**
 * 日志记录无效单词（用于调试）
 * @param invalidWords 无效单词数组
 * @param context 上下文信息
 */
export const logInvalidWords = (invalidWords: string[], context: string = ''): void => {
  if (invalidWords.length > 0) {
    console.warn(`发现无效单词 ${context}:`, invalidWords)
    
    // 分析无效原因
    invalidWords.forEach(word => {
      if (isPossibleSpellingError(word)) {
        console.warn(`  - "${word}": 可能的拼写错误`)
      } else if (word.length > 20) {
        console.warn(`  - "${word}": 单词过长，可能是连写`)
      } else if (/\d/.test(word)) {
        console.warn(`  - "${word}": 包含数字`)
      } else {
        console.warn(`  - "${word}": 其他无效模式`)
      }
    })
  }
}