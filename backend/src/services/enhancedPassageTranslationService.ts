import { Pool } from 'pg';
import { logger } from '@/utils/logger';
import { WordRepository } from '@/repositories/wordRepository';
import { Word } from '@/models/types';
import { BatchTranslationService, BatchTranslationResult } from './batchTranslationService';
import { WordDifficultyService } from './wordDifficultyService';
import { CacheService } from '@/config/redis';
import { TranslationService } from './translationService';
import { VolcanoCompleteWordService } from './volcanoCompleteWordService';

export interface EnhancedTranslationResult {
  id?: number;
  original: string;
  translated: string;
  cached: boolean;
  source: 'database' | 'api' | 'cache';
  wordTranslations: WordTranslationResult[];
  batchStats?: BatchTranslationResult;
  processingTime: number;
}

export interface WordTranslationResult {
  sourceWord: string;
  translatedWord: string;
  found: boolean;
  source: 'database' | 'api' | 'local_dictionary';
  difficultyLevel: number;
}

export class EnhancedPassageTranslationService {
  private wordRepo: WordRepository;
  private translationService: TranslationService;
  private batchTranslationService: BatchTranslationService;
  private wordDifficultyService: WordDifficultyService;

  constructor(private pool: Pool) {
    this.wordRepo = new WordRepository(pool);
    this.translationService = new TranslationService();
    this.batchTranslationService = new BatchTranslationService(pool);
    this.wordDifficultyService = new WordDifficultyService(pool);
  }

