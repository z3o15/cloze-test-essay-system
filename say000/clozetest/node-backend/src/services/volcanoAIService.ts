import axios from 'axios';
import { logger } from '../utils/logger';
import { CacheService } from '../config/redis';

export interface WordComplexityResult {
  word: string;
  isComplex: boolean;
  reason?: string;
  difficultyLevel?: number;
  translation?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  translations?: string[];
}

export class VolcanoAIService {
  // EdgeFN API配置（主要）
  private static edgefnApiKey = process.env.EDGEFN_API_KEY;
  private static edgefnApiUrl = process.env.EDGEFN_API_URL;
  private static edgefnModel = process.env.EDGEFN_MODEL || 'DeepSeek-R1-0528-Qwen3-8B';
  
  // EdgeFN API配置（备用2）
  private static edgefnApiKey2 = process.env.EDGEFN_API_KEY_2;
  private static edgefnApiUrl2 = process.env.EDGEFN_API_URL_2;
  private static edgefnModel2 = process.env.EDGEFN_MODEL_2 || 'KAT-Coder-Exp-72B-1010';
  
  // EdgeFN API 配置 (第三套) - 暂未使用
  // private static edgefnApiKey3 = process.env.EDGEFN_API_KEY_3;
  // private static edgefnApiUrl3 = process.env.EDGEFN_API_URL_3;
  // private static edgefnModel3 = process.env.EDGEFN_MODEL_3 || 'BAAI/bge-m3';
  
  // 火山AI配置（备用4）
  private static apiKey = process.env.VOLCANO_API_KEY;
  private static apiUrl = process.env.VOLCANO_API_URL;
  private static model = process.env.VOLCANO_MODEL || 'ep-20241022140820-8xqpz';
  
  // Token使用量管理
  private static tokenUsageKey = 'volcano_ai_token_usage';
  private static dailyTokenLimit = parseInt(process.env.VOLCANO_DAILY_TOKEN_LIMIT || '100000');
  
  // 并发控制
  private static maxConcurrentRequests = parseInt(process.env.VOLCANO_MAX_CONCURRENT || '3');
  private static activeRequests = 0;

  /**
   * 构建批量单词难度判断提示词（优化Token使用）
   */
  private static buildBatchDifficultyJudgmentPrompt(words: string[]): string {
    return `分析英文单词难度并提供中文翻译，返回JSON数组:
[{"word":"单词","isComplex":true,"difficultyLevel":1-5,"translations":["中文翻译1","中文翻译2"],"pronunciation":"音标","partOfSpeech":"词性"}]

难度级别说明:
1-基础词汇(a,the,is) 
2-基础动名词(go,man,book) 
3-日常高频词汇(important,beautiful) 
4-专业学术词汇(revolutionary,technology) 
5-生僻专业术语(sophisticated,unprecedented)

要求:
- 必须提供准确的中文翻译
- 音标使用国际音标格式
- 词性用英文缩写(n./v./adj./adv.等)

待分析单词:${words.join(',')}`;
  }

