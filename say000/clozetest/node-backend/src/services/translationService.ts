import axios from 'axios';
import CryptoJS from 'crypto-js';
import { logger } from '../utils/logger';
import { TranslationRepository } from '../repositories/translationRepository';
import type { TranslationResponse } from '../models/types';

export class TranslationService {
  private translationRepo: TranslationRepository;

  constructor() {
    this.translationRepo = new TranslationRepository();
  }

  /**
   * 翻译文本
   */
  async translate(
    text: string, 
    sourceLang: string = 'auto', 
    targetLang: string = 'zh',
    service: 'tencent' | 'volcano' = 'volcano'
  ): Promise<TranslationResponse> {
    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
      const cached = await this.translationRepo.findByKey(cacheKey);
      
      if (cached) {
        logger.info('使用缓存翻译结果');
        return {
          original: text,
          translated: cached.translated_text,
          source_language: sourceLang,
          target_language: targetLang,
          cached: true,
          service
        };
      }

      let translationResult: string;
      
      try {
        // 优先使用EdgeFN API
        translationResult = await this.translateWithEdgeFN(text, sourceLang, targetLang);
        logger.info('使用EdgeFN翻译服务成功');
      } catch (error) {
        // 如果EdgeFN失败，尝试火山翻译作为备用
        logger.warn('EdgeFN翻译失败，尝试火山翻译服务:', error);
        try {
          translationResult = await this.translateWithVolcano(text, sourceLang, targetLang);
          logger.info('切换到火山翻译服务成功');
        } catch (volcanoError) {
          logger.error('所有翻译服务都失败了:', volcanoError);
          throw new Error('翻译服务暂时不可用，请稍后重试');
        }
      }

      // 保存到数据库
      await this.translationRepo.create({
        source_text: text,
        translated_text: translationResult,
        source_lang: sourceLang,
        target_lang: targetLang,
        service,
        cache_key: cacheKey
      });

      return {
        original: text,
        translated: translationResult,
        source_language: sourceLang,
        target_language: targetLang,
        cached: false,
        service
      };
    } catch (error) {
      logger.error('翻译失败:', error);
      throw error;
    }
  }

  /**
   * 使用火山API翻译
   */
  private async translateWithVolcano(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const apiKey = process.env.VOLCANO_API_KEY;
    const url = process.env.VOLCANO_API_URL;
    const model = process.env.VOLCANO_MODEL || 'ep-20241022140820-8xqpz';

    if (!apiKey || !url) {
      throw new Error('火山翻译API配置不完整');
    }

    const prompt = `请将以下${sourceLang === 'auto' ? '' : sourceLang}文本翻译成${targetLang}，只返回翻译结果，不要添加任何解释：\n\n${text}`;

    try {
      const response = await axios.post(url, {
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('火山翻译API返回格式错误');
      }
    } catch (error) {
      logger.error('火山翻译API调用失败:', error);
      throw new Error('火山翻译服务暂时不可用');
    }
  }

  /**
   * 使用腾讯API翻译（备用）
   */
  private async translateWithTencent(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // 使用EdgeFN API作为备用翻译服务
    return await this.translateWithEdgeFN(text, sourceLang, targetLang);
  }

  /**
   * 使用EdgeFN API翻译
   */
  private async translateWithEdgeFN(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const apiKey = process.env.EDGEFN_API_KEY;
    const url = process.env.EDGEFN_API_URL;
    const model = process.env.EDGEFN_MODEL || 'gpt-3.5-turbo';

    if (!apiKey || !url) {
      throw new Error('EdgeFN翻译API配置不完整');
    }

    const prompt = `请将以下${sourceLang === 'auto' ? '' : sourceLang}文本翻译成${targetLang}，只返回翻译结果，不要添加任何解释：\n\n${text}`;

    try {
      const response = await axios.post(url, {
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('EdgeFN翻译API返回格式错误');
      }
    } catch (error) {
      logger.error('EdgeFN翻译API调用失败:', error);
      throw new Error('EdgeFN翻译服务暂时不可用');
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(text: string, sourceLang: string, targetLang: string): string {
    const hash = CryptoJS.MD5(text).toString();
    return `translation:${sourceLang}:${targetLang}:${hash}`;
  }

  /**
   * 获取翻译历史
   */
  async getTranslationHistory(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      const result = await this.translationRepo.findMany({
        limit,
        offset,
        orderBy: 'created_at DESC'
      });

      const total = await this.translationRepo.count();

      return {
        data: result,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('获取翻译历史失败:', error);
      throw error;
    }
  }

  /**
   * 批量翻译
   */
  async batchTranslate(
    texts: string[], 
    sourceLang: string = 'auto', 
    targetLang: string = 'zh',
    service: 'tencent' | 'volcano' = 'volcano'
  ): Promise<TranslationResponse[]> {
    const results: TranslationResponse[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.translate(text, sourceLang, targetLang, service);
        results.push(result);
      } catch (error) {
        logger.error(`翻译失败: ${text}`, error);
        results.push({
          original: text,
          translated: text, // 翻译失败时返回原文
          source_language: sourceLang,
          target_language: targetLang,
          cached: false,
          service
        });
      }
    }

    return results;
  }
}