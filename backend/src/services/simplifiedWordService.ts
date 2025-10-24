import { logger } from '@/utils/logger';
import { TencentTranslationService } from './tencentTranslationService';
import { VolcanoAIService } from './volcanoAIService';
import { WordRepository } from '@/repositories/wordRepository';
import { testConnection } from '@/config/database';

/**
 * 简化的AI单词处理服务
 * 实现清晰的四步流程：查数据库 → 腾讯翻译API → 火山大模型判断 → 存数据库
 */

// 单词信息接口
export interface WordInfo {
  word: string;
  translation?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  difficultyLevel?: number;
  definition?: string;
}

// 批量处理结果接口
export interface BatchResult {
  words: WordInfo[];
  complexWords: string[]; // 难度 > 3 的单词
  stats: {
    total: number;
    fromDatabase: number;
    fromAPI: number;
    complexCount: number;
  };
}

export class SimplifiedWordService {
  private static wordRepository = new WordRepository();

  /**
   * 核心四步流程：处理单个单词
   * @param word 单词
   * @returns 完整的单词信息
   */
  static async processWord(word: string): Promise<WordInfo> {
    const normalizedWord = word.toLowerCase().trim();
    
    try {
      logger.info(`🔄 开始处理单词: ${normalizedWord}`);

      // 第一步：查数据库
      const dbResult = await this.step1_CheckDatabase(normalizedWord);
      if (dbResult) {
        logger.info(`✅ 步骤1: 从数据库获取 ${normalizedWord}`);
        return dbResult;
      }

      // 第二步：调用腾讯翻译官API
      logger.info(`🌐 步骤2: 调用腾讯翻译API - ${normalizedWord}`);
      const tencentResult = await this.step2_CallTencentAPI(normalizedWord);

      // 第三步：火山大模型判断难度
      logger.info(`🤖 步骤3: 火山AI判断难度 - ${normalizedWord}`);
      const difficultyLevel = await this.step3_CallVolcanoAI(normalizedWord, tencentResult);

      // 第四步：存数据库
      const finalResult: WordInfo = {
        ...tencentResult,
        difficultyLevel
      };
      
      logger.info(`💾 步骤4: 存储到数据库 - ${normalizedWord} (难度: ${difficultyLevel})`);
      await this.step4_SaveToDatabase(finalResult);

      logger.info(`✅ 完成处理: ${normalizedWord} - 难度等级: ${difficultyLevel}`);
      return finalResult;

    } catch (error) {
      logger.error(`❌ 处理单词失败: ${normalizedWord}`, error);
      throw error;
    }
  }

  /**
   * 批量处理单词
   * @param words 单词数组
   * @returns 批量处理结果
   */
  static async batchProcessWords(words: string[]): Promise<BatchResult> {
    if (!words || words.length === 0) {
      return {
        words: [],
        complexWords: [],
        stats: { total: 0, fromDatabase: 0, fromAPI: 0, complexCount: 0 }
      };
    }

    logger.info(`🔄 开始批量处理 ${words.length} 个单词`);
    
    const results: WordInfo[] = [];
    const complexWords: string[] = [];
    let fromDatabase = 0;
    let fromAPI = 0;

    for (const word of words) {
      try {
        const result = await this.processWord(word);
        results.push(result);

        // 统计来源
        const dbResult = await this.step1_CheckDatabase(word.toLowerCase().trim());
        if (dbResult) {
          fromDatabase++;
        } else {
          fromAPI++;
        }

        // 收集难度 >= 2 的单词
        if (result.difficultyLevel && result.difficultyLevel >= 2) {
          complexWords.push(result.word);
        }
      } catch (error) {
        logger.error(`批量处理中单词失败: ${word}`, error);
      }
    }

    const stats = {
      total: words.length,
      fromDatabase,
      fromAPI,
      complexCount: complexWords.length
    };

    logger.info(`✅ 批量处理完成: ${JSON.stringify(stats)}`);
    
    return {
      words: results,
      complexWords,
      stats
    };
  }

  /**
   * 过滤复杂单词（难度 > 3）
   * @param words 单词数组
   * @returns 复杂单词信息数组
   */
  static async filterComplexWords(words: string[]): Promise<CompleteWordInfo[]> {
    logger.info(`🔍 开始过滤复杂单词，输入: ${words.length} 个`);
    
    const batchResult = await this.batchProcessWords(words);
    
    // 过滤出难度 > 3 的完整单词信息
    const complexWordInfos = batchResult.words.filter(word => 
      word.difficultyLevel && word.difficultyLevel >= 2
    );
    
    logger.info(`✅ 过滤完成，找到 ${complexWordInfos.length} 个复杂单词`);
    return complexWordInfos;
  }

