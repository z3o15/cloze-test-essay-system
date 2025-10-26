import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';

// HTTP客户端配置接口
interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// HTTP响应接口
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// HTTP错误接口
export interface HttpError extends Error {
  status?: number;
  response?: AxiosResponse;
  config?: AxiosRequestConfig;
}

/**
 * HTTP客户端工具类
 * 提供统一的HTTP请求处理，包含重试机制和错误处理
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config: HttpClientConfig = {}) {
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    // 创建axios实例
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cloze-Test-Backend/1.0.0'
      }
    });

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`HTTP请求: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('HTTP请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug(`HTTP响应: ${response.status} ${response.config.url}`, {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('HTTP响应错误:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 执行HTTP请求（带重试机制）
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt: number = 1
  ): Promise<HttpResponse<T>> {
    try {
      const response = await requestFn();
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      const isLastAttempt = attempt >= this.retries;
      const shouldRetry = this.shouldRetry(error);

      if (!isLastAttempt && shouldRetry) {
        logger.warn(`HTTP请求失败，第${attempt}次重试 (共${this.retries}次)`, {
          error: error.message,
          url: error.config?.url
        });
        
        // 等待后重试
        await this.delay(this.retryDelay * attempt);
        return this.executeWithRetry(requestFn, attempt + 1);
      }

      // 转换为标准错误格式
      const httpError: HttpError = new Error(error.message || 'HTTP请求失败');
      httpError.status = error.response?.status;
      httpError.response = error.response;
      httpError.config = error.config;

      throw httpError;
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误或超时错误应该重试
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return true;
    }

    // 5xx服务器错误应该重试
    if (error.response?.status >= 500) {
      return true;
    }

    // 429 Too Many Requests 应该重试
    if (error.response?.status === 429) {
      return true;
    }

    return false;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.executeWithRetry(() => this.axiosInstance.get<T>(url, config));
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.executeWithRetry(() => this.axiosInstance.post<T>(url, data, config));
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.executeWithRetry(() => this.axiosInstance.put<T>(url, data, config));
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.executeWithRetry(() => this.axiosInstance.delete<T>(url, config));
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.executeWithRetry(() => this.axiosInstance.patch<T>(url, data, config));
  }
}

// 创建默认的HTTP客户端实例
export const httpClient = new HttpClient({
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});

// 创建翻译API专用的HTTP客户端
export const translationHttpClient = new HttpClient({
  timeout: 60000, // 翻译API可能需要更长时间
  retries: 2,
  retryDelay: 2000
});

export default httpClient;