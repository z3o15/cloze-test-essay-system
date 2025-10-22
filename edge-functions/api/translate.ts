import axios from 'axios';

// 声明KV存储（EdgeOne兼容）
declare const kv: {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
};

// Web Crypto API 辅助函数
async function md5Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
const BAIDU_APP_ID = process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/vip/translate';

// 调用百度翻译API的函数
async function callBaiduTranslateAPI(text: string, from: string, to: string) {
  try {
    console.log('调用百度翻译API进行翻译');
    
    // 生成随机数
    const salt = Math.floor(Math.random() * 1000000000).toString();
    // 构建签名
    const sign = await md5Hash(`${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET_KEY}`);
    
    // 构建请求参数
    const params = {
      q: text,
      from: from,
      to: to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    };
    
    // 发送请求
    const response = await axios.get(BAIDU_TRANSLATE_URL, { 
      params,
      timeout: 5000
    });
    
    console.log(`百度翻译API响应状态: ${response.status}`);
    console.log(`百度翻译API响应数据:`, JSON.stringify(response.data, null, 2));
    
    // 检查API错误
    if (response.data && response.data.error_code) {
      console.log(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`);
      if (response.data.error_code === '54003') {
        console.log('API调用频率超限，抛出错误以触发回退');
      }
      throw new Error(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`);
    }
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translatedText = response.data.trans_result.map((item: any) => item.dst).join('\n');
      console.log(`翻译成功: "${text}" -> "${translatedText}"`);
      return translatedText;
    } else {
      console.log(`翻译响应格式异常:`, response.data);
      throw new Error('百度翻译API响应格式错误');
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
}

// 调用火山AI API的函数
async function callVolcanoAPI(text: string, targetLanguage: string, sourceLanguage: string) {
  if (!VOLCANO_API_KEY) {
    throw new Error('API密钥未配置');
  }

  try {
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
      model: 'doubao-1-5-lite-32k-250115',
      messages,
      temperature: 0.1,
      max_tokens: 2000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCANO_API_KEY}`
      },
      timeout: 20000
    });
    
    const translatedText = response.data.choices?.[0]?.message?.content || '';
    
    if (!translatedText.trim()) {
      throw new Error('Empty translation result');
    }
    
    return translatedText;
  } catch (error) {
    console.error('火山AI接口调用失败:', error);
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
  const response = new Response();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    response.status = 204;
    return response;
  }
  
  // 只处理POST请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('翻译处理错误:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '翻译服务暂时不可用',
      details: (error as any)?.response?.data || null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}