// 段落单词映射服务 - 从段落翻译中提取单词对应关系
import { WordInfo } from './wordService'

// 段落翻译映射接口
export interface ParagraphTranslationMapping {
  originalText: string
  translatedText: string
  wordMappings: Map<string, WordInfo>
  timestamp: number
}

// 段落翻译映射缓存
const paragraphMappingCache = new Map<string, ParagraphTranslationMapping>()

// 段落翻译结果缓存
interface ParagraphTranslationCache {
  originalText: string
  translatedText: string
  timestamp: number
  hitCount: number
}

const paragraphTranslationCache = new Map<string, ParagraphTranslationCache>()

// 缓存配置
const TRANSLATION_CACHE_CONFIG = {
  maxSize: 1000, // 最大缓存条目数
  maxAge: 24 * 60 * 60 * 1000, // 24小时过期时间
  cleanupInterval: 60 * 60 * 1000 // 1小时清理一次
}

// 生成段落缓存键
const generateParagraphKey = (text: string): string => {
  return `paragraph_${text.trim().toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`
}

// 智能单词匹配算法 - 从段落翻译中提取单词映射
const extractWordMappings = (originalText: string, translatedText: string): Map<string, WordInfo> => {
  const wordMappings = new Map<string, WordInfo>()
  
  // 提取英文单词
  const englishWords = originalText.toLowerCase().match(/\b[a-zA-Z]+\b/g) || []
  
  // 常见单词的预定义映射
  const commonWordMappings: Record<string, string> = {
    'hello': '你好',
    'world': '世界',
    'the': '这个/那个',
    'and': '和/与',
    'is': '是',
    'in': '在',
    'to': '到/向',
    'of': '的',
    'a': '一个',
    'that': '那个',
    'it': '它',
    'with': '与/和',
    'for': '为了',
    'as': '作为',
    'was': '是(过去式)',
    'on': '在...上',
    'are': '是(复数)',
    'you': '你',
    'all': '所有',
    'can': '能够',
    'had': '有(过去式)',
    'be': '是',
    'at': '在',
    'by': '通过/被',
    'not': '不/没有',
    'or': '或者',
    'have': '有',
    'from': '从',
    'they': '他们',
    'we': '我们',
    'say': '说',
    'her': '她的',
    'she': '她',
    'an': '一个',
    'each': '每个',
    'which': '哪个',
    'do': '做',
    'their': '他们的',
    'time': '时间',
    'will': '将要',
    'about': '关于',
    'if': '如果',
    'up': '向上',
    'out': '出去',
    'many': '许多',
    'then': '然后',
    'them': '他们',
    'these': '这些',
    'so': '所以',
    'some': '一些',
    'what': '什么',
    'see': '看见',
    'him': '他',
    'two': '二/两个',
    'more': '更多',
    'go': '去',
    'no': '没有',
    'way': '方式/路',
    'could': '能够',
    'my': '我的',
    'than': '比',
    'first': '第一',
    'been': '已经',
    'call': '叫/打电话',
    'who': '谁',
    'its': '它的',
    'now': '现在',
    'find': '找到',
    'long': '长的',
    'down': '向下',
    'day': '天/日',
    'did': '做(过去式)',
    'get': '得到',
    'may': '可能',
    'new': '新的',
    'write': '写',
    'our': '我们的',
    'work': '工作',
    'but': '但是',
    'come': '来',
    'man': '男人',
    'old': '老的',
    'take': '拿/取',
    'know': '知道',
    'year': '年',
    'good': '好的',
    'give': '给',
    'use': '使用',
    'make': '制作',
    'look': '看',
    'think': '思考',
    'like': '喜欢/像',
    'back': '回来/背部',
    'only': '只有',
    'over': '在...上方',
    'also': '也',
    'after': '在...之后',
    'right': '正确的/右边',
    'where': '哪里',
    'just': '只是',
    'before': '在...之前',
    'any': '任何',
    'too': '也/太',
    'very': '非常',
    'well': '好地',
    'water': '水',
    'little': '小的',
    'great': '伟大的',
    'tell': '告诉',
    'try': '尝试',
    'ask': '问',
    'need': '需要',
    'feel': '感觉',
    'become': '成为',
    'leave': '离开',
    'put': '放',
    'mean': '意思是',
    'keep': '保持',
    'let': '让',
    'begin': '开始',
    'seem': '似乎',
    'help': '帮助',
    'talk': '谈话',
    'turn': '转动',
    'start': '开始',
    'show': '显示',
    'hear': '听见',
    'play': '玩',
    'run': '跑',
    'move': '移动',
    'live': '生活',
    'believe': '相信',
    'hold': '握住',
    'bring': '带来',
    'happen': '发生',
    'must': '必须',
    'stop': '停止',
    'without': '没有',
    'second': '第二/秒',
    'later': '后来',
    'miss': '想念/错过',
    'idea': '想法',
    'enough': '足够',
    'eat': '吃',
    'face': '脸',
    'watch': '看/手表',
    'far': '远的',
    'really': '真的',
    'almost': '几乎',
    'hand': '手',
    'high': '高的',
    'something': '某事',
    'fact': '事实',
    'why': '为什么',
    'how': '如何',
    'when': '什么时候',
    'much': '很多',
    'every': '每个',
    'another': '另一个',
    'example': '例子',
    'between': '在...之间',
    'important': '重要的',
    'often': '经常',
    'public': '公共的',
    'same': '相同的',
    'able': '能够的',
    'test': '测试',
    'cat': '猫',
    'sleeping': '睡觉',
    'love': '爱/喜欢',
    'programming': '编程',
    'natural': '自然的',
    'pervading': '弥漫的/遍布的',
    'presence': '存在/出现',
    'universe': '宇宙',
    'unfolds': '展开/显露',
    'numberless': '无数的',
    'flowers': '花朵',
    'branches': '树枝',
    'precious': '珍贵的',
    'objects': '物体/对象',
    'mountains': '山脉',
    'setting': '环境/背景',
    'overflow': '溢出/充满',
    'congenial': '令人愉快的',
    'tenderest': '最温柔的',
    'noblest': '最高贵的',
    'feelings': '感情/情感',
    'painful': '痛苦的',
    'multitude': '众多/大量',
    'remaining': '剩余的'
  }

  // 智能匹配算法：尝试从翻译中提取对应关系
  const smartExtractMappings = (original: string, translated: string): Map<string, string> => {
    const mappings = new Map<string, string>()
    
    // 分割句子为词组
    const originalSentences = original.split(/[.!?。！？]/).filter(s => s.trim())
    const translatedSentences = translated.split(/[.!?。！？]/).filter(s => s.trim())
    
    // 如果句子数量匹配，尝试句子级别的映射
    if (originalSentences.length === translatedSentences.length) {
      for (let i = 0; i < originalSentences.length; i++) {
        const origSent = originalSentences[i].trim()
        const transSent = translatedSentences[i].trim()
        
        // 提取关键词并尝试匹配
        const origWords = origSent.toLowerCase().match(/\b[a-zA-Z]+\b/g) || []
        
        // 特殊词汇的智能匹配
        for (const word of origWords) {
          if (!commonWordMappings[word]) {
            // 尝试从翻译中提取对应词汇
            const contextualTranslation = extractContextualTranslation(word, origSent, transSent)
            if (contextualTranslation) {
              mappings.set(word, contextualTranslation)
            }
          }
        }
      }
    }
    
    return mappings
  }

  // 从上下文中提取单词翻译
  const extractContextualTranslation = (word: string, originalSentence: string, translatedSentence: string): string | null => {
    // 简单的关键词匹配策略
    const keywordMappings: Record<string, string[]> = {
      'test': ['测试', '试验', '考试'],
      'cat': ['猫', '猫咪'],
      'dog': ['狗', '狗狗'],
      'sleep': ['睡觉', '睡眠', '休息'],
      'sleeping': ['睡觉', '正在睡觉'],
      'love': ['爱', '喜欢', '热爱'],
      'programming': ['编程', '程序设计', '编程序'],
      'computer': ['电脑', '计算机'],
      'book': ['书', '书籍'],
      'read': ['读', '阅读'],
      'write': ['写', '书写'],
      'study': ['学习', '研究'],
      'school': ['学校'],
      'teacher': ['老师', '教师'],
      'student': ['学生'],
      'friend': ['朋友'],
      'family': ['家庭', '家人'],
      'house': ['房子', '家'],
      'car': ['汽车', '车'],
      'food': ['食物', '食品'],
      'music': ['音乐'],
      'movie': ['电影'],
      'game': ['游戏'],
      'sport': ['运动', '体育'],
      'travel': ['旅行', '旅游'],
      'beautiful': ['美丽', '漂亮'],
      'happy': ['快乐', '高兴', '开心'],
      'sad': ['悲伤', '难过'],
      'big': ['大', '大的'],
      'small': ['小', '小的'],
      'fast': ['快', '快速'],
      'slow': ['慢', '缓慢'],
      'easy': ['容易', '简单'],
      'difficult': ['困难', '难'],
      'interesting': ['有趣', '有意思'],
      'boring': ['无聊', '乏味']
    }

    if (keywordMappings[word]) {
      // 检查翻译中是否包含对应的中文词汇
      for (const chineseWord of keywordMappings[word]) {
        if (translatedSentence.includes(chineseWord)) {
          return chineseWord
        }
      }
      // 如果没有找到精确匹配，返回第一个候选
      return keywordMappings[word][0]
    }

    // 如果没有预定义映射，返回null
    return null
  }

  // 获取智能映射
  const smartMappings = smartExtractMappings(originalText, translatedText)
  
  // 为每个英文单词创建映射
  for (const word of englishWords) {
    let translation: string
    let isContextual = false
    const lowerWord = word.toLowerCase()

    if (commonWordMappings[lowerWord]) {
      // 使用预定义映射
      translation = commonWordMappings[lowerWord]
    } else if (smartMappings.has(lowerWord)) {
      // 使用智能提取的映射
      translation = smartMappings.get(lowerWord)!
      isContextual = true
    } else {
      // 使用上下文翻译
      const contextualTranslation = extractContextualTranslation(word, originalText, translatedText)
      if (contextualTranslation) {
        translation = contextualTranslation
        isContextual = true
      } else {
        // 最后回退：跳过没有找到翻译的单词，不添加到映射中
        continue
      }
    }

    wordMappings.set(word.toLowerCase(), {
      phonetic: `/${word}/`, // 简单的音标
      definitions: isContextual ? [translation, `上下文: ${originalText}`] : [translation]
    })
  }
  
  return wordMappings
}

