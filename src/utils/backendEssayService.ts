// 后端文章处理服务 - 调用后端API进行文章处理
import httpClient from './httpClient'
import { API_URLS } from '../config/api'

// 后端API响应接口
interface BackendEssayProcessResponse {
  success: boolean
  data?: {
    id: string
    title: string
    content: string
    paragraphs: Array<{
      id: string
      original_text: string
      translated_text: string
      paragraph_order: number
    }>
    word_count: number
    paragraph_count: number
    difficulty_level: string
    created_at: string
  }
  errors?: string[]
  message?: string
}

// 文章处理结果接口
export interface EssayProcessResult {
  success: boolean
  processedParagraphs: number
  totalWords: number
  savedWords: number
  errors: string[]
  data?: any
}

/**
 * 调用后端API处理文章
 * @param text 文章内容
 * @param title 文章标题
 * @returns 处理结果
 */
export const processEssayWithBackend = async (text: string, title: string = '未命名文章'): Promise<EssayProcessResult> => {
  try {
    const response = await httpClient.post<BackendEssayProcessResponse>('/api/essay/process', {
      text: text,
      title: title
    })

    if (response.data.success && response.data.data) {
      const data = response.data.data
      
      return {
        success: true,
        processedParagraphs: data.paragraph_count || 0,
        totalWords: data.word_count || 0,
        savedWords: data.word_count || 0, // 假设所有单词都已保存
        errors: response.data.errors || [],
        data: data
      }
    } else {
      return {
        success: false,
        processedParagraphs: 0,
        totalWords: 0,
        savedWords: 0,
        errors: response.data.errors || ['后端处理失败'],
        data: null
      }
    }
  } catch (error: any) {
    console.error('调用后端API失败:', error)
    
    return {
      success: false,
      processedParagraphs: 0,
      totalWords: 0,
      savedWords: 0,
      errors: [error.message || '网络请求失败'],
      data: null
    }
  }
}

/**
 * 异步处理文章（不阻塞UI）
 * @param content 文章内容
 * @param title 文章标题
 */
export const processEssayAsync = async (content: string, title: string = '未命名文章'): Promise<void> => {
  try {
    const result = await processEssayWithBackend(content, title)
    
    if (!result.success) {
      console.error('后端文章处理失败:', result.errors)
    }
  } catch (error) {
    console.error('异步处理文章失败:', error)
  }
}