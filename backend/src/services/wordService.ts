import { WordRepository } from '@/repositories/wordRepository';
import { logger } from '@/utils/logger';
import { Word, WordCreateRequest, WordUpdateRequest, WordQueryParams, PaginatedResponse } from '@/models/types';

export class WordService {
  private wordRepository: WordRepository;

  constructor() {
    this.wordRepository = new WordRepository();
  }

  /**
   * 查询单词
   */
  async queryWord(word: string): Promise<Word | null> {
    try {
      logger.info('查询单词:', { word });

      // 标准化单词（转小写，去除空格）
      const normalizedWord = word.toLowerCase().trim();
      
      if (!normalizedWord) {
        return null;
      }

      // 查找单词
      const wordData = await this.wordRepository.findByWord(normalizedWord);
      
      return wordData;
    } catch (error) {
      logger.error('查询单词失败:', { 
        word, 
        error: error instanceof Error ? error.message : error 
      });
      
      return null;
    }
  }

  /**
   * 获取单词列表
   */
  async getWords(params: WordQueryParams): Promise<PaginatedResponse<Word>> {
    try {
      const {
        page = 1,
        limit = 20,
        search
      } = params;

      logger.info('获取单词列表:', { params });

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 查询数据和总数
      const [words, total] = await Promise.all([
        this.wordRepository.findMany({
          limit,
          offset,
          search,
          orderBy: 'word ASC'
        }),
        this.wordRepository.count({ search })
      ]);

      // 计算分页信息
      const totalPages = Math.ceil(total / limit);

      return {
        data: words,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('获取单词列表失败:', { 
        params, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }

  /**
   * 创建单词
   */
  async createWord(wordData: WordCreateRequest): Promise<Word> {
    try {
      logger.info('创建单词:', { word: wordData.word });

      // 标准化单词
      const normalizedWordData = {
        ...wordData,
        word: wordData.word.toLowerCase().trim()
      };

      // 检查单词是否已存在
      const existingWord = await this.wordRepository.findByWord(normalizedWordData.word);
      if (existingWord) {
        logger.info('单词已存在，返回现有单词:', { id: existingWord.id, word: existingWord.word });
        return existingWord;
      }

      // 创建单词
      const newWord = await this.wordRepository.create(normalizedWordData);

      logger.info('创建单词成功:', { id: newWord.id, word: newWord.word });
      
      return newWord;
    } catch (error) {
      logger.error('创建单词失败:', { 
        wordData, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }

  /**
   * 批量创建单词
   */
  async createWords(wordsData: WordCreateRequest[]): Promise<{ created: number; skipped: number; words: Word[] }> {
    try {
      logger.info('批量创建单词:', { count: wordsData.length });

      const results: Word[] = [];
      let created = 0;
      let skipped = 0;

      for (const wordData of wordsData) {
        try {
          // 标准化单词
          const normalizedWordData = {
            ...wordData,
            word: wordData.word.toLowerCase().trim()
          };

          // 检查单词是否已存在
          const existingWord = await this.wordRepository.findByWord(normalizedWordData.word);
          if (existingWord) {
            skipped++;
            continue;
          }

          // 创建单词
          const newWord = await this.wordRepository.create(normalizedWordData);
          results.push(newWord);
          created++;
        } catch (error) {
          logger.warn('创建单词失败，跳过:', { 
            word: wordData.word, 
            error: error instanceof Error ? error.message : error 
          });
          skipped++;
        }
      }

      logger.info('批量创建单词完成:', { created, skipped });
      
      return { created, skipped, words: results };
    } catch (error) {
      logger.error('批量创建单词失败:', { 
        count: wordsData.length, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }

  /**
   * 更新单词
   */
  async updateWord(id: string, updateData: WordUpdateRequest): Promise<Word | null> {
    try {
      logger.info('更新单词:', { id, updateData });

      // 如果更新单词本身，需要标准化
      if (updateData.word) {
        updateData.word = updateData.word.toLowerCase().trim();
      }

      const updatedWord = await this.wordRepository.update(id, updateData);
      
      if (updatedWord) {
        logger.info('更新单词成功:', { id, word: updatedWord.word });
      }
      
      return updatedWord;
    } catch (error) {
      logger.error('更新单词失败:', { 
        id, 
        updateData, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }

  /**
   * 删除单词
   */
  async deleteWord(id: string): Promise<boolean> {
    try {
      logger.info('删除单词:', { id });

      const success = await this.wordRepository.delete(id);
      
      if (success) {
        logger.info('删除单词成功:', { id });
      }
      
      return success;
    } catch (error) {
      logger.error('删除单词失败:', { 
        id, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }

  /**
   * 批量检查单词是否存在
   * 返回已存在的单词映射和不存在的单词列表
   */
  async checkWords(words: string[]): Promise<{ existing: Record<string, Word>; unknown: string[] }> {
    try {
      const normalized = words
        .filter(w => typeof w === 'string')
        .map(w => w.toLowerCase().trim())
        .filter(w => !!w)

      const existing: Record<string, Word> = {}
      const unknown: string[] = []

      for (const w of normalized) {
        const found = await this.wordRepository.findByWord(w)
        if (found) {
          existing[w] = found
        } else {
          unknown.push(w)
        }
      }

      logger.info('批量检查单词完成', { existingCount: Object.keys(existing).length, unknownCount: unknown.length })
      return { existing, unknown }
    } catch (error) {
      logger.error('批量检查单词失败:', { error: error instanceof Error ? error.message : error })
      throw error
    }
  }

  /**
   * 查找难度级别≥3的单词
   * 从给定的单词列表中，返回数据库中存在且难度级别≥3的单词
   */
  async findDifficultWords(words: string[]): Promise<Word[]> {
    try {
      logger.info('查找难度级别≥3的单词:', { wordCount: words.length });

      if (!words || words.length === 0) {
        return [];
      }

      // 标准化单词列表
      const normalizedWords = words
        .filter(w => typeof w === 'string')
        .map(w => w.toLowerCase().trim())
        .filter(w => !!w);

      if (normalizedWords.length === 0) {
        return [];
      }

      const difficultWords = await this.wordRepository.findDifficultWords(normalizedWords);
      
      logger.info('找到难度级别≥3的单词:', { 
        inputCount: normalizedWords.length, 
        foundCount: difficultWords.length 
      });
      
      return difficultWords;
    } catch (error) {
      logger.error('查找难度级别≥3的单词失败:', { 
        words, 
        error: error instanceof Error ? error.message : error 
      });
      
      throw error;
    }
  }
}