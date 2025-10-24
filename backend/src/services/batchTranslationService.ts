import { logger } from '@/utils/logger';
import { httpClient } from '@/utils/httpClient';
import { WordDifficultyService, WordDifficultyLevel } from './wordDifficultyService';

// 批处理翻译配置
export interface BatchTranslationConfig {
  batchSize: number;        // 每批处理的单词数量
  maxRetries: number;       // 最大重试次数
  retryDelay: number;       // 重试延迟时间(ms)
  timeout: number;          // 请求超时时间(ms)
}

// 翻译结果接口
export interface WordTranslationResult {
  sourceWord: string;
  translatedWord: string;
  difficultyLevel: WordDifficultyLevel;
  success: boolean;
  error?: string;
  retryCount: number;
}

// 批处理翻译结果
export interface BatchTranslationResult {
  totalWords: number;
  successCount: number;
  failureCount: number;
  results: WordTranslationResult[];
  failedWords: string[];
  processingTime: number;
}

export class BatchTranslationService {
  private static readonly DEFAULT_CONFIG: BatchTranslationConfig = {
    batchSize: 20,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000
  };

  /**
   * 批量翻译单词
   * @param words 待翻译的单词数组
   * @param config 批处理配置
   * @returns 批处理翻译结果
   */
  public static async batchTranslateWords(
    words: string[], 
    config: Partial<BatchTranslationConfig> = {}
  ): Promise<BatchTranslationResult> {
    const startTime = Date.now();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    logger.info(`开始批量翻译: ${words.length}个单词, 批大小: ${finalConfig.batchSize}`);
    
    // 1. 预处理: 过滤简单词汇和去重
    const filteredWords = WordDifficultyService.filterComplexWords(words);
    
    if (filteredWords.length === 0) {
      logger.info('所有单词都被过滤，无需翻译');
      return {
        totalWords: words.length,
        successCount: 0,
        failureCount: 0,
        results: [],
        failedWords: [],
        processingTime: Date.now() - startTime
      };
    }
    
    // 2. 分批处理
    const batches = this.createBatches(filteredWords, finalConfig.batchSize);
    const allResults: WordTranslationResult[] = [];
    const failedWords: string[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`处理第 ${i + 1}/${batches.length} 批: ${batch.length}个单词`);
      
      try {
        const batchResults = await this.processBatch(batch, finalConfig);
        allResults.push(...batchResults);
        
        // 收集失败的单词
        batchResults.forEach(result => {
          if (!result.success) {
            failedWords.push(result.sourceWord);
          }
        });
        
        // 批次间延迟，避免API限流
        if (i < batches.length - 1) {
          await this.delay(500);
        }
        
      } catch (error) {
        logger.error(`批次 ${i + 1} 处理失败:`, error);
        
        // 将整个批次标记为失败
        batch.forEach(word => {
          failedWords.push(word);
          allResults.push({
            sourceWord: word,
            translatedWord: '',
            difficultyLevel: WordDifficultyService.getWordDifficultyLevel(word),
            success: false,
            error: `批次处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
            retryCount: 0
          });
        });
      }
    }
    
    const successCount = allResults.filter(r => r.success).length;
    const processingTime = Date.now() - startTime;
    
    logger.info(`批量翻译完成: 成功${successCount}个, 失败${failedWords.length}个, 耗时${processingTime}ms`);
    
    return {
      totalWords: words.length,
      successCount,
      failureCount: failedWords.length,
      results: allResults,
      failedWords,
      processingTime
    };
  }
  
  /**
   * 处理单个批次
   * @param batch 批次中的单词
   * @param config 配置
   * @returns 批次翻译结果
   */
  private static async processBatch(
    batch: string[], 
    config: BatchTranslationConfig
  ): Promise<WordTranslationResult[]> {
    const results: WordTranslationResult[] = [];
    
    // 并发处理批次中的每个单词
    const promises = batch.map(word => this.translateWordWithRetry(word, config));
    const batchResults = await Promise.allSettled(promises);
    
    batchResults.forEach((result, index) => {
      const word = batch[index];
      
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        logger.error(`单词 "${word}" 翻译失败:`, result.reason);
        results.push({
          sourceWord: word,
          translatedWord: '',
          difficultyLevel: WordDifficultyService.getWordDifficultyLevel(word),
          success: false,
          error: result.reason instanceof Error ? result.reason.message : '翻译失败',
          retryCount: 0
        });
      }
    });
    
    return results;
  }
  
  /**
   * 带重试机制的单词翻译
   * @param word 待翻译单词
   * @param config 配置
   * @returns 翻译结果
   */
  private static async translateWordWithRetry(
    word: string, 
    config: BatchTranslationConfig
  ): Promise<WordTranslationResult> {
    let lastError: Error | null = null;
    let retryCount = 0;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.debug(`重试翻译单词 "${word}", 第${attempt}次重试`);
          await this.delay(config.retryDelay * attempt); // 递增延迟
        }
        
        const translatedWord = await this.translateSingleWord(word, config.timeout);
        const difficultyLevel = WordDifficultyService.getWordDifficultyLevel(word);
        
        return {
          sourceWord: word,
          translatedWord,
          difficultyLevel,
          success: true,
          retryCount: attempt
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('未知错误');
        retryCount = attempt;
        
        if (attempt < config.maxRetries) {
          logger.warn(`单词 "${word}" 翻译失败，准备重试: ${lastError.message}`);
        }
      }
    }
    
    logger.error(`单词 "${word}" 翻译最终失败，已重试${config.maxRetries}次:`, lastError);
    
    return {
      sourceWord: word,
      translatedWord: '',
      difficultyLevel: WordDifficultyService.getWordDifficultyLevel(word),
      success: false,
      error: lastError?.message || '翻译失败',
      retryCount
    };
  }
  
  /**
   * 翻译单个单词
   * @param word 待翻译单词
   * @param timeout 超时时间
   * @returns 翻译结果
   */
  private static async translateSingleWord(word: string, timeout: number): Promise<string> {
    try {
      const response = await httpClient.post('/api/translate', {
        text: word,
        source_lang: 'en',
        target_lang: 'zh',
        service: 'tencent'
      }, {
        timeout
      });
      
      // 提取翻译结果
      const translation = response?.data?.data?.target_text || 
                         response?.data?.data?.translation || 
                         response?.data?.translation;
      
      if (!translation) {
        throw new Error('翻译API返回空结果');
      }
      
      return translation.trim();
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`翻译API调用失败: ${error.message}`);
      }
      throw new Error('翻译API调用失败: 未知错误');
    }
  }
  
  /**
   * 将单词数组分割成批次
   * @param words 单词数组
   * @param batchSize 批次大小
   * @returns 批次数组
   */
  private static createBatches(words: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
    
    for (let i = 0; i < words.length; i += batchSize) {
      batches.push(words.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 获取翻译统计信息
   * @param result 批处理翻译结果
   * @returns 统计信息字符串
   */
  public static getTranslationStats(result: BatchTranslationResult): string {
    const successRate = result.totalWords > 0 ? 
      ((result.successCount / result.totalWords) * 100).toFixed(1) : '0';
    
    return `翻译统计: 总计${result.totalWords}个单词, ` +
           `成功${result.successCount}个(${successRate}%), ` +
           `失败${result.failureCount}个, ` +
           `耗时${result.processingTime}ms`;
  }
}