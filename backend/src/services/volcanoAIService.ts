import axios from 'axios';
import { logger } from '@/utils/logger';
import { WordDifficultyLevel } from './wordDifficultyService';

// 火山AI API配置
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_API_URL = process.env.VOLCANO_API_URL;
const VOLCANO_MODEL = process.env.VOLCANO_MODEL || 'kimi-k2-250905';

// 单词信息接口
interface WordInfo {
  word: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

// AI判断结果接口
interface AIJudgmentResult {
  word: string;
  difficultyLevel: WordDifficultyLevel;
  reasoning: string;
  confidence: number;
}

// 重试配置（耐心等待版）
const RETRY_CONFIG = {
  maxRetries: 1,    // 进一步减少重试次数，主要依靠长超时
  baseDelay: 2000,  // 增加延迟时间，给AI更多处理时间
  maxDelay: 5000    // 适当增加最大延迟
};

export class VolcanoAIService {
  
  /**
   * 使用火山AI判断单词难度等级
   * @param wordInfo 单词信息（包含翻译、音标等）
   * @returns AI判断结果
   */
  static async judgeWordDifficulty(wordInfo: WordInfo): Promise<AIJudgmentResult> {
    if (!VOLCANO_API_KEY || !VOLCANO_API_URL) {
      throw new Error('火山AI API配置缺失：缺少API密钥或URL');
    }

    logger.info(`开始判断单词难度: ${wordInfo.word}`);
    const prompt = this.buildDifficultyJudgmentPrompt(wordInfo);
    
    try {
      const response = await this.callVolcanoAIWithRetry(prompt);
      const result = this.parseAIResponse(wordInfo.word, response);
      logger.info(`单词 ${wordInfo.word} 难度判断完成: 等级${result.difficultyLevel}`);
      return result;
    } catch (error) {
      logger.error(`火山AI判断单词 ${wordInfo.word} 难度失败:`, error);
      // 降级处理：使用基础规则判断
      return this.fallbackJudgment(wordInfo);
    }
  }

  /**
   * 批量判断单词难度
   * @param wordInfos 单词信息数组
   * @returns AI判断结果数组
   */
  static async batchJudgeWordDifficulty(wordInfos: WordInfo[]): Promise<AIJudgmentResult[]> {
    if (wordInfos.length === 0) {
      return [];
    }

    logger.info(`开始批量判断 ${wordInfos.length} 个单词的难度`);

    // 优先尝试真正的批量API调用
    try {
      const batchResults = await this.batchJudgeWordDifficultyOptimized(wordInfos);
      logger.info(`批量难度判断成功，处理了 ${batchResults.length} 个单词`);
      return batchResults;
    } catch (error) {
      logger.warn('批量API调用失败，降级为分批处理:', error);
      return this.batchJudgeWordDifficultyFallback(wordInfos);
    }
  }

  /**
   * 优化的批量难度判断（真正的批量API调用）
   */
  private static async batchJudgeWordDifficultyOptimized(wordInfos: WordInfo[]): Promise<AIJudgmentResult[]> {
    const batchPrompt = this.buildBatchDifficultyJudgmentPrompt(wordInfos);
    const response = await this.callVolcanoAIWithRetry(batchPrompt);
    return this.parseBatchAIResponse(wordInfos, response);
  }

