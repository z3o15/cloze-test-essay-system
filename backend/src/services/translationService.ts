import axios from 'axios';
import crypto from 'crypto-js';
import { logger } from '@/utils/logger';
import { CacheService } from '@/config/redis';
import { TranslationRequest, TranslationResponse, TranslationHistory } from '@/models/types';
import { TranslationRepository } from '@/repositories/translationRepository';

export class TranslationService {
  private translationRepo: TranslationRepository;
  private cacheTTL: number;

  constructor() {
    this.translationRepo = new TranslationRepository();
    this.cacheTTL = parseInt(process.env.CACHE_TTL_TRANSLATION || '86400'); // 24小时
  }

  /**
   * 主要翻译方法
   */
  async translate(request: TranslationRequest, userIp?: string, userAgent?: string): Promise<TranslationResponse> {
    const {
      text,
      source_lang = 'auto',
      target_lang = 'zh',
      service = 'tencent'
    } = request;

    // 输入验证
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本不能为空');
    }

    if (text.length > 5000) {
      throw new Error('翻译文本长度不能超过5000字符');
    }

    // 生成缓存键
    const cacheKey = this.generateCacheKey(text, source_lang, target_lang);
    
    try {
      // 尝试从缓存获取
      const cachedResult = await CacheService.get<TranslationResponse>(cacheKey);
      if (cachedResult) {
        logger.info(`翻译缓存命中: ${cacheKey}`);
        return {
          ...cachedResult,
          cached: true,
          timestamp: new Date()
        };
      }

      // 执行翻译
      let translationResult: string;
      
      if (service === 'volcano') {
        translationResult = await this.translateWithVolcano(text, source_lang, target_lang);
      } else {
        translationResult = await this.translateWithTencent(text, source_lang, target_lang);
      }

      // 构建响应
      const response: TranslationResponse = {
        source_text: text,
        target_text: translationResult,
        source_lang,
        target_lang,
        service,
        cached: false,
        timestamp: new Date()
      };

      // 保存到缓存
      await CacheService.set(cacheKey, response, this.cacheTTL);

      // 保存到数据库
      try {
        const createData: any = {
          source_text: text,
          target_text: translationResult,
          source_lang,
          target_lang,
          translation_service: service
        };
        
        if (userIp) createData.user_ip = userIp;
        if (userAgent) createData.user_agent = userAgent;
        
        await this.translationRepo.create(createData);
      } catch (dbError) {
        logger.error('保存翻译历史失败:', dbError);
        // 不影响翻译结果返回
      }

      logger.info(`翻译完成: ${service}, ${text.substring(0, 50)}...`);
      return response;

    } catch (error) {
      // 安全地记录错误，避免循环引用
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logger.error('翻译失败:', errorMessage);
      throw new Error(`翻译失败: ${errorMessage}`);
    }
  }

  /**
   * 腾讯云翻译API（带频率限制重试）
   */
  private async translateWithTencent(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    const region = process.env.TENCENT_REGION || 'ap-beijing';

    if (!secretId || !secretKey) {
      throw new Error('腾讯翻译API配置缺失');
    }

    // 重试配置
    const maxRetries = 3;
    const baseDelay = 1000; // 1秒基础延迟

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const endpoint = 'tmt.tencentcloudapi.com';
        const service = 'tmt';
        const version = '2018-03-21';
        const action = 'TextTranslate';
        
        // 当前时间戳
        const timestamp = Math.floor(Date.now() / 1000);
        const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

        // 请求体
        const payload = JSON.stringify({
          SourceText: text,
          Source: sourceLang === 'auto' ? 'auto' : sourceLang,
          Target: targetLang,
          ProjectId: 0
        });

        // 构建规范请求串
        const httpRequestMethod = 'POST';
        const canonicalUri = '/';
        const canonicalQueryString = '';
        const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${endpoint}\n`;
        const signedHeaders = 'content-type;host';
        const hashedRequestPayload = crypto.SHA256(payload).toString();
        
        const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

        // 构建待签名字符串
        const algorithm = 'TC3-HMAC-SHA256';
        const credentialScope = `${date}/${service}/tc3_request`;
        const hashedCanonicalRequest = crypto.SHA256(canonicalRequest).toString();
        const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

        // 计算签名
        const secretDate = crypto.HmacSHA256(date, `TC3${secretKey}`);
        const secretService = crypto.HmacSHA256(service, secretDate);
        const secretSigning = crypto.HmacSHA256('tc3_request', secretService);
        const signature = crypto.HmacSHA256(stringToSign, secretSigning).toString();

        // 构建Authorization
        const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        const response = await axios.post(`https://${endpoint}`, payload, {
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': endpoint,
            'X-TC-Action': action,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Version': version,
            'X-TC-Region': region
          },
          timeout: 15000 // 增加超时时间
        });

        if (response.data.Response?.Error) {
          throw new Error(`腾讯云翻译API错误: ${response.data.Response.Error.Message}`);
        }

        return response.data.Response.TargetText;
      } catch (error) {
        // 安全地记录错误，避免循环引用
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const errorCode = (error as any)?.code;
        const errorStatus = (error as any)?.response?.status;
        
        logger.error(`腾讯翻译API调用失败 (尝试 ${attempt}/${maxRetries}):`, {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });

        // 检查是否是频率限制错误
        const isRateLimitError = errorMessage.includes('请求频率超过限制') || 
                                errorMessage.includes('rate limit') || 
                                errorMessage.includes('RequestLimitExceeded') ||
                                errorCode === 'RequestLimitExceeded';

        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxRetries) {
          if (isRateLimitError) {
            throw new Error('翻译服务请求频率超过限制，请稍后重试');
          }
          throw new Error('翻译服务异常');
        }

        // 如果是频率限制错误，使用指数退避延迟
        if (isRateLimitError) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // 指数退避：1s, 2s, 4s
          logger.warn(`检测到频率限制，等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // 其他错误，短暂延迟后重试
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // 如果所有重试都失败了，抛出最终错误
    throw new Error('翻译服务在多次重试后仍然失败');
  }

  /**
   * 火山翻译API
   */
  private async translateWithVolcano(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const apiKey = process.env.VOLCANO_API_KEY;
    const url = process.env.VOLCANO_API_URL;
    const model = process.env.VOLCANO_MODEL || 'doubao-lite-4k';

    if (!apiKey || !url) {
      throw new Error('火山翻译API配置不完整');
    }

    const prompt = `请将以下${sourceLang === 'auto' ? '' : sourceLang}文本翻译成${targetLang}：\n\n${text}`;

    try {
      const response = await axios.post(url, {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，请提供准确、自然的翻译结果，只返回翻译内容，不要添加任何解释。'
          },
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
      // 详细记录错误信息
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        };
        logger.error('🔥 火山翻译API调用失败 (Axios错误):', errorDetails);
        console.error('🔥 火山翻译API调用失败:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          url: error.config?.url
        });
        throw new Error(`火山翻译API错误: ${error.response?.status} ${error.response?.statusText}`);
      } else {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        logger.error('🔥 火山翻译API调用失败:', errorMessage);
        console.error('🔥 火山翻译API调用失败 (非Axios错误):', {
          message: errorMessage,
          type: typeof error
        });
        throw new Error(`火山翻译服务错误: ${errorMessage}`);
      }
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(text: string, sourceLang: string, targetLang: string): string {
    const hash = crypto.MD5(text).toString();
    return `translation:${sourceLang}:${targetLang}:${hash}`;
  }

  /**
   * 获取翻译历史
   */
  async getTranslationHistory(page: number = 1, limit: number = 20): Promise<{
    data: TranslationHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
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
      throw new Error('获取翻译历史失败');
    }
  }

  /**
   * 获取翻译统计
   */
  async getTranslationStats(days: number = 7): Promise<any> {
    try {
      return await this.translationRepo.getStats(days);
    } catch (error) {
      logger.error('获取翻译统计失败:', error);
      throw new Error('获取翻译统计失败');
    }
  }

  /**
   * 清除翻译缓存
   */
  async clearTranslationCache(pattern?: string): Promise<number> {
    try {
      const cachePattern = pattern || 'translation:*';
      const deletedCount = await CacheService.delPattern(cachePattern);
      logger.info(`清除翻译缓存: ${deletedCount} 条记录`);
      return deletedCount;
    } catch (error) {
      logger.error('清除翻译缓存失败:', error);
      throw new Error('清除翻译缓存失败');
    }
  }

  /**
   * 批量翻译
   */
  async batchTranslate(
    texts: string[],
    sourceLang: string = 'auto',
    targetLang: string = 'zh',
    service: 'tencent' | 'volcano' = 'tencent'
  ): Promise<TranslationResponse[]> {
    if (texts.length === 0) {
      return [];
    }

    if (texts.length > 10) {
      throw new Error('批量翻译最多支持10条文本');
    }

    const results: TranslationResponse[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.translate({
          text,
          source_lang: sourceLang,
          target_lang: targetLang,
          service
        });
        results.push(result);
      } catch (error) {
        logger.error(`批量翻译失败: ${text}`, error);
        results.push({
          source_text: text,
          target_text: '',
          source_lang: sourceLang,
          target_lang: targetLang,
          service,
          cached: false,
          timestamp: new Date()
        });
      }
    }

    return results;
  }
}