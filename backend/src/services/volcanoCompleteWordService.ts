import axios from 'axios';
import { logger } from '@/utils/logger';

// 火山AI API配置
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '31fb0b92-d606-48ec-827b-45cf2feaa65a';
const VOLCANO_API_URL = process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const VOLCANO_MODEL = process.env.VOLCANO_MODEL || 'kimi-k2-250905';

// 完整单词信息接口
export interface CompleteWordInfo {
  word: string;
  chinese: string;
  phonetic?: string;
  difficulty_level: number; // 1-10级别
  part_of_speech?: string;
  definition?: string;
  source: 'volcano_ai';
}

// 批量处理结果
export interface BatchWordResult {
  success: CompleteWordInfo[];
  failed: { word: string; error: string }[];
  stats: {
    total: number;
    success_count: number;
    failure_count: number;
    processing_time: number;
  };
}

const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 3000
};

export class VolcanoCompleteWordService {
  
  /**
   * 检查环境变量配置
   */
  private static checkConfig(): void {
    if (!VOLCANO_API_KEY) {
      throw new Error('VOLCANO_API_KEY 环境变量未配置');
    }
    if (!VOLCANO_API_URL) {
      throw new Error('VOLCANO_API_URL 环境变量未配置');
    }
    logger.info(`火山AI配置检查通过: URL=${VOLCANO_API_URL}, Model=${VOLCANO_MODEL}, Key=${VOLCANO_API_KEY ? '已配置' : '未配置'}`);
  }
  
  /**
   * 使用火山AI获取单词的完整信息（翻译、音标、难度等级）
   * @param word 英文单词
   * @returns 完整的单词信息
   */
  static async getCompleteWordInfo(word: string): Promise<CompleteWordInfo> {
    if (!word || word.trim().length === 0) {
      throw new Error('单词不能为空');
    }
    
    this.checkConfig();

    logger.info(`开始获取单词完整信息: ${word}`);
    const prompt = this.buildCompleteWordPrompt(word);
    
    try {
      const response = await this.callVolcanoAIWithRetry(prompt);
      const result = this.parseCompleteWordResponse(word, response);
      logger.info(`单词 ${word} 完整信息获取成功: ${result.chinese}, 难度${result.difficulty_level}`);
      return result;
    } catch (error) {
      logger.error(`火山AI获取单词 ${word} 完整信息失败:`, error);
      throw error;
    }
  }

  /**
   * 批量获取单词完整信息
   * @param words 英文单词数组
   * @returns 批量处理结果
   */
  static async batchGetCompleteWordInfo(words: string[]): Promise<BatchWordResult> {
    if (words.length === 0) {
      return {
        success: [],
        failed: [],
        stats: { total: 0, success_count: 0, failure_count: 0, processing_time: 0 }
      };
    }

    this.checkConfig();

    const startTime = Date.now();
    logger.info(`开始批量获取 ${words.length} 个单词的完整信息`);

    // 优先尝试批量API调用
    try {
      const batchResults = await this.batchGetCompleteWordInfoOptimized(words);
      const processingTime = Date.now() - startTime;
      
      logger.info(`批量获取完成，成功 ${batchResults.length} 个单词，耗时 ${processingTime}ms`);
      
      return {
        success: batchResults,
        failed: [],
        stats: {
          total: words.length,
          success_count: batchResults.length,
          failure_count: words.length - batchResults.length,
          processing_time: processingTime
        }
      };
    } catch (error) {
      logger.warn('批量API调用失败，降级为分批处理:', error);
      return this.batchGetCompleteWordInfoFallback(words, startTime);
    }
  }

  /**
   * 优化的批量获取（真正的批量API调用）
   */
  private static async batchGetCompleteWordInfoOptimized(words: string[]): Promise<CompleteWordInfo[]> {
    const batchPrompt = this.buildBatchCompleteWordPrompt(words);
    const response = await this.callVolcanoAIWithRetry(batchPrompt);
    return this.parseBatchCompleteWordResponse(words, response);
  }

