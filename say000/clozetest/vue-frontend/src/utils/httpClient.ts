import axios from 'axios'
import { API_CONFIG } from '../config/api'

// 1. 先创建axios实例
const httpClient = axios.create({
  baseURL: API_CONFIG.baseURL, // 不添加/api，由端点配置处理
  timeout: API_CONFIG.defaults.timeout,
  headers: API_CONFIG.defaults.headers,
})

// 2. 请求拦截器
httpClient.interceptors.request.use(
  config => {
    // 简单的日志记录
    console.log('🚀 API请求:', config.method?.toUpperCase(), config.url);
    return config
  },
  error => Promise.reject(error)
)

// 3. 【第二步：添加响应拦截器 - 处理错误】
httpClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      return Promise.reject(new Error('服务器返回HTML错误页面'));
    }
    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch {}
    }
    if (typeof response.data !== 'object' || response.data === null) {
      response.data = { raw: response.data };
    }
    if (response.data.error || (response.data.success === false && response.status !== 200)) {
      return Promise.reject(new Error(response.data.error || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      switch(error.response.status) {
        case 429:
          error.message = '请求过于频繁，请5分钟后再试';
          break;
        case 404:
          error.message = '请求的资源未找到（路径可能仍有问题）';
          break;
        case 500:
          error.message = '服务器内部错误';
          break;
        default:
          error.message = error.response.data?.error || '请求错误';
      }
    } else {
      error.message = '网络连接失败';
    }
    return Promise.reject(error);
  }
)

// 4. 【第三步：添加重试拦截器 - 缓解429】
httpClient.interceptors.response.use(
  response => response,
  async (error) => {
    const config = error.config;
    if (!config || !config.retry) return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    // 仅网络错误重试，间隔延长到5秒
    if (!error.response) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return httpClient(config);
    }
    return Promise.reject(error);
  }
)

// 超时工具函数
export const createTimeoutPromise = (ms: number, message: string): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

export default httpClient