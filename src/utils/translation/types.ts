// 翻译系统模块化接口定义
// 统一的数据结构和接口规范

// ==================== 基础数据结构 ====================

// 单词信息接口
export interface WordInfo {
  phonetic: string
  definitions: string[]
}

// 单词翻译结果接口
export interface WordTranslation {
  word: string
  translation: string
  context: string // 所在段落的上下文
}

// 分词结果接口
export interface Token {
  type: 'word' | 'punctuation' | 'space'
  text: string
}

// 段落处理结果接口
export interface ParagraphProcessResult {
  originalText: string
  translatedText: string
  wordTranslations: WordTranslation[]
}

// 作文处理结果接口
export interface EssayProcessResult {
  success: boolean
  processedParagraphs: number
  totalWords: number
  savedWords: number
  errors: string[]
}

// ==================== 段落处理模块接口 ====================

export interface IParagraphProcessor {
  // 分割段落为单词
  tokenizeText(text: string): Token[]
  
  // 提取段落中的单词
  extractWords(text: string): string[]
  
  // 从段落翻译中提取单词映射
  extractWordTranslationsFromParagraph(originalText: string, translatedText: string): WordTranslation[]
  
  // 处理单个段落
  processParagraph(paragraph: string): Promise<ParagraphProcessResult>
}

// ==================== 单词翻译模块接口 ====================

export interface IWordTranslator {
  // 翻译单个单词
  translateWord(word: string, context?: string): Promise<string>
  
  // 批量翻译单词
  translateWords(words: string[]): Promise<string[]>
  
  // 翻译文本段落
  translateText(text: string): Promise<string>
  
  // 批量翻译段落
  translateBatch(texts: string[]): Promise<string[]>
  
  // 清除翻译缓存
  clearTranslationCache(): void
  
  // 获取缓存大小
  getTranslationCacheSize(): number
}

// ==================== 数据库交互模块接口 ====================

export interface IDatabaseService {
  // 保存单词翻译到数据库
  saveTranslationToDatabase(word: string, translation: string): Promise<boolean>
  
  // 批量保存单词翻译
  saveTranslationsBatch(translations: Array<{word: string, translation: string}>): Promise<number>
  
  // 从数据库查询单词
  queryWordFromDatabase(word: string): Promise<WordInfo | null>
  
  // 检查单词是否存在
  checkWordExists(word: string): Promise<boolean>
}

// ==================== 主控模块接口 ====================

export interface ITranslationController {
  // 处理作文保存后的翻译和单词提取
  processEssayAfterSave(content: string): Promise<EssayProcessResult>
  
  // 异步处理作文
  processEssayAsync(content: string): Promise<void>
  
  // 预加载单词翻译
  preloadWordTranslations(content: string): Promise<void>
}

// ==================== 配置接口 ====================

export interface TranslationConfig {
  // 自动保存配置
  autoSave: {
    enabled: boolean
    minTextLength: number
    saveDelay: number
  }
  
  // 缓存配置
  cache: {
    maxSize: number
    maxAge: number
    cleanupInterval: number
  }
  
  // 并发控制
  concurrency: {
    maxConcurrent: number
    requestDelay: number
  }
}

// ==================== 错误类型 ====================

export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'TranslationError'
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public details?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// ==================== 工具函数类型 ====================

export type WordValidator = (word: string) => boolean
export type TextNormalizer = (text: string) => string
export type ContextExtractor = (word: string, text: string) => string