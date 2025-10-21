import axios from 'axios';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// 从环境变量获取API密钥
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '';
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const BAIDU_APP_ID = process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 定义翻译结果接口
export interface TranslationResult {
  translatedText: string;
  from: string;
  to: string;
  provider: string;
  fromCache?: boolean;
}

// 腾讯翻译API调用函数
const callTencentTranslateAPI = async (
  text: string,
  from: string = 'auto',
  to: string = 'zh'
): Promise<string> => {
  const TENCENT_APP_ID = process.env.TENCENT_APP_ID || '';
  const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || '';
  const TENCENT_TRANSLATE_URL = process.env.TENCENT_TRANSLATE_URL || 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate';
  
  if (!TENCENT_APP_ID || !TENCENT_APP_KEY) {
    throw new Error('腾讯翻译API密钥未配置');
  }

  // 生成随机字符串
  const nonceStr = Math.random().toString(36).substr(2, 15);
  // 时间戳
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  
  // 构建签名字符串
  const params: any = {
    app_id: TENCENT_APP_ID,
    nonce_str: nonceStr,
    time_stamp: timeStamp,
    text: text,
    source: from === 'auto' ? 'auto' : from,
    target: to
  };

  // 对参数进行排序并拼接签名
  const sortedKeys = Object.keys(params).sort();
  let signStr = '';
  for (const key of sortedKeys) {
    signStr += `${key}=${params[key]}&`;
  }
  signStr += `app_key=${TENCENT_APP_KEY}`;
  
  // 计算MD5签名
  const sign = crypto
    .createHash('md5')
    .update(signStr)
    .digest('hex')
    .toUpperCase();

  params.sign = sign;

  try {
    const response = await axios.post(TENCENT_TRANSLATE_URL, new URLSearchParams(params));
    
    if (response.data.ret === 0 && response.data.data) {
      return response.data.data.target_text;
    } else {
      throw new Error(`腾讯API错误: ${response.data.msg || '未知错误'}`);
    }
  } catch (error) {
    console.error('腾讯翻译API调用失败:', error);
    throw error;
  }
};

// 调用百度翻译API（保留作为备用）
const callBaiduTranslateAPI = async (
  text: string,
  from: string = 'auto',
  to: string = 'zh'
): Promise<string> => {
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    throw new Error('百度翻译API密钥未配置');
  }

  try {
    // 生成随机数
    const salt = Math.floor(Math.random() * 1000000000).toString();
    // 构建签名
    const sign = crypto.createHash('md5')
      .update(`${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET_KEY}`)
      .digest('hex');
    
    // 构建请求参数
    const params = {
      q: text,
      from,
      to,
      appid: BAIDU_APP_ID,
      salt,
      sign
    };
    
    // 发送请求
    const response = await axios.get(BAIDU_TRANSLATE_URL, { params });
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      return response.data.trans_result[0].dst;
    } else {
      throw new Error('百度翻译API响应格式错误');
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
};