  /**
   * 增强的段落翻译服务
   * 包含段落翻译、单词提取、批量翻译和分表存储
   * @param text 待翻译的段落
   * @param options 翻译选项
   * @returns 增强的翻译结果
   */
  async enhancedTranslate(
    text: string,
    options: {
      sourceLang?: string;
      targetLang?: string;
      enableWordTranslation?: boolean;
      enableBatchTranslation?: boolean;
    } = {}
  ): Promise<EnhancedTranslationResult> {
    const startTime = Date.now();
    const {
      sourceLang = 'en',
      targetLang = 'zh',
      enableWordTranslation = true,
      enableBatchTranslation = true
    } = options;

    logger.info(`开始增强翻译: ${text.substring(0, 50)}...`);

    try {
      // 1. 检查段落翻译缓存
      const cacheKey = `passage:${Buffer.from(text).toString('base64')}`;
      let passageTranslation: string;
      let cached = false;
      let source: 'database' | 'api' | 'cache' = 'api';

      // 检查Redis缓存
      const cachedResult = await CacheService.get<string>(cacheKey);
      if (cachedResult) {
        passageTranslation = cachedResult;
        cached = true;
        source = 'cache';
        logger.debug('段落翻译缓存命中');
      } else {
        // 直接调用翻译API（不再使用passage_translations表）
        passageTranslation = await this.translateParagraph(text, sourceLang, targetLang);
        
        // 更新Redis缓存
        await CacheService.set(cacheKey, passageTranslation, 3600);
        logger.debug('段落翻译API调用完成并已缓存');
      }

      // 2. 处理单词翻译
      let wordTranslations: WordTranslationResult[] = [];
      let batchStats: BatchTranslationResult | undefined;

      if (enableWordTranslation) {
        const extractedWords = this.extractWords(text);
        logger.info(`提取到 ${extractedWords.length} 个单词`);

        if (extractedWords.length > 0) {
          // 直接使用火山AI完整单词服务
          wordTranslations = await this.translateWordsIndividually(extractedWords);
          
          // 构建批量统计信息
          const successCount = wordTranslations.filter(w => w.found).length;
          const failureCount = wordTranslations.filter(w => !w.found).length;
          const failedWords = wordTranslations.filter(w => !w.found).map(w => w.sourceWord);
          
          batchStats = {
            total_words: extractedWords.length,
            success_count: successCount,
            failure_count: failureCount,
            processing_time: 0, // 将在translateWordsIndividually中计算
            failed_words: failedWords,
            results: wordTranslations.map(w => ({
              sourceWord: w.sourceWord,
              translatedWord: w.translatedWord,
              success: w.found,
              difficultyLevel: w.difficultyLevel,
              error: w.found ? undefined : '火山AI获取失败'
            }))
          };
        }
      }

      const processingTime = Date.now() - startTime;
      
      logger.info(`增强翻译完成: 段落翻译源=${source}, 单词翻译=${wordTranslations.length}个, 耗时=${processingTime}ms`);

      return {
        original: text,
        translated: passageTranslation,
        cached,
        source,
        wordTranslations,
        batchStats,
        processingTime
      };

    } catch (error) {
      logger.error('增强翻译失败:', error);
      throw new Error(`增强翻译失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 翻译段落
   * @param text 待翻译文本
   * @param sourceLang 源语言
   * @param targetLang 目标语言
   * @returns 翻译结果
   */
  private async translateParagraph(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const translationResult = await this.translationService.translate({
        text,
        source_lang: sourceLang,
        target_lang: targetLang
      });

      if (!translationResult.target_text) {
        throw new Error('翻译服务返回空结果');
      }

      return translationResult.target_text.trim();
    } catch (error) {
      logger.error('段落翻译服务调用失败:', error);
      throw new Error(`段落翻译失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 从文本中提取单词
   * @param text 文本
   * @returns 单词数组
   */
  private extractWords(text: string): string[] {
    // 使用正则表达式提取英文单词
    const words = text.match(/\b[a-zA-Z]+\b/g) || [];
    
    // 去重并转换为小写
    const uniqueWords = [...new Set(words.map(word => word.toLowerCase()))];
    
    logger.debug(`从文本中提取单词: ${uniqueWords.length}个`);
    return uniqueWords;
  }

  /**
   * 传统的单个单词翻译方式
   * @param words 单词数组
   * @returns 单词翻译结果
   */
  private async translateWordsIndividually(words: string[]): Promise<WordTranslationResult[]> {
    const results: WordTranslationResult[] = [];
    const wordsToTranslate: string[] = [];
    
    // 首先检查数据库中已存在的单词
    for (const word of words) {
      const existingWord = await this.wordRepo.findByWord(word.toLowerCase());
      
      if (existingWord) {
        results.push({
          sourceWord: word,
          translatedWord: existingWord.translation || '',
          found: true,
          source: 'database',
          difficultyLevel: existingWord.difficulty_level || 1
        });
      } else {
        wordsToTranslate.push(word);
      }
    }
    
    // 对于数据库中不存在的单词，使用火山AI批量获取完整信息
    if (wordsToTranslate.length > 0) {
      try {
        logger.info(`使用火山AI获取 ${wordsToTranslate.length} 个单词的完整信息`);
        const volcanoResults = await VolcanoCompleteWordService.batchGetCompleteWordInfo(wordsToTranslate);
        
        // 处理成功的单词
        for (const wordInfo of volcanoResults.success) {
          try {
            await this.wordRepo.createComplete({
              word: wordInfo.word.toLowerCase(),
              translation: wordInfo.chinese,
              phonetic: wordInfo.phonetic,
              difficulty_level: wordInfo.difficulty_level
            });
            
            results.push({
              sourceWord: wordInfo.word,
              translatedWord: wordInfo.chinese,
              found: true,
              source: 'api',
              difficultyLevel: wordInfo.difficulty_level
            });
            
            logger.info(`火山AI成功获取单词信息: ${wordInfo.word} -> ${wordInfo.chinese} (难度: ${wordInfo.difficulty_level})`);
          } catch (dbError) {
            logger.warn(`保存单词 "${wordInfo.word}" 到数据库失败:`, dbError);
            // 即使保存失败，也返回翻译结果
            results.push({
              sourceWord: wordInfo.word,
              translatedWord: wordInfo.chinese,
              found: true,
              source: 'api',
              difficultyLevel: wordInfo.difficulty_level
            });
          }
        }
        
        // 处理失败的单词
        for (const failedWord of volcanoResults.failed) {
          logger.warn(`火山AI获取单词 "${failedWord.word}" 信息失败:`, failedWord.error);
          results.push({
            sourceWord: failedWord.word,
            translatedWord: '',
            found: false,
            source: 'api',
            difficultyLevel: 1
          });
        }
        
        logger.info(`火山AI批量处理完成: 成功 ${volcanoResults.stats.success_count}/${volcanoResults.stats.total} 个单词`);
        
      } catch (error) {
        logger.error('火山AI批量获取单词信息失败:', error);
        
        // 如果火山AI失败，为所有未翻译的单词返回失败结果
        for (const word of wordsToTranslate) {
          results.push({
            sourceWord: word,
            translatedWord: '',
            found: false,
            source: 'api',
            difficultyLevel: 1
          });
        }
      }
    }
    
    return results;
  }

  /**
   * 获取段落翻译历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 翻译历史列表
   */
  async getTranslationHistory(limit: number = 20, offset: number = 0): Promise<PassageTranslation[]> {
    try {
      return await this.passageRepo.findMany({
        limit,
        offset,
        order_by: 'created_at',
        order_direction: 'DESC'
      });
    } catch (error) {
      logger.error('获取翻译历史失败:', error);
      throw new Error('获取翻译历史失败');
    }
  }

  /**
   * 获取单词翻译历史
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 单词翻译历史列表
   */
  async getWordTranslationHistory(limit: number = 50, offset: number = 0): Promise<Word[]> {
    try {
      return await this.wordRepo.findMany({
        limit,
        offset,
        orderBy: 'created_at DESC'
      });
    } catch (error) {
      logger.error('获取单词翻译历史失败:', error);
      throw new Error('获取单词翻译历史失败');
    }
  }

  /**
   * 根据难度等级查询单词
   * @param difficultyLevel 难度等级
   * @param limit 限制数量
   * @returns 单词列表
   */
  async getWordsByDifficulty(difficultyLevel: number, limit: number = 100): Promise<Word[]> {
    try {
      return await this.wordRepo.findMany({
        limit,
        search: `difficulty_level:${difficultyLevel}`
      });
    } catch (error) {
      logger.error('根据难度等级查询单词失败:', error);
      throw new Error('根据难度等级查询单词失败');
    }
  }

  /**
   * 获取翻译统计信息
   * @returns 统计信息
   */
  async getTranslationStats(): Promise<{
    totalPassages: number;
    totalWords: number;
    recentTranslations: number;
  }> {
    try {
      const [passageCount, wordCount, recentCount] = await Promise.all([
        this.passageRepo.count(),
        this.wordRepo.count(),
        this.passageRepo.count({ 
          created_after: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        })
      ]);

      return {
        totalPassages: passageCount,
        totalWords: wordCount,
        recentTranslations: recentCount
      };
    } catch (error) {
      logger.error('获取翻译统计失败:', error);
      throw new Error('获取翻译统计失败');
    }
  }
}