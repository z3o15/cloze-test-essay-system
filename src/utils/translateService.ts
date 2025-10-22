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

// 调用腾讯翻译API
const callTencentTranslateAPI = async (text: string): Promise<string> => {
  try {
    // 使用Edge Function进行翻译
    const response = await Promise.race([
      httpClient.post('/api/translate', {
        text: text,
        source: 'en',
        target: 'zh'
      }),
      createTimeoutPromise(10000) // 10秒超时
    ])

    if (response.data && response.data.translation) {
      return response.data.translation
    } else {
      throw new Error('翻译响应格式错误')
    }
  } catch (error: any) {
    console.error('腾讯翻译API调用失败:', error)
    
    // 如果是网络错误或超时，返回更友好的错误信息
    if (error.message === '请求超时') {
      throw new Error('翻译请求超时，请稍后重试')
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error('翻译服务暂时不可用，请稍后重试')
    }
  }
}

// 主要的翻译函数
export const translateText = async (text: string): Promise<string> => {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const trimmedText = text.trim()
  if (!trimmedText) {
    return ''
  }

  // 检查缓存
  if (translationCache.has(trimmedText)) {
    return translationCache.get(trimmedText) || ''
  }

  // 检查本地字典
  const localTranslation = getLocalTranslation(trimmedText)
  if (localTranslation) {
    translationCache.set(trimmedText, localTranslation)
    return localTranslation
  }

  try {
    // 调用API翻译
    const translation = await callTencentTranslateAPI(trimmedText)
    
    // 缓存结果
    translationCache.set(trimmedText, translation)
    
    return translation
  } catch (error: any) {
    console.error('翻译失败:', error)
    
    // 返回错误信息而不是原文
    const errorMessage = error.message || '翻译失败'
    return `[翻译失败: ${errorMessage}]`
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