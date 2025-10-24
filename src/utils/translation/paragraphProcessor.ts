// 段落处理模块 - 负责接收和分割原文段落
import type { 
  IParagraphProcessor, 
  Token, 
  WordTranslation, 
  ParagraphProcessResult 
} from './types'
import type { IWordTranslator } from './types'


export class ParagraphProcessor implements IParagraphProcessor {
  private wordTranslator: IWordTranslator

  constructor(wordTranslator: IWordTranslator) {
    this.wordTranslator = wordTranslator
  }

  /**
   * 分词处理 - 将文本分割为单词、标点和空格
   * @param text 输入文本
   * @returns 分词结果数组
   */
  tokenizeText(text: string): Token[] {
    const tokens: Token[] = []
    let currentToken = ''
    let currentType: Token['type'] | null = null

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      let charType: Token['type']

      if (/[a-zA-Z']/.test(char)) {
        charType = 'word'
      } else if (/\s/.test(char)) {
        charType = 'space'
      } else {
        charType = 'punctuation'
      }

      if (currentType === null) {
        currentType = charType
        currentToken = char
      } else if (currentType === charType) {
        currentToken += char
      } else {
        // 类型变化，保存当前token
        if (currentToken) {
          tokens.push({
            type: currentType,
            text: currentToken
          })
        }
        currentType = charType
        currentToken = char
      }
    }

    // 保存最后一个token
    if (currentToken) {
      tokens.push({
        type: currentType!,
        text: currentToken
      })
    }

    return tokens
  }

  /**
   * 提取段落中的单词
   * @param text 输入文本
   * @returns 单词数组（去重且小写）
   */
  extractWords(text: string): string[] {
    // 直接提取所有英文单词，不进行过滤
    const allWords = text.match(/\b[a-zA-Z]+\b/g) || []
    const words = [...new Set(allWords.map(word => word.toLowerCase()))] // 去重并转小写
    
    return words
  }

  /**
   * 从段落翻译中提取单词映射
   * @param originalText 原始英文段落
   * @param translatedText 翻译后的中文段落
   * @returns 单词翻译映射数组
   */
  extractWordTranslationsFromParagraph(originalText: string, translatedText: string): WordTranslation[] {
    const wordTranslations: WordTranslation[] = []
    
    // 提取英文单词
    const words = this.extractWords(originalText)
    
    // 从段落翻译中智能提取单词翻译
    words.forEach(word => {
      const translation = this.extractWordTranslationFromContext(word, originalText, translatedText)
      
      if (translation) {
        wordTranslations.push({
          word,
          translation,
          context: originalText
        })
      }
    })
    
    return wordTranslations
  }

  /**
   * 处理单个段落
   * @param paragraph 段落文本
   * @returns 段落处理结果
   */
  async processParagraph(paragraph: string): Promise<ParagraphProcessResult> {
    try {
      // 翻译段落
      const translatedText = await this.wordTranslator.translateText(paragraph)
      
      // 提取单词翻译映射
      const wordTranslations = this.extractWordTranslationsFromParagraph(paragraph, translatedText)
      
      return {
        originalText: paragraph,
        translatedText,
        wordTranslations
      }
    } catch (error) {
      console.error('❌ 段落处理失败:', error)
      throw error
    }
  }

  /**
   * 从上下文中提取单词翻译
   * @param word 目标单词
   * @param originalText 原文
   * @param translatedText 译文
   * @returns 单词翻译或null
   */
  private extractWordTranslationFromContext(word: string, originalText: string, translatedText: string): string {
    // 首先尝试从句子对中提取
    const sentenceTranslation = this.extractWordFromSentencePair(word, originalText, translatedText)
    if (sentenceTranslation) {
      return sentenceTranslation
    }
    
    // 如果句子对提取失败，尝试从完整翻译中提取
    return this.extractWordFromFullTranslation(word, originalText, translatedText)
  }

  /**
   * 从句子对中提取单词翻译
   * @param word 目标单词
   * @param originalSentence 原句
   * @param translatedSentence 译句
   * @returns 单词翻译或空字符串
   */
  private extractWordFromSentencePair(word: string, originalSentence: string, translatedSentence: string): string {
    // 简化的单词映射逻辑
    const lowerWord = word.toLowerCase()
    const originalLower = originalSentence.toLowerCase()
    const translated = translatedSentence.trim()
    
    // 如果原句只包含一个主要单词，直接返回翻译
    const mainWords = originalLower.match(/\b[a-zA-Z]{3,}\b/g) || []
    if (mainWords.length === 1 && mainWords[0] === lowerWord) {
      return translated
    }
    
    // 常见单词的直接映射
    const commonMappings: Record<string, string> = {
      'the': '这个/那个',
      'and': '和/与',
      'is': '是',
      'are': '是',
      'was': '是/过去式',
      'were': '是/过去式',
      'in': '在...里',
      'on': '在...上',
      'at': '在',
      'to': '到/向',
      'of': '的',
      'for': '为了',
      'with': '和/用',
      'by': '通过/被',
      'from': '从',
      'up': '向上',
      'about': '关于',
      'into': '进入',
      'through': '通过',
      'during': '在...期间',
      'before': '在...之前',
      'after': '在...之后',
      'above': '在...上方',
      'below': '在...下方',
      'between': '在...之间',
      'among': '在...中间',
      'a': '一个',
      'an': '一个',
      'this': '这个',
      'that': '那个',
      'these': '这些',
      'those': '那些',
      'i': '我',
      'you': '你',
      'he': '他',
      'she': '她',
      'it': '它',
      'we': '我们',
      'they': '他们',
      'my': '我的',
      'your': '你的',
      'his': '他的',
      'her': '她的',
      'its': '它的',
      'our': '我们的',
      'their': '他们的'
    }
    
    if (commonMappings[lowerWord]) {
      return commonMappings[lowerWord]
    }
    
    // 如果是简单的句子结构，尝试智能匹配
    if (translated.length < 20 && mainWords.length <= 3) {
      // 移除常见词汇后的主要内容
      const filteredWords = mainWords.filter(w => !commonMappings[w])
      if (filteredWords.length === 1 && filteredWords[0] === lowerWord) {
        // 移除常见的中文功能词
        const cleanTranslation = translated
          .replace(/^(这个|那个|一个|是|的|在|和|与|了|着|过)\s*/g, '')
          .replace(/\s*(这个|那个|一个|是|的|在|和|与|了|着|过)$/g, '')
          .trim()
        
        if (cleanTranslation && cleanTranslation !== translated) {
          return cleanTranslation
        }
      }
    }
    
    return ''
  }

  /**
   * 从完整翻译中提取单词翻译（简化版本）
   * @param word 目标单词
   * @param originalText 原文
   * @param translatedText 译文
   * @returns 单词翻译或空字符串
   */
  private extractWordFromFullTranslation(word: string, originalText: string, translatedText: string): string {
    // 这里可以实现更复杂的提取逻辑
    // 目前返回空字符串，表示无法从完整翻译中提取
    return ''
  }
}

// 创建默认实例的工厂函数
export const createParagraphProcessor = (wordTranslator: IWordTranslator): ParagraphProcessor => {
  return new ParagraphProcessor(wordTranslator)
}