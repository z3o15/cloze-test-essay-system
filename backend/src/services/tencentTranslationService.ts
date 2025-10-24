import axios from 'axios';
import * as crypto from 'crypto-js';
import { logger } from '@/utils/logger';

// 腾讯翻译API返回的单词信息接口
export interface TencentWordResult {
  word: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition?: string;
}

/**
 * 腾讯翻译服务 - 专门用于单词翻译和词汇信息获取
 */
export class TencentTranslationService {
  private static readonly ENDPOINT = 'tmt.tencentcloudapi.com';
  private static readonly SERVICE = 'tmt';
  private static readonly VERSION = '2018-03-21';
  private static readonly REGION = process.env.TENCENT_REGION || 'ap-beijing';

  /**
   * 翻译单词并获取详细信息
   */
  static async translateWord(word: string): Promise<TencentWordResult> {
    const secretId = process.env.TENCENT_APP_ID;
    const secretKey = process.env.TENCENT_APP_KEY;

    if (!secretId || !secretKey) {
      throw new Error('腾讯翻译API配置缺失');
    }

    try {
      // 基础翻译
      const translation = await this.callTextTranslateAPI(word, secretId, secretKey);
      
      // 尝试获取更多词汇信息（如果有词典API的话）
      // 这里暂时只返回基础翻译，后续可以扩展
      
      return {
        word,
        translation,
        pronunciation: this.generatePhonetic(word), // 简单的音标生成
        partOfSpeech: this.guessPartOfSpeech(word), // 简单的词性推测
        definition: translation // 暂时用翻译作为定义
      };
    } catch (error) {
      logger.error(`腾讯翻译单词失败: ${word}`, error);
      throw error;
    }
  }

