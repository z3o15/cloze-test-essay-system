import axios from 'axios'

// 确定API基础URL
const getApiBaseUrl = (): string => {
  // 在开发环境中，使用本地Edge Functions服务器
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  
  // 在生产环境中，使用相对路径避免跨域问题
  // EdgeOne会通过路由配置将/api/*请求转发到对应的Edge Functions
  return ''
}

// 创建axios实例
const httpClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 5000, // 减少超时时间以更快响应错误
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
      if (error.response.status >= 500) {
        // 服务器内部错误
      } else if (error.response.status === 404) {
        // 资源未找到
      } else if (error.response.status === 405) {
        // 方法不允许
        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          // 错误响应是HTML格式
        }
      }
    } else if (error.request) {
      // 网络错误或服务器无响应
    } else {
      // 请求配置错误
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
    
    // 只有网络错误才重试，不重试服务器返回的错误
    if (!error.response && config.url?.includes('/api/word-query')) {
      // 创建一个延迟函数
      const delay = new Promise(resolve => {
        setTimeout(resolve, config.retryDelay || 1000)
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