  /**
   * 检查单词是否需要显示翻译（难度 > 3）
   * @param word 单词
   * @returns 是否需要显示翻译
   */
  static async shouldShowTranslation(word: string): Promise<boolean> {
    const wordInfo = await this.processWord(word);
    const needsTranslation = wordInfo.difficultyLevel ? wordInfo.difficultyLevel >= 2 : false;
    
    logger.info(`🔍 翻译检查: ${word} - 难度: ${wordInfo.difficultyLevel} - 需要翻译: ${needsTranslation}`);
    return needsTranslation;
  }

  // ==================== 私有方法：四个步骤的具体实现 ====================

  /**
   * 第一步：查数据库
   */
  private static async step1_CheckDatabase(word: string): Promise<WordInfo | null> {
    try {
      const dbWord = await this.wordRepository.findByWord(word);
      if (dbWord && dbWord.translation && dbWord.difficultyLevel) {
        return {
          word: dbWord.english,
          translation: dbWord.chinese,
          pronunciation: dbWord.phonetic,
          partOfSpeech: dbWord.partOfSpeech,
          difficultyLevel: dbWord.difficultyLevel,
          definition: dbWord.definition
        };
      }
      return null;
    } catch (error) {
      logger.error(`数据库查询失败: ${word}`, error);
      return null;
    }
  }

  /**
   * 第二步：调用腾讯翻译官API
   */
  private static async step2_CallTencentAPI(word: string): Promise<WordInfo> {
    try {
      const result = await TencentTranslationService.translateWord(word);
      return {
        word,
        translation: result.translation,
        pronunciation: result.pronunciation,
        partOfSpeech: result.partOfSpeech,
        definition: result.definition
      };
    } catch (error) {
      logger.error(`腾讯翻译API调用失败: ${word}`, error);
      // 返回基础信息
      return {
        word,
        translation: `${word}的翻译`, // 占位符
        pronunciation: '',
        partOfSpeech: '',
        definition: ''
      };
    }
  }

  /**
   * 第三步：火山大模型判断难度
   */
  private static async step3_CallVolcanoAI(word: string, wordInfo: WordInfo): Promise<number> {
    try {
      const aiResult = await VolcanoAIService.judgeWordDifficulty({
        word,
        translation: wordInfo.translation,
        pronunciation: wordInfo.pronunciation,
        partOfSpeech: wordInfo.partOfSpeech
      });
      
      return aiResult.difficultyLevel || this.fallbackDifficultyJudgment(word);
    } catch (error) {
      logger.error(`火山AI判断失败: ${word}`, error);
      // 使用备用规则判断
      return this.fallbackDifficultyJudgment(word);
    }
  }

  /**
   * 第四步：存数据库
   */
  private static async step4_SaveToDatabase(wordInfo: WordInfo): Promise<void> {
    try {
      await this.wordRepository.create({
        english: wordInfo.word,
        chinese: wordInfo.translation || '',
        phonetic: wordInfo.pronunciation || '',
        partOfSpeech: wordInfo.partOfSpeech || '',
        difficultyLevel: wordInfo.difficultyLevel || 1,
        definition: wordInfo.definition || '',
        isActive: true
      });
    } catch (error) {
      logger.error(`数据库存储失败: ${wordInfo.word}`, error);
      // 不抛出错误，允许继续处理
    }
  }

  /**
   * 备用难度判断规则（当AI服务不可用时）
   */
  private static fallbackDifficultyJudgment(word: string): number {
    const length = word.length;
    
    // 基础规则
    if (length <= 3) return 1;
    if (length <= 5) return 2;
    if (length <= 7) return 3;
    if (length <= 9) return 4;
    return 5;
  }

  /**
   * 获取配置状态
   */
  static async getConfigStatus(): Promise<{
    tencentAPI: boolean;
    volcanoAI: boolean;
    database: boolean;
  }> {
    try {
      // 检查腾讯翻译API配置
      const tencentConfigured = !!(process.env.TENCENT_APP_ID && process.env.TENCENT_APP_KEY);
      
      // 检查火山AI配置
      const volcanoConfigured = !!(process.env.VOLCANO_API_KEY && process.env.VOLCANO_API_URL);
      
      // 检查数据库连接
      let databaseConnected = false;
      try {
        databaseConnected = await testConnection();
      } catch (error) {
        logger.error('数据库连接测试失败:', error);
        databaseConnected = false;
      }
      
      return {
        tencentAPI: tencentConfigured,
        volcanoAI: volcanoConfigured,
        database: databaseConnected
      };
    } catch (error) {
      logger.error('获取配置状态失败:', error);
      return {
        tencentAPI: false,
        volcanoAI: false,
        database: false
      };
    }
  }
}