  /**
   * 调用腾讯云文本翻译API
   */
  private static async callTextTranslateAPI(
    text: string, 
    secretId: string, 
    secretKey: string
  ): Promise<string> {
    const action = 'TextTranslate';
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

    // 请求体
    const payload = JSON.stringify({
      SourceText: text,
      Source: 'en',
      Target: 'zh',
      ProjectId: 0
    });

    // 构建规范请求串
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${this.ENDPOINT}\n`;
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = crypto.SHA256(payload).toString();
    
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

    // 构建待签名字符串
    const algorithm = 'TC3-HMAC-SHA256';
    const credentialScope = `${date}/${this.SERVICE}/tc3_request`;
    const hashedCanonicalRequest = crypto.SHA256(canonicalRequest).toString();
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    // 计算签名
    const secretDate = crypto.HmacSHA256(date, `TC3${secretKey}`);
    const secretService = crypto.HmacSHA256(this.SERVICE, secretDate);
    const secretSigning = crypto.HmacSHA256('tc3_request', secretService);
    const signature = crypto.HmacSHA256(stringToSign, secretSigning).toString();

    // 构建Authorization
    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await axios.post(`https://${this.ENDPOINT}`, payload, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': this.ENDPOINT,
        'X-TC-Action': action,
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Version': this.VERSION,
        'X-TC-Region': this.REGION
      },
      timeout: 10000
    });

    if (response.data.Response?.Error) {
      throw new Error(`腾讯云翻译API错误: ${response.data.Response.Error.Message}`);
    }

    return response.data.Response.TargetText;
  }

  /**
   * 调用腾讯云批量文本翻译API
   */
  private static async callTextTranslateBatchAPI(
    texts: string[], 
    secretId: string, 
    secretKey: string
  ): Promise<string[]> {
    const action = 'TextTranslateBatch';
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

    // 请求体 - 使用批量翻译API的参数格式
    const payload = JSON.stringify({
      SourceTextList: texts,
      Source: 'en',
      Target: 'zh',
      ProjectId: 0
    });

    // 构建规范请求串
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${this.ENDPOINT}\n`;
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = crypto.SHA256(payload).toString();
    
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

    // 构建待签名字符串
    const algorithm = 'TC3-HMAC-SHA256';
    const credentialScope = `${date}/${this.SERVICE}/tc3_request`;
    const hashedCanonicalRequest = crypto.SHA256(canonicalRequest).toString();
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    // 计算签名
    const secretDate = crypto.HmacSHA256(date, `TC3${secretKey}`);
    const secretService = crypto.HmacSHA256(this.SERVICE, secretDate);
    const secretSigning = crypto.HmacSHA256('tc3_request', secretService);
    const signature = crypto.HmacSHA256(stringToSign, secretSigning).toString();

    // 构建Authorization
    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await axios.post(`https://${this.ENDPOINT}`, payload, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': this.ENDPOINT,
        'X-TC-Action': action,
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Version': this.VERSION,
        'X-TC-Region': this.REGION
      },
      timeout: 15000 // 批量翻译可能需要更长时间
    });

    if (response.data.Response?.Error) {
      throw new Error(`腾讯云批量翻译API错误: ${response.data.Response.Error.Message}`);
    }

    // 返回翻译结果数组
    return response.data.Response.TargetTextList || [];
  }

  /**
   * 简单的音标生成（占位实现）
   * 实际项目中可以集成专门的音标API或词典
   */
  private static generatePhonetic(word: string): string {
    // 这里是一个简化的实现，实际应该调用专门的音标API
    // 或者维护一个音标词典
    return `/${word}/`; // 占位符格式
  }

  /**
   * 简单的词性推测（占位实现）
   * 实际项目中可以使用NLP库或词典API
   */
  private static guessPartOfSpeech(word: string): string {
    // 简单的词性推测规则
    if (word.endsWith('ing')) return 'v.';
    if (word.endsWith('ed')) return 'v.';
    if (word.endsWith('ly')) return 'adv.';
    if (word.endsWith('tion') || word.endsWith('sion')) return 'n.';
    if (word.endsWith('ful') || word.endsWith('less')) return 'adj.';
    
    // 默认返回名词
    return 'n.';
  }

  /**
   * 批量翻译单词（使用腾讯云批量文本翻译API）
   * 使用真正的批量API调用，提高效率并减少API调用次数
   */
  static async batchTranslateWords(words: string[]): Promise<TencentWordResult[]> {
    if (words.length === 0) {
      return [];
    }

    const secretId = process.env.TENCENT_APP_ID;
    const secretKey = process.env.TENCENT_APP_KEY;

    if (!secretId || !secretKey) {
      throw new Error('腾讯翻译API配置缺失');
    }

    const results: TencentWordResult[] = [];
    const batchSize = 20; // 每批处理20个单词，腾讯云批量API支持更多

    try {
      // 分批处理，避免单次请求过大
      for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        
        logger.info(`批量翻译第${Math.floor(i/batchSize) + 1}批: ${batch.length}个单词`);
        
        try {
          // 调用腾讯云批量翻译API
          const translations = await this.callTextTranslateBatchAPI(batch, secretId, secretKey);
          
          // 处理每个单词的结果
          for (let j = 0; j < batch.length; j++) {
            const word = batch[j];
            const translation = translations[j] || word; // 如果翻译失败，使用原词
            
            results.push({
              word,
              translation: translation.trim(),
              pronunciation: this.generatePhonetic(word),
              partOfSpeech: this.guessPartOfSpeech(word),
              definition: translation.trim()
            });
          }
          
          // 批次间延迟，避免API限流
          if (i + batchSize < words.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
        } catch (error) {
          logger.error(`批量翻译第${Math.floor(i/batchSize) + 1}批失败:`, error);
          
          // 降级处理：逐个翻译这一批的单词
          for (const word of batch) {
            try {
              const result = await this.translateWord(word);
              results.push(result);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (singleError) {
              logger.error(`单词翻译失败: ${word}`, singleError);
              // 添加默认结果，避免丢失单词
              results.push({
                word,
                translation: word, // 翻译失败时使用原词
                pronunciation: this.generatePhonetic(word),
                partOfSpeech: this.guessPartOfSpeech(word),
                definition: word
              });
            }
          }
        }
      }
      
      logger.info(`批量翻译完成: 共处理${words.length}个单词，成功${results.length}个`);
      return results;
      
    } catch (error) {
      logger.error('批量翻译失败:', error);
      throw error;
    }
  }

  /**
   * 检查API配置是否完整
   */
  static checkConfiguration(): boolean {
    const secretId = process.env.TENCENT_APP_ID;
    const secretKey = process.env.TENCENT_APP_KEY;
    
    return !!(secretId && secretKey);
  }
}