  /**
   * 检查Token使用量
   */
  private static async checkTokenUsage(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `${this.tokenUsageKey}:${today}`;
      const currentUsage = await CacheService.get<number>(usageKey) || 0;
      
      if (currentUsage >= this.dailyTokenLimit) {
        logger.warn(`Token使用量已达到每日限制: ${currentUsage}/${this.dailyTokenLimit}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('检查Token使用量失败:', error);
      return true; // 检查失败时允许继续
    }
  }

  /**
   * 记录Token使用量
   */
  private static async recordTokenUsage(tokens: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `${this.tokenUsageKey}:${today}`;
      const currentUsage = await CacheService.get<number>(usageKey) || 0;
      const newUsage = currentUsage + tokens;
      
      await CacheService.set(usageKey, newUsage, 86400); // 24小时过期
      logger.info(`Token使用量更新: ${newUsage}/${this.dailyTokenLimit}`);
      
      // 预警机制
      const usagePercent = (newUsage / this.dailyTokenLimit) * 100;
      if (usagePercent >= 80) {
        logger.warn(`Token使用量预警: ${usagePercent.toFixed(1)}% (${newUsage}/${this.dailyTokenLimit})`);
      }
    } catch (error) {
      logger.error('记录Token使用量失败:', error);
    }
  }

  /**
   * 并发控制
   */
  private static async waitForSlot(): Promise<void> {
    while (this.activeRequests >= this.maxConcurrentRequests) {
      logger.info(`等待并发槽位释放... (当前: ${this.activeRequests}/${this.maxConcurrentRequests})`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.activeRequests++;
  }

  /**
   * 释放并发槽位
   */
  private static releaseSlot(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /**
   * 通用API调用方法 - 按优先级依次尝试所有可用的API
   * @param prompt 要发送的提示词
   * @param taskType 任务类型，用于日志记录
   * @returns API响应内容
   */
  static async callAnyAvailableAPI(prompt: string, taskType: string = '通用任务'): Promise<string> {
    let content: string | undefined;
    let lastError: Error | undefined;
    
    // 按优先级依次尝试API
    // 1. 优先尝试EdgeFN API 1 (DeepSeek-R1-0528-Qwen3-8B)
    if (this.edgefnApiKey && this.edgefnApiUrl) {
      try {
        logger.info(`${taskType}: 尝试使用EdgeFN API 1 (DeepSeek-R1-0528-Qwen3-8B)`);
        content = await this.callEdgeFNAPI(prompt);
        logger.info(`${taskType}: EdgeFN API 1调用成功`);
        return content;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`${taskType}: EdgeFN API 1调用失败:`, error);
      }
    }
    
    // 2. 如果第一个API失败，尝试EdgeFN API 2 (KAT-Coder-Exp-72B-1010)
    if (!content && this.edgefnApiKey2 && this.edgefnApiUrl2) {
      try {
        logger.info(`${taskType}: 尝试使用EdgeFN API 2 (KAT-Coder-Exp-72B-1010)`);
        content = await this.callEdgeFNAPI2(prompt);
        logger.info(`${taskType}: EdgeFN API 2调用成功`);
        return content;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`${taskType}: EdgeFN API 2调用失败:`, error);
      }
    }
    
    // 3. 如果EdgeFN API都失败，最后尝试火山AI API (暂时注释掉，模型不可用)
    // if (!content && this.apiKey && this.apiUrl) {
    //   try {
    //     logger.info(`${taskType}: 尝试使用火山AI API`);
    //     content = await this.callVolcanoAPI(prompt);
    //     logger.info(`${taskType}: 火山AI API调用成功`);
    //     return content;
    //   } catch (error) {
    //     lastError = error as Error;
    //     logger.warn(`${taskType}: 火山AI API调用失败:`, error);
    //   }
    // }

    // 如果所有API都失败，抛出最后一个错误
    const errorMessage = lastError ? 
      `${taskType}: 所有API调用都失败，最后错误: ${lastError.message}` : 
      `${taskType}: 所有API都不可用或配置不完整`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * 调用EdgeFN API进行单词分析
   */
  private static async callEdgeFNAPI(prompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`EdgeFN API调用尝试 ${attempt}/${maxRetries}`);
        
        const response = await axios.post(this.edgefnApiUrl!, {
          model: this.edgefnModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.edgefnApiKey}`,
          }
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          logger.warn(`EdgeFN API限流 (429)，等待 ${waitTime}ms 后重试...`);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error(`EdgeFN API请求失败: 429 Too Many Requests (已重试${maxRetries}次)`);
          }
        }
        
