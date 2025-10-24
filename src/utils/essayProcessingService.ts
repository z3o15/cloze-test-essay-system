// 作文处理服务 - 处理作文保存后的翻译和单词提取
import { translateText } from './translateService'
import { tokenizeText } from './wordService'
import { saveTranslationToDatabase } from './databaseService'
import httpClient from './httpClient'
import { isBasicWord } from './wordValidator'
import { isAdvancedWord } from './api'
import { API_URLS } from '../config/api'

// 单词提取和翻译结果接口
interface WordTranslation {
  word: string
  translation: string
  context: string // 所在段落的上下文
}

// 段落处理结果接口
interface ParagraphProcessResult {
  originalText: string
  translatedText: string
  wordTranslations: WordTranslation[]
}

// 作文处理结果接口
interface EssayProcessResult {
  success: boolean
  processedParagraphs: number
  totalWords: number
  savedWords: number
  errors: string[]
}

/**
 * 从段落翻译中提取单词映射
 * @param originalText 原始英文段落
 * @param translatedText 翻译后的中文段落
 * @returns 单词翻译映射数组
 */
const extractWordTranslationsFromParagraph = (originalText: string, translatedText: string): WordTranslation[] => {
  const wordTranslations: WordTranslation[] = []
  
  // 使用tokenizeText提取英文单词
  const tokens = tokenizeText(originalText)
  const words = tokens
    .filter((token: any) => token.type === 'word')
    .map((token: any) => token.text.toLowerCase())
    .filter((word: string, index: number, self: string[]) => self.indexOf(word) === index) // 去重
  
  // 从段落翻译中智能提取单词翻译
  words.forEach(word => {
    const translation = extractWordTranslationFromContext(word, originalText, translatedText)
    
    if (translation) {
      wordTranslations.push({
        word: word,
        translation: translation,
        context: originalText
      })
    }
  })
  
  return wordTranslations
}

/**
 * 从上下文中提取单词翻译
 * @param word 要翻译的单词
 * @param originalText 原始英文文本
 * @param translatedText 翻译后的中文文本
 * @returns 单词的翻译
 */
const extractWordTranslationFromContext = (word: string, originalText: string, translatedText: string): string => {
  // 将原文和译文按句子分割
  const originalSentences = originalText.split(/[.!?]+/).filter(s => s.trim())
  const translatedSentences = translatedText.split(/[。！？]+/).filter(s => s.trim())
  
  // 如果句子数量不匹配，使用整段翻译
  if (originalSentences.length !== translatedSentences.length) {
    return extractWordFromFullTranslation(word, originalText, translatedText)
  }
  
  // 找到包含该单词的句子
  for (let i = 0; i < originalSentences.length; i++) {
    const originalSentence = originalSentences[i].trim()
    const translatedSentence = translatedSentences[i].trim()
    
    // 检查句子中是否包含目标单词
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
    if (wordRegex.test(originalSentence)) {
      return extractWordFromSentencePair(word, originalSentence, translatedSentence)
    }
  }
  
  // 如果没有找到对应句子，使用整段翻译
  return extractWordFromFullTranslation(word, originalText, translatedText)
}

/**
 * 从句子对中提取单词翻译
 * @param word 目标单词
 * @param originalSentence 原始英文句子
 * @param translatedSentence 翻译后的中文句子
 * @returns 单词翻译
 */
