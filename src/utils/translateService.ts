// 翻译服务模块
import httpClient from './httpClient'
import { saveTranslationToDatabase } from './translation'
import { API_URLS } from '../config/api'

// 自动保存配置
const AUTO_SAVE_CONFIG = {
  enabled: true,
  minTextLength: 10, // 最小文本长度才保存
  saveDelay: 1000 // 延迟保存时间（毫秒）
}

// 待保存的翻译队列
const pendingSaves = new Map<string, { original: string, translation: string, timestamp: number }>()

// 自动保存翻译到数据库
const autoSaveTranslation = async (originalText: string, translation: string): Promise<void> => {
  if (!AUTO_SAVE_CONFIG.enabled || originalText.length < AUTO_SAVE_CONFIG.minTextLength) {
    return
  }

  const saveKey = `${originalText}_${translation}`
  const now = Date.now()
  
  // 添加到待保存队列
  pendingSaves.set(saveKey, {
    original: originalText,
    translation: translation,
    timestamp: now
  })

  // 延迟保存
  setTimeout(async () => {
    const pendingItem = pendingSaves.get(saveKey)
    if (pendingItem && pendingItem.timestamp === now) {
      try {
        await saveTranslationToDatabase(originalText, translation)
        pendingSaves.delete(saveKey)
      } catch (error) {
        console.error('自动保存翻译失败:', error)
      }
    }
  }, AUTO_SAVE_CONFIG.saveDelay)
}

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
  console.log('开始调用后端翻译API...')
  console.log('请求URL:', API_URLS.translate.translate())
  console.log('请求参数:', { text, source_lang: sourceLanguage, target_lang: targetLanguage })
  
  const resp = await Promise.race([
    httpClient.post(API_URLS.translate.translate(), {
      text,
      source_lang: sourceLanguage,
      target_lang: targetLanguage
    }),
    createTimeoutPromise(20000)
  ])
  
  console.log('后端API响应:', resp)
  const data = resp?.data || {}
  console.log('响应数据:', data)
  
  // 支持多种响应格式 - 修复后端返回target_text字段的问题
  const translation = data.translation || 
                     data?.data?.translation || 
                     data?.data?.target_text || 
                     data?.target_text || 
                     ''
  console.log('提取的翻译结果:', translation)
  
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

  // 1. 检查段落翻译缓存（适用于较长文本）
  if (trimmedText.length > 20) { // 对于较长的文本使用段落缓存
    const cachedTranslation = translationCache.get(trimmedText)
    if (cachedTranslation) {
      return cachedTranslation
    }
  }

  // 2. 检查本地翻译字典
  const localTranslation = getLocalTranslation(trimmedText)
  if (localTranslation) {
    return localTranslation
  }

  // 3. 通过后端API翻译
  try {
    const translation = await translateViaBackend(trimmedText)
    
    // 缓存翻译结果
    if (trimmedText.length > 20) {
      translationCache.set(trimmedText, translation)
    }
    
    // 自动保存翻译结果
    if (AUTO_SAVE_CONFIG.enabled) {
      autoSaveTranslation(trimmedText, translation)
    }
    
    return translation
  } catch (error) {
    console.error('翻译失败:', error)
    throw error // 抛出错误而不是返回原文，这样可以看到真正的问题
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