        if (response.status >= 400) {
          throw new Error(`EdgeFN API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = response.data;
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          throw new Error('EdgeFN API响应内容为空');
        }
        
        logger.info('EdgeFN API调用成功');
        return content;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`EdgeFN API调用尝试 ${attempt} 失败:`, error);
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError || new Error('EdgeFN API调用失败');
  }

  /**
   * 调用EdgeFN API 2进行单词分析（KAT-Coder-Exp-72B-1010模型）
   */
  private static async callEdgeFNAPI2(prompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`EdgeFN API 2调用尝试 ${attempt}/${maxRetries}`);
        
        const response = await axios.post(this.edgefnApiUrl2!, {
          model: this.edgefnModel2,
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.edgefnApiKey2}`,
          }
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          logger.warn(`EdgeFN API 2限流 (429)，等待 ${waitTime}ms 后重试...`);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error(`EdgeFN API 2请求失败: 429 Too Many Requests (已重试${maxRetries}次)`);
          }
        }
        
        if (response.status >= 400) {
          throw new Error(`EdgeFN API 2请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = response.data;
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          throw new Error('EdgeFN API 2响应内容为空');
        }
        
        logger.info('EdgeFN API 2调用成功');
        return content;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`EdgeFN API 2调用尝试 ${attempt} 失败:`, error);
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError || new Error('EdgeFN API 2调用失败');
  }

  /**
   * 调用火山AI API进行单词分析（备用）
   */
  private static async callVolcanoAPI(prompt: string): Promise<string> {
    // 检查Token使用量
    const canUseAPI = await this.checkTokenUsage();
    if (!canUseAPI) {
      throw new Error('火山AI Token使用量已达限制');
    }

    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`火山AI API调用尝试 ${attempt}/${maxRetries}`);
        
        const response = await axios.post(this.apiUrl!, {
          model: this.model,
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          }
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          logger.warn(`火山AI API限流 (429)，等待 ${waitTime}ms 后重试...`);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error(`火山AI API请求失败: 429 Too Many Requests (已重试${maxRetries}次)`);
          }
        }
        
        if (response.status >= 400) {
          throw new Error(`火山AI API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = response.data;
        const content = data.choices?.[0]?.message?.content;
        
        // 记录Token使用量
        const tokensUsed = data.usage?.total_tokens || Math.ceil(prompt.length / 4);
        await this.recordTokenUsage(tokensUsed);
        
        if (!content) {
          throw new Error('火山AI API响应内容为空');
        }
        
        logger.info('火山AI API调用成功');
        return content;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`火山AI API调用尝试 ${attempt} 失败:`, error);
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError || new Error('火山AI API调用失败');
  }

  /**
   * 判断单词是否复杂
   */
  static async isWordComplex(word: string): Promise<boolean> {
    try {
      const result = await this.analyzeWordComplexity([word]);
      return result[0]?.isComplex || false;
    } catch (error) {
      logger.error(`判断单词复杂度失败: ${word}`, error);
      // 降级处理：长度大于5的单词认为是复杂的
      return word.length > 5;
    }
  }

  /**
   * 批量判断单词复杂度（带缓存，分批处理）
   */
  static async analyzeWordComplexity(words: string[]): Promise<WordComplexityResult[]> {
    if (!words || words.length === 0) {
      return [];
    }

    // 分批处理：每批最多20个单词
    const BATCH_SIZE = 20;
    const allResults: WordComplexityResult[] = [];
    
    logger.info(`🔍 [WordDifficultyService] 开始AI分析 ${words.length} 个新单词（已去重），将分${Math.ceil(words.length / BATCH_SIZE)}批处理`);

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(words.length / BATCH_SIZE);
      
      logger.info(`📦 处理第${batchNumber}/${totalBatches}批: ${batch.length}个单词`);
      
      const batchResults = await this.processSingleBatch(batch);
      allResults.push(...batchResults);
      
      // 批次间稍微延迟，避免API限流
      if (i + BATCH_SIZE < words.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logger.info(`✅ 所有批次处理完成，共分析${allResults.length}个单词`);
    return allResults;
  }

  /**
   * 处理单个批次的单词
   */
  private static async processSingleBatch(words: string[]): Promise<WordComplexityResult[]> {
    // 检查缓存
    const cacheKey = `word_complexity_batch:${words.sort().join(',')}`;
    try {
      const cached = await CacheService.get<WordComplexityResult[]>(cacheKey);
      if (cached) {
        logger.info(`批量单词分析缓存命中: ${words.length}个单词`);
        return cached;
      }
    } catch (error) {
      logger.warn('缓存读取失败，继续API调用:', error);
    }

    // 并发控制
    await this.waitForSlot();

    const prompt = this.buildBatchDifficultyJudgmentPrompt(words);

    try {
      // 使用通用API调用方法
      const content = await this.callAnyAvailableAPI(prompt, '单词分析');

      // 解析JSON响应
      let results: WordComplexityResult[] = [];
      try {
        // 尝试直接解析
        logger.info('尝试解析JSON内容:', content.substring(0, 500) + '...');
        results = JSON.parse(content);
        logger.info('JSON解析成功，结果数量:', results.length);
      } catch (parseError) {
        logger.warn('直接JSON解析失败，尝试多种解析策略:', parseError);
        
        // 策略1: 提取JSON数组
        let jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            logger.info('找到JSON数组，尝试解析...');
            results = JSON.parse(jsonMatch[0]);
            logger.info('JSON数组解析成功，结果数量:', results.length);
          } catch (arrayParseError) {
            logger.warn('JSON数组解析失败:', arrayParseError);
            jsonMatch = null;
          }
        }
        
        // 策略2: 清理并修复JSON格式
        if (!jsonMatch) {
          try {
            logger.info('尝试清理和修复JSON格式...');
            let cleanedContent = content
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            // 查找JSON数组的开始和结束
            const startIndex = cleanedContent.indexOf('[');
            const lastIndex = cleanedContent.lastIndexOf(']');
            
            if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
              const jsonString = cleanedContent.substring(startIndex, lastIndex + 1);
              logger.info('提取的JSON字符串:', jsonString.substring(0, 200) + '...');
              
              // 尝试修复常见的JSON格式问题
              let fixedJson = jsonString
                .replace(/,\s*}/g, '}')  // 移除对象末尾多余的逗号
                .replace(/,\s*]/g, ']')  // 移除数组末尾多余的逗号
                .replace(/'/g, '"')      // 将单引号替换为双引号
                .replace(/(\w+):/g, '"$1":'); // 为属性名添加双引号
              
              results = JSON.parse(fixedJson);
              logger.info('修复后JSON解析成功，结果数量:', results.length);
            } else {
              throw new Error('无法找到有效的JSON数组结构');
            }
          } catch (fixError) {
            logger.error('JSON修复解析失败:', fixError);
            
            // 策略3: 降级处理 - 生成基础结果
            logger.warn('所有JSON解析策略都失败，使用降级处理');
            results = words.map(word => ({
              word: word,
              isComplex: word.length > 5, // 简单的长度判断
              difficultyLevel: word.length > 8 ? 4 : word.length > 5 ? 3 : 2,
              reason: '解析失败，使用基础判断',
              translation: '暂无释义',
              pronunciation: '',
              partOfSpeech: '',
              translations: ['暂无释义']
            }));
            logger.info('降级处理完成，生成基础结果数量:', results.length);
          }
        }
      }

      // 处理结果，确保包含所有必要字段
      const processedResults = results.map(result => ({
        word: result.word,
        isComplex: result.isComplex,
        difficultyLevel: result.difficultyLevel,
        reason: result.reason || `难度级别: ${result.difficultyLevel}`,
        translation: result.translations?.[0] || result.translation || '暂无释义',
        pronunciation: result.pronunciation || '',
        partOfSpeech: result.partOfSpeech || '',
        translations: result.translations || [result.translation || '暂无释义']
      }));

      // 缓存结果（1小时）
      try {
        await CacheService.set(cacheKey, processedResults, 3600);
        logger.info(`批量单词分析结果已缓存: ${words.length}个单词`);
      } catch (cacheError) {
        logger.warn('缓存结果失败:', cacheError);
      }

      return processedResults;
    } catch (error) {
      logger.error('API调用失败:', error);
      throw error; // 直接抛出错误，不进行降级处理
    } finally {
      // 释放并发槽位
      this.releaseSlot();
    }
  }

  /**
   * 过滤复杂单词（基于5级难度等级标准）
   */
  static async filterComplexWords(words: string[]): Promise<{
    complexWords: string[];
    simpleWords: string[];
    total: number;
    complexCount: number;
    wordDetails: Array<{
      word: string;
      difficultyLevel: number;
      translations: string[];
      pronunciation: string;
      partOfSpeech: string;
    }>;
  }> {
    try {
      const results = await this.analyzeWordComplexity(words);
      
      const complexWords: string[] = [];
      const simpleWords: string[] = [];
      const wordDetails: Array<{
        word: string;
        difficultyLevel: number;
        translations: string[];
        pronunciation: string;
        partOfSpeech: string;
      }> = [];
      
      results.forEach(result => {
        const difficultyLevel = result.difficultyLevel || 1;
        
        // 记录单词详细信息
        wordDetails.push({
          word: result.word,
          difficultyLevel,
          translations: result.translations || [],
          pronunciation: result.pronunciation || '',
          partOfSpeech: result.partOfSpeech || ''
        });
        
        // 难度级别 >= 3 的单词被认为是复杂的（日常高频词汇及以上）
        if (difficultyLevel >= 3) {
          complexWords.push(result.word);
        } else {
          simpleWords.push(result.word);
        }
      });
      
      return {
        complexWords,
        simpleWords,
        total: words.length,
        complexCount: complexWords.length,
        wordDetails
      };
    } catch (error) {
      logger.error('过滤复杂单词失败:', error);
      throw error;
    }
  }

  /**
   * 段落翻译方法
   * @param text 要翻译的段落文本
   * @param sourceLanguage 源语言（默认为英语）
   * @param targetLanguage 目标语言（默认为中文）
   * @returns 翻译结果
   */
  static async translateParagraph(
    text: string, 
    sourceLanguage: string = 'English', 
    targetLanguage: string = 'Chinese'
  ): Promise<{
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本不能为空');
    }

    // 并发控制
    await this.waitForSlot();

    try {
      // 构建翻译提示词
      const prompt = `请将以下${sourceLanguage}文本翻译成${targetLanguage}，要求：
1. 保持原文的语气和风格
2. 确保翻译准确、自然、流畅
3. 只返回翻译结果，不要添加任何解释或说明

原文：
${text}

翻译：`;

      // 使用通用API调用方法
      const translatedText = await this.callAnyAvailableAPI(prompt, '段落翻译');

      // 清理翻译结果（移除可能的前缀或后缀）
      const cleanedTranslation = translatedText
        .replace(/^翻译[：:]\s*/, '')
        .replace(/^译文[：:]\s*/, '')
        .replace(/^结果[：:]\s*/, '')
        .trim();

      logger.info(`段落翻译完成: ${text.substring(0, 50)}... -> ${cleanedTranslation.substring(0, 50)}...`);

      return {
        originalText: text,
        translatedText: cleanedTranslation,
        sourceLanguage,
        targetLanguage
      };
    } catch (error) {
      logger.error('段落翻译失败:', error);
      throw error;
    } finally {
      // 释放并发槽位
      this.releaseSlot();
    }
  }

  /**
   * 检查单词是否需要显示（基于5级难度等级标准）
   */
  static async checkDisplayNeeded(word: string): Promise<{
    word: string;
    needsDisplay: boolean;
    reason: string;
    difficultyLevel?: number;
    translations?: string[];
    pronunciation?: string;
    partOfSpeech?: string;
  }> {
    try {
      // 使用火山AI分析单词复杂度
      const results = await this.analyzeWordComplexity([word]);
      
      if (results.length > 0) {
        const result = results[0];
        const difficultyLevel = result.difficultyLevel || 1;
        
        // 难度级别 >= 3 的单词需要显示（日常高频词汇及以上）
        const needsDisplay = difficultyLevel >= 3;
        
        const difficultyLabels = {
          1: '基础词汇',
          2: '基础动词名词', 
          3: '日常高频词汇',
          4: '专业学术词汇',
          5: '生僻专业术语'
        };
        
        return {
          word,
          needsDisplay,
          reason: needsDisplay 
            ? `${difficultyLabels[difficultyLevel as keyof typeof difficultyLabels] || '未知'} (级别${difficultyLevel})` 
            : `${difficultyLabels[difficultyLevel as keyof typeof difficultyLabels] || '未知'} (级别${difficultyLevel})`,
          difficultyLevel,
          translations: result.translations || [],
          pronunciation: result.pronunciation || '',
          partOfSpeech: result.partOfSpeech || ''
        };
      }
      
      // 如果AI分析失败，使用本地难度判断作为降级处理
      const isComplex = await this.isWordComplex(word);
      
      return {
        word,
        needsDisplay: isComplex,
        reason: isComplex ? '单词较复杂，需要显示提示' : '单词简单，无需显示提示'
      };
    } catch (error) {
      logger.error(`检查单词显示需求失败: ${word}`, error);
      
      // 降级处理：基于单词长度判断
      const needsDisplay = word.length > 5;
      return {
        word,
        needsDisplay,
        reason: needsDisplay ? '单词较长，可能较复杂' : '单词较短，可能较简单'
      };
    }
  }
}