// 翻译服务模块
import httpClient from './httpClient'

// 创建超时Promise
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms)
  })
}

// 翻译缓存
const translationCache = new Map<string, string>()

// 本地翻译字典
const localTranslationDict: Record<string, string> = {
  'hello': '你好',
  'world': '世界',
  'good': '好的',
  'morning': '早上',
  'evening': '晚上',
  'night': '夜晚',
  'thank': '谢谢',
  'you': '你',
  'welcome': '欢迎',
  'please': '请',
  'sorry': '对不起',
  'excuse': '打扰',
  'me': '我',
  'yes': '是的',
  'no': '不',
  'ok': '好的',
  'fine': '很好',
  'great': '很棒',
  'wonderful': '精彩的',
  'beautiful': '美丽的'
}

// 获取本地翻译
const getLocalTranslation = (text: string): string | null => {
  const normalizedText = text.toLowerCase().trim()
  return localTranslationDict[normalizedText] || null
}

// 通过后端代理翻译
const translateViaBackend = async (text:string, sourceLanguage = 'en', targetLanguage = 'zh'): Promise<string> => {
  const resp = await Promise.race([
    httpClient.post('/api/translate', {
      text,
      sourceLanguage,
      targetLanguage
    }),
    createTimeoutPromise(20000)
  ])
  const data = resp?.data || {}
  const translation = data.translation || data?.data?.translation || ''
  if (typeof translation === 'string' && translation.trim().length > 0) {
    return translation
  }
  throw new Error('后端翻译返回空结果')
}

// 主要的翻译函数
export const translateText = async (text: string): Promise<string> => {
  if (!text || typeof text !== 'string') return ''
  const trimmedText = text.trim()
  if (!trimmedText) return ''

  if (translationCache.has(trimmedText)) {
    return translationCache.get(trimmedText) || ''
  }

  const localTranslation = getLocalTranslation(trimmedText)
  if (localTranslation) {
    translationCache.set(trimmedText, localTranslation)
    return localTranslation
  }

  try {
    const translation = await translateViaBackend(trimmedText)
    translationCache.set(trimmedText, translation)
    return translation
  } catch (error: any) {
    console.error('翻译失败:', error)
    if (error.message === '请求超时') {
      throw new Error('翻译请求超时，请稍后重试')
    } else {
      throw new Error('翻译服务暂时不可用，请稍后重试')
    }
  }
}

// 批量翻译
export const translateBatch = async (texts: string[]): Promise<string[]> => {
  const results: string[] = []
  
  for (const text of texts) {
    try {
      const translation = await translateText(text)
      results.push(translation)
    } catch (error) {
      console.error('批量翻译中的单个文本失败:', error)
      results.push(`[翻译失败]`)
    }
  }
  
  return results
}

// 清空翻译缓存
export const clearTranslationCache = (): void => {
  translationCache.clear()
}

// 获取缓存大小
export const getTranslationCacheSize = (): number => {
  return translationCache.size
}