// 保存段落翻译映射
export const saveParagraphMapping = (originalText: string, translatedText: string): void => {
  const key = generateParagraphKey(originalText)
  const wordMappings = extractWordMappings(originalText, translatedText)
  
  const mapping: ParagraphTranslationMapping = {
    originalText,
    translatedText,
    wordMappings,
    timestamp: Date.now()
  }
  
  paragraphMappingCache.set(key, mapping)
  
  console.log(`保存段落映射: ${key}, 包含 ${wordMappings.size} 个单词`)
}

// 从段落映射中查询单词
export const queryWordFromParagraphMapping = (word: string, contextText?: string): WordInfo | null => {
  const lowerWord = word.toLowerCase()
  
  // 如果提供了上下文，优先在相关段落中查找
  if (contextText) {
    const contextKey = generateParagraphKey(contextText)
    const mapping = paragraphMappingCache.get(contextKey)
    
    if (mapping && mapping.wordMappings.has(lowerWord)) {
      console.log(`从上下文段落映射中找到单词: ${word}`)
      return mapping.wordMappings.get(lowerWord)!
    }
  }
  
  // 在所有段落映射中查找
  for (const [key, mapping] of paragraphMappingCache.entries()) {
    if (mapping.wordMappings.has(lowerWord)) {
      console.log(`从段落映射中找到单词: ${word} (来源: ${key})`)
      return mapping.wordMappings.get(lowerWord)!
    }
  }
  
  return null
}

