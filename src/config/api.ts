/**
 * 统一API配置
 * 解决多重配置问题，提供统一的API地址管理
 */

// 获取基础API URL
const getBaseURL = (): string => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 开发环境使用空字符串，通过Vite代理
  if (import.meta.env.DEV) {
    return '';
  }
  
  // 生产环境使用相对路径
  return '';
};

// API配置
export const API_CONFIG = {
  // 基础URL
  baseURL: getBaseURL(),
  
  // API端点配置
  endpoints: {

    

    
    // 单词查询
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

// 常用API URL构建器
export const API_URLS = {
  
  // 单词查询
  words: {
    query: (word?: string) => word 
      ? buildURL(`${API_CONFIG.endpoints.words.query}/${encodeURIComponent(word)}`)
      : buildURL(API_CONFIG.endpoints.words.query),
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
  
  // AI单词处理
  aiWords: {
    batchProcess: () => buildURL(API_CONFIG.endpoints.aiWords.batchProcess),
    filterComplex: () => buildURL(API_CONFIG.endpoints.aiWords.filterComplex),
    checkDisplay: () => buildURL(API_CONFIG.endpoints.aiWords.checkDisplay),
    processSingle: () => buildURL(API_CONFIG.endpoints.aiWords.processSingle),
    configStatus: () => buildURL(API_CONFIG.endpoints.aiWords.configStatus)
  },
  
  // 翻译接口
  translation: {
    translate: () => buildURL(API_CONFIG.endpoints.translation.translate),
    batch: () => buildURL(API_CONFIG.endpoints.translation.batch),
    history: () => buildURL(API_CONFIG.endpoints.translation.history)
  },
  
  // 系统接口
  system: {
    health: () => buildURL(API_CONFIG.endpoints.system.health),
    info: () => buildURL(API_CONFIG.endpoints.system.info)
  }
};

// 导出默认配置
export default API_CONFIG;