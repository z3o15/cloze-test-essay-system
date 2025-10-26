/**
 * 统一API配置
 * 解决多重配置问题，提供统一的API地址管理
 */

// 获取基础API URL（核心修改：强制返回空字符串，避免环境变量导致多余/api）
const getBaseURL = (): string => {
  // 强制返回空字符串，无论环境变量或开发/生产环境，彻底杜绝baseURL带/api
  return '';
  
  // 注释原有逻辑，避免干扰（后续确认无问题可删除）
  // if (import.meta.env.VITE_API_BASE_URL) {
  //   return import.meta.env.VITE_API_BASE_URL;
  // }
  // if (import.meta.env.DEV) {
  //   return '';
  // }
  // return '';
};

// API配置（关键：删除所有包含/api/的注释，避免构建工具误解析）
export const API_CONFIG = {
  baseURL: getBaseURL(),
  endpoints: {
    // 单词相关
    words: {
      query: '/api/words',
      batch: '/api/words/batch',
      // 单词预查询相关端点
      batchPrequery: '/api/words/batch-prequery',
      prequerySingle: '/api/words/prequery',
      clearCache: '/api/words/clear-cache',
      cacheStats: '/api/words/cache-stats',
      health: '/api/words/health',
      // 查找难度级别≥3的单词
      difficult: '/api/words/difficult'
    },
    
    // AI单词处理
    aiWords: {
      batchProcess: '/api/ai-words/batch-process',
      filterComplex: '/api/ai-words/filter-complex',
      checkDisplay: '/api/ai-words/check-display',
      processSingle: '/api/ai-words/process-single',
      configStatus: '/api/ai-words/config-status'
    },
    
    // 翻译相关
    translation: {
      translate: '/api/translate',
      batch: '/api/translate/batch',
      history: '/api/translate/history'
    },
    
    // 系统相关
    system: {
      health: '/api/health',
      info: '/api/info'
    },

    // essay模块
    essay: {
      process: '/api/essay/process'
    }
  },
  
  // 请求配置
  defaults: {
    timeout: 60000, // 增加到60秒，适应翻译API的响应时间
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// 构建完整URL的辅助函数
export const buildURL = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// 常用API URL构建器（关键：删除所有包含/api/的注释）
export const API_URLS = {
  words: {
    query: (word?: string) => word 
      ? buildURL(`${API_CONFIG.endpoints.words.query}/${encodeURIComponent(word)}`)
      : buildURL(API_CONFIG.endpoints.words.query),
    create: () => buildURL(API_CONFIG.endpoints.words.query),
    batch: () => buildURL(API_CONFIG.endpoints.words.batch),
    // 单词预查询相关URL
    batchPrequery: () => buildURL(API_CONFIG.endpoints.words.batchPrequery),
    prequerySingle: (word: string) => buildURL(`${API_CONFIG.endpoints.words.prequerySingle}/${encodeURIComponent(word)}`),
    clearCache: () => buildURL(API_CONFIG.endpoints.words.clearCache),
    cacheStats: () => buildURL(API_CONFIG.endpoints.words.cacheStats),
    health: () => buildURL(API_CONFIG.endpoints.words.health),
    // 查找难度级别≥3的单词
    difficult: () => buildURL(API_CONFIG.endpoints.words.difficult)
  },
  
  aiWords: {
    batchProcess: () => buildURL(API_CONFIG.endpoints.aiWords.batchProcess),
    filterComplex: () => buildURL(API_CONFIG.endpoints.aiWords.filterComplex),
    checkDisplay: () => buildURL(API_CONFIG.endpoints.aiWords.checkDisplay),
    processSingle: () => buildURL(API_CONFIG.endpoints.aiWords.processSingle),
    configStatus: () => buildURL(API_CONFIG.endpoints.aiWords.configStatus)
  },
  
  translation: {
    translate: () => buildURL(API_CONFIG.endpoints.translation.translate),
    batch: () => buildURL(API_CONFIG.endpoints.translation.batch),
    history: () => buildURL(API_CONFIG.endpoints.translation.history)
  },
  
  system: {
    health: () => buildURL(API_CONFIG.endpoints.system.health),
    info: () => buildURL(API_CONFIG.endpoints.system.info)
  },
  // 新增：essay模块的URL生成方法
  essay: {
    process: () => buildURL(API_CONFIG.endpoints.essay.process)
  }
};

// 导出默认配置
export default API_CONFIG;