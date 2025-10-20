import { translateText as apiTranslate } from '../../utils/api'

// 翻译缓存
const translationCache = new Map<string, string>()

// 翻译文本服务
export const translateText = async (text: string): Promise<string> => {
  // 检查缓存
  if (translationCache.has(text)) {
    return translationCache.get(text)! as string
  }

  try {
    const translation = await apiTranslate(text)
    // 存入缓存
    translationCache.set(text, translation)
    return translation
  } catch (error) {
    console.error('翻译服务出错:', error)
    // 翻译失败时返回原文本，并添加错误标记
    return `${text} [翻译失败]`
  }
}

// 批量翻译文本（用于段落或句子）
export const translateBatch = async (texts: string[]): Promise<Map<string, string>> => {
  const results = new Map<string, string>()
  const untranslatedTexts = texts.filter(text => !translationCache.has(text))

  // 并行翻译未缓存的文本
  await Promise.all(
    untranslatedTexts.map(async (text) => {
      try {
        const translation = await apiTranslate(text)
        translationCache.set(text, translation)
        results.set(text, translation)
      } catch (error) {
        console.error(`翻译失败: ${text}`, error)
        results.set(text, `${text} [翻译失败]`)
      }
    })
  )

  // 添加已缓存的翻译
  texts.forEach(text => {
    if (!results.has(text) && translationCache.has(text)) {
      results.set(text, translationCache.get(text)!)
    }
  })

  return results
}

// 清理翻译缓存
export const clearTranslationCache = (): void => {
  translationCache.clear()
  console.log('翻译缓存已清理')
}

// 获取缓存大小
export const getTranslationCacheSize = (): number => {
  return translationCache.size
}