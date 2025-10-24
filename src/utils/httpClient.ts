import axios from 'axios'
import { API_CONFIG } from '../config/api'

// 创建axios实例，使用统一配置
const httpClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.defaults.timeout,
  headers: API_CONFIG.defaults.headers,
})

// 添加响应拦截器，在实例级别统一处理HTML响应问题
httpClient.interceptors.response.use(
  (response) => {
    // 检查响应是否为HTML（通常表示错误页面）
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      return Promise.reject(new Error('服务器返回了HTML页面，可能是错误页面'))
    }

    // 如果响应是字符串，尝试解析为JSON；否则保留给上层解析
    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data)
      } catch {
        // 保留原始字符串以便上层逻辑自行处理
      }
    }

    // 标准化非对象响应为包装对象，但不标记为错误
    if (typeof response.data !== 'object' || response.data === null) {
      response.data = { raw: response.data }
    }

    // 检查是否有错误信息字段
    if (response.data && typeof response.data === 'object') {
      const errMsg = (response.data as any).error
      const success = (response.data as any).success
      if (errMsg || (success === false && response.status !== 200)) {
        return Promise.reject(new Error(errMsg || '请求失败'))
      }
    }

    return response
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.status === 429) {
        // 速率限制错误
        const errorMsg = error.response.data?.error || '请求过于频繁，请稍后再试'
        error.message = errorMsg
      } else if (error.response.status >= 500) {
        // 服务器内部错误
        error.message = '服务器内部错误，请稍后再试'
      } else if (error.response.status === 404) {
        // 资源未找到
        error.message = '请求的资源未找到'
      } else if (error.response.status === 405) {
        // 方法不允许
        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          // 错误响应是HTML格式
          error.message = '请求方法不被允许'
        }
      } else if (error.response.data?.error) {
        // 使用服务器返回的错误信息
        error.message = error.response.data.error
      }
    } else if (error.request) {
      // 网络错误或服务器无响应
      error.message = '网络连接失败，请检查网络连接'
    } else {
      // 请求配置错误
      error.message = '请求配置错误'
    }
    return Promise.reject(error)
  }
)

// 添加重试拦截器
httpClient.interceptors.response.use(
  response => response,
  async (error) => {
    const config = error.config
    
    // 如果配置不存在或没有重试选项，则直接拒绝
    if (!config || !config.retry) return Promise.reject(error)
    
    // 记录重试次数
    config.__retryCount = config.__retryCount || 0
    
    // 检查是否已经达到最大重试次数
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error)
    }
    
    // 增加重试计数
    config.__retryCount += 1
    
    // 仅在网络错误或服务器无响应时重试（不对服务器返回的错误进行重试）
    if (!error.response) {
      // 创建一个延迟函数
      const delay = new Promise(resolve => {
        setTimeout(resolve, (config as any).retryDelay || 1000)
      })
      
      // 重试请求
      return delay.then(() => httpClient(config))
    }
    
    return Promise.reject(error)
  }
)

// 添加请求拦截器
httpClient.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 创建超时Promise的工具函数
export const createTimeoutPromise = (ms: number, message: string): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })
}

export default httpClient