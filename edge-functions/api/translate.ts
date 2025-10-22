import axios from 'axios';
import CryptoJS from 'crypto-js';

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

// 真实的MD5哈希函数（使用 crypto-js）
async function md5Hash(text: string): Promise<string> {
  try {
    return CryptoJS.MD5(text).toString();
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

// 从环境变量获取配置（支持 VITE 前缀别名）
const VOLCANO_API_KEY = process.env.VITE_VOLCANO_API_KEY || process.env.VOLCANO_API_KEY || '';
const VOLCANO_API_URL = process.env.VITE_VOLCANO_APIURL || process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const BAIDU_APP_ID = process.env.VITE_BAIDU_APP_ID || process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.VITE_BAIDU_SECRET_KEY || process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/vip/translate';

// 腾讯开放平台（api.ai.qq.com）环境变量与URL（支持多种命名别名）
const TENCENT_APP_ID = process.env.VITE_TENCENT_SECRET_ID || process.env.TENCENT_SECRET_ID || '';
const TENCENT_APP_KEY = process.env.VITE_TENCENT_SECRET_KEY || process.env.TENCENT_SECRET_KEY || '';
const KV_NAMESPACE = (process.env.KV_NAMESPACE || null) as any;
const TENCENT_TRANSLATE_URL = process.env.VITE_TENCENT_API_URL || process.env.TENCENT_API_URL || 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttrans';

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

// 语言映射：腾讯开放平台
function mapLangForTencent(lang: string, isSource: boolean): string {
  const l = (lang || '').toLowerCase();
  // 腾讯接口不支持 auto，源语言默认使用 en 作为回退
  if (isSource) {
    if (l.startsWith('zh') || l === 'cn') return 'zh';
    if (l === 'en') return 'en';
    if (l === 'ja' || l === 'jp') return 'jp';
    if (l === 'ko' || l === 'kr') return 'kr';
    return 'en';
  }
  // 目标语言映射
  if (l.startsWith('zh') || l === 'cn') return 'zh';
  if (l === 'en') return 'en';
  if (l === 'ja' || l === 'jp') return 'jp';
  if (l === 'ko' || l === 'kr') return 'kr';
  return 'zh';
}

// 腾讯开放平台翻译
async function callTencentAPI(text: string, from: string, to: string) {
  if (!TENCENT_APP_ID || !TENCENT_APP_KEY) {
    throw new Error('腾讯翻译API密钥未配置');
  }

  const time_stamp = Math.floor(Date.now() / 1000).toString();
  const nonce_str = Math.random().toString(36).slice(2, 10);

  const source = mapLangForTencent(sourceLanguage, true);
  const target = mapLangForTencent(targetLanguage, false);

  console.log('腾讯翻译语言映射:', { 
    原始源语言: sourceLanguage, 
    映射源语言: source,
    原始目标语言: targetLanguage,
    映射目标语言: target
  });

  const params: Record<string, string> = {
    app_id: TENCENT_APP_ID,
    time_stamp,
    nonce_str,
    source,
    target,
    text
  };

  // 按键名 ASCII 升序排序并拼接参数
  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&');
  const signStr = `${paramStr}&app_key=${TENCENT_APP_KEY}`;
  const sign = (await md5Hash(signStr)).toUpperCase();

  console.log('腾讯翻译签名信息:', {
    paramStr: paramStr.substring(0, 100) + '...',
    signStr: signStr.substring(0, 50) + '...',
    sign: sign.substring(0, 8) + '...'
  });

  const form = new URLSearchParams({ ...params, sign });

  try {
    console.log('发送腾讯翻译请求:', { 
      url: TENCENT_TRANSLATE_URL,
      text: text.substring(0, 50), 
      source, 
      target,
      formDataSize: form.toString().length
    });

    const response = await axios.post(
      TENCENT_TRANSLATE_URL,
      form.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    console.log('腾讯翻译响应:', {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });

    const data = response.data;
    if (data.ret !== 0) {
      console.error('腾讯翻译API业务错误:', data);
      throw new Error(`Tencent API error: ${data.msg || data.ret}`);
    }

    const translatedText = data?.data?.trans_text || '';
    if (!translatedText.trim()) {
      console.error('腾讯翻译返回空结果:', data);
      throw new Error('Empty translation result');
    }

    console.log('腾讯翻译成功:', {
      原文: text.substring(0, 50),
      译文: translatedText.substring(0, 50),
      完整长度: translatedText.length
    });
    return translatedText;
  } catch (error) {
    console.error('腾讯翻译API调用失败:', {
      error: error instanceof Error ? error.message : error,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status,
      config: (error as any)?.config ? {
        url: (error as any).config.url,
        method: (error as any).config.method,
        headers: (error as any).config.headers
      } : null
    });
    throw error;
  }
}

// 调用火山AI API的函数
async function callVolcanoAPI(text: string, targetLanguage: string, sourceLanguage: string) {
  if (!VOLCANO_API_KEY) {
    console.error('火山AI API密钥未配置');
    throw new Error('火山AI API密钥未配置');
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
export default async function handler(request: Request): Promise<Response> {
  console.log('=== 翻译API调用开始 ===');
  console.log('请求方法:', request.method);
  console.log('请求URL:', request.url);
  console.log('运行环境:', typeof process !== 'undefined' ? 'EdgeOne' : 'Unknown');
  
  // EdgeOne环境变量详细检查
  console.log('EdgeOne环境变量检查:');
  const allEnvVars = {
    TENCENT_APP_ID: process.env.TENCENT_APP_ID,
    TENCENT_APP_KEY: process.env.TENCENT_APP_KEY,
    TENCENT_KEY: process.env.TENCENT_KEY,
    TENCENT_API_URL: process.env.TENCENT_API_URL,
    VITE_TENCENT_APP_ID: process.env.VITE_TENCENT_APP_ID,
    VITE_TENCENT_KEY: process.env.VITE_TENCENT_KEY,
    VITE_TENCENT_APP_KEY: process.env.VITE_TENCENT_APP_KEY,
    VITE_TENCENT_API_URL: process.env.VITE_TENCENT_API_URL,
    BAIDU_APP_ID: process.env.BAIDU_APP_ID,
    BAIDU_SECRET_KEY: process.env.BAIDU_SECRET_KEY,
    VOLCANO_API_KEY: process.env.VOLCANO_API_KEY,
    VOLCANO_API_URL: process.env.VOLCANO_API_URL
  };
  
  console.log('所有环境变量状态:');
  Object.entries(allEnvVars).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? `${value.substring(0, 4)}***` : 'undefined'}`);
  });
  
  // 环境变量检查
  console.log('最终使用的配置:');
  console.log('- 腾讯翻译:', {
    appId: TENCENT_APP_ID ? `${TENCENT_APP_ID.substring(0, 4)}***` : 'undefined',
    appKey: TENCENT_APP_KEY ? `${TENCENT_APP_KEY.substring(0, 4)}***` : 'undefined',
    apiUrl: TENCENT_TRANSLATE_URL
  });
  console.log('- 百度翻译:', {
    appId: BAIDU_APP_ID ? `${BAIDU_APP_ID.substring(0, 4)}***` : 'undefined',
    secretKey: BAIDU_SECRET_KEY ? `${BAIDU_SECRET_KEY.substring(0, 4)}***` : 'undefined'
  });
  console.log('- 火山翻译:', {
    apiKey: VOLCANO_API_KEY ? `${VOLCANO_API_KEY.substring(0, 4)}***` : 'undefined',
    apiUrl: VOLCANO_API_URL
  });
  
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
    // 最终使用的配置检查
    console.log('最终使用的配置:', {
      hasTencent: !!(TENCENT_APP_ID && TENCENT_APP_KEY),
      hasBaidu: !!(BAIDU_APP_ID && BAIDU_SECRET_KEY),
      hasVolcano: !!VOLCANO_API_KEY,
      tencentAppId: TENCENT_APP_ID ? `${TENCENT_APP_ID.substring(0, 4)}***` : 'undefined',
      tencentKey: TENCENT_APP_KEY ? `${TENCENT_APP_KEY.substring(0, 4)}***` : 'undefined',
      tencentApiUrl: TENCENT_TRANSLATE_URL,
      baiduAppId: BAIDU_APP_ID ? `${BAIDU_APP_ID.substring(0, 4)}***` : 'undefined',
      baiduSecret: BAIDU_SECRET_KEY ? `${BAIDU_SECRET_KEY.substring(0, 4)}***` : 'undefined',
      volcanoKey: VOLCANO_API_KEY ? `${VOLCANO_API_KEY.substring(0, 4)}***` : 'undefined',
      volcanoUrl: VOLCANO_API_URL
    });

    // 获取请求体数据
    let body;
    try {
      body = await request.json();
      console.log('请求体解析成功:', { 
        text: body.text?.substring(0, 50), 
        sourceLanguage: body.sourceLanguage, 
        targetLanguage: body.targetLanguage,
        provider: body.provider 
      });
    } catch (e) {
      console.error('解析请求体失败:', e);
      return new Response(JSON.stringify({ error: '请求体格式错误' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    const { text, targetLanguage = 'zh', sourceLanguage = 'en', useBaidu = true, skipCache = false, provider: preferredProvider } = body;
    
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

    let translatedText = '';
    let provider = '';

    const hasTencent = !!(TENCENT_APP_ID && TENCENT_APP_KEY);
    const hasBaidu = !!(BAIDU_APP_ID && BAIDU_SECRET_KEY);
    const hasVolcano = !!(VOLCANO_API_KEY);

    // 如果指定了 provider，则只使用对应提供者
    if (preferredProvider === 'tencent') {
      if (!hasTencent) {
        return new Response(JSON.stringify({ error: '腾讯翻译未配置（缺少 APP_ID/KEY）' }), { status: 503, headers: corsHeaders });
      }
      translatedText = await callTencentTranslateAPI(text, sourceLanguage, targetLanguage);
      provider = 'tencent';
    } else if (preferredProvider === 'baidu') {
      if (!hasBaidu) {
        return new Response(JSON.stringify({ error: '百度翻译未配置（缺少 APP_ID/SECRET）' }), { status: 503, headers: corsHeaders });
      }
      translatedText = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage);
      provider = 'baidu';
    } else if (preferredProvider === 'volcano') {
      if (!hasVolcano) {
        return new Response(JSON.stringify({ error: '火山翻译未配置（缺少 API_KEY）' }), { status: 503, headers: corsHeaders });
      }
      translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
      provider = 'volcano';
    } else {
      // 未指定 provider，按照默认优先级：腾讯 -> 百度 -> 火山
      if (hasTencent) {
        try {
          translatedText = await callTencentTranslateAPI(text, sourceLanguage, targetLanguage);
          provider = 'tencent';
        } catch (tencentError) {
          console.error('腾讯翻译失败，尝试其他提供者:', tencentError);
          if (useBaidu && hasBaidu) {
            try {
              translatedText = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage);
              provider = 'baidu';
            } catch (baiduError) {
              console.error('百度翻译失败，回退到火山AI:', baiduError);
              if (hasVolcano) {
                translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
                provider = 'volcano';
              } else {
                throw baiduError;
              }
            }
          } else if (hasVolcano) {
            translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
            provider = 'volcano';
          } else {
            throw tencentError;
          }
        }
      } else if (useBaidu && hasBaidu) {
        try {
          translatedText = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage);
          provider = 'baidu';
        } catch (baiduError) {
          console.error('百度翻译失败，回退到火山AI:', baiduError);
          if (hasVolcano) {
            translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
            provider = 'volcano';
          } else {
            throw baiduError;
          }
        }
      } else if (hasVolcano) {
        translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
        provider = 'volcano';
      } else {
        return new Response(JSON.stringify({ error: '未配置任何可用的翻译服务（腾讯/百度/火山）' }), {
          status: 503,
          headers: corsHeaders
        });
      }
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
      if (error.message.includes('密钥未配置')) {
        errorMessage = '翻译服务配置错误（请检查腾讯/百度/火山密钥）';
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

// EdgeOne Pages 入口函数 - 处理所有请求
export async function onRequest(context: any) {
  const { request } = context;
  
  console.log('=== EdgeOne翻译API调用开始 ===');
  console.log('请求方法:', request.method);
  console.log('请求URL:', request.url);
  console.log('运行环境: EdgeOne Pages');
  
  // EdgeOne环境变量详细检查
  console.log('EdgeOne环境变量检查:');
  const allEnvVars = {
    TENCENT_APP_ID: context.env.TENCENT_APP_ID,
    TENCENT_APP_KEY: context.env.TENCENT_APP_KEY,
    TENCENT_KEY: context.env.TENCENT_KEY,
    TENCENT_API_URL: context.env.TENCENT_API_URL,
    VITE_TENCENT_APP_ID: context.env.VITE_TENCENT_APP_ID,
    VITE_TENCENT_KEY: context.env.VITE_TENCENT_KEY,
    VITE_TENCENT_APP_KEY: context.env.VITE_TENCENT_APP_KEY,
    VITE_TENCENT_API_URL: context.env.VITE_TENCENT_API_URL,
    BAIDU_APP_ID: context.env.BAIDU_APP_ID,
    BAIDU_SECRET_KEY: context.env.BAIDU_SECRET_KEY,
    VOLCANO_API_KEY: context.env.VOLCANO_API_KEY,
    VOLCANO_API_URL: context.env.VOLCANO_API_URL
  };
  
  console.log('所有环境变量状态:');
  Object.entries(allEnvVars).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? `${value.substring(0, 4)}***` : 'undefined'}`);
  });
  
  // 临时设置process.env以兼容现有代码
  if (typeof process !== 'undefined' && process.env) {
    Object.assign(process.env, allEnvVars);
  }
  
  return handler(request);
}