// 调用火山AI接口
const callVolcanoAPI = async (
  text: string,
  from: string = 'auto',
  to: string = 'zh'
): Promise<string> => {
  if (!VOLCANO_API_KEY) {
    throw new Error('火山AI API密钥未配置');
  }

  try {
    // 构建翻译提示
    const targetLanguage = to === 'zh' ? '中文' : to === 'en' ? '英文' : to;
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的翻译助手，将用户提供的文本翻译成指定语言。只返回翻译结果，不要添加任何解释或其他内容。'
      },
      {
        role: 'user',
        content: `请将以下文本翻译成${targetLanguage}：\n\n${text}`
      }
    ];

    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: 'doubao-1-5-lite-32k-250115',
        messages
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VOLCANO_API_KEY}`
        },
        timeout: 30000
      }
    );
    
    return response.data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('火山AI API调用失败:', error);
    throw error;
  }
};

// 生成翻译缓存键
function generateTranslationCacheKey(
  text: string,
  from: string,
  to: string
): string {
  const contentToHash = `${text}|${from}|${to}`;
  return `translation:${crypto.createHash('md5').update(contentToHash).digest('hex')}`;
}

// 从缓存获取翻译结果
async function getTranslationFromCache(
  text: string,
  from: string,
  to: string
): Promise<string | null> {
  try {
    const cacheKey = generateTranslationCacheKey(text, from, to);
    const cachedTranslation = await kv.get<string>(cacheKey);
    
    if (cachedTranslation) {
      console.log('从缓存获取翻译结果');
      return cachedTranslation;
    }
    return null;
  } catch (error) {
    console.error('从缓存读取翻译失败:', error);
    return null;
  }
}

// 缓存翻译结果
async function cacheTranslationResult(
  text: string,
  from: string,
  to: string,
  translatedText: string
): Promise<void> {
  try {
    const cacheKey = generateTranslationCacheKey(text, from, to);
    // 缓存30天（2592000秒）
    await kv.set(cacheKey, translatedText, { ex: 2592000 });
    console.log('翻译结果已缓存');
  } catch (error) {
    console.error('缓存翻译结果失败:', error);
  }
}

// EdgeOne Pages 入口函数 - 处理所有请求
export default async function onRequest(context: any) {
  const { request } = context;
  
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }
  
  // 只处理POST请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  }
  
  try {
    // 解析请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('解析请求体失败:', e);
      body = {};
    }
    
    const { text, from = 'auto', to = 'zh', useTencent = true, useBaidu, skipCache = false } = body;
    
    // 为向后兼容，支持useBaidu参数，但优先使用useTencent
    const finalUseTencent = useTencent || (useBaidu === undefined);
    const finalUseBaidu = useBaidu !== false;
    
    // 参数验证
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: '翻译文本不能为空' }), {
        status: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (text.length > 1000) {
      return new Response(JSON.stringify({ error: '翻译文本过长' }), {
        status: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }

    // 尝试从缓存获取（除非明确跳过缓存）
    if (!skipCache) {
      const cachedTranslation = await getTranslationFromCache(text, from, to);
      if (cachedTranslation) {
        return new Response(JSON.stringify({
          translatedText: cachedTranslation,
          from,
          to,
          provider: 'cache',
          fromCache: true
        }), {
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    let translatedText: string;
    let provider: string;

    // 优先使用腾讯翻译API
    const TENCENT_APP_ID = process.env.TENCENT_APP_ID || '';
    const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || '';
    
    if ((useTencent || !useBaidu) && TENCENT_APP_ID && TENCENT_APP_KEY) {
      try {
        translatedText = await callTencentTranslateAPI(text, from, to);
        provider = 'tencent';
        
        // 缓存结果
        await cacheTranslationResult(text, from, to, translatedText);
        
        return new Response(JSON.stringify({
          translatedText,
          from,
          to,
          provider,
          fromCache: false
        }), {
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      } catch (tencentError) {
        console.error('腾讯翻译API调用失败，尝试使用百度翻译:', tencentError);
        // 继续使用百度翻译作为备用
      }
    }

    // 备用使用百度翻译API
    if (useBaidu && BAIDU_APP_ID && BAIDU_SECRET_KEY) {
      try {
        translatedText = await callBaiduTranslateAPI(text, from, to);
        provider = 'baidu';
        
        // 缓存结果
        await cacheTranslationResult(text, from, to, translatedText);
        
        return new Response(JSON.stringify({
          translatedText,
          from,
          to,
          provider,
          fromCache: false
        }), {
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      } catch (baiduError) {
        console.error('百度翻译API调用失败，尝试使用火山AI:', baiduError);
        // 继续使用火山AI作为备用
      }
    }

    // 使用火山AI接口翻译
    provider = 'volcano';
    translatedText = await callVolcanoAPI(text, from, to);
    
    // 缓存结果
    await cacheTranslationResult(text, from, to, translatedText);
    
    return new Response(JSON.stringify({
      translatedText,
      from,
      to,
      provider,
      fromCache: false
    }), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('翻译处理失败:', error);
    return new Response(JSON.stringify({
      error: '翻译失败',
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