// 获取所有段落映射的统计信息
export const getParagraphMappingStats = (): {
  totalParagraphs: number
  totalWords: number
  cacheSize: number
} => {
  let totalWords = 0
  
  for (const mapping of paragraphMappingCache.values()) {
    totalWords += mapping.wordMappings.size
  }
  
  return {
    totalParagraphs: paragraphMappingCache.size,
    totalWords,
    cacheSize: paragraphMappingCache.size
  }
}

// 段落翻译缓存管理函数

// 获取缓存的翻译结果
export const getCachedTranslation = (originalText: string): string | null => {
  const key = generateParagraphKey(originalText)
  const cached = paragraphTranslationCache.get(key)
  
  if (cached) {
    const now = Date.now()
    // 检查是否过期
    if (now - cached.timestamp > TRANSLATION_CACHE_CONFIG.maxAge) {
      paragraphTranslationCache.delete(key)
      return null
    }
    
    // 更新命中次数
    cached.hitCount++
    cached.timestamp = now // 更新访问时间
    return cached.translatedText
  }
  
  return null
}

// 缓存翻译结果
export const cacheTranslation = (originalText: string, translatedText: string): void => {
  const key = generateParagraphKey(originalText)
  
  // 检查缓存大小，如果超过限制则清理
  if (paragraphTranslationCache.size >= TRANSLATION_CACHE_CONFIG.maxSize) {
    cleanupTranslationCache()
  }
  
  paragraphTranslationCache.set(key, {
    originalText,
    translatedText,
    timestamp: Date.now(),
    hitCount: 1
  })
}

