// 重构后的API文件 - 保持向后兼容性
// 导入独立模块
import httpClient from './httpClient'
import { translateText as translateService, tokenizeText as tokenizeTextService } from './translation'
import { queryWord as wordQueryService, clearWordCache as clearWordCacheService, addToLocalDictionary as addToLocalDictionaryService, isAdvancedWord as isAdvancedWordService, type WordInfo } from './wordService'
import { type Essay } from './essayService'

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

// 作文功能已移至本地存储模式，不再提供API接口

export type { Essay }

// 保留一些常用的导出（向后兼容）
export { httpClient as api }