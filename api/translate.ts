import axios from 'axios';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// EdgeOne Pages兼容的请求和响应类型
type Request = {
  method: string;
  headers: Record<string, string | string[]>;
  body: any;
};

type Response = {
  status: (code: number) => Response;
  json: (data: any) => Promise<void>;
  end: () => Promise<void>;
  setHeader: (key: string, value: string) => void;
};

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
    const sign = crypto.createHash('md5').update(`${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET_KEY}`).digest('hex');
    
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
    const response = await axios.get(BAIDU_TRANSLATE_URL, { params });
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translatedText = response.data.trans_result.map((item: any) => item.dst).join('\n');
      return translatedText;
    } else {
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
function generateCacheKey(text: string, sourceLanguage: string, targetLanguage: string): string {
  return `translation:${sourceLanguage}:${targetLanguage}:${crypto.createHash('md5').update(text).digest('hex')}`;
}

// 从缓存获取翻译结果
async function getTranslationFromCache(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translation: string; provider: string } | null> {
  try {
    const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
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
    const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
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

export default async function handler(
  request: Request,
  response: Response
) {
  try {
    // 设置CORS头
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return response.status(204).end();
    }

    // 验证请求方法
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 获取请求体数据
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { text, targetLanguage = 'zh', sourceLanguage = 'en', useBaidu = true, skipCache = false } = body;
    
    if (!text || typeof text !== 'string') {
      return response.status(400).json({ error: '文本内容不能为空' });
    }

    // 尝试从缓存获取（除非明确跳过缓存）
    if (!skipCache) {
      const cachedResult = await getTranslationFromCache(text, sourceLanguage, targetLanguage);
      if (cachedResult) {
        return response.status(200).json({
          translation: cachedResult.translation,
          sourceLanguage,
          targetLanguage,
          provider: cachedResult.provider,
          fromCache: true
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
    
    return response.status(200).json({
      translation: translatedText,
      sourceLanguage,
      targetLanguage,
      provider,
      fromCache: false
    });
  } catch (error) {
    console.error('翻译处理错误:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : '翻译服务暂时不可用',
      details: (error as any)?.response?.data || null
    });
  }
}