const extractWordFromSentencePair = (word: string, originalSentence: string, translatedSentence: string): string => {
  // 简化的翻译提取逻辑
  // 对于常见的功能词，提供基础翻译
  const basicMappings: Record<string, string> = {
    'the': '这个/那个',
    'a': '一个',
    'an': '一个',
    'and': '和',
    'or': '或者',
    'but': '但是',
    'is': '是',
    'are': '是',
    'was': '是',
    'were': '是',
    'be': '是',
    'have': '有',
    'has': '有',
    'had': '有',
    'do': '做',
    'does': '做',
    'did': '做',
    'will': '将',
    'would': '会',
    'can': '能',
    'could': '能',
    'should': '应该',
    'may': '可能',
    'might': '可能',
    'must': '必须',
    'in': '在',
    'on': '在',
    'at': '在',
    'to': '到',
    'for': '为了',
    'of': '的',
    'with': '与',
    'by': '被',
    'from': '从',
    'up': '上',
    'down': '下',
    'out': '出',
    'off': '离开',
    'over': '在...上',
    'under': '在...下',
    'again': '再次',
    'further': '进一步',
    'then': '然后',
    'once': '一旦'
  }
  
  // 如果是基础功能词，直接返回映射
  if (basicMappings[word.toLowerCase()]) {
    return basicMappings[word.toLowerCase()]
  }
  
  // 对于实词，尝试从翻译中推断
  // 这里使用简化的方法：如果翻译句子较短，可能包含单词的直接翻译
  const translatedWords = translatedSentence.replace(/[，。！？；：""''（）【】]/g, ' ').split(/\s+/).filter(w => w.trim())
  
  // 如果翻译句子只有1-3个词，可能是单词的直接翻译
  if (translatedWords.length <= 3) {
    return translatedWords.join('')
  }
  
  // 否则返回一个通用的翻译标记
  return `[${word}]`
}

/**
 * 从完整翻译中提取单词翻译
 * @param word 目标单词
 * @param originalText 原始文本
 * @param translatedText 翻译文本
 * @returns 单词翻译
 */
const extractWordFromFullTranslation = (word: string, originalText: string, translatedText: string): string => {
  // 对于整段翻译，返回一个标记，表示需要在上下文中理解
  return `[${word}]`
}

/**
 * 处理单个段落：翻译并提取单词
 * @param paragraph 段落文本
 * @returns 段落处理结果
 */
const processParagraph = async (paragraph: string): Promise<ParagraphProcessResult> => {
  try {
    // 翻译段落
    const translatedText = await translateText(paragraph)
    
    // 提取单词翻译
    const wordTranslations = extractWordTranslationsFromParagraph(paragraph, translatedText)
    
    return {
      originalText: paragraph,
      translatedText: translatedText,
      wordTranslations: wordTranslations
    }
  } catch (error) {
    console.error('处理段落失败:', error)
    throw error
  }
}

/**
 * 处理整篇作文：翻译所有段落并保存单词到数据库
 * @param content 作文内容
 * @returns 处理结果
 */
