import { logger } from '../utils/logger';
import { VolcanoAIService } from './volcanoAIService';
import { WordRepository } from '../repositories/wordRepository';

/**
 * 简化的单词服务
 * 提供基本的单词处理功能，使用火山AI进行单词复杂度判断
 */
export class SimplifiedWordService {
  
  /**
   * 批量处理单词（完整流程：AI分析 + 数据库保存）
   */
  static async batchProcessWords(words: string[]): Promise<any> {
    try {
      logger.info(`🚀 开始完整批量处理流程: ${words.length}个单词 - ${words.join(', ')}`);
      
      // 步骤1: 使用火山AI进行批量分析（只调用一次）
      logger.info('🤖 步骤1: 调用火山AI进行批量分析...');
      const analysisResults = await VolcanoAIService.analyzeWordComplexity(words);
      
      // 步骤2: 基于分析结果过滤复杂单词（不再重复调用AI）
      logger.info('🔍 步骤2: 基于分析结果过滤复杂单词...');
      const complexWords = analysisResults.filter(result => (result.difficultyLevel || 1) >= 3);
      const simpleWords = analysisResults.filter(result => (result.difficultyLevel || 1) < 3);
      
      const filterResult = {
        complexWords: complexWords.map(r => r.word),
        simpleWords: simpleWords.map(r => r.word),
        total: words.length,
        complexCount: complexWords.length,
        wordDetails: analysisResults.map(result => ({
          word: result.word,
          difficultyLevel: result.difficultyLevel || 1,
          translations: result.translations || [],
          pronunciation: result.pronunciation || '',
          partOfSpeech: result.partOfSpeech || ''
        }))
      };
      
      // 步骤3: 准备数据库保存数据（保存所有单词）
      const wordsToSave = analysisResults.map(result => ({
        word: result.word.toLowerCase(),
        pronunciation: result.pronunciation || '',
        translation: result.translations?.[0] || result.translation || '暂无释义',
        definition: result.translations?.join('; ') || result.translation || '',
        part_of_speech: result.partOfSpeech || '',
        difficulty_level: result.difficultyLevel || 1
      }));
      
      logger.info(`💾 步骤3: 准备保存${wordsToSave.length}个单词到数据库（所有单词）...`);
      
      // 步骤4: 批量保存到数据库
      let savedWords: any[] = [];
      if (wordsToSave.length > 0) {
        try {
          const wordRepository = new WordRepository();
          savedWords = await wordRepository.batchCreateComplete(wordsToSave);
          logger.info(`✅ 步骤4: 成功保存${savedWords.length}个单词到数据库`);
        } catch (dbError) {
          logger.warn('⚠️ 数据库保存失败，但AI分析成功:', dbError);
          // 数据库保存失败不影响返回AI分析结果
        }
      } else {
        logger.info('ℹ️ 步骤4: 无单词需要保存');
      }
      
      // 构建详细的处理结果
      const processedWords = analysisResults.map(result => ({
        word: result.word,
        isComplex: result.isComplex,
        difficultyLevel: result.difficultyLevel || 1,
        translations: result.translations || [],
        pronunciation: result.pronunciation || '',
        partOfSpeech: result.partOfSpeech || '',
        needsDisplay: (result.difficultyLevel || 1) >= 3,
        processed: true,
        savedToDatabase: wordsToSave.some(w => w.word === result.word.toLowerCase()),
        timestamp: new Date().toISOString()
      }));
      
      // 构建完整的复杂单词对象数组（前端需要的格式）
      const complexWordObjects = complexWords.map(result => ({
        word: result.word,
        difficulty_level: result.difficultyLevel || 2,
        translation: result.translations?.[0] || result.translation || '暂无释义',
        pronunciation: result.pronunciation || '',
        part_of_speech: result.partOfSpeech || '',
        isComplex: true,
        needsDisplay: true
      }));

      const result = {
        success: true,
        complexWords: complexWordObjects, // 返回完整的单词对象数组
        stats: {
          total: words.length,
          complexCount: complexWords.length,
          simpleCount: simpleWords.length,
          processedCount: processedWords.length,
          savedToDbCount: savedWords.length,
          aiAnalyzedCount: analysisResults.length
        },
        wordDetails: processedWords,
        filterResult: filterResult.wordDetails,
        databaseSaveResult: {
          attempted: wordsToSave.length,
          successful: savedWords.length,
          failed: wordsToSave.length - savedWords.length
        }
      };
      
      logger.info(`🎯 完整批量处理完成: AI分析${analysisResults.length}个，保存${savedWords.length}个到数据库`);
      return result;
      
    } catch (error) {
      logger.error('❌ 批量处理单词失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否需要显示智能提示
   */
  static async checkDisplayNeeded(word: string): Promise<any> {
    try {
      logger.info(`检查单词是否需要显示: ${word}`);
      
      // 使用火山AI判断单词复杂度
      const result = await VolcanoAIService.checkDisplayNeeded(word);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('检查显示需求失败:', error);
      throw error;
    }
  }

  /**
   * 过滤复杂单词
   */
  static async filterComplexWords(words: string[]): Promise<any> {
    try {
      logger.info(`过滤复杂单词: ${words.join(', ')}`);
      
      // 使用火山AI判断单词复杂度
      const result = await VolcanoAIService.filterComplexWords(words);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('过滤复杂单词失败:', error);
      throw error;
    }
  }

  /**
   * 处理单个单词（完整流程：AI分析 + 数据库存储）
   */
  static async processSingleWord(word: string): Promise<any> {
    try {
      logger.info(`🚀 开始处理单个单词: ${word}`);
      
      // 标准化单词
      const normalizedWord = word.toLowerCase().trim();
      
      // 先检查数据库是否已存在
      const wordRepository = new WordRepository();
      const existingWord = await wordRepository.findByWord(normalizedWord);
      
      if (existingWord) {
        logger.info(`✅ 单词 "${normalizedWord}" 已存在于数据库中`);
        return {
          success: true,
          data: {
            word: normalizedWord,
            pronunciation: existingWord.pronunciation || '',
            translation: existingWord.meaning || '',
            translations: existingWord.meaning ? [existingWord.meaning] : [],
            partOfSpeech: existingWord.part_of_speech || '',
            difficultyLevel: existingWord.difficulty_level || 1,
            isComplex: (existingWord.difficulty_level || 1) >= 3,
            processed: true,
            fromDatabase: true,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      // 数据库中不存在，使用AI分析
      logger.info(`🤖 单词 "${normalizedWord}" 不在数据库中，调用AI分析...`);
      const analysisResults = await VolcanoAIService.analyzeWordComplexity([normalizedWord]);
      
      if (!analysisResults || analysisResults.length === 0) {
        throw new Error('AI分析失败，未返回结果');
      }
      
      const result = analysisResults[0];
      
      // 保存所有单词到数据库
       const wordToSave = {
         word: normalizedWord,
         pronunciation: result.pronunciation || '',
         translation: result.translations?.[0] || result.translation || '暂无释义',
         definition: result.translations?.join('; ') || result.translation || '',
         part_of_speech: result.partOfSpeech || '',
         difficulty_level: result.difficultyLevel || 1
       };
       
       try {
         await wordRepository.createComplete(wordToSave);
         logger.info(`💾 单词 "${normalizedWord}" 已保存到数据库`);
       } catch (dbError) {
         logger.warn('⚠️ 数据库保存失败，但AI分析成功:', dbError);
       }
      
      return {
        success: true,
        data: {
          word: normalizedWord,
          pronunciation: result.pronunciation || '',
          translation: result.translations?.[0] || result.translation || '暂无释义',
          translations: result.translations || [result.translation || '暂无释义'],
          partOfSpeech: result.partOfSpeech || '',
          difficultyLevel: result.difficultyLevel || 1,
          isComplex: (result.difficultyLevel || 1) >= 2,
          processed: true,
          fromDatabase: false,
          savedToDatabase: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('处理单个单词失败:', error);
      throw error;
    }
  }

  /**
   * 获取配置状态
   */
  static async getConfigStatus(): Promise<any> {
    try {
      return {
        success: true,
        data: {
          service: 'SimplifiedWordService',
          status: 'active',
          version: '1.0.0',
          features: ['batch_process', 'display_check', 'filter_complex', 'single_process']
        }
      };
    } catch (error) {
      logger.error('获取配置状态失败:', error);
      throw error;
    }
  }
}