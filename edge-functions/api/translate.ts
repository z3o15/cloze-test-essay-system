import axios from 'axios';

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

// EdgeOne Pages兼容的请求和响应类型
interface Request {
  method: string;
  headers: Record<string, string | string[]>;
  json?: () => Promise<any>;
  body?: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => Promise<void>;
  end: () => Promise<void>;
  setHeader: (key: string, value: string) => void;
}

// 允许的源
const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080', 'http://localhost:8081']

// 从环境变量获取配置
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '';
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const BAIDU_APP_ID = process.env.VITE_BAIDU_APP_ID || process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.VITE_BAIDU_SECRET_KEY || process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/vip/translate';

// 调用百度翻译API
async function callBaiduTranslateAPI(text: string, from: string, to: string) {
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    console.error('百度翻译API密钥未配置');
    throw new Error('百度翻译API密钥未配置');
  }

  const salt = Date.now().toString();
  const sign = await md5Hash(BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY);

  try {
    console.log('调用百度翻译API:', { text: text.substring(0, 50), from, to });
    
    const response = await axios.post(BAIDU_TRANSLATE_URL, {
      q: text,
      from,
      to,
      appid: BAIDU_APP_ID,
      salt,
      sign
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000 // 增加超时时间
    });

    console.log('百度翻译响应状态:', response.status);

    if (response.data.error_code) {
      console.error('百度翻译API错误:', response.data);
      throw new Error(`百度翻译API错误: ${response.data.error_msg || response.data.error_code}`);
    }

    const translatedText = response.data.trans_result?.[0]?.dst;
    if (!translatedText) {
      console.error('百度翻译返回空结果:', response.data);
      throw new Error('百度翻译返回空结果');
    }

    console.log('百度翻译成功:', translatedText.substring(0, 50));
    return translatedText;
  } catch (error) {
    console.error('百度翻译API调用失败:', {
      error: error instanceof Error ? error.message : error,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status
    });
    throw error;
  }
}

// 调用火山AI API的函数
async function callVolcanoAPI(text: string, targetLanguage: string, sourceLanguage: string) {
  if (!VOLCANO_API_KEY) {
    console.error('火山AI API密钥未配置');
    throw new Error('API密钥未配置');
  }

  try {
    console.log('调用火山AI翻译API:', { text: text.substring(0, 50), sourceLanguage, targetLanguage });
    
    const messages = [
      { 
        role: 'system', 
        content: `你是一个专业的翻译助手，请将用户提供的文本从${sourceLanguage}翻译成${targetLanguage}。请只返回翻译后的结果，不要添加任何额外的说明或解释。` 
      },
      { 
        role: 'user', 
        content: text 
      }
    ];
    
    const response = await axios.post(VOLCANO_API_URL, {
      model: 'ep-20241218140516-8xqzj',
      messages,
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCANO_API_KEY}`
      },
      timeout: 20000
    });
    
    console.log('火山AI响应状态:', response.status);
    
    const translatedText = response.data.choices?.[0]?.message?.content || '';
    
    if (!translatedText.trim()) {
      console.error('火山AI返回空翻译结果:', response.data);
      throw new Error('Empty translation result');
    }
    
    console.log('火山AI翻译成功:', translatedText.substring(0, 50));
    return translatedText;
  } catch (error) {
    console.error('火山AI接口调用失败:', {
      error: error instanceof Error ? error.message : error,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status
    });
    throw error;
  }
}

// 生成缓存键
async function generateCacheKey(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  const hash = await md5Hash(text);
  return `translation:${sourceLanguage}:${targetLanguage}:${hash}`;
}

// 从缓存获取翻译结果
async function getTranslationFromCache(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translation: string; provider: string } | null> {
  try {
    const cacheKey = await generateCacheKey(text, sourceLanguage, targetLanguage);
    const cachedData = await kv.get<string>(cacheKey);
    
    if (cachedData) {
      console.log('从缓存获取翻译结果');
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('从缓存读取失败:', error);
    return null;
  }
}

// 缓存翻译结果
async function cacheTranslationResult(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  translation: string,
  provider: string
): Promise<void> {
  try {
    const cacheKey = await generateCacheKey(text, sourceLanguage, targetLanguage);
    const cacheData = JSON.stringify({
      translation,
      provider,
      timestamp: Date.now()
    });
    
    // 缓存7天（604800秒）
    await kv.set(cacheKey, cacheData, { ex: 604800 });
    console.log('翻译结果已缓存');
  } catch (error) {
    console.error('缓存翻译结果失败:', error);
  }
}

// EdgeOne Pages 入口函数 - 处理所有请求
export default async function onRequest(context: any) {
  const { request, env } = context;
  
  // 设置CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // 只处理POST请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }
  
  try {
    // 获取请求体数据
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('解析请求体失败:', e);
      body = {};
    }
    
    const { text, targetLanguage = 'zh', sourceLanguage = 'en', useBaidu = true, skipCache = false } = body;
    
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: '文本内容不能为空' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 尝试从缓存获取（除非明确跳过缓存）
    if (!skipCache) {
      const cachedResult = await getTranslationFromCache(text, sourceLanguage, targetLanguage);
      if (cachedResult) {
        return new Response(JSON.stringify({
          translation: cachedResult.translation,
          sourceLanguage,
          targetLanguage,
          provider: cachedResult.provider,
          fromCache: true
        }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }

    let translatedText = ''
    let provider = ''
    
    // 优先使用百度翻译API（如果配置了且请求允许）
    if (useBaidu && BAIDU_APP_ID && BAIDU_SECRET_KEY) {
      try {
        translatedText = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage)
        provider = 'baidu'
        console.log('百度翻译成功')
      } catch (baiduError) {
        console.error('百度翻译失败，回退到火山AI:', baiduError)
        // 百度翻译失败，回退到火山AI
        translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage)
        provider = 'volcano'
      }
    } else {
      // 直接使用火山AI
      translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage)
      provider = 'volcano'
    }
    
    // 缓存翻译结果
    await cacheTranslationResult(text, sourceLanguage, targetLanguage, translatedText, provider);
    
    return new Response(JSON.stringify({
      translation: translatedText,
      sourceLanguage,
      targetLanguage,
      provider,
      fromCache: false
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('翻译处理错误:', error);
    
    // 增强错误处理，提供更详细的错误信息
    let errorMessage = '翻译服务暂时不可用，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API密钥未配置')) {
        errorMessage = '翻译服务配置错误';
        statusCode = 503;
      } else if (error.message.includes('Empty translation result')) {
        errorMessage = '翻译结果为空，请检查输入文本';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: (error as any)?.response?.data || null,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: corsHeaders
    });
  }
}