export const processEssayAfterSave = async (content: string): Promise<EssayProcessResult> => {
  const result: EssayProcessResult = {
    success: true,
    processedParagraphs: 0,
    totalWords: 0,
    savedWords: 0,
    errors: []
  }
  
  try {
    // 分割段落
    const paragraphs = content.split('\n').filter(p => p.trim())
    
    // 处理每个段落
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim()
      if (!paragraph) continue
      
      try {
        
        // 处理段落
        const paragraphResult = await processParagraph(paragraph)
        result.processedParagraphs++
        
        // 保存单词翻译到数据库
        for (const wordTranslation of paragraphResult.wordTranslations) {
          try {
            const saved = await saveTranslationToDatabase(wordTranslation.word, wordTranslation.translation)
            if (saved) {
              result.savedWords++
            }
            result.totalWords++
            
            // 添加小延迟避免过于频繁的请求
            await new Promise(resolve => setTimeout(resolve, 50))
          } catch (saveError) {
            console.warn(`保存单词失败: ${wordTranslation.word}`, saveError)
            result.errors.push(`保存单词失败: ${wordTranslation.word}`)
          }
        }
        
        // 段落间添加延迟
        if (i < paragraphs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (paragraphError) {
        console.error(`处理第 ${i + 1} 个段落失败:`, paragraphError)
        result.errors.push(`处理第 ${i + 1} 个段落失败: ${paragraphError}`)
        result.success = false
      }
    }
    

    
  } catch (error) {
    console.error('处理作文失败:', error)
    result.success = false
    result.errors.push(`处理作文失败: ${error}`)
  }
  
  return result
}

/**
 * 异步处理作文（不阻塞用户界面）
 * @param content 作文内容
 * @returns Promise<void>
 */
export const processEssayAsync = async (content: string): Promise<void> => {
  try {
    const result = await processEssayAfterSave(content)
    
    if (!result.success) {
      console.warn('作文处理完成但有错误:', result.errors)
    }
  } catch (error) {
    console.error('异步处理作文失败:', error)
  }
}

/**
 * 新增：自动化流程函数 - 在作文创建后执行“四步流程”
 * 1) 段落翻译（批量，按10条分批）
 * 2) 段落批量保存到后端数据库
 * 3) 从作文中提取有效英语单词，过滤基础词汇与重复，批量检查已存在单词
 * 4) 对未知单词执行批量翻译，并批量创建新单词记录
 */
export const autoProcessEssayAfterCreate = async (
  essayId: string,
  essayContent: string
): Promise<AutoProcessSummary> => {
  const summary: AutoProcessSummary = {
    essayId,
    paragraphsProcessed: 0,
    paragraphsSaved: 0,
    totalWordsExtracted: 0,
    advancedWordsChecked: 0,
    unknownWordsTranslated: 0,
    newWordsCreated: 0,
    errors: []
  }

  try {
    // 1) 解析段落
    const rawParagraphs = (essayContent || '')
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    if (rawParagraphs.length === 0) {
      return summary
    }

    // 1.1) 批量翻译段落（每批最多10条）
    const batchSize = 10
    const translatedParagraphs: string[] = []

    for (let i = 0; i < rawParagraphs.length; i += batchSize) {
      const batch = rawParagraphs.slice(i, i + batchSize)
      try {
        const resp = await httpClient.post(API_URLS.translate.batch(), {
          texts: batch,
          source_lang: 'en',
          target_lang: 'zh',
          service: 'volcano'
        })
        const translations: string[] = resp?.data?.data || resp?.data || []
        // 兜底处理
        if (Array.isArray(translations) && translations.length === batch.length) {
          translatedParagraphs.push(...translations)
        } else {
          // 如果返回结构不一致，逐条回退到单次翻译
          for (const text of batch) {
            try {
              const singleResp = await httpClient.post(API_URLS.translate.translate(), {
                text,
                source_lang: 'en',
                target_lang: 'zh',
                service: 'volcano'
              })
              const t = singleResp?.data?.data?.translation || singleResp?.data?.translation || singleResp?.data?.target_text || ''
              translatedParagraphs.push(typeof t === 'string' && t.length > 0 ? t : text)
            } catch (e) {
              translatedParagraphs.push(text)
              summary.errors.push(`段落翻译失败，使用原文回退: ${String(e)}`)
            }
          }
        }
      } catch (err) {
        // 整批失败时，逐条回退
        for (const text of batch) {
          try {
            const singleResp = await httpClient.post(API_URLS.translate.translate(), {
              text,
              source_lang: 'en',
              target_lang: 'zh',
              service: 'volcano'
            })
            const t = singleResp?.data?.data?.translation || singleResp?.data?.translation || singleResp?.data?.target_text || ''
            translatedParagraphs.push(typeof t === 'string' && t.length > 0 ? t : text)
          } catch (e) {
            translatedParagraphs.push(text)
            summary.errors.push(`段落翻译失败，使用原文回退: ${String(e)}`)
          }
        }
      }
    }

    summary.paragraphsProcessed = rawParagraphs.length

    // 2) 批量保存段落到后端
    try {
      const payload = {
        paragraphs: rawParagraphs.map((src, idx) => ({
          source_text: src,
          translated_text: translatedParagraphs[idx] || ''
        }))
      }
      const saveResp = await httpClient.post(API_URLS.words.batch(), payload)
      const saved = saveResp?.data?.data?.paragraphs || saveResp?.data?.data || []
      summary.paragraphsSaved = Array.isArray(saved) ? saved.length : 0
    } catch (e) {
      summary.errors.push(`段落批量保存失败: ${String(e)}`)
    }

    // 3) 提取所有英文单词，过滤基础词汇与重复
    console.log('🔍 步骤3: 开始提取和分析单词...')
    const allWordsRaw = essayContent.match(/\b[a-zA-Z]+\b/g) || []
    const allWords = [...new Set(allWordsRaw.map(word => word.toLowerCase()))]
    summary.totalWordsExtracted = allWords.length
    console.log(`📊 提取到 ${allWords.length} 个单词`)

    const advancedWords = allWords
      .filter(w => !isBasicWord(w))
      .filter(w => isAdvancedWord(w))
    const uniqueAdvancedWords = Array.from(new Set(advancedWords))

    summary.advancedWordsChecked = uniqueAdvancedWords.length
    console.log(`🎯 筛选出 ${uniqueAdvancedWords.length} 个高级单词`)

    // 3.1) 调用后端批量检查已存在单词
    console.log('🔍 步骤3.1: 检查数据库中已存在的单词...')
    let unknownWords: string[] = []
    let knownWords: string[] = []
    try {
      const checkResp = await httpClient.get(API_URLS.words.batch(), {
        params: { words: uniqueAdvancedWords }
      })
      const data = checkResp?.data?.data || checkResp?.data || {}
      unknownWords = Array.isArray(data?.unknownWords) ? data.unknownWords : []
      knownWords = uniqueAdvancedWords.filter(w => !unknownWords.includes(w))
      console.log(`✅ 数据库中已有 ${knownWords.length} 个单词，需要处理 ${unknownWords.length} 个新单词`)
    } catch (e) {
      summary.errors.push(`批量检查单词失败: ${String(e)}`)
      // 若检查失败，全部当作未知词继续后续步骤（避免流程中断）
      unknownWords = uniqueAdvancedWords
      console.log(`⚠️ 检查失败，将 ${unknownWords.length} 个单词标记为待处理`)
    }

    if (unknownWords.length === 0) {
      console.log('✅ 所有单词都已存在于数据库中，无需进一步处理')
      return summary
    }

    // 4) 使用AI处理未知单词（包含翻译和难度评估）
    console.log('🔍 步骤4: 使用AI处理新单词...')
    let aiProcessedWords: Array<{ word: string, translation: string, difficultyLevel: number }> = []
    try {
      const aiResp = await httpClient.post('/api/ai-words/batch-process', { words: unknownWords })
       const result = aiResp?.data?.data || aiResp?.data || []
       aiProcessedWords = Array.isArray(result) ? result.map((item: any) => ({
         word: item.word,
         translation: item.translation,
         difficultyLevel: item.difficultyLevel || 1
       })) : []
      summary.unknownWordsTranslated = aiProcessedWords.length
    } catch (e) {
      summary.errors.push(`AI单词处理失败: ${String(e)}`)
    }

    // 4.1) 筛选级别>3的单词
    const filteredWords = aiProcessedWords.filter(w => w.difficultyLevel > 3)
    
    if (filteredWords.length === 0) {
      return summary
    }

    // 4.2) 批量创建筛选后的单词
    const wordsToCreate = filteredWords.map(w => ({ 
      word: w.word, 
      translation: w.translation,
      difficultyLevel: w.difficultyLevel
    }))

    if (wordsToCreate.length > 0) {
      try {
        const createResp = await httpClient.post(API_URLS.words.batch(), { words: wordsToCreate })
        const data = createResp?.data?.data || createResp?.data || {}
        summary.newWordsCreated = typeof data?.created === 'number' ? data.created : wordsToCreate.length
      } catch (e) {
        summary.errors.push(`批量创建新单词失败: ${String(e)}`)
      }
    }

    return summary
  } catch (error) {
    summary.errors.push(`自动化流程失败: ${String(error)}`)
    return summary
  }
}