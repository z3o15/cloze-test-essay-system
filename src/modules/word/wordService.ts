import { queryWord as apiQueryWord } from '../../utils/api'
// 本地WordInfo类型，不包含examples属性
interface WordInfo {
  phonetic: string
  definitions: string[]
}

// 单词查询缓存
const wordCache = new Map<string, WordInfo>()

// 查询单词信息
interface QueryWordOptions {
  contextSentence?: string
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
    // 调用API时传递forceRefresh参数给底层apiQueryWord
    const rawWordInfo = await apiQueryWord(normalizedWord, forceRefresh)
    
    // 只保留需要的字段，过滤掉examples
    const wordInfo: WordInfo = {
      phonetic: rawWordInfo.phonetic || '',
      definitions: rawWordInfo.definitions || []
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
      definitions: [`未找到单词 "${word}" 的释义`]
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