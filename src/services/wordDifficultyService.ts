import httpClient from '../utils/httpClient'
import { API_URLS } from '../config/api'
import type { WordDifficultyAnalysisResponse } from '../types/wordDifficulty'

/**
 * 单词难度服务
 * 使用新的AI处理API进行单词难度判断
 */
export class WordDifficultyService {
  /**
   * 批量分析单词难度（分批处理版本）
   * @param words 单词数组
   * @returns 单词难度分析结果
   */
  static async analyzeWordDifficulty(words: string[]): Promise<WordDifficultyAnalysisResponse> {
    if (import.meta.env.DEV) {
      console.log(`🔍 [WordDifficultyService] 开始分批AI分析 ${words.length} 个新单词（已去重）`);
    }
    
    try {
      // 如果单词数量较少，直接处理
      if (words.length <= 20) {
        return await this.processSingleBatch(words);
      }
      
      // 分批处理逻辑
      const BATCH_SIZE = 20;
      const batches: string[][] = [];
      
      // 将单词分成多个批次
      for (let i = 0; i < words.length; i += BATCH_SIZE) {
        batches.push(words.slice(i, i + BATCH_SIZE));
      }
      
      if (import.meta.env.DEV) {
        console.log(`📦 [分批处理] 将 ${words.length} 个单词分为 ${batches.length} 个批次，每批最多 ${BATCH_SIZE} 个单词`);
      }
      
      // 串行处理所有批次，避免并发压力
      const batchResults: WordDifficultyAnalysisResponse[] = [];
      for (let i = 0; i < batches.length; i++) {
        if (import.meta.env.DEV) {
          console.log(`📦 [分批处理] 正在处理第 ${i + 1}/${batches.length} 批次`);
        }
        
        try {
          const result = await this.processSingleBatch(batches[i]);
          batchResults.push(result);
          
          // 批次间延迟，避免API压力
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 增加到1秒延迟
          }
        } catch (error: any) {
          console.error(`❌ [分批处理] 第 ${i + 1} 批次处理失败:`, error);
          
          // 尝试重试失败的批次（减少批次大小）
          let retryResult = null;
          if (batches[i].length > 1) {
            console.log(`🔄 [重试] 尝试将失败批次拆分为更小的批次重试...`);
            try {
              // 将失败的批次拆分为单个单词重试
              const smallBatches = batches[i].map(word => [word]);
              const retryResults: WordDifficultyAnalysisResponse[] = [];
              
              for (const smallBatch of smallBatches) {
                try {
                  await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟
                  const singleResult = await this.processSingleBatch(smallBatch);
                  retryResults.push(singleResult);
                } catch (singleError: any) {
                  console.warn(`⚠️ [重试失败] 单词 "${smallBatch[0]}" 重试失败:`, singleError);
                  // 为失败的单词创建默认结果
                  retryResults.push({
                    code: 'ERROR',
                    data: {
                      total_words: 1,
                      complex_words_count: 0,
                      simple_words_count: 1,
                      analysis: [{
                        word: smallBatch[0],
                        difficulty_level: 1,
                        difficulty_description: '分析失败，默认为简单单词',
                        is_simple: true,
                        should_display: false
                      }],
                      complex_words: []
                    },
                    message: '单词分析失败'
                  });
                }
              }
              
              // 合并重试结果
              retryResult = this.mergeBatchResults(retryResults, batches[i].length);
              console.log(`✅ [重试成功] 批次重试完成，成功处理 ${retryResult.data.total_words} 个单词`);
            } catch (retryError: any) {
              console.error(`❌ [重试失败] 批次重试完全失败:`, retryError);
            }
          }
          
          // 如果重试成功，使用重试结果；否则使用默认错误结果
          if (retryResult) {
            batchResults.push(retryResult);
          } else {
            // 为失败批次中的每个单词创建默认分析结果
            const defaultAnalysis = batches[i].map(word => ({
              word: word,
              difficulty_level: 1,
              difficulty_description: '分析失败，默认为简单单词',
              is_simple: true,
              should_display: false
            }));
            
            batchResults.push({
              code: 'ERROR',
              data: {
                total_words: batches[i].length,
                complex_words_count: 0,
                simple_words_count: batches[i].length,
                analysis: defaultAnalysis,
                complex_words: []
              },
              message: '批次处理失败'
            });
          }
        }
      }
      
      // 合并所有批次的结果
      const mergedResult = this.mergeBatchResults(batchResults, words.length);
      
      if (import.meta.env.DEV) {
        console.log(`✅ [分批处理完成] 总计 ${words.length} 个单词，${mergedResult.data.complex_words_count} 个复杂单词`);
      }
      
      return mergedResult;
    } catch (error: any) {
      console.error(`❌ [分批处理错误] 单词难度分析失败:`, {
        message: error.message,
        wordsCount: words.length
      });
      
      // 返回错误结果
      return {
        code: 'ERROR',
        data: {
          total_words: words.length,
          complex_words_count: 0,
          simple_words_count: words.length,
          analysis: words.map(word => ({
            word: word,
            difficulty_level: 1,
            difficulty_description: '分析失败，默认为简单单词',
            is_simple: true,
            should_display: false
          })),
          complex_words: []
        },
        message: `分析失败: ${error.message}`
      };
    }
  }

  /**
   * 处理单个批次的单词
   * @param words 单词数组
   * @returns 单词难度分析结果
   */
  private static async processSingleBatch(words: string[]): Promise<WordDifficultyAnalysisResponse> {
    if (import.meta.env.DEV) {
      console.log(`🔍 [单批次处理] 开始处理 ${words.length} 个单词:`, words);
    }
    
    try {
      // 准备API请求数据
      const requestData = { words };
      const apiUrl = API_URLS.aiWords.batchProcess();
      
      console.log(`📤 [API请求] URL: ${apiUrl}`);
      console.log(`📤 [API请求] 数据:`, requestData);
      
      // 调用简化的批量处理接口
      const response = await httpClient.post(apiUrl, requestData, {
        timeout: 60000 // 增加到60秒，与API配置保持一致
      });
      
      console.log(`📥 [API响应] 状态码:`, response.status);
      console.log(`📥 [API响应] 完整数据:`, JSON.stringify(response.data, null, 2));
      console.log(`📥 [API响应] data字段:`, response.data?.data);
      console.log(`📥 [API响应] complexWords字段:`, response.data?.data?.complexWords);
      
      // 检查响应结构
      if (!response.data) {
        console.error(`❌ API响应无data字段:`, response);
        throw new Error('API响应格式错误: 缺少data字段');
      }
      
      if (!response.data.data) {
        console.error(`❌ API响应data字段无data子字段:`, response.data);
        throw new Error('API响应格式错误: data字段缺少data子字段');
      }
      
      // 获取复杂单词列表
      const complexWords = Array.isArray(response.data.data.complexWords) ? response.data.data.complexWords : [];
      
      if (import.meta.env.DEV) {
        console.log(`📊 [分析结果] ${words.length}个单词中，${complexWords.length}个为复杂单词:`, complexWords);
      }
      console.log(`📊 [统计信息]`, response.data.data.stats);
      
      if (!Array.isArray(complexWords)) {
        console.error(`❌ complexWords不是数组:`, complexWords);
        throw new Error(`API返回的数据格式错误: complexWords不是数组，实际类型: ${typeof complexWords}`);
      }
      
      // 构建分析结果，为所有单词创建分析数据
      const analysis = words.map(word => {
        // complexWords是对象数组，需要检查word属性
        const complexWordObj = complexWords.find((cw: any) => cw.word === word);
        const isComplex = !!complexWordObj;
        return {
          word: word,
          difficulty_level: isComplex ? (complexWordObj?.difficulty_level || 3) : 1,
          difficulty_description: isComplex ? '复杂单词' : '简单单词',
          is_simple: !isComplex,
          should_display: isComplex,
          translation: complexWordObj?.translation || '',
          pronunciation: complexWordObj?.pronunciation || '',
          part_of_speech: complexWordObj?.part_of_speech || ''
        };
      });
      
      const result = {
        code: 'SUCCESS',
        data: {
          total_words: words.length,
          complex_words_count: complexWords.length,
          simple_words_count: words.length - complexWords.length,
          analysis: analysis,
          complex_words: complexWords.map((cw: any) => cw.word), // 提取单词字符串
          complex_words_details: complexWords // 保留完整对象信息
        },
        message: '单批次分析完成'
      };
      
      return result;
    } catch (error: any) {
      console.error(`❌ [API错误] 单词难度分析失败:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        wordsCount: words.length,
        requestData: error.config?.data,
        responseData: error.response?.data
      });
      
      // 抛出错误，让上层处理
      throw error;
    }
  }



  /**
   * 合并多个批次的结果
   * @param batchResults 批次结果数组
   * @param totalWords 总单词数
   * @returns 合并后的结果
   */
  private static mergeBatchResults(batchResults: WordDifficultyAnalysisResponse[], totalWords: number): WordDifficultyAnalysisResponse {
    const allAnalysis: any[] = [];
    const allComplexWords: string[] = [];
    let totalComplexCount = 0;
    
    // 合并所有批次的结果
    batchResults.forEach((result: any) => {
      if (result.code === 'SUCCESS' && result.data) {
        allAnalysis.push(...result.data.analysis);
        allComplexWords.push(...result.data.complex_words);
        totalComplexCount += result.data.complex_words_count;
      }
    });
    
    return {
      code: 'SUCCESS',
      data: {
        total_words: totalWords,
        complex_words_count: totalComplexCount,
        simple_words_count: totalWords - totalComplexCount,
        analysis: allAnalysis,
        complex_words: allComplexWords
      },
      message: '分批处理完成'
    };
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
        timeout: 20000
      });
      
      // 从响应中提取复杂单词列表
      // API返回格式: {code: 'SUCCESS', data: {success: true, data: {complexWords: [...]}}}
      const responseData = response.data || response;
      
      let complexWords: string[] = [];
      
      // 处理API响应格式
      if (responseData.code === 'SUCCESS' && responseData.data) {
        // 标准格式: {code: 'SUCCESS', data: {success: true, data: {complexWords: [...]}}}
        const innerData = responseData.data;
        if (innerData.success && innerData.data && Array.isArray(innerData.data.complexWords)) {
          complexWords = innerData.data.complexWords;
        } else {
          console.error('❌ API内部数据格式不正确:', innerData);
          throw new Error('API内部数据格式错误');
        }
      } else if (responseData.success && responseData.data && Array.isArray(responseData.data.complexWords)) {
        // 直接格式: {success: true, data: {complexWords: [...]}}
        complexWords = responseData.data.complexWords;
      } else {
        console.error('❌ API返回的数据格式不支持:', responseData);
        throw new Error('API返回的数据格式错误');
      }
      
      // 确保返回的是字符串数组
      if (!Array.isArray(complexWords)) {
        throw new Error('复杂单词数据不是数组格式');
      }
      
      return complexWords;
    } catch (error: any) {
      console.warn('⚠️ AI过滤失败，跳过过滤显示所有单词:', error);
      
      // API失败时跳过过滤，返回所有单词
      return words;
    }
  }

  /**
   * 检查单词是否需要显示智能提示（简化版本）
   * @param word 要检查的单词
   * @returns 是否需要显示智能提示
   */
  static async shouldShowDisplay(word: string): Promise<boolean> {

    
    try {
      const response = await httpClient.post(API_URLS.aiWords.checkDisplay(), {
        word: word.toLowerCase().trim()
      }, {
        timeout: 15000 // 延长超时时间到15秒
      });
      
      const needsDisplay = response.data.data.needsDisplay || false;
      
  
      
      return needsDisplay;
    } catch (error: any) {
      console.error(`❌ 检查智能提示需求失败: ${word}`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 网络错误时返回true，确保用户能看到智能提示
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        console.warn(`⚠️ 网络超时，默认显示智能提示: ${word}`);
        return true;
      }
      
      // 其他错误时默认不显示智能提示
      return false;
    }
  }

  /**
   * 查找难度级别≥3的单词
   * 从数据库中查找给定单词列表中难度级别≥3的单词
   * @param words 单词数组
   * @returns 难度级别≥3的单词数据
   */
  static async findDifficultWords(words: string[]): Promise<any[]> {
    try {
      const response = await httpClient.post(API_URLS.words.difficult(), {
        words
      }, {
        timeout: 10000
      });
      
      // 正确提取数据：response.data.data 才是实际的单词数组
      const responseData = response.data || response;
      const difficultWords = responseData.data || responseData || [];
      
      // 确保返回的是数组
      const wordsArray = Array.isArray(difficultWords) ? difficultWords : [];
      
      return wordsArray;
    } catch (error: any) {
      console.error('查找难度级别≥3的单词失败:', {
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

}