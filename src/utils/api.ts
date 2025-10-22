// 重构后的API文件 - 保持向后兼容性
// 导入独立模块
import httpClient from './httpClient'
import { translateText as translateService } from './translateService'
import { queryWord as wordQueryService, clearWordCache as clearWordCacheService, addToLocalDictionary as addToLocalDictionaryService, tokenizeText as tokenizeTextService, isAdvancedWord as isAdvancedWordService, type WordInfo } from './wordService'
import { saveEssayToBackend as saveEssayService, type Essay } from './essayService'

// 导出HTTP客户端（向后兼容）
export default httpClient

// 重新导出翻译功能（向后兼容）
export const translateText = translateService

// 重新导出单词查询功能（向后兼容）
export const queryWord = wordQueryService
export const clearWordCache = clearWordCacheService
export const addToLocalDictionary = addToLocalDictionaryService
export const tokenizeText = tokenizeTextService
export const isAdvancedWord = isAdvancedWordService
export type { WordInfo }

// 重新导出作文功能（向后兼容）
export const saveEssay = async (essay: Omit<Essay, 'id' | 'createTime'>): Promise<Essay> => {
  try {
    return await saveEssayService(essay)
  } catch (error: any) {
    console.error('保存作文失败:', error)
    
    // 如果保存失败，生成本地ID并返回（保持原有行为）
    const localEssay: Essay = {
      ...essay,
      id: `local_${Date.now()}`,
      createTime: new Date().toISOString()
    }
    
    return localEssay
  }
}

export type { Essay }

// 保留一些常用的导出（向后兼容）
export { httpClient as api }