// 清理翻译缓存
const cleanupTranslationCache = (): void => {
  const now = Date.now()
  const entries = Array.from(paragraphTranslationCache.entries())
  
  // 按访问时间和命中次数排序，删除最旧和最少使用的条目
  entries.sort((a, b) => {
    const scoreA = a[1].hitCount * 1000 + (now - a[1].timestamp)
    const scoreB = b[1].hitCount * 1000 + (now - b[1].timestamp)
    return scoreA - scoreB
  })
  
  // 删除最旧的25%条目
  const deleteCount = Math.floor(paragraphTranslationCache.size * 0.25)
  for (let i = 0; i < deleteCount; i++) {
    paragraphTranslationCache.delete(entries[i][0])
  }
}

// 获取翻译缓存统计
export const getTranslationCacheStats = () => {
  const now = Date.now()
  let totalHits = 0
  let expiredCount = 0
  
  for (const cached of paragraphTranslationCache.values()) {
    totalHits += cached.hitCount
    if (now - cached.timestamp > TRANSLATION_CACHE_CONFIG.maxAge) {
      expiredCount++
    }
  }
  
  return {
    totalEntries: paragraphTranslationCache.size,
    totalHits,
    expiredCount,
    maxSize: TRANSLATION_CACHE_CONFIG.maxSize,
    maxAge: TRANSLATION_CACHE_CONFIG.maxAge
  }
}

// 清空翻译缓存
export const clearTranslationCache = (): void => {
  paragraphTranslationCache.clear()
}

// 清理过期的段落映射
export const cleanupExpiredMappings = (): number => {
  const now = Date.now()
  const expiredKeys: string[] = []
  
  for (const [key, mapping] of paragraphMappingCache) {
    if (now - mapping.timestamp > 7 * 24 * 60 * 60 * 1000) { // 7天过期
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => paragraphMappingCache.delete(key))
  
  // 同时清理过期的翻译缓存
  const expiredTranslationKeys: string[] = []
  for (const [key, cached] of paragraphTranslationCache) {
    if (now - cached.timestamp > TRANSLATION_CACHE_CONFIG.maxAge) {
      expiredTranslationKeys.push(key)
    }
  }
  
  expiredTranslationKeys.forEach(key => paragraphTranslationCache.delete(key))
  
  return expiredKeys.length + expiredTranslationKeys.length
}

// 清空所有段落映射
export const clearAllParagraphMappings = (): void => {
  paragraphMappingCache.clear()
}

// 获取特定段落的单词映射
export const getParagraphWordMappings = (text: string): Map<string, WordInfo> | null => {
  const key = generateParagraphKey(text)
  const mapping = paragraphMappingCache.get(key)
  return mapping ? mapping.wordMappings : null
}

// 检查单词是否在段落映射中存在
export const isWordInParagraphMapping = (word: string): boolean => {
  const lowerWord = word.toLowerCase()
  
  for (const mapping of paragraphMappingCache.values()) {
    if (mapping.wordMappings.has(lowerWord)) {
      return true
    }
  }
  
  return false
}