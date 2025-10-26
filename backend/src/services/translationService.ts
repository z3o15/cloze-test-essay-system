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
        if (service === 'volcano') {
          translationResult = await this.translateWithVolcano(text, sourceLang, targetLang);
        } else {
          translationResult = await this.translateWithTencent(text, sourceLang, targetLang);
        }
      } catch (error) {
        // 如果主要服务失败，尝试备用服务
        logger.warn(`${service}翻译失败，尝试备用服务:`, error);
        if (service === 'volcano') {
          logger.info('切换到腾讯翻译服务');
          translationResult = await this.translateWithTencent(text, sourceLang, targetLang);
        } else {
          logger.info('切换到火山翻译服务');
          translationResult = await this.translateWithVolcano(text, sourceLang, targetLang);
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
  private async translateWithTencent(_text: string, _sourceLang: string, _targetLang: string): Promise<string> {
    // 腾讯翻译实现（如果需要的话）
    throw new Error('腾讯翻译服务暂未实现');
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