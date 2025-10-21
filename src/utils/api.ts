import axios from 'axios'

// 创建axios实例
const api = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 添加响应拦截器，在实例级别统一处理HTML响应问题
api.interceptors.response.use(
  (response) => {
    console.log('响应拦截器 - 收到响应，状态码:', response.status)
    console.log('响应拦截器 - 响应类型:', typeof response.data)
    
    // 1. 首先检查是否是字符串响应
    if (typeof response.data === 'string') {
      const lowerCaseData = response.data.toLowerCase()
      
      // 检查是否包含HTML特征
      const isHtml = 
        lowerCaseData.includes('<!doctype html>') || 
        lowerCaseData.includes('<html') || 
        lowerCaseData.includes('<head') ||
        lowerCaseData.includes('<body') ||
        lowerCaseData.includes('<title') ||
        lowerCaseData.includes('<meta')
      
      if (isHtml) {
        console.error('响应拦截器 - 检测到HTML响应，将替换为错误对象')
        // 替换为标准错误响应对象
        response.data = {
          error: 'API返回HTML页面而非JSON数据',
          errorType: 'HTML_RESPONSE',
          isHtmlResponse: true
        }
      } else {
        // 尝试解析非HTML字符串为JSON
        try {
          console.log('响应拦截器 - 尝试将字符串解析为JSON')
          response.data = JSON.parse(response.data)
          console.log('响应拦截器 - 成功解析字符串为JSON')
        } catch (e) {
          console.error('响应拦截器 - 无法解析字符串为JSON，保留原始数据')
          // 保留原始字符串数据，但添加警告标记
          response.data = {
            rawString: response.data,
            warning: 'Response is a non-JSON string',
            isRawString: true
          }
        }
      }
    }
    
    // 2. 确保响应数据是有效的对象
    if (!response.data || typeof response.data !== 'object' || response.data === null) {
      console.error('响应拦截器 - 响应数据不是有效的对象，将替换为默认对象')
      response.data = {
        error: 'Invalid response data format',
        errorType: 'INVALID_DATA',
        isInvalidData: true
      }
    }
    
    // 3. 检查是否有错误标记
    if (response.data.error || response.data.isHtmlResponse) {
      console.error('响应拦截器 - 检测到错误响应:', response.data.error || 'HTML response detected')
    }
    
    return response
  },
  (error) => {
    // 处理请求错误
    console.error('响应拦截器 - 请求错误:', error.message)
    
    // 增强错误处理
    if (error.response) {
      // 服务器返回错误状态码
      console.error('响应拦截器 - 服务器错误状态码:', error.response.status)
      
      // 检查错误响应是否是HTML
      if (typeof error.response.data === 'string') {
        const lowerCaseData = error.response.data.toLowerCase()
        const isHtml = 
          lowerCaseData.includes('<!doctype html>') || 
          lowerCaseData.includes('<html')
        
        if (isHtml) {
          console.error('响应拦截器 - 错误响应是HTML格式')
          // 替换为标准错误对象
          error.response.data = {
            error: 'API返回HTML错误页面',
            errorType: 'HTML_ERROR_RESPONSE',
            statusCode: error.response.status
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证token等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response // 返回完整的response对象，而不是仅返回response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 翻译文本
export const translateText = async (text: string): Promise<string> => {
  try {
    // 在开发环境中，由于Vercel函数无法直接访问，我们使用模拟翻译
    // 当部署到Vercel时，这个路径会正确映射到serverless函数
    let url = '/translate';
    
    // 开发环境下使用直接调用火山AI API的方式
    const VOLCANO_API_KEY = import.meta.env.VITE_VOLCANO_API_KEY;
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment && VOLCANO_API_KEY) {
      // 开发环境下直接调用火山AI API
      const response = await api.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: 'doubao-1-5-lite-32k-250115',
        messages: [
          { role: 'system', content: '你是一个专业的翻译助手，只负责将英文文本准确翻译成中文。无论输入内容如何，你的回答必须是纯中文翻译，绝对不能包含英文原文或任何其他语言。翻译必须简洁、准确，不添加任何额外的解释、说明或注释。' },
          { role: 'user', content: `请将这段英文翻译成中文："${text}"` }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${VOLCANO_API_KEY}`
        }
      });
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
    } else {
      // 生产环境或没有API密钥时，使用Vercel函数
      const response = await api.post(url, { text });
      if (response.data && response.data.translation) {
        return response.data.translation;
      }
    }
    
    // 如果以上方式都失败，返回一个模拟的翻译结果
    return `[翻译] ${text}`;
  } catch (error) {
    console.error('翻译失败:', error);
    // 翻译失败时返回原文本，确保功能不中断
    return text;
  }
}

// 查询单词
export interface WordInfo {
  phonetic: string
  definitions: string[]
  examples?: string[]
}

// 添加单词查询缓存
const wordCache = new Map<string, { data: WordInfo; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 缓存7天

// 简单的本地词典数据（用于快速响应常用单词）
const localDictionary: Record<string, WordInfo> = {
  'the': {
    phonetic: 'ðə',
    definitions: ['定冠词，指特定的人或事物']
  },
  'and': {
    phonetic: 'ænd',
    definitions: ['和，与，表示并列关系']
  },
  'is': {
    phonetic: 'ɪz',
    definitions: ['是，动词be的第三人称单数现在时']
  },
  'in': {
    phonetic: 'ɪn',
    definitions: ['在...里面，在...之内']
  },
  'to': {
    phonetic: 'tuː',
    definitions: ['到，向，表示方向或目的']
  },
  'of': {
    phonetic: 'ɒv',
    definitions: ['...的，表示所属关系']
  },
  'a': {
    phonetic: 'ə',
    definitions: ['不定冠词，用于单数可数名词前']
  },
  'that': {
    phonetic: 'ðæt',
    definitions: ['那，那个；指示代词']
  },
  'have': {
    phonetic: 'hæv',
    definitions: ['有，拥有；助动词，构成完成时态']
  },
  'i': {
    phonetic: 'aɪ',
    definitions: ['我，第一人称单数主格']
  }
};

// 从环境变量获取API配置
const VOLCANO_API_KEY = import.meta.env.VITE_VOLCANO_API_KEY || '';
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
// 本地API代理地址
const LOCAL_WORD_QUERY_API = '/api/word-query';

// 验证响应数据的有效性
function isValidResponseData(data: any): boolean {
  // 如果是错误响应，认为它是有效的（用于错误处理）
  if (data.error || data.isHtmlResponse) {
    return true
  }
  
  // 基本的非错误响应应该是对象
  if (typeof data !== 'object' || data === null) {
    return false
  }
  
  // 对于单词查询，至少应该有某些预期字段或不为空对象
  return Object.keys(data).length > 0
}

// 调用本地API代理的函数 - 优化为直接使用GET请求，符合API要求
export const callLocalWordQueryAPI = async (word: string, contextSentence?: string, forceRefresh: boolean = false): Promise<WordInfo> => {
  try {
    console.log('调用本地API代理查询单词(GET方式):', word);
    console.log('请求参数:', { word, contextSentence, forceRefresh });
    
    // 确保word参数被正确编码
    const encodedWord = encodeURIComponent(word);
    console.log('编码后的单词:', encodedWord);
    
    // 直接使用GET请求，符合服务器要求
    const response = await api.get(LOCAL_WORD_QUERY_API, {
      params: {
        word: encodedWord,
        contextSentence,
        forceRefresh,
        useBaidu: true // 优先使用百度翻译API
      },
      timeout: 8000 // 增加超时时间到8秒
    });
    
    // 添加详细的响应日志，帮助调试
    console.log('API原始响应内容类型:', typeof response.data);
    console.log('API原始响应内容:', response.data);
    
    // 响应拦截器已经处理了HTML响应和无效数据
    // 检查是否有错误标记（来自拦截器或API）
    if (response.data.error || response.data.isHtmlResponse) {
      console.error('API响应包含错误信息:', response.data.error);
      
      // 增强错误对象，添加更多上下文信息
      const enhancedError = {
        phonetic: '',
        definitions: [`查询失败: ${response.data.error || 'API返回错误'}`],
        examples: [`单词"${word}"查询出错，请稍后再试`]
      };
      return enhancedError;
    }
    
    // 验证响应数据的完整性
    if (!isValidResponseData(response.data)) {
      console.error('响应数据结构不完整');
      return {
        phonetic: '',
        definitions: ['查询失败: API响应数据结构不完整'],
        examples: [`单词"${word}"查询返回的数据不完整`]
      };
    }
    
    // 初始化结果对象
    const wordInfo: WordInfo = {
      phonetic: '',
      definitions: ['未找到释义'],
      examples: []
    };
    
    // 验证并处理响应数据
    if (response.data && typeof response.data === 'object') {
      console.log('响应结构检查 - 是否有phonetic字段:', 'phonetic' in response.data);
      console.log('响应结构检查 - 是否有definitions字段:', 'definitions' in response.data);
      console.log('响应结构检查 - 是否有examples字段:', 'examples' in response.data);
      // 处理音标
      if (typeof response.data.phonetic === 'string') {
        wordInfo.phonetic = response.data.phonetic.trim();
        console.log('处理后的音标:', wordInfo.phonetic);
      }
      
      // 处理释义 - 增强的数据验证
      if (Array.isArray(response.data.definitions)) {
        const validDefinitions = response.data.definitions
          .filter((def: any) => typeof def === 'string' && def.trim().length > 0)
          .map((def: string) => def.trim());
        
        if (validDefinitions.length > 0) {
          wordInfo.definitions = validDefinitions;
        } else {
          console.warn('未找到有效释义，使用默认值');
          // 根据单词特性生成更具体的默认释义
          if (word.length > 1) {
            wordInfo.definitions = [`考研核心词汇: ${word}`];
          }
        }
      } else if (typeof response.data.definitions === 'string') {
        // 如果definitions是字符串，转换为数组
        wordInfo.definitions = [response.data.definitions.trim()];
      }
      
      // 处理例句 - 增强的数据验证
      if (Array.isArray(response.data.examples)) {
        const validExamples = response.data.examples
          .filter((example: any) => typeof example === 'string' && example.trim().length > 5)
          .map((example: string) => example.trim());
        
        if (validExamples.length > 0) {
          wordInfo.examples = validExamples;
        } else {
          console.warn('未找到有效例句，准备添加默认例句');
          // 添加默认例句
          wordInfo.examples = [
            `这是包含单词"${word}"的例句。`,
            `${word}在考研英语中是常见词汇。`
          ];
        }
      }
      
      // 检查是否有provider信息
      if (response.data.provider) {
        console.log('数据来源:', response.data.provider);
      }
      
      // 检查是否来自缓存
      if (response.data.fromCache) {
        console.log('数据来自缓存');
      }
    }
    
    console.log('GET请求处理完成，最终单词信息:', wordInfo);
    return wordInfo;
  } catch (error: any) {
    console.error('本地API代理调用失败:', error);
    console.error('错误详情:', error.response?.data || error.message || error);
    
    // 构建统一的错误响应对象
    const errorResponse = {
      phonetic: '',
      definitions: ['查询失败'],
      examples: [`请检查网络连接或稍后重试单词"${word}"的查询`]
    };
    
    // 处理网络错误或超时
    if (!error.response) {
      console.error('网络错误或超时');
      errorResponse.definitions = ['查询失败: 网络错误或API超时'];
      return errorResponse;
    }
    
    // 处理服务器错误 - 响应拦截器已经处理了HTML错误响应
    console.error('服务器返回错误状态码:', error.response.status);
    
    // 使用拦截器处理后的错误信息
    const processedErrorData = error.response.data || {};
    errorResponse.definitions = [
      `查询失败: ${processedErrorData.error || '服务器错误'}`
    ];
    
    return errorResponse;
  }
};

// 调用API的函数
export const queryWord = async (word: string, contextSentence?: string | boolean, forceRefresh: boolean = false): Promise<WordInfo> => {
  // 标准化单词（转为小写）
  const normalizedWord = word.toLowerCase().trim();
  
  // 处理参数兼容性 - 如果第二个参数是boolean，则表示forceRefresh
  if (typeof contextSentence === 'boolean') {
    forceRefresh = contextSentence;
    contextSentence = undefined;
  }
  
  // 定义统一的错误响应创建函数
  const createErrorResponse = (errorMessage: string, isCritical: boolean = false): WordInfo => {
    const errorResponse: WordInfo = {
      phonetic: '',
      definitions: [errorMessage],
      examples: isCritical ? 
        [`单词"${word}"查询遇到严重问题，请稍后再试`] : 
        [`请稍后重试单词"${word}"的查询`]
    };
    
    // 对于非强制刷新且非关键错误，可以考虑使用缓存的旧数据（如果有）
    if (!forceRefresh && !isCritical) {
      const cachedData = wordCache.get(normalizedWord);
      if (cachedData) {
        console.log('查询失败但存在缓存数据，使用过期缓存作为临时替代:', normalizedWord);
        // 添加过期标记，但仍然返回缓存数据
        return {
          ...cachedData.data,
          definitions: cachedData.data.definitions.map(def => 
            def.includes('⚠️') ? def : `⚠️ ${def}`
          )
        };
      }
    }
    
    return errorResponse;
  };
  
  try {
    // 如果不是强制刷新，正常检查缓存和本地词典
    if (!forceRefresh) {
      // 1. 检查缓存
      const cachedData = wordCache.get(normalizedWord);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log('从缓存获取单词信息:', normalizedWord);
        return cachedData.data;
      }
      
      // 2. 检查本地词典
      if (localDictionary[normalizedWord]) {
        console.log('从本地词典获取单词信息:', normalizedWord);
        // 保存到缓存
        wordCache.set(normalizedWord, {
          data: localDictionary[normalizedWord],
          timestamp: Date.now()
        });
        return localDictionary[normalizedWord];
      }
    } else {
      console.log('强制刷新模式，跳过缓存和本地词典，直接调用API:', normalizedWord);
    }
    
    // 3. 使用本地API代理（会自动优先使用百度翻译API）
    try {
      console.log('准备调用本地API代理查询单词:', normalizedWord);
      const wordInfo = await callLocalWordQueryAPI(normalizedWord, contextSentence, forceRefresh);
      
      // 防御性检查：确保返回的数据是有效的WordInfo对象
      if (typeof wordInfo !== 'object' || wordInfo === null || !wordInfo.definitions || !Array.isArray(wordInfo.definitions)) {
        console.error('本地API返回了无效的数据结构:', wordInfo);
        return createErrorResponse('查询失败：API返回数据结构无效', true);
      }
      
      // 检查是否是错误响应（来自拦截器）
      if (wordInfo.error || wordInfo.isHtmlResponse || wordInfo.definitions[0].includes('查询失败')) {
        console.warn('本地API返回了错误响应，但不是异常，将作为错误结果处理');
        // 对于HTML响应或其他错误，不缓存，直接返回错误信息
        return wordInfo;
      }
      
      // 保存到缓存 - 只缓存有效的成功响应
      console.log('准备更新单词缓存:', normalizedWord);
      wordCache.set(normalizedWord, {
        data: wordInfo,
        timestamp: Date.now()
      });
      console.log('单词缓存更新成功:', normalizedWord);
      
      console.log('本地API代理查询成功，最终结果:', wordInfo);
      return wordInfo;
    } catch (localApiError: any) {
      console.error('本地API代理调用失败，尝试使用备用方案:', localApiError.message || localApiError);
      // 本地API失败，继续使用备用方案
    }
    
    // 4. 如果没有百度翻译API密钥或者调用失败，使用火山AI API作为备用
    if (!VOLCANO_API_KEY) {
      console.warn('API密钥未配置，使用简化响应');
      const fallbackResponse: WordInfo = {
        phonetic: '',
        definitions: [`单词"${word}"的释义需要API密钥`],
        examples: []
      };
      return fallbackResponse;
    }
    
    // 5. 调用火山AI API作为备用
    console.log('调用火山AI API查询单词（备用方案）:', normalizedWord);
    
    // 构建提示词 - 移除例句相关要求，优化格式
    let prompt = `请提供单词"${word}"的以下信息：\n1. 音标\n2. 考研核心释义（优先显示常考含义）\n`;
    
    prompt += '请使用以下格式返回，不要添加其他信息：\n音标:/phonetic/\n释义:definition1,definition2,...';
    
    // 构建请求消息
    const messages = [
      { role: 'system', content: '你是一个专业的英语词典助手，专注于提供准确的单词释义。请严格按照要求的格式返回信息。' },
      { role: 'user', content: prompt }
    ];
    
    // 设置请求超时（提高用户体验）
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), 3000)
    );
    
    try {
      // 使用Promise.race添加请求超时处理
      const response = await Promise.race([
        api.post(VOLCANO_API_URL, {
          model: 'doubao-1-5-lite-32k-250115',
          messages
        }, {
          headers: {
            'Authorization': `Bearer ${VOLCANO_API_KEY}`,
            'Accept': 'application/json'
          }
        }),
        timeoutPromise
      ]);
      
      // 响应拦截器已经处理了HTML响应
      // 检查是否有错误标记
      if (response.data.error || response.data.isHtmlResponse) {
        console.error('火山AI API返回错误响应:', response.data.error);
        return createErrorResponse(`查询失败: ${response.data.error || 'AI服务错误'}`);
      }
      
      // 检查API响应结构
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.error('API响应格式错误，缺少必要字段:', response.data);
        return createErrorResponse('查询失败：AI API响应格式错误');
      }
      
      // 获取API响应内容
      const apiResponse = response.data.choices[0].message.content;
      console.log('火山AI API原始响应:', apiResponse);
      
      // 防御性检查：确保响应内容是字符串
      if (typeof apiResponse !== 'string') {
        console.error('AI API返回的内容不是字符串:', typeof apiResponse);
        return createErrorResponse('查询失败：AI返回格式异常');
      }
      
      // 解析API响应
      const wordInfo: WordInfo = {
        phonetic: '',
        definitions: [],
        examples: [] // 保持兼容性，但不再处理
      };
      
      // 提取音标
      const phoneticMatch = apiResponse.match(/音标:\/(.*?)\//);
      if (phoneticMatch && phoneticMatch[1]) {
        wordInfo.phonetic = phoneticMatch[1];
        console.log('提取到的音标:', wordInfo.phonetic);
      } else {
        console.log('未找到音标信息');
      }
      
      // 提取释义
      const definitionMatch = apiResponse.match(/释义:(.*?)$/s);
      if (definitionMatch && definitionMatch[1]) {
        wordInfo.definitions = definitionMatch[1]
          .split(',')
          .map((d: string) => d.trim())
          .filter((d: string) => d.length > 0); // 过滤空字符串
        console.log('提取到的释义:', wordInfo.definitions);
      }
      
      // 如果没有找到任何信息，使用默认提示
      if (wordInfo.definitions.length === 0) {
        wordInfo.definitions = ['未找到详细释义'];
      }
      
      // 保存到缓存 - 只缓存有效的响应
      wordCache.set(normalizedWord, {
        data: wordInfo,
        timestamp: Date.now()
      });
      
      console.log('最终的单词信息:', wordInfo);
      return wordInfo;
    } catch (timeoutError) {
      console.error('单词查询超时:', timeoutError);
      return createErrorResponse('查询超时，请稍后重试');
    }
  } catch (error: any) {
    console.error('单词查询失败:', error.message || error);
    
    // 检查是否是HTML相关的错误
    const errorMessage = error.message || '';
    if (errorMessage.toLowerCase().includes('html') || 
        (error.response?.data?.isHtmlResponse)) {
      return createErrorResponse('查询失败：服务器返回了HTML页面而非数据', true);
    }
    
    // 失败时返回基本信息，确保包含所有必要字段
    return createErrorResponse('查询失败，请稍后重试');
  }
}

// 导出清除单词缓存的方法（可选使用）
export const clearWordCache = (): void => {
  wordCache.clear();
  console.log('单词缓存已清除');
};

// 导出添加单词到本地词典的方法（可选扩展）
export const addToLocalDictionary = (word: string, info: WordInfo): void => {
  localDictionary[word.toLowerCase()] = info;
  console.log(`单词"${word}"已添加到本地词典`);
};

// 保存作文到后端（实际项目中使用）
export interface Essay {
  year: string
  title: string
  type: string
  content: string
}

export const saveEssay = async (_data: Essay): Promise<{ id: string }> => {
  try {
    // 实际项目中应该调用后端API
    // const response = await api.post('/essays', data)
    // return response
    
    // 模拟保存成功
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now().toString() })
      }, 300)
    })
  } catch (error) {
    console.error('保存失败:', error)
    throw error
  }
}

export default api