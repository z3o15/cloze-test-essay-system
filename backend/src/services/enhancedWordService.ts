import { logger } from '@/utils/logger';
import { TencentTranslationService } from './tencentTranslationService';
import { VolcanoAIService } from './volcanoAIService';
import { WordRepository } from '@/repositories/wordRepository';
import { transaction } from '@/config/database';

// 定义完整的单词信息接口
export interface CompleteWordInfo {
  word: string;
  pronunciation?: string | undefined;
  definition?: string | undefined;
  translation?: string | undefined;
  partOfSpeech?: string | undefined;
  difficultyLevel?: number | undefined;
  frequencyRank?: number | undefined;
  exampleSentences?: string[] | undefined;
  synonyms?: string[] | undefined;
  antonyms?: string[] | undefined;
  etymology?: string | undefined;
}



export class EnhancedWordService {

  /**
   * 四步AI判断流程：查数据库 → 腾讯翻译API → 火山大模型判断 → 存数据库
   * @param word 单词
   * @returns 完整的单词信息
   */
  static async processWordWithAI(word: string): Promise<CompleteWordInfo> {
    const normalizedWord = word.toLowerCase().trim();
    
    try {
      // 第一步：查数据库
      logger.info(`开始处理单词: ${normalizedWord}`);
      const existingWord = await this.checkDatabase(normalizedWord);
      if (existingWord) {
        logger.info(`单词 ${normalizedWord} 从数据库缓存获取`);
        return existingWord;
      }

      // 第二步：调用腾讯翻译官API
      logger.info(`单词 ${normalizedWord} 调用腾讯翻译API`);
      const tencentResult = await this.callTencentAPI(normalizedWord);

      // 第三步：火山大模型判断难度
      logger.info(`单词 ${normalizedWord} 调用火山AI判断难度`);
      const volcanoWordInfo: any = {
        word: normalizedWord,
        translation: tencentResult.translation
      };
      if (tencentResult.pronunciation) {
        volcanoWordInfo.pronunciation = tencentResult.pronunciation;
      }
      if (tencentResult.partOfSpeech) {
        volcanoWordInfo.partOfSpeech = tencentResult.partOfSpeech;
      }
      logger.info(`开始调用火山AI判断单词 ${normalizedWord} 的难度等级`);
      const aiJudgment = await VolcanoAIService.judgeWordDifficulty(volcanoWordInfo);
      logger.info(`火山AI判断完成，单词 ${normalizedWord} 难度等级: ${aiJudgment.difficultyLevel}`);

      // 第四步：存数据库
      const completeWordInfo: CompleteWordInfo = {
        word: normalizedWord,
        pronunciation: tencentResult.pronunciation,
        translation: tencentResult.translation,
        partOfSpeech: tencentResult.partOfSpeech,
        difficultyLevel: aiJudgment.difficultyLevel,
        definition: tencentResult.definition
      };

      logger.info(`单词 ${normalizedWord} 存储到数据库`);
      const savedWord = await this.saveToDatabase(completeWordInfo);
      
      logger.info(`单词 ${normalizedWord} 处理完成，难度等级: ${aiJudgment.difficultyLevel}`);
      return savedWord;

    } catch (error) {
      logger.error(`处理单词 ${normalizedWord} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量处理单词（支持AI判断）- 增强错误处理版本
   */
  static async batchProcessWordsWithAI(words: string[]): Promise<CompleteWordInfo[]> {
    if (!words || words.length === 0) {
      return [];
    }

    logger.info(`开始批量处理 ${words.length} 个单词`);
    const processedResults: CompleteWordInfo[] = [];
    const errors: { word: string; error: string; step: string }[] = [];

    try {
      // 第一步：批量检查数据库
      logger.info('第一步：检查数据库中已存在的单词');
      const existingWordsMap = await this.batchCheckDatabase(words);
      const existingWords: CompleteWordInfo[] = [];
      const newWords: string[] = [];
      
      // 分离已存在和新单词
      for (const word of words) {
        const existing = existingWordsMap[word.toLowerCase()];
        if (existing) {
          existingWords.push(existing);
          logger.debug(`单词 ${word} 从数据库缓存获取`);
        } else {
          newWords.push(word);
        }
      }
      
      processedResults.push(...existingWords);
      
      if (newWords.length === 0) {
        logger.info('所有单词都已存在于数据库中');
        return processedResults;
      }

      logger.info(`需要处理 ${newWords.length} 个新单词`);

      // 第二步：批量调用腾讯翻译API（支持部分失败）
      logger.info('第二步：调用腾讯翻译API');
      let translationResults: any[] = [];
      try {
        translationResults = await this.batchCallTencentAPI(newWords);
        logger.info(`腾讯翻译API成功处理 ${translationResults.length} 个单词`);
      } catch (error) {
        logger.error('腾讯翻译API批量调用失败，尝试逐个处理:', error);
        // 降级处理：逐个调用翻译API
        for (const word of newWords) {
          try {
            const result = await this.callTencentAPI(word);
            translationResults.push(result);
          } catch (singleError) {
            logger.error(`单词 ${word} 翻译失败:`, singleError);
            errors.push({
              word,
              error: singleError instanceof Error ? singleError.message : String(singleError),
              step: '腾讯翻译API'
            });
          }
        }
      }

      if (translationResults.length === 0) {
        logger.warn('所有单词翻译都失败，返回已有结果');
        return processedResults;
      }

      // 第三步：批量调用火山AI判断难度（支持部分失败）
      logger.info('第三步：调用火山AI判断难度');
      let aiResults: CompleteWordInfo[] = [];
      try {
        aiResults = await this.batchCallVolcanoAI(translationResults);
        logger.info(`火山AI成功处理 ${aiResults.length} 个单词`);
      } catch (error) {
        logger.error('火山AI批量调用失败，尝试逐个处理:', error);
        // 降级处理：逐个调用火山AI
        for (const translationResult of translationResults) {
          try {
            const volcanoWordInfo: any = {
              word: translationResult.word,
              translation: translationResult.translation
            };
            if (translationResult.pronunciation) {
              volcanoWordInfo.pronunciation = translationResult.pronunciation;
            }
            if (translationResult.partOfSpeech) {
              volcanoWordInfo.partOfSpeech = translationResult.partOfSpeech;
            }
            const aiJudgment = await VolcanoAIService.judgeWordDifficulty(volcanoWordInfo);

            const completeWordInfo: CompleteWordInfo = {
              word: translationResult.word,
              pronunciation: translationResult.pronunciation,
              translation: translationResult.translation,
              partOfSpeech: translationResult.partOfSpeech,
              difficultyLevel: aiJudgment.difficultyLevel,
              definition: translationResult.definition
            };

            aiResults.push(completeWordInfo);
          } catch (singleError) {
            logger.error(`单词 ${translationResult.word} AI判断失败:`, singleError);
            errors.push({
              word: translationResult.word,
              error: singleError instanceof Error ? singleError.message : String(singleError),
              step: '火山AI判断'
            });
          }
        }
      }

      if (aiResults.length === 0) {
        logger.warn('所有单词AI判断都失败，返回已有结果');
        return processedResults;
      }

      // 第四步：批量存储到数据库（支持部分失败）
      logger.info('第四步：存储到数据库');
      let savedResults: CompleteWordInfo[] = [];
      try {
        savedResults = await this.batchSaveToDatabase(aiResults);
        logger.info(`数据库成功保存 ${savedResults.length} 个单词`);
      } catch (error) {
        logger.error('数据库批量保存失败，尝试逐个保存:', error);
        // 降级处理：逐个保存到数据库
        for (const wordInfo of aiResults) {
          try {
            const saved = await this.saveToDatabase(wordInfo);
            savedResults.push(saved);
          } catch (singleError) {
            logger.error(`单词 ${wordInfo.word} 保存失败:`, singleError);
            errors.push({
              word: wordInfo.word,
              error: singleError instanceof Error ? singleError.message : String(singleError),
              step: '数据库保存'
            });
          }
        }
      }

      // 合并所有成功处理的结果
      processedResults.push(...savedResults);
      
      // 记录处理结果统计
      logger.info(`批量处理完成统计:`);
      logger.info(`- 总输入单词数: ${words.length}`);
      logger.info(`- 从缓存获取: ${existingWords.length}`);
      logger.info(`- 新处理成功: ${savedResults.length}`);
      logger.info(`- 处理失败: ${errors.length}`);
      logger.info(`- 最终返回: ${processedResults.length}`);

      if (errors.length > 0) {
        logger.warn('部分单词处理失败:', errors);
      }

      return processedResults;

    } catch (error) {
      logger.error('批量处理单词发生严重错误:', error);
      // 即使发生严重错误，也返回已处理的结果
      if (processedResults.length > 0) {
        logger.info(`返回已处理的 ${processedResults.length} 个单词结果`);
        return processedResults;
      }
      throw error;
    }
  }

  /**
   * 第一步：检查数据库中是否已有单词信息
   */
  private static async checkDatabase(word: string): Promise<CompleteWordInfo | null> {
    try {
      const wordRepository = new WordRepository();
      const existingWord = await wordRepository.findByWord(word);
      
      if (existingWord) {
        logger.info(`单词 ${word} 在数据库中找到`);
        return {
          word: existingWord.word,
          pronunciation: existingWord.pronunciation || undefined,
          definition: undefined, // 简化模型中没有此字段
          translation: existingWord.translation || undefined,
          partOfSpeech: undefined, // 简化模型中没有此字段
          difficultyLevel: undefined, // 简化模型中没有此字段
          frequencyRank: undefined, // 简化模型中没有此字段
          exampleSentences: undefined, // 简化模型中没有此字段
          synonyms: undefined, // 简化模型中没有此字段
          antonyms: undefined, // 简化模型中没有此字段
          etymology: undefined // 简化模型中没有此字段
        };
      }
      
      return null;
    } catch (error) {
      logger.error(`检查数据库失败: ${word}`, error);
      return null;
    }
  }

  /**
   * 批量查询数据库（优化版本）
   * 一次性查询所有单词的完整信息，避免逐个查询
   */
  private static async batchCheckDatabase(words: string[]): Promise<{ [word: string]: CompleteWordInfo | null }> {
    const results: { [word: string]: CompleteWordInfo | null } = {};
    
    try {
      const wordRepository = new WordRepository();
      
      // 批量查询完整单词信息
      const wordsMap = await wordRepository.batchFindByWords(words);
      
      // 转换为CompleteWordInfo格式
      for (const [word, wordData] of Object.entries(wordsMap)) {
        if (wordData) {
          results[word] = {
            word: wordData.word,
            pronunciation: wordData.pronunciation || undefined,
            definition: undefined, // 简化模型中没有此字段
            translation: wordData.translation || undefined,
            partOfSpeech: undefined, // 简化模型中没有此字段
            difficultyLevel: undefined, // 简化模型中没有此字段
            frequencyRank: undefined, // 简化模型中没有此字段
            exampleSentences: undefined, // 简化模型中没有此字段
            synonyms: undefined, // 简化模型中没有此字段
            antonyms: undefined, // 简化模型中没有此字段
            etymology: undefined // 简化模型中没有此字段
          };
        } else {
          results[word] = null;
        }
      }
      
      const foundCount = Object.values(results).filter(r => r !== null).length;
      logger.info(`批量数据库查询完成: ${words.length}个单词中找到${foundCount}个完整记录`);
      
      return results;
    } catch (error) {
      logger.error('批量检查数据库失败:', error);
      
      // 如果批量查询失败，回退到逐个查询
      for (const word of words) {
        results[word] = await this.checkDatabase(word);
      }
      
      return results;
    }
  }

  /**
   * 批量调用火山AI判断
   */
  private static async batchCallVolcanoAI(translationResults: any[]): Promise<CompleteWordInfo[]> {
    const wordInfos = translationResults.map(tr => {
      const wordInfo: any = {
        word: tr.word,
        translation: tr.translation
      };
      if (tr.pronunciation) {
        wordInfo.pronunciation = tr.pronunciation;
      }
      if (tr.partOfSpeech) {
        wordInfo.partOfSpeech = tr.partOfSpeech;
      }
      return wordInfo;
    });

    logger.info(`开始批量调用火山AI判断 ${wordInfos.length} 个单词的难度等级`);
    let aiJudgments;
    try {
      aiJudgments = await VolcanoAIService.batchJudgeWordDifficulty(wordInfos);
      logger.info(`火山AI批量判断完成，成功处理 ${aiJudgments.length} 个单词`);
    } catch (error) {
      logger.error('火山AI批量判断失败:', error);
      throw error;
    }
    
    const results: CompleteWordInfo[] = [];
    for (let i = 0; i < translationResults.length; i++) {
      const tencentResult = translationResults[i];
      const aiJudgment = aiJudgments[i];

      if (aiJudgment && tencentResult) {
        results.push({
          word: tencentResult.word,
          pronunciation: tencentResult.pronunciation,
          translation: tencentResult.translation,
          partOfSpeech: tencentResult.partOfSpeech,
          difficultyLevel: aiJudgment.difficultyLevel,
          definition: tencentResult.definition
        });
      }
    }
    
    return results;
  }

  /**
   * 第二步：调用腾讯翻译API
   */
  private static async callTencentAPI(word: string): Promise<{
    word: string;
    translation: string;
    pronunciation?: string | undefined;
    partOfSpeech?: string | undefined;
    definition?: string | undefined;
  }> {
    try {
      const result = await TencentTranslationService.translateWord(word);
      
      return {
        word,
        translation: result.translation || '',
        pronunciation: result.pronunciation,
        partOfSpeech: result.partOfSpeech,
        definition: result.definition
      };
    } catch (error) {
      logger.error(`腾讯翻译API调用失败: ${word}`, error);
      throw error;
    }
  }

  /**
   * 批量调用腾讯翻译API（使用真正的批量翻译API）
   */
  private static async batchCallTencentAPI(words: string[]): Promise<any[]> {
    if (words.length === 0) {
      return [];
    }

    try {
      logger.info(`开始批量翻译 ${words.length} 个单词`);
      
      // 使用腾讯云批量翻译API
      const tencentResults = await TencentTranslationService.batchTranslateWords(words);
      
      logger.info(`批量翻译完成，成功处理 ${tencentResults.length} 个单词`);
      return tencentResults;
      
    } catch (error) {
      logger.error('批量翻译API调用失败，降级为逐个翻译:', error);
      
      // 降级处理：逐个翻译
      const results = [];
      for (const word of words) {
        try {
          const result = await this.callTencentAPI(word);
          results.push(result);
          
          // 添加延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (singleError) {
          logger.error(`单词翻译失败: ${word}`, singleError);
          // 添加默认结果，避免丢失单词
          results.push({
            word,
            translation: word,
            pronunciation: `/${word}/`,
            partOfSpeech: 'n.',
            definition: word
          });
        }
      }
      
      return results;
    }
  }

  /**
   * 保存到数据库
   */
  private static async saveToDatabase(wordInfo: CompleteWordInfo): Promise<CompleteWordInfo> {
    try {
      const wordRepository = new WordRepository();
      
      // 检查单词是否已存在
      const existingWord = await wordRepository.findByWord(wordInfo.word);
      if (existingWord) {
        logger.info(`单词 ${wordInfo.word} 已存在，跳过保存`);
        return wordInfo;
      }

      // 保存新单词
      const createData: any = {
        word: wordInfo.word
      };
      
      // 只添加非undefined的字段
      if (wordInfo.pronunciation !== undefined) createData.pronunciation = wordInfo.pronunciation;
      if (wordInfo.definition !== undefined) createData.definition = wordInfo.definition;
      if (wordInfo.translation !== undefined) createData.translation = wordInfo.translation;
      if (wordInfo.partOfSpeech !== undefined) createData.part_of_speech = wordInfo.partOfSpeech;
      if (wordInfo.difficultyLevel !== undefined) createData.difficulty_level = wordInfo.difficultyLevel;
      if (wordInfo.frequencyRank !== undefined) createData.frequency_rank = wordInfo.frequencyRank;
      if (wordInfo.exampleSentences !== undefined) createData.example_sentences = wordInfo.exampleSentences.join('\n');
      if (wordInfo.synonyms !== undefined) createData.synonyms = wordInfo.synonyms.join(', ');
      if (wordInfo.antonyms !== undefined) createData.antonyms = wordInfo.antonyms.join(', ');
      if (wordInfo.etymology !== undefined) createData.etymology = wordInfo.etymology;
      
      await wordRepository.createComplete(createData);

      logger.info(`单词 ${wordInfo.word} 保存成功`);
      return wordInfo;
    } catch (error) {
      logger.error(`保存单词 ${wordInfo.word} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量存储到数据库
   */
  private static async batchSaveToDatabase(wordInfos: CompleteWordInfo[]): Promise<CompleteWordInfo[]> {
    if (wordInfos.length === 0) {
      return [];
    }

    try {
      logger.info(`开始批量保存 ${wordInfos.length} 个单词到数据库（使用事务）`);
      
      // 使用事务确保原子性
      const results = await transaction(async (client) => {
        // 转换为数据库格式
        const wordsData = wordInfos.map(wordInfo => ({
          word: wordInfo.word,
          pronunciation: wordInfo.pronunciation,
          definition: wordInfo.definition,
          translation: wordInfo.translation,
          part_of_speech: wordInfo.partOfSpeech,
          difficulty_level: wordInfo.difficultyLevel,
          frequency_rank: wordInfo.frequencyRank,
          example_sentences: wordInfo.exampleSentences?.join('\n'),
          synonyms: wordInfo.synonyms?.join(', '),
          antonyms: wordInfo.antonyms?.join(', '),
          etymology: wordInfo.etymology
        }));

        // 构建批量插入SQL
        const placeholders = wordsData.map((_, index) => {
          const offset = index * 11;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`;
        }).join(', ');

        const sql = `
          INSERT INTO words (
            word, pronunciation, definition, translation, part_of_speech, 
            difficulty_level, frequency_rank, example_sentences, synonyms, antonyms, etymology
          ) VALUES ${placeholders}
          ON CONFLICT (word) DO UPDATE SET
            pronunciation = EXCLUDED.pronunciation,
            definition = EXCLUDED.definition,
            translation = EXCLUDED.translation,
            part_of_speech = EXCLUDED.part_of_speech,
            difficulty_level = EXCLUDED.difficulty_level,
            frequency_rank = EXCLUDED.frequency_rank,
            example_sentences = EXCLUDED.example_sentences,
            synonyms = EXCLUDED.synonyms,
            antonyms = EXCLUDED.antonyms,
            etymology = EXCLUDED.etymology,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        // 构建参数数组
        const params: any[] = [];
        wordsData.forEach(wordData => {
          params.push(
            wordData.word,
            wordData.pronunciation,
            wordData.definition,
            wordData.translation,
            wordData.part_of_speech,
            wordData.difficulty_level,
            wordData.frequency_rank,
            wordData.example_sentences,
            wordData.synonyms,
            wordData.antonyms,
            wordData.etymology
          );
        });

        logger.debug('执行批量插入事务', { sql: sql.substring(0, 200) + '...', paramCount: params.length });
        
        // 在事务中执行批量插入
        const result = await client.query(sql, params);
        
        logger.info(`事务中成功插入/更新 ${result.rows.length} 个单词`);
        
        // 转换回CompleteWordInfo格式
        return result.rows.map((word: any) => ({
          word: word.word,
          pronunciation: word.pronunciation || undefined,
          definition: word.definition || undefined,
          translation: word.translation || undefined,
          partOfSpeech: word.part_of_speech || undefined,
          difficultyLevel: word.difficulty_level || undefined,
          frequencyRank: word.frequency_rank || undefined,
          exampleSentences: word.example_sentences ? word.example_sentences.split('\n') : undefined,
          synonyms: word.synonyms ? word.synonyms.split(', ') : undefined,
          antonyms: word.antonyms ? word.antonyms.split(', ') : undefined,
          etymology: word.etymology || undefined
        }));
      });

      logger.info(`成功批量保存 ${results.length} 个单词到数据库（事务已提交）`);
      return results;
      
    } catch (error) {
      logger.error('批量保存到数据库失败（事务已回滚）:', error);
      
      // 降级为逐个保存（不使用事务）
      logger.warn('降级为逐个保存模式（无事务）');
      const results: CompleteWordInfo[] = [];
      
      for (const wordInfo of wordInfos) {
        try {
          const saved = await this.saveToDatabase(wordInfo);
          results.push(saved);
          logger.debug(`单词 ${wordInfo.word} 逐个保存成功`);
        } catch (singleError) {
          logger.error(`单词 ${wordInfo.word} 逐个保存失败:`, singleError);
          // 继续处理其他单词，不中断整个流程
        }
      }
      
      logger.info(`降级模式完成，成功保存 ${results.length}/${wordInfos.length} 个单词`);
      return results;
    }
  }

  /**
   * 获取单词信息（优先从缓存）
   */
  static async getWordInfo(word: string): Promise<CompleteWordInfo | null> {
    const normalizedWord = word.toLowerCase().trim();
    
    // 先查缓存
    const cached = await this.checkDatabase(normalizedWord);
    if (cached) {
      return cached;
    }
    
    // 缓存未命中，使用AI处理
    try {
      return await this.processWordWithAI(normalizedWord);
    } catch (error) {
      logger.error(`获取单词信息失败: ${normalizedWord}`, error);
      return null;
    }
  }

  /**
   * 检查单词是否应该显示翻译（基于AI判断的难度）
   */
  static async shouldShowTranslation(word: string): Promise<boolean> {
    console.log(`\n=== 开始检查单词翻译显示需求 ===`);
    console.log(`步骤1: 输入单词 = "${word}"`);
    
    const wordInfo = await this.getWordInfo(word);
    if (!wordInfo) {
      console.log(`步骤2: 获取单词信息失败，返回false`);
      console.log(`=== 结束检查，结果: 不显示翻译 ===\n`);
      return false; // 获取失败，不显示翻译
    }
    
    console.log(`步骤2: 获取单词信息成功`);
    console.log(`  - 单词: ${wordInfo.word}`);
    console.log(`  - 翻译: ${wordInfo.translation || '无'}`);
    console.log(`  - 难度等级: ${wordInfo.difficultyLevel || '未设置'}`);
    
    // 难度等级 > 3 的单词显示翻译
    const shouldShow = wordInfo.difficultyLevel ? wordInfo.difficultyLevel >= 2 : false;
      console.log(`步骤3: 判断逻辑 - 难度等级(${wordInfo.difficultyLevel}) >= 2 = ${shouldShow}`);
    console.log(`=== 结束检查，结果: ${shouldShow ? '显示翻译' : '不显示翻译'} ===\n`);
    
    return shouldShow;
  }

  /**
   * 过滤复杂单词（难度等级 > 3）
   */
  static async filterComplexWords(words: string[]): Promise<CompleteWordInfo[]> {
    if (!words || words.length === 0) {
      return [];
    }

    const complexWords: CompleteWordInfo[] = [];
    
    for (const word of words) {
      if (!word) continue; // 跳过空值
      
      const wordInfo = await this.getWordInfo(word);
      if (wordInfo && wordInfo.difficultyLevel && wordInfo.difficultyLevel >= 2) {
        complexWords.push(wordInfo);
      }
    }
    
    return complexWords;
  }

  /**
   * 批量检查哪些单词需要显示翻译（旧方法，保留兼容性）
   */
  static async batchFilterComplexWords(words: string[]): Promise<string[]> {
    const allWords = await this.batchProcessWordsWithAI(words);
    
    return allWords
      .filter(wordInfo => wordInfo.difficultyLevel && wordInfo.difficultyLevel >= 2)
      .map(wordInfo => wordInfo.word);
  }

  /**
   * 检查单词是否应该显示翻译（基于单词信息对象）
   * @param wordInfo 单词信息
   * @returns 是否应该显示翻译
   */
  static shouldShowTranslationByInfo(wordInfo: CompleteWordInfo): boolean {
    // 难度等级 > 3 的单词显示翻译
    return wordInfo.difficultyLevel ? wordInfo.difficultyLevel >= 2 : false;
  }

}