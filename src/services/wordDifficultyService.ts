import httpClient from '../utils/httpClient'
import { API_URLS } from '../config/api'
import type { WordDifficultyAnalysisResponse, WordDifficultyLevel } from '../types/wordDifficulty'
import { isBasicWord } from '../utils/wordValidator'

/**
 * 单词难度服务
 * 使用新的AI处理API进行单词难度判断
 */
export class WordDifficultyService {
  /**
   * 批量分析单词难度（简化版本 - 四步流程）
   * @param words 单词数组
   * @returns 单词难度分析结果
   */
  static async analyzeWordDifficulty(words: string[]): Promise<WordDifficultyAnalysisResponse> {

    
    try {
      // 调用简化的批量处理接口
      const response = await httpClient.post(API_URLS.aiWords.batchProcess(), {
        words
      }, {
        timeout: 20000, // 批量处理需要更长时间
        retry: 1, // 重试1次
        retryDelay: 2000 // 重试间隔2秒
      });
      
  
      
      // 获取复杂单词列表
      const complexWords = Array.isArray(response.data.complexWords) ? response.data.complexWords : [];
      
      console.log(`API返回: ${words.length}个单词中，${complexWords.length}个为复杂单词:`, complexWords);
      
      if (!Array.isArray(complexWords)) {
        console.error(`❌ complexWords不是数组:`, complexWords);
        throw new Error(`API返回的数据格式错误: complexWords不是数组，实际类型: ${typeof complexWords}`);
      }
      
      // 构建分析结果，为所有单词创建分析数据
      const analysis = words.map(word => {
        const isComplex = complexWords.includes(word);
        return {
          word: word,
          difficulty_level: isComplex ? 2 : 1, // 复杂单词设为2级，简单单词设为1级
          difficulty_description: isComplex ? '复杂单词' : '简单单词',
          is_simple: !isComplex,
          should_translate: isComplex
        };
      });
      
      const result = {
        code: 'SUCCESS',
        data: {
          total_words: words.length,
          complex_words_count: complexWords.length,
          simple_words_count: words.length - complexWords.length,
          analysis: analysis,
          complex_words: complexWords
        },
        message: '四步流程分析完成'
      };
      
      return result;
    } catch (error: any) {
      console.error(`前端步骤2: API调用失败 =`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        wordsCount: words.length
      });
      console.log(`=== 前端：分析失败 ===\n`);
      throw error;
    }
  }

  /**
   * 过滤复杂单词（难度等级 >= 2）- 使用火山API级别数据
   * @param words 单词数组
   * @returns 复杂单词数组
   */
  static async filterComplexWords(words: string[]): Promise<string[]> {
    try {
      // 直接调用filter-complex API
      const response = await httpClient.post(API_URLS.aiWords.filterComplex(), {
        words
      }, {
        timeout: 20000,
        retry: 1,
        retryDelay: 2000
      });
      
      console.log('API响应:', response);
      
      // 从响应中提取复杂单词列表
      // API返回格式: {code: 'SUCCESS', data: [{word: 'xxx', ...}, ...]}
      const responseData = response.data || response;
      const complexWordsData = responseData.data || responseData;
      
      if (!Array.isArray(complexWordsData)) {
        console.error('API返回的数据不是数组:', complexWordsData);
        throw new Error('API返回的数据格式错误');
      }
      
      const complexWords = complexWordsData.map((item: any) => item.word);
      
      console.log(`AI过滤结果: ${words.length}个单词中，${complexWords.length}个为复杂单词:`, complexWords);
      
      return complexWords;
    } catch (error) {
      console.warn('AI过滤失败，使用基础词汇过滤:', error);
      
      // 降级处理：使用基础词汇列表过滤
      const complexWords = words.filter(word => !isBasicWord(word));
      
      console.log(`基础过滤结果: ${words.length}个单词中，${complexWords.length}个为非基础单词`);
      
      return complexWords;
    }
  }

  /**
   * 检查单词是否需要显示翻译（简化版本）
   * @param word 单词
   * @returns 是否需要显示翻译
   */
  static async shouldShowTranslation(word: string): Promise<boolean> {

    
    try {
      const response = await httpClient.post(API_URLS.aiWords.checkTranslation(), {
        word
      }, {
        timeout: 15000, // 延长超时时间到15秒
        retry: 2, // 重试2次
        retryDelay: 1000 // 重试间隔1秒
      });
      
      const needsTranslation = response.data.data.needsTranslation || false;
      
  
      
      return needsTranslation;
    } catch (error: any) {
      console.error(`❌ 检查翻译需求失败: ${word}`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // 网络错误时返回true，确保用户能看到翻译
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED' || !error.response) {

        return true;
      }
      
      return false; // 其他错误时默认不显示翻译
    }
  }

  /**
   * 查找难度级别≥2的单词
   * 从数据库中查找给定单词列表中难度级别≥2的单词
   * @param words 单词数组
   * @returns 难度级别≥2的单词数据
   */
  static async findDifficultWords(words: string[]): Promise<any[]> {
    try {
      console.log('查找难度级别≥2的单词:', { wordCount: words.length });
      
      const response = await httpClient.post(API_URLS.words.difficult(), {
        words
      }, {
        timeout: 10000,
        retry: 1,
        retryDelay: 1000
      });
      
      console.log('难度级别≥2的单词查询响应:', response);
      
      // 正确提取数据：response.data.data 才是实际的单词数组
      const responseData = response.data || response;
      const difficultWords = responseData.data || responseData || [];
      
      // 确保返回的是数组
      const wordsArray = Array.isArray(difficultWords) ? difficultWords : [];
      console.log(`找到 ${wordsArray.length} 个难度级别≥2的单词`);
      
      return wordsArray;
    } catch (error: any) {
      console.error('查找难度级别≥2的单词失败:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // 出错时返回空数组，不影响正常显示
      return [];
    }
  }

  /**
   * 获取难度等级描述
   * @param level 难度等级
   * @returns 描述文本
   */
  private static getDifficultyDescription(level: number): string {
    const descriptions = {
      1: '最简单',
      2: '简单', 
      3: '基础',
      4: '中等',
      5: '高级',
      6: '专家级',
      7: '非常高级',
      8: '学术级',
      9: '专业级',
      10: '罕见'
    };
    return descriptions[level as keyof typeof descriptions] || '未知';
  }
}