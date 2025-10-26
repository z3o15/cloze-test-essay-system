// 重构后的API文件 - 保持向后兼容性
// 导入独立模块
import httpClient from './httpClient'
import { 
  queryWord as wordQueryService, 
  clearWordCache as clearWordCacheService, 
  addToLocalDictionary as addToLocalDictionaryService, 
  isAdvancedWord as isAdvancedWordService, 
  type WordInfo 
} from './wordService'
import { type Essay } from './essayService'

// 新增：日志工具函数，统一打印API调用信息
const logApiCall = (method: string, url: string, params?: any) => {
  console.log(`[API调用] ${method} ${url}`, params ? `参数: ${JSON.stringify(params)}` : '')
}

// 新增：对异步API方法添加调用日志包装
const withLog = <T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  method: string, 
  getUrl: (...args: Parameters<T>) => string
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const url = getUrl(...args)
    logApiCall(method, url, args[0]) // 打印参数（假设第一个参数为请求体/参数）
    try {
      const result = await fn(...args)
      console.log(`[API成功] ${method} ${url}`)
      return result
    } catch (error) {
      console.error(`[API失败] ${method} ${url}`, error)
      throw error // 继续抛出错误，不影响上层处理
    }
  }
}

// 新增：对同步函数添加调用日志包装
const withSyncLog = <T extends (...args: any[]) => any>(
  fn: T, 
  method: string, 
  getUrl: (...args: Parameters<T>) => string
) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const url = getUrl(...args)
    logApiCall(method, url, args[0])
    try {
      const result = fn(...args)
      console.log(`[API成功] ${method} ${url}`)
      return result
    } catch (error) {
      console.error(`[API失败] ${method} ${url}`, error)
      throw error
    }
  }
}

// 导出HTTP客户端（向后兼容）并添加请求日志
const httpClientWithLog = {
  ...httpClient,
  get: withLog(httpClient.get, 'GET', (url) => url),
  post: withLog(httpClient.post, 'POST', (url) => url),
  put: withLog(httpClient.put, 'PUT', (url) => url),
  delete: withLog(httpClient.delete, 'DELETE', (url) => url)
}
export default httpClientWithLog

// 重新导出带日志的单词查询功能（向后兼容）
export const queryWord = withLog(
  wordQueryService, 
  'GET', 
  (word: string) => `/words/${word}` // 匹配实际路径模板
)
export const clearWordCache = withSyncLog(
  clearWordCacheService, 
  'POST', 
  () => '/words/clear-cache'
)
export const addToLocalDictionary = withSyncLog(
  addToLocalDictionaryService, 
  'POST', 
  (word: string, info: WordInfo) => `/words/local/${word}`
)
export const isAdvancedWord = withSyncLog(
  isAdvancedWordService, 
  'GET', 
  (word: string) => `/words/advanced/${word}`
)
export type { WordInfo }

// 作文功能已移至本地存储模式，不再提供API接口
export type { Essay }

// 保留一些常用的导出（向后兼容）
export { httpClientWithLog as api }