  /**
   * 降级的批量难度判断（分批并发处理）
   */
  private static async batchJudgeWordDifficultyFallback(wordInfos: WordInfo[]): Promise<AIJudgmentResult[]> {
    const results: AIJudgmentResult[] = [];
    
    // 控制并发数量，避免API限流
    const batchSize = 5;
    for (let i = 0; i < wordInfos.length; i += batchSize) {
      const batch = wordInfos.slice(i, i + batchSize);
      const batchPromises = batch.map(wordInfo => 
        this.judgeWordDifficulty(wordInfo).catch(error => {
          logger.warn(`单词 ${wordInfo.word} 判断失败:`, error);
          return this.fallbackJudgment(wordInfo);
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 批次间延迟，避免频率限制
      if (i + batchSize < wordInfos.length) {
        await this.delay(500);
      }
    }
    
    return results;
  }

  /**
   * 构建批量难度判断的Prompt（简化版，只传单词）
   */
  private static buildBatchDifficultyJudgmentPrompt(wordInfos: WordInfo[]): string {
    const wordList = wordInfos.map((wordInfo, index) => 
      `${index + 1}. ${wordInfo.word}`
    ).join('\n');

    return `请作为英语教学专家，批量判断以下英语单词的学习难度等级（1-10级）：

单词列表：
${wordList}

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

判断依据：使用频率、学习阶段、复杂度

请以JSON数组格式回复，每个单词对应一个对象：
[
  {
    "word": "单词1",
    "difficulty_level": 数字(1-10),
    "reasoning": "判断理由",
    "confidence": 数字(0.0-1.0)
  },
  {
    "word": "单词2",
    "difficulty_level": 数字(1-10),
    "reasoning": "判断理由",
    "confidence": 数字(0.0-1.0)
  }
]`;
  }

  /**
   * 构建难度判断的Prompt
   */
  private static buildDifficultyJudgmentPrompt(wordInfo: WordInfo): string {
    return `请作为英语教学专家，判断以下英语单词的学习难度等级（1-10级）：

单词信息：
- 英文单词：${wordInfo.word}
- 中文翻译：${wordInfo.translation}
- 音标：${wordInfo.pronunciation || '未提供'}
- 词性：${wordInfo.partOfSpeech || '未提供'}

难度等级标准：
1级（最简单）：最基础词汇，如 a, the, is, am, are
2级（简单）：基础动词和名词，如 go, come, man, woman
3级（基础）：日常词汇，如 about, after, good, bad
4级（中等）：高中水平，如 important, different, education
5级（高级）：大学水平，如 sophisticated, comprehensive
6级（专家级）：学术/专业词汇
7级（非常高级）：高级学术词汇
8级（学术级）：专业学术术语
9级（专业级）：特定领域专业词汇
10级（罕见）：极其罕见或古老词汇

请考虑以下因素：
1. 词汇在日常生活中的使用频率
2. 学习者通常在什么阶段接触这个词汇
3. 词汇的语法复杂度和语义复杂度
4. 是否为专业术语或学术词汇

请以JSON格式回复：
{
  "difficulty_level": 数字(1-10),
  "reasoning": "判断理由",
  "confidence": 数字(0.0-1.0)
}`;
  }

  /**
   * 调用火山AI API（带重试机制）
   */
  private static async callVolcanoAIWithRetry(prompt: string): Promise<string> {
    let lastError: any;
    
    logger.info(`开始调用火山AI API，最大重试次数: ${RETRY_CONFIG.maxRetries}`);
    
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        logger.info(`火山AI API调用尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries}`);
        const response = await axios.post(
          VOLCANO_API_URL!,
          {
            model: VOLCANO_MODEL, // 从环境变量读取模型名称
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 300,  // 减少token数量
            temperature: 0.1  // 进一步降低随机性
          },
          {
            headers: {
              'Authorization': `Bearer ${VOLCANO_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 60000 // 增加超时时间到60秒，给AI充足处理时间
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          logger.info(`🔥 火山AI API调用成功，尝试次数: ${attempt + 1}`);
          console.log(`🔥 火山AI API调用成功，尝试次数: ${attempt + 1}，响应长度: ${response.data.choices[0].message.content.length}字符`);
          return response.data.choices[0].message.content;
        } else {
          throw new Error('AI响应格式异常');
        }
        
      } catch (error: any) {
        lastError = error;
        
        // 详细的错误日志
        const errorInfo = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          code: error.code,
          attempt: attempt + 1,
          maxRetries: RETRY_CONFIG.maxRetries
        };
        
        // 快速失败：对于某些错误不进行重试
        const shouldNotRetry = error.response?.status === 401 || // 认证失败
                              error.response?.status === 403 || // 权限不足
                              error.response?.status === 400;   // 请求格式错误
        
        if (shouldNotRetry) {
          logger.error('🔥 火山AI API调用遇到不可重试错误:', errorInfo);
          console.error('🔥 火山AI API调用失败 - 不可重试错误:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data
          });
          throw error;
        }
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === RETRY_CONFIG.maxRetries) {
          logger.error('🔥 火山AI API调用最终失败:', errorInfo);
          console.error('🔥 火山AI API调用最终失败 - 已达到最大重试次数:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data,
            totalAttempts: RETRY_CONFIG.maxRetries
          });
          break;
        }
        
        // 计算延迟时间（指数退避）
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
          RETRY_CONFIG.maxDelay
        );
        
        logger.warn(`🔥 火山AI API调用失败，${delay}ms后重试 (${attempt + 1}/${RETRY_CONFIG.maxRetries}):`, errorInfo);
        console.warn(`🔥 火山AI API调用失败，${delay}ms后重试 (${attempt + 1}/${RETRY_CONFIG.maxRetries}):`, {
          status: error.response?.status,
          message: error.message,
          nextRetryIn: `${delay}ms`
        });
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * 解析批量AI响应
   */
  private static parseBatchAIResponse(wordInfos: WordInfo[], response: string): AIJudgmentResult[] {
    try {
      // 尝试解析JSON数组响应
      const cleanResponse = response.trim().replace(/```json\s*|\s*```/g, '');
      const parsedResponse = JSON.parse(cleanResponse);
      
      if (!Array.isArray(parsedResponse)) {
        throw new Error('响应不是数组格式');
      }

      const results: AIJudgmentResult[] = [];
      
      // 为每个单词匹配AI响应
      for (const wordInfo of wordInfos) {
        const aiResult = parsedResponse.find(item => 
          item.word && item.word.toLowerCase() === wordInfo.word.toLowerCase()
        );
        
        if (aiResult) {
          results.push({
            word: wordInfo.word,
            difficultyLevel: this.validateDifficultyLevel(aiResult.difficulty_level),
            reasoning: aiResult.reasoning || '无具体理由',
            confidence: Math.max(0, Math.min(1, aiResult.confidence || 0.8))
          });
        } else {
          // 如果AI响应中没有找到对应单词，使用降级判断
          logger.warn(`批量响应中未找到单词 ${wordInfo.word}，使用降级判断`);
          results.push(this.fallbackJudgment(wordInfo));
        }
      }
      
      return results;
      
    } catch (error) {
      logger.error('批量AI响应解析失败:', error);
      logger.debug('原始响应:', response);
      
      // 解析失败时，为所有单词使用降级判断
      return wordInfos.map(wordInfo => this.fallbackJudgment(wordInfo));
    }
  }

  /**
   * 解析AI响应
   */
  private static parseAIResponse(word: string, response: string): AIJudgmentResult {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到JSON格式');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        word,
        difficultyLevel: this.validateDifficultyLevel(parsed.difficulty_level),
        reasoning: parsed.reasoning || '无理由说明',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
      
    } catch (error) {
      logger.warn(`解析AI响应失败，使用降级判断: ${word}`, error);
      throw new Error(`AI响应解析失败: ${error}`);
    }
  }

  /**
   * 验证并修正难度等级
   */
  private static validateDifficultyLevel(level: any): WordDifficultyLevel {
    const numLevel = parseInt(level);
    if (isNaN(numLevel) || numLevel < 1 || numLevel > 10) {
      return WordDifficultyLevel.INTERMEDIATE; // 默认中等难度
    }
    return numLevel as WordDifficultyLevel;
  }

  /**
   * 降级处理：使用基础规则判断
   */
  private static fallbackJudgment(wordInfo: WordInfo): AIJudgmentResult {
    const word = wordInfo.word.toLowerCase();
    let difficultyLevel: WordDifficultyLevel;
    
    // 简单的规则判断
    if (word.length <= 3) {
      difficultyLevel = WordDifficultyLevel.VERY_EASY;
    } else if (word.length <= 5) {
      difficultyLevel = WordDifficultyLevel.EASY;
    } else if (word.length <= 7) {
      difficultyLevel = WordDifficultyLevel.INTERMEDIATE;
    } else if (word.length <= 10) {
      difficultyLevel = WordDifficultyLevel.ADVANCED;
    } else {
      difficultyLevel = WordDifficultyLevel.EXPERT;
    }
    
    return {
      word: wordInfo.word,
      difficultyLevel,
      reasoning: '使用基础规则判断（AI服务不可用）',
      confidence: 0.6
    };
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}