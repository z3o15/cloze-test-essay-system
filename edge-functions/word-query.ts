import axios from 'axios';
import { kv } from '@vercel/kv';

// Web Crypto API 辅助函数
async function md5Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 导入axios用于HTTP请求
import axios from 'axios';

// 声明KV存储
declare const kv: {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
};

// 定义单词信息接口
interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples: string[];
  source: string;
}

// 环境变量
const BAIDU_APP_ID = process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 本地词典数据（作为回退）
const localDictionary: Record<string, WordInfo> = {
  'the': {
    phonetic: '/ðə/',
    definitions: ['定冠词', '这，那']
  },
  'and': {
    phonetic: '/ænd/',
    definitions: ['和，与', '并且']
  },
  'is': {
    phonetic: '/ɪz/',
    definitions: ['是（be的第三人称单数现在时）']
  },
  'in': {
    phonetic: '/ɪn/',
    definitions: ['在...里面', '在...期间']
  },
  'to': {
    phonetic: '/tuː/',
    definitions: ['到，向', '为了']
  },
  'of': {
    phonetic: '/əv/',
    definitions: ['...的', '属于']
  },
  'a': {
    phonetic: '/ə/',
    definitions: ['一（个）', '不定冠词']
  },
  'waste': {
    phonetic: '/weɪst/',
    definitions: ['废物，垃圾', '浪费', '废弃的']
  },
  'separation': {
    phonetic: '/ˌsepəˈreɪʃn/',
    definitions: ['分离，分开', '间隔']
  }
};

// 调用百度翻译API的函数
async function callBaiduTranslateAPI(word: string): Promise<WordInfo | null> {
  try {
    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      console.log('百度翻译API配置不完整');
      return null;
    }
    
    const salt = Date.now().toString();
    const query = word;
    const from = 'en';
    const to = 'zh';
    
    // 生成签名
    const signStr = BAIDU_APP_ID + query + salt + BAIDU_SECRET_KEY;
    const sign = await md5Hash(signStr);
    
    const params = {
      q: query,
      from: from,
      to: to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    };
    
    console.log(`调用百度翻译API: ${word}`);
    const response = await axios.get(BAIDU_TRANSLATE_URL, {
      params: params,
      timeout: 5000
    });
    
    console.log(`百度翻译API响应状态: ${response.status}`);
    console.log(`百度翻译API响应数据:`, JSON.stringify(response.data, null, 2));
    
    // 检查API错误
    if (response.data && response.data.error_code) {
      console.log(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`);
      if (response.data.error_code === '54003') {
        console.log('API调用频率超限，返回null');
      }
      return null;
    }
    
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translation = response.data.trans_result[0].dst;
      console.log(`翻译成功: "${word}" -> "${translation}"`);
      return {
        phonetic: `/${word}/`,
        definitions: [translation, `英语单词: ${word}`],
        examples: [
          `This is an example sentence with "${word}".`,
          `${word} is commonly used in English.`
        ],
        source: 'baidu_translate'
      };
    } else {
      console.log(`翻译响应格式异常:`, response.data);
    }
    
    return null;
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
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
    if (localDictionary[normalizedWord]) {
      return new Response(JSON.stringify({
        phonetic: localDictionary[normalizedWord].phonetic,
        definitions: localDictionary[normalizedWord].definitions,
        examples: localDictionary[normalizedWord].examples || [],
        source: 'local_dictionary'
      }), {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 如果没有本地词典数据，使用翻译服务
    const translationResult = await translateWord(normalizedWord);
    
    return new Response(JSON.stringify(translationResult), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Word query error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  }
}