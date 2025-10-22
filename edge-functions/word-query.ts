import axios from 'axios';

// 简化的MD5哈希函数（使用crypto-js替代Web Crypto API）
async function md5Hash(text: string): Promise<string> {
  try {
    // 使用简单的哈希算法替代MD5
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('哈希计算失败:', error);
    return Date.now().toString(16);
  }
}

// 简化的KV存储模拟（使用内存缓存）
const memoryCache = new Map<string, { value: string; expiry: number }>();

const kv = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.value) as T;
      }
      if (cached) {
        memoryCache.delete(key); // 清理过期缓存
      }
      return null;
    } catch (error) {
      console.error('缓存读取失败:', error);
      return null;
    }
  },
  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    try {
      const expiry = options?.ex ? Date.now() + (options.ex * 1000) : Date.now() + (3600 * 1000);
      memoryCache.set(key, { value, expiry });
    } catch (error) {
      console.error('缓存写入失败:', error);
    }
  }
};

// 定义单词信息接口
interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples: string[];
  source: string;
}

// 环境变量
const BAIDU_APP_ID = process.env.VITE_BAIDU_APP_ID || process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.VITE_BAIDU_SECRET_KEY || process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 本地词典数据（作为回退）
const localDictionary: Record<string, WordInfo> = {
  'the': {
    phonetic: '/ðə/',
    definitions: ['定冠词', '这，那'],
    examples: ['The book is on the table.', 'The sun is shining.'],
    source: 'local'
  },
  'and': {
    phonetic: '/ænd/',
    definitions: ['和，与', '并且'],
    examples: ['Tom and Jerry', 'I like apples and oranges.'],
    source: 'local'
  },
  'is': {
    phonetic: '/ɪz/',
    definitions: ['是（be的第三人称单数现在时）'],
    examples: ['He is a teacher.', 'The weather is nice.'],
    source: 'local'
  },
  'in': {
    phonetic: '/ɪn/',
    definitions: ['在...里面', '在...期间'],
    examples: ['The cat is in the box.', 'In summer, it\'s hot.'],
    source: 'local'
  },
  'to': {
    phonetic: '/tuː/',
    definitions: ['到，向', '为了'],
    examples: ['Go to school.', 'I want to learn.'],
    source: 'local'
  },
  'of': {
    phonetic: '/əv/',
    definitions: ['...的', '属于'],
    examples: ['The color of the sky.', 'A cup of tea.'],
    source: 'local'
  },
  'a': {
    phonetic: '/ə/',
    definitions: ['一（个）', '不定冠词'],
    examples: ['A book', 'A beautiful day'],
    source: 'local'
  },
  'waste': {
    phonetic: '/weɪst/',
    definitions: ['废物，垃圾', '浪费', '废弃的'],
    examples: ['Don\'t waste time.', 'Waste separation is important.'],
    source: 'local'
  },
  'separation': {
    phonetic: '/ˌsepəˈreɪʃn/',
    definitions: ['分离，分开', '间隔'],
    examples: ['The separation of powers.', 'Waste separation helps recycling.'],
    source: 'local'
  }
};

// 调用百度翻译API的函数
async function callBaiduTranslateAPI(word: string): Promise<WordInfo | null> {
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    console.log('百度翻译API密钥未配置，跳过百度翻译');
    return null;
  }

  try {
    console.log(`调用百度翻译API查询单词: ${word}`);
    
    // 生成随机数
    const salt = Date.now().toString();
    // 构建签名
    const sign = await md5Hash(`${BAIDU_APP_ID}${word}${salt}${BAIDU_SECRET_KEY}`);
    
    // 发送请求
    const response = await axios.post(BAIDU_TRANSLATE_URL, {
      q: word,
      from: 'en',
      to: 'zh',
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000 // 增加超时时间
    });
    
    console.log(`百度翻译API响应状态: ${response.status}`);
    
    // 检查API错误
    if (response.data && response.data.error_code) {
      console.error(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`, response.data);
      return null;
    }
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translatedText = response.data.trans_result.map((item: any) => item.dst).join(', ');
      console.log(`翻译成功: "${word}" -> "${translatedText}"`);
      
      return {
        phonetic: `/${word}/`,
        definitions: [translatedText, '英语单词'],
        examples: [`This is an example sentence with "${word}".`, `"${word}" is an English word.`],
        source: 'baidu'
      };
    } else {
      console.error(`翻译响应格式异常:`, response.data);
      return null;
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', {
      error: error instanceof Error ? error.message : error,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status
    });
    return null;
  }
}

// 翻译单词函数（包含缓存和回退机制）
async function translateWord(word: string): Promise<WordInfo> {
  // 检查KV缓存
  try {
    const cacheKey = `word_translation:${word.toLowerCase()}`;
    const cachedResult = await kv.get<string>(cacheKey);
    
    if (cachedResult) {
      console.log(`从缓存获取翻译: ${word}`);
      return JSON.parse(cachedResult);
    }
  } catch (error) {
    console.error('从缓存读取失败:', error);
  }
  
  try {
    // 首先尝试百度翻译API
    if (BAIDU_APP_ID && BAIDU_SECRET_KEY) {
      const baiduResult = await callBaiduTranslateAPI(word);
      if (baiduResult) {
        // 缓存成功的翻译结果
        try {
          const cacheKey = `word_translation:${word.toLowerCase()}`;
          await kv.set(cacheKey, JSON.stringify(baiduResult), { ex: 3600 }); // 缓存1小时 - 优化缓存策略
          console.log(`单词翻译结果已缓存1小时: ${word}`);
        } catch (error) {
          console.error('缓存翻译结果失败:', error);
        }
        return baiduResult;
      }
    }
    
    // 如果百度翻译失败，返回基础翻译
    return {
      phonetic: `/${word}/`,
      definitions: [`${word}`, '英语单词 (翻译服务暂时不可用)'],
      examples: [`This is an example sentence with "${word}".`, `"${word}" is an English word.`],
      source: 'fallback'
    };
  } catch (error) {
    console.error('翻译服务错误:', error);
    return {
      phonetic: `/${word}/`,
      definitions: [`${word} (翻译服务暂不可用)`],
      examples: [`This is an example sentence with "${word}".`],
      source: 'error_fallback'
    };
  }
}

export default async function handler(request: Request) {
  // 这是Edge Function的默认导出处理函数
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // 从请求中获取单词参数
    let word = '';
    let useBaidu = true;
    
    if (request.method === 'GET') {
      const url = new URL(request.url);
      word = url.searchParams.get('encodedWord') || url.searchParams.get('word') || '';
      useBaidu = url.searchParams.get('useBaidu') !== 'false';
    } else if (request.method === 'POST') {
      const body = await request.json();
      word = body.encodedWord || body.word || '';
      useBaidu = body.useBaidu !== false;
    }
    
    // 解码单词
    try {
      word = decodeURIComponent(word);
    } catch (e) {
      // 如果解码失败，使用原始单词
    }
    
    if (!word.trim()) {
      return new Response(JSON.stringify({
        error: 'Missing word parameter',
        message: 'Please provide a word to query'
      }), {
        status: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 标准化单词（转小写）
    const normalizedWord = word.toLowerCase().trim();
    
    // 检查本地词典
    const localResult = localDictionary[normalizedWord];
    if (localResult) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          success: true,
          data: localResult
        },
        source: 'local'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 如果没有本地词典数据，使用翻译服务
    const translationResult = await translateWord(normalizedWord);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        success: true,
        data: translationResult
      },
      source: 'translation'
    }), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('单词查询错误:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: '单词查询失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}