  /**
   * 降级处理：分批逐个获取
   */
  private static async batchGetCompleteWordInfoFallback(words: string[], startTime: number): Promise<BatchWordResult> {
    const results: CompleteWordInfo[] = [];
    const failed: { word: string; error: string }[] = [];
    const batchSize = 5; // 小批次处理

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchPromises = batch.map(word => 
        this.getCompleteWordInfo(word).catch(error => {
          logger.warn(`单词 ${word} 获取失败:`, error);
          failed.push({ word, error: error.message });
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as CompleteWordInfo[]);
      
      // 批次间延迟，避免频率限制
      if (i + batchSize < words.length) {
        await this.delay(500);
      }
    }

    const processingTime = Date.now() - startTime;
    return {
      success: results,
      failed,
      stats: {
        total: words.length,
        success_count: results.length,
        failure_count: failed.length,
        processing_time: processingTime
      }
    };
  }

  /**
   * 构建单个单词完整信息的Prompt
   */
  private static buildCompleteWordPrompt(word: string): string {
    return `请作为专业的英语词典，为以下英文单词提供完整信息：

单词：${word}

请提供以下信息：
1. 中文翻译（最常用的含义）
2. 音标（国际音标IPA格式）
3. 词性（如：n. v. adj. adv.等）
4. 简短定义（英文）
5. 难度等级（1-10级）

难度等级标准：
1级：最基础词汇 (a, the, is, go)
2级：基础动词名词 (come, man, woman)
3级：日常词汇 (about, after, good)
4级：高中水平 (important, different)
5级：大学水平 (sophisticated, comprehensive)
6级：学术词汇 (methodology, paradigm)
7级：高级学术 (epistemological, phenomenological)
8级：专业术语 (biochemistry, quantum)
9级：特定领域 (jurisprudence, ontological)
10级：罕见词汇 (sesquipedalian, perspicacious)

请以JSON格式回复：
{
  "word": "${word}",
  "chinese": "中文翻译",
  "phonetic": "/音标/",
  "part_of_speech": "词性",
  "definition": "英文定义",
  "difficulty_level": 数字(1-10)
}`;
  }

  /**
   * 构建批量单词完整信息的Prompt
   */
  private static buildBatchCompleteWordPrompt(words: string[]): string {
    const wordList = words.map((word, index) => 
      `${index + 1}. ${word}`
    ).join('\n');

    return `请作为专业的英语词典，为以下英文单词批量提供完整信息：

单词列表：
${wordList}

对每个单词请提供：
1. 中文翻译（最常用的含义）
2. 音标（国际音标IPA格式）
3. 词性（如：n. v. adj. adv.等）
4. 简短定义（英文）
5. 难度等级（1-10级）

难度等级标准：
1级：最基础词汇 (a, the, is, go)
2级：基础动词名词 (come, man, woman)
3级：日常词汇 (about, after, good)
4级：高中水平 (important, different)
5级：大学水平 (sophisticated, comprehensive)
6级：学术词汇 (methodology, paradigm)
7级：高级学术 (epistemological, phenomenological)
8级：专业术语 (biochemistry, quantum)
9级：特定领域 (jurisprudence, ontological)
10级：罕见词汇 (sesquipedalian, perspicacious)

请以JSON数组格式回复：
[
  {
    "word": "单词1",
    "chinese": "中文翻译",
    "phonetic": "/音标/",
    "part_of_speech": "词性",
    "definition": "英文定义",
    "difficulty_level": 数字(1-10)
  },
  {
    "word": "单词2",
    "chinese": "中文翻译",
    "phonetic": "/音标/",
    "part_of_speech": "词性",
    "definition": "英文定义",
    "difficulty_level": 数字(1-10)
  }
]`;
  }

  /**
   * 调用火山AI API（带重试机制）
   */
  private static async callVolcanoAIWithRetry(prompt: string): Promise<string> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
            RETRY_CONFIG.maxDelay
          );
          logger.info(`第 ${attempt + 1} 次尝试，延迟 ${delay}ms`);
          await this.delay(delay);
        }

        const response = await axios.post(VOLCANO_API_URL!, {
          model: VOLCANO_MODEL,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的英语词典助手，请提供准确、完整的单词信息。回复必须是有效的JSON格式。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        }, {
          headers: {
            'Authorization': `Bearer ${VOLCANO_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        });

        if (response.data.choices && response.data.choices.length > 0) {
          const content = response.data.choices[0].message.content.trim();
          logger.info(`火山AI API调用成功，返回内容长度: ${content.length}`);
          return content;
        } else {
          throw new Error('火山AI API返回格式错误');
        }

      } catch (error) {
        lastError = error;
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorMsg = `HTTP ${status}: ${error.response?.statusText}`;
          logger.warn(`火山AI API调用失败 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}): ${errorMsg}`);
          
          // 对于某些错误不重试
          if (status === 401 || status === 403 || status === 404) {
            throw new Error(`火山AI API认证或配置错误: ${errorMsg}`);
          }
        } else {
          logger.warn(`火山AI API调用失败 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}): ${error}`);
        }
      }
    }

    throw new Error(`火山AI API调用失败，已重试 ${RETRY_CONFIG.maxRetries} 次: ${lastError?.message}`);
  }

  /**
   * 解析单个单词的完整信息响应
   */
  private static parseCompleteWordResponse(word: string, response: string): CompleteWordInfo {
    try {
      // 清理响应内容，移除可能的markdown格式
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanResponse);

      return {
        word: word.toLowerCase(),
        chinese: data.chinese || '',
        phonetic: data.phonetic || '',
        difficulty_level: this.validateDifficultyLevel(data.difficulty_level),
        part_of_speech: data.part_of_speech || '',
        definition: data.definition || '',
        source: 'volcano_ai'
      };
    } catch (error) {
      logger.error(`解析单词 ${word} 响应失败:`, error);
      logger.error(`原始响应:`, response);
      throw new Error(`解析火山AI响应失败: ${error}`);
    }
  }

  /**
   * 解析批量单词的完整信息响应
   */
  private static parseBatchCompleteWordResponse(words: string[], response: string): CompleteWordInfo[] {
    try {
      // 清理响应内容，移除可能的markdown格式
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const dataArray = JSON.parse(cleanResponse);

      if (!Array.isArray(dataArray)) {
        throw new Error('响应不是数组格式');
      }

      return dataArray.map((data, index) => ({
        word: (data.word || words[index] || '').toLowerCase(),
        chinese: data.chinese || '',
        phonetic: data.phonetic || '',
        difficulty_level: this.validateDifficultyLevel(data.difficulty_level),
        part_of_speech: data.part_of_speech || '',
        definition: data.definition || '',
        source: 'volcano_ai'
      }));
    } catch (error) {
      logger.error(`解析批量响应失败:`, error);
      logger.error(`原始响应:`, response);
      throw new Error(`解析火山AI批量响应失败: ${error}`);
    }
  }

  /**
   * 验证难度等级
   */
  private static validateDifficultyLevel(level: any): number {
    const numLevel = parseInt(level);
    if (isNaN(numLevel) || numLevel < 1 || numLevel > 10) {
      logger.warn(`无效的难度等级: ${level}，使用默认值5`);
      return 5; // 默认中等难度
    }
    return numLevel;
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}