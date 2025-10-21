import axios from 'axios'

// 创建axios实例
const api = axios.create({
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

// 调用本地API代理的函数 - 优化为直接使用GET请求，符合API要求
export const callLocalWordQueryAPI = async (word: string, contextSentence?: string, forceRefresh: boolean = false): Promise<WordInfo> => {
  try {
    console.log('调用本地API代理查询单词(GET方式):', word);
    
    // 直接使用GET请求，符合服务器要求
    const response = await api.get(LOCAL_WORD_QUERY_API, {
      params: {
        word,
        contextSentence,
        forceRefresh,
        useBaidu: true // 优先使用百度翻译API
      },
      timeout: 5000 // 设置超时时间
    });
    
    // 检查响应
    if (response.data) {
      // 确保返回的对象符合WordInfo接口
      const wordInfo: WordInfo = {
        phonetic: response.data.phonetic || '',
        definitions: response.data.definitions || ['未找到释义'],
        examples: response.data.examples || []
      };
      
      console.log('GET请求成功');
      return wordInfo;
    } else {
      console.error('本地API代理响应格式错误:', response.data);
      return {
        phonetic: '',
        definitions: ['未找到释义'],
        examples: []
      };
    }
  } catch (error) {
    console.error('本地API代理调用失败:', error);
    throw error;
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
      const wordInfo = await callLocalWordQueryAPI(normalizedWord, contextSentence, forceRefresh);
      
      // 保存到缓存
      wordCache.set(normalizedWord, {
        data: wordInfo,
        timestamp: Date.now()
      });
      
      console.log('本地API代理查询成功，结果:', wordInfo);
      return wordInfo;
    } catch (localApiError) {
      console.error('本地API代理调用失败，尝试使用备用方案:', localApiError);
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
            'Authorization': `Bearer ${VOLCANO_API_KEY}`
          }
        }),
        timeoutPromise
      ]);
      
      // 检查API响应结构
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.error('API响应格式错误，缺少必要字段:', response.data);
        return {
          phonetic: '',
          definitions: ['查询失败：API响应格式错误'],
          examples: []
        };
      }
      
      // 获取API响应内容
      const apiResponse = response.data.choices[0].message.content;
      console.log('火山AI API原始响应:', apiResponse);
      
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
        wordInfo.definitions = definitionMatch[1].split(',').map((d: string) => d.trim());
        console.log('提取到的释义:', wordInfo.definitions);
      }
      
      // 如果没有找到任何信息，使用默认提示
      if (wordInfo.definitions.length === 0) {
        wordInfo.definitions = ['未找到详细释义'];
      }
      
      // 保存到缓存
      wordCache.set(normalizedWord, {
        data: wordInfo,
        timestamp: Date.now()
      });
      
      console.log('最终的单词信息:', wordInfo);
      return wordInfo;
    } catch (timeoutError) {
      console.error('单词查询超时:', timeoutError);
      return {
        phonetic: '',
        definitions: ['查询超时，请稍后重试'],
        examples: []
      };
    }
  } catch (error) {
    console.error('单词查询失败:', error);
    // 失败时返回基本信息，确保包含所有必要字段
    return {
      phonetic: '',
      definitions: ['查询失败，请稍后重试'],
      examples: []
    };
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