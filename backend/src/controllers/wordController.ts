import { Request, Response } from 'express';
import { WordService } from '@/services/wordService';
import { logger } from '@/utils/logger';
import { WordQueryParams, WordCreateRequest, WordUpdateRequest, API_CODES } from '@/models/types';

export class WordController {
  private wordService: WordService;

  constructor() {
    this.wordService = new WordService();
  }

  /**
   * 查询单词 - GET /api/words/:word
   */
  queryWord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { word } = req.params;

      if (!word || typeof word !== 'string') {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请提供要查询的单词',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到单词查询请求:', { word });

      const result = await this.wordService.queryWord(word);

      res.status(200).json({
        code: API_CODES.SUCCESS,
        data: result,
        message: result ? '查询成功' : '未找到该单词'
      });
    } catch (error) {
      logger.error('单词查询控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 获取单词列表 - GET /api/words
   */
  getWords = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '20',
        search
      } = req.query;

      // 参数验证和转换
      const params: WordQueryParams = {
        page: parseInt(page as string, 10) || 1,
        limit: Math.min(parseInt(limit as string, 10) || 20, 100), // 最大限制100
        search: search as string
      };

      logger.info('收到获取单词列表请求:', { params });

      const result = await this.wordService.getWords(params);

      res.status(200).json({
        code: API_CODES.SUCCESS,
        data: result.data,
        pagination: result.pagination,
        message: '获取成功'
      });
    } catch (error) {
      logger.error('获取单词列表控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 创建单词 - POST /api/words
   */
  createWord = async (req: Request, res: Response): Promise<void> => {
    try {
      const wordData: WordCreateRequest = req.body;

      // 基本验证
      if (!wordData.word || !wordData.translation) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '单词和翻译是必填字段',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到创建单词请求:', { word: wordData.word });

      const result = await this.wordService.createWord(wordData);

      res.status(201).json({
        code: API_CODES.SUCCESS,
        data: result,
        message: '创建成功'
      });
    } catch (error) {
      logger.error('创建单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 批量创建单词 - POST /api/words/batch
   */
  createWords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { words } = req.body;

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请提供要创建的单词数组',
          timestamp: new Date()
        });
        return;
      }

      if (words.length > 100) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '一次最多创建100个单词',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到批量创建单词请求:', { count: words.length });

      const result = await this.wordService.createWords(words);

      res.status(201).json({
        code: API_CODES.SUCCESS,
        data: result,
        message: `成功创建${result.created}个单词，跳过${result.skipped}个重复单词`
      });
    } catch (error) {
      logger.error('批量创建单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 更新单词 - PUT /api/words/:id
   */
  updateWord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: WordUpdateRequest = req.body;

      if (!id) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请提供单词ID',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到更新单词请求:', { id, updateData });

      const result = await this.wordService.updateWord(id, updateData);

      if (result) {
        res.status(200).json({
          code: API_CODES.SUCCESS,
          data: result,
          message: '更新成功'
        });
      } else {
        res.status(404).json({
          code: API_CODES.ERROR_001,
          message: '未找到该单词'
        });
      }
    } catch (error) {
      logger.error('更新单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 删除单词 - DELETE /api/words/:id
   */
  deleteWord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请提供单词ID',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到删除单词请求:', { id });

      const success = await this.wordService.deleteWord(id);

      if (success) {
        res.status(200).json({
          code: API_CODES.SUCCESS,
          message: '删除成功'
        });
      } else {
        res.status(404).json({
          code: API_CODES.ERROR_001,
          message: '未找到该单词'
        });
      }
    } catch (error) {
      logger.error('删除单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };

  /**
   * 批量检查单词是否存在 - GET /api/words/batch/check
   */
  checkWords = async (req: Request, res: Response): Promise<void> => {
    try {
      let words: string[] = []

      // 支持 query ?words=word1,word2 或 ?words[]=word1&words[]=word2
      const q = req.query.words
      if (Array.isArray(q)) {
        words = q as string[]
      } else if (typeof q === 'string') {
        words = q.split(',')
      } else if (Array.isArray(req.body?.words)) {
        // 兼容部分客户端以GET带body的情况
        words = req.body.words
      }

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请通过 query 参数提供要检查的单词数组，如 ?words=word1,word2',
          timestamp: new Date()
        })
        return
      }

      logger.info('收到批量检查单词请求:', { count: words.length })

      const result = await this.wordService.checkWords(words)

      res.status(200).json({
        code: API_CODES.SUCCESS,
        data: result,
        message: '批量检查完成'
      })
    } catch (error) {
      logger.error('批量检查单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      })
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      })
    }
  }

  /**
   * 查找难度级别≥2的单词 - POST /api/words/difficult
   */
  findDifficultWords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { words } = req.body;

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({
          code: API_CODES.ERROR_001,
          message: '请提供要查询的单词数组',
          timestamp: new Date()
        });
        return;
      }

      logger.info('收到查找难度级别≥2的单词请求:', { count: words.length });

      const difficultWords = await this.wordService.findDifficultWords(words);

      res.status(200).json({
        code: API_CODES.SUCCESS,
        data: difficultWords,
        message: `找到 ${difficultWords.length} 个难度级别≥2的单词`
      });
    } catch (error) {
      logger.error('查找难度级别≥2的单词控制器错误:', { 
        error: error instanceof Error ? error.message : error 
      });
      
      res.status(500).json({
        code: API_CODES.ERROR_500,
        message: '服务器内部错误',
        timestamp: new Date()
      });
    }
  };
}