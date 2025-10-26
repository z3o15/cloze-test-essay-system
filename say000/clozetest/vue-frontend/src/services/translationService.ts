import httpClient from '../utils/httpClient';
import { API_URLS } from '../config/api';

export interface TranslationRequest {
  text: string;
  source_lang?: string;
  target_lang?: string;
  service?: 'tencent' | 'volcano';
}

export interface TranslationResponse {
  original: string;
  translated: string;
  cached: boolean;
  service: string;
  error?: string;
}

export interface BatchTranslationRequest {
  texts: string[];
  source_lang?: string;
  target_lang?: string;
  service?: 'tencent' | 'volcano';
}

export interface TranslationHistoryItem {
  id: number;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  service: string;
  created_at: string;
}

export interface TranslationHistoryResponse {
  data: TranslationHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export class TranslationService {
  /**
   * 翻译单个文本
   */
  static async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await httpClient.post(API_URLS.translation.translate(), {
        text: request.text,
        source_lang: request.source_lang || 'auto',
        target_lang: request.target_lang || 'zh',
        service: request.service || 'volcano'
      }, {
        timeout: 30000
      });

      if (response.data.code === 'SUCCESS') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '翻译失败');
      }
    } catch (error: any) {
      console.error('翻译失败:', error);
      throw error;
    }
  }

  /**
   * 批量翻译
   */
  static async batchTranslate(request: BatchTranslationRequest): Promise<TranslationResponse[]> {
    try {
      const response = await httpClient.post(API_URLS.translation.batch(), {
        texts: request.texts,
        source_lang: request.source_lang || 'auto',
        target_lang: request.target_lang || 'zh',
        service: request.service || 'volcano'
      }, {
        timeout: 30000
      });

      if (response.data.code === 'SUCCESS') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '批量翻译失败');
      }
    } catch (error: any) {
      console.error('批量翻译失败:', error);
      throw error;
    }
  }

  /**
   * 获取翻译历史
   */
  static async getHistory(page: number = 1, limit: number = 20): Promise<TranslationHistoryResponse> {
    try {
      const response = await httpClient.get(`${API_URLS.translation.history()}?page=${page}&limit=${limit}`, {
        timeout: 10000
      });

      if (response.data.code === 'SUCCESS') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '获取翻译历史失败');
      }
    } catch (error: any) {
      console.error('获取翻译历史失败:', error);
      throw error;
    }
  }

  /**
   * 翻译段落（兼容旧接口）
   */
  static async translateParagraph(text: string, sourceLang: string = 'auto', targetLang: string = 'zh'): Promise<TranslationResponse> {
    return this.translate({
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
      service: 'volcano'
    });
  }

  /**
   * 检查翻译缓存
   */
  static async checkCache(text: string, sourceLang: string = 'auto', targetLang: string = 'zh'): Promise<TranslationResponse | null> {
    try {
      // 先尝试翻译，如果有缓存会直接返回
      const result = await this.translate({
        text,
        source_lang: sourceLang,
        target_lang: targetLang
      });
      
      return result.cached ? result : null;
    } catch (error: any) {
      console.warn('检查翻译缓存失败:', error);
      return null;
    }
  }
}