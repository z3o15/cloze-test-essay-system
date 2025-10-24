// 数据库服务模块 - 用于保存和查询翻译结果
import httpClient from './httpClient'
import type { WordInfo } from './wordService'
import { isValidWord } from './wordValidator'
import { API_URLS } from '../config/api'

// 保存单词翻译到数据库
export const saveTranslationToDatabase = async (word: string, translation: string): Promise<boolean> => {
  try {
    // 使用单词验证器检查单词有效性
    const trimmedWord = word.trim().toLowerCase()
    
    // 检查是否为有效单词
    if (!isValidWord(trimmedWord)) {
  
      return false
    }
    
    // 先检查单词是否已存在
    const existingWord = await queryWordFromDatabase(trimmedWord)
    if (existingWord) {

      return true
    }
    
    // 调用后端API保存单词
    const response = await httpClient.post(API_URLS.words.query(), {
      word: trimmedWord,
      translation: translation.trim(),
      pronunciation: '' // 暂时为空，后续可以扩展
    })
    
    if (response.data && response.data.code === 'SUCCESS') {
      return true
    } else {
      return false
    }
  } catch (error: any) {
    // 如果是单词已存在的错误，不需要报错
    if (error.response?.status === 400 && error.response?.data?.message?.includes('已存在')) {
  
      return true
    }
    
    console.error('保存单词到数据库失败:', error.response?.data || error.message)
    return false
  }
}

// 批量保存单词翻译
export const saveTranslationsBatch = async (translations: Array<{word: string, translation: string}>): Promise<number> => {
  let savedCount = 0
  
  for (const item of translations) {
    const success = await saveTranslationToDatabase(item.word, item.translation)
    if (success) {
      savedCount++
    }
    
    // 添加小延迟避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return savedCount
}

// 从数据库查询单词翻译
export const queryWordFromDatabase = async (word: string): Promise<WordInfo | null> => {
  try {
    // 使用单词验证器检查单词有效性
    const trimmedWord = word.trim().toLowerCase()
    
    // 检查是否为有效的英文单词
    if (!isValidWord(trimmedWord)) {
      return null
    }
    
    // 调用后端API查询单词
    const response = await httpClient.get(`${API_URLS.words.query()}/${encodeURIComponent(trimmedWord)}`)
    
    if (response.data && response.data.code === 'SUCCESS' && response.data.data) {
      const wordData = response.data.data
      
      // 转换为WordInfo格式
      const wordInfo: WordInfo = {
        phonetic: wordData.pronunciation || '',
        definitions: wordData.translation ? [wordData.translation] : []
      }
      
      return wordInfo
    } else {
      return null
    }
  } catch (error: any) {
    // 404错误表示单词不存在，这是正常情况
    if (error.response?.status === 404) {
      return null
    }
    
    console.error('从数据库查询单词失败:', error.response?.data || error.message)
    return null
  }
}