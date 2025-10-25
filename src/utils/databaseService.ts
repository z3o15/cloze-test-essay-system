// 数据库服务模块 - 用于保存和查询单词释义
import httpClient from './httpClient'
import type { WordInfo } from './wordService'
import { isValidWord } from './wordValidator'
import { API_URLS } from '../config/api'

// 保存单词释义到数据库
export const saveMeaningToDatabase = async (word: string, meaning: string): Promise<boolean> => {
  try {
    // 使用单词验证器检查单词有效性
    const trimmedWord = word.trim().toLowerCase()
    
    // 检查是否为有效单词
    if (!isValidWord(trimmedWord)) {
      console.warn(`❌ 无效单词，跳过保存: ${word}`)
      return false
    }
    
    // 验证释义内容
    if (!meaning || typeof meaning !== 'string' || meaning.trim().length === 0) {
      console.warn(`❌ 无效释义内容，跳过保存: ${word}`)
      return false
    }
    
    // 先检查单词是否已存在
    const existingWord = await queryWordFromDatabase(trimmedWord)
    if (existingWord) {
      console.log(`单词已存在: ${trimmedWord}`)
      return true
    }
    
    // 调用后端API保存单词
    const response = await httpClient.post(API_URLS.words.create(), {
      word: trimmedWord,
      meaning: meaning.trim(),
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

// 批量保存单词释义
export const saveMeaningsBatch = async (meanings: Array<{word: string, meaning: string}>): Promise<number> => {
  let successCount = 0
  
  for (const item of meanings) {
    const success = await saveMeaningToDatabase(item.word, item.meaning)
    if (success) {
      savedCount++
    }
    
    // 添加小延迟避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return savedCount
}

// 从数据库查询单词释义
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
      
      // 调试日志已移除
      
      // 转换为WordInfo格式
      const wordInfo: WordInfo = {
        phonetic: wordData.pronunciation || '',
        definitions: wordData.translation ? [wordData.translation] : [],
        difficultyLevel: wordData.difficulty_level || undefined,
        partOfSpeech: wordData.part_of_speech || undefined
      }
      
      // 调试日志已移除
      
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