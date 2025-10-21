import axios from 'axios'

// 浏览器兼容的MD5实现
async function md5(str: string): Promise<string> {
  const crypto = window.crypto || (window as any).msCrypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const buffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

// 腾讯API配置
const TENCENT_APP_ID = import.meta.env.VITE_TENCENT_APP_ID || '';
const TENCENT_KEY = import.meta.env.VITE_TENCENT_KEY || '';
const TENCENT_API_URL = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_worddict';

// 百度API配置
const BAIDU_APP_ID = import.meta.env.VITE_BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = import.meta.env.VITE_BAIDU_SECRET_KEY || '';
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 调用腾讯词典API
const callTencentDictAPI = async (word: string): Promise<WordInfo> => {
  try {
    if (!TENCENT_APP_ID || !TENCENT_KEY) {
      throw new Error('腾讯API密钥未配置');
    }

    console.log('调用腾讯词典API查询单词:', word);
    
    // 生成随机数和时间戳
    const nonce = Math.floor(Math.random() * 1000000000).toString();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 构造请求参数
  const params: {
    app_id: string;
    time_stamp: string;
    nonce_str: string;
    text: string;
    sign: string;
  } = {
    app_id: TENCENT_APP_ID,
    time_stamp: timestamp,
    nonce_str: nonce,
    text: word,
    sign: ''
  };
    
    // 生成签名
  const signStr = `app_id=${TENCENT_APP_ID}&nonce_str=${nonce}&text=${encodeURIComponent(word)}&time_stamp=${timestamp}&key=${TENCENT_KEY}`;
  const sign = (await md5(signStr)).toUpperCase();
    params['sign'] = sign;
    
    // 发送POST请求
    const response = await api.post(TENCENT_API_URL, new URLSearchParams(params));
    
    // 处理响应
    if (response.data && response.data.ret === 0) {
      // 提取音标
      let phonetic = '';
      if (response.data.data && response.data.data.phonetic) {
        phonetic = response.data.data.phonetic;
      }
      
      // 提取释义
      const definitions: string[] = [];
      if (response.data.data && response.data.data.explanations) {
        response.data.data.explanations.forEach((exp: any) => {
          if (exp.pos && exp.def) {
            definitions.push(`${exp.pos} ${exp.def}`);
          } else if (exp.def) {
            definitions.push(exp.def);
          }
        });
      }
      
      // 提取例句
      const examples: string[] = [];
      if (response.data.data && response.data.data.examples) {
        response.data.data.examples.forEach((example: any) => {
          if (example.en && example.zh) {
            examples.push(`${example.en}\n${example.zh}`);
          }
        });
      }
      
      return {
        phonetic,
        definitions: definitions.length > 0 ? definitions : ['未找到释义'],
        examples
      };
    } else {
      throw new Error(`腾讯API错误: ${response.data.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('腾讯词典API调用失败:', error);
    throw error;
  }
};

// 调用百度翻译API
const callBaiduTranslateAPI = async (word: string): Promise<WordInfo> => {
  try {
    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      throw new Error('百度API密钥未配置');
    }

    console.log('调用百度翻译API查询单词:', word);
    
    // 生成随机数和时间戳
    const salt = Math.floor(Math.random() * 1000000000).toString();
    
    // 构建签名
  const signStr = BAIDU_APP_ID + word + salt + BAIDU_SECRET_KEY;
  const sign = await md5(signStr);
    
    // 发送GET请求
    const response = await api.get(BAIDU_API_URL, {
      params: {
        q: word,
        from: 'en',
        to: 'zh',
        appid: BAIDU_APP_ID,
        salt,
        sign
      }
    });
    
    // 处理响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      return {
        phonetic: '',
        definitions: [response.data.trans_result[0].dst],
        examples: []
      };
    } else {
      throw new Error(`百度API错误: ${response.data.error_msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
};

// 调用火山AI API
const callVolcanoAPI = async (word: string): Promise<WordInfo> => {
  try {
    if (!VOLCANO_API_KEY) {
      throw new Error('火山AI API密钥未配置');
    }

    console.log('调用火山AI API查询单词:', word);
    
    // 构建提示词
    let prompt = `请提供单词"${word}"的以下信息：\n1. 音标\n2. 考研核心释义（优先显示常考含义）\n`;
    prompt += '请使用以下格式返回，不要添加其他信息：\n音标:/phonetic/\n释义:definition1,definition2,...';
    
    // 构建请求消息
    const messages = [
      { role: 'system', content: '你是一个专业的英语词典助手，专注于提供准确的单词释义。请严格按照要求的格式返回信息。' },
      { role: 'user', content: prompt }
    ];
    
    // 发送请求
    const response = await api.post(VOLCANO_API_URL, {
      model: 'doubao-1-5-lite-32k-250115',
      messages
    }, {
      headers: {
        'Authorization': `Bearer ${VOLCANO_API_KEY}`
      }
    });
    
    // 处理响应
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const apiResponse = response.data.choices[0].message.content;
      
      const wordInfo: WordInfo = {
        phonetic: '',
        definitions: [],
        examples: []
      };
      
      // 提取音标
      const phoneticMatch = apiResponse.match(/音标:\/(.*?)\//);
      if (phoneticMatch && phoneticMatch[1]) {
        wordInfo.phonetic = phoneticMatch[1];
      }
      
      // 提取释义
      const definitionMatch = apiResponse.match(/释义:(.*?)$/s);
      if (definitionMatch && definitionMatch[1]) {
        wordInfo.definitions = definitionMatch[1].split(',').map((d: string) => d.trim());
      }
      
      if (wordInfo.definitions.length === 0) {
        wordInfo.definitions = ['未找到详细释义'];
      }
      
      return wordInfo;
    } else {
      throw new Error('火山API响应格式错误');
    }
  } catch (error) {
    console.error('火山AI API调用失败:', error);
    throw error;
  }
};

// 统一翻译结果格式的函数
const normalizeTranslationResponse = (response: WordInfo): WordInfo => {
  return {
    phonetic: response.phonetic || '',
    definitions: response.definitions && response.definitions.length > 0 
      ? response.definitions 
      : ['未找到释义'],
    examples: response.examples || []
  };
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
    
    // 3. 尝试调用腾讯词典API（直接调用，不再通过边缘函数）
    try {
      // 添加请求超时控制，避免长时间等待
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('腾讯API请求超时')), 3000)
      );
      
      const tencentResult = await Promise.race([
        callTencentDictAPI(normalizedWord),
        timeoutPromise
      ]);
      
      // 统一响应格式
      const normalizedResult = normalizeTranslationResponse(tencentResult);
      
      // 保存到缓存
      wordCache.set(normalizedWord, {
        data: normalizedResult,
        timestamp: Date.now()
      });
      
      console.log('腾讯词典API查询成功，结果:', normalizedResult);
      return normalizedResult;
    } catch (tencentError) {
      console.error('腾讯词典API调用失败或超时，尝试使用火山AI API:', tencentError);
      // 腾讯API失败，继续尝试火山AI API
    }
    
    // 4. 尝试调用火山AI API
    try {
      if (!VOLCANO_API_KEY) {
        throw new Error('火山AI API密钥未配置');
      }
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('火山API请求超时')), 3000)
      );
      
      const volcanoResult = await Promise.race([
        callVolcanoAPI(normalizedWord),
        timeoutPromise
      ]);
      
      // 统一响应格式
      const normalizedResult = normalizeTranslationResponse(volcanoResult);
      
      // 保存到缓存
      wordCache.set(normalizedWord, {
        data: normalizedResult,
        timestamp: Date.now()
      });
      
      console.log('火山AI API查询成功，结果:', normalizedResult);
      return normalizedResult;
    } catch (volcanoError) {
      console.error('火山AI API调用失败或超时，尝试使用百度翻译API:', volcanoError);
      // 火山AI API失败，继续尝试百度翻译API
    }
    
    // 5. 最后尝试百度翻译API
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('百度API请求超时')), 3000)
      );
      
      const baiduResult = await Promise.race([
        callBaiduTranslateAPI(normalizedWord),
        timeoutPromise
      ]);
      
      // 统一响应格式
      const normalizedResult = normalizeTranslationResponse(baiduResult);
      
      // 保存到缓存
      wordCache.set(normalizedWord, {
        data: normalizedResult,
        timestamp: Date.now()
      });
      
      console.log('百度翻译API查询成功，结果:', normalizedResult);
      return normalizedResult;
    } catch (baiduError) {
      console.error('百度翻译API调用失败或超时，使用默认响应:', baiduError);
      // 所有API都失败，使用默认响应
    }
    
    // 所有API都失败时的默认响应
    const defaultResponse: WordInfo = {
      phonetic: '',
      definitions: ['无法连接到翻译服务，请检查网络连接或API密钥配置'],
      examples: []
    };
    
    return defaultResponse;
  } catch (error) {
    console.error('单词查询过程中出现错误:', error);
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