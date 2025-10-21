import axios from 'axios';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// 定义单词信息接口
export interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples?: string[];
}

// 从环境变量获取API密钥
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '';
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const BAIDU_APP_ID = process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 调用腾讯词典API获取单词信息
const callTencentDictAPI = async (word: string): Promise<WordInfo> => {
  const TENCENT_APP_ID = process.env.TENCENT_APP_ID || '';
  const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || '';
  const TENCENT_DICT_URL = process.env.TENCENT_DICT_URL || 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_worddict';
  
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
    word: word
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
    const response = await axios.post(TENCENT_DICT_URL, new URLSearchParams(params));
    
    // 检查响应
    if (response.data && response.data.ret === 0 && response.data.data) {
      const data = response.data.data;
      const wordInfo: WordInfo = {
        phonetic: data.phonetic || '',
        definitions: data.translation || [],
        examples: data.examples || []
      };
      return wordInfo;
    } else {
      throw new Error('腾讯词典API返回格式异常');
    }
  } catch (error) {
    console.error('腾讯词典API调用失败:', error);
    throw error;
  }
};

// 调用百度翻译API的函数（保留作为备用）
const callBaiduTranslateAPI = async (word: string): Promise<WordInfo> => {
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    throw new Error('百度翻译API密钥未配置');
  }

  try {
    // 生成随机数
    const salt = Math.floor(Math.random() * 1000000000).toString();
    // 构建签名
    const sign = crypto.createHash('md5').update(`${BAIDU_APP_ID}${word}${salt}${BAIDU_SECRET_KEY}`).digest('hex');
    
    // 构建请求参数
    const params = {
      q: word,
      from: 'en',
      to: 'zh',
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    };
    
    // 发送请求
    const response = await axios.get(BAIDU_TRANSLATE_URL, { params });
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translation = response.data.trans_result[0].dst;
      
      // 构建WordInfo对象
      const wordInfo: WordInfo = {
        phonetic: '', // 百度翻译API不直接提供音标
        definitions: [translation]
      };
      
      return wordInfo;
    } else {
      throw new Error('百度翻译API返回格式异常');
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
};

// 调用火山AI API的函数
const callVolcanoAPI = async (messages: any[]): Promise<string> => {
  if (!VOLCANO_API_KEY) {
    throw new Error('火山AI API密钥未配置');
  }

  try {
    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: 'ep-20240321183314-g4h44',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${VOLCANO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('火山AI API返回格式异常');
    }
  } catch (error) {
    console.error('火山AI API调用失败:', error);
    throw error;
  }
};

// 生成单词缓存键
function generateWordCacheKey(word: string, withContext: boolean): string {
  return `word_${word}_${withContext ? 'with_context' : 'without_context'}`;
}

// 从缓存获取单词信息
async function getWordFromCache(word: string, withContext: boolean): Promise<any> {
  try {
    const cacheKey = generateWordCacheKey(word, withContext);
    const cachedData = await kv.get(cacheKey);
    
    if (cachedData) {
      console.log('从缓存获取单词查询结果');
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('从缓存读取失败:', error);
    return null;
  }
}

// 缓存单词查询结果
async function cacheWordResult(word: string, withContext: boolean, wordInfo: WordInfo, provider: string): Promise<void> {
  try {
    const cacheKey = generateWordCacheKey(word, withContext);
    const cacheData = JSON.stringify({
      ...wordInfo,
      provider,
      timestamp: Date.now()
    });
    
    // 缓存30天（2592000秒）
    await kv.set(cacheKey, cacheData, { ex: 2592000 });
    console.log('单词查询结果已缓存');
  } catch (error) {
    console.error('缓存单词查询结果失败:', error);
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
    
    const { word, contextSentence, useTencent = true, useBaidu, skipCache = false } = body;
    
    if (!word || typeof word !== 'string') {
      return new Response(JSON.stringify({ error: '单词内容不能为空' }), {
        status: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 为向后兼容，支持useBaidu参数，但优先使用useTencent
    const finalUseTencent = useTencent || (useBaidu === undefined);
    const finalUseBaidu = useBaidu !== false;

    // 尝试从缓存获取（除非明确跳过缓存）
    if (!skipCache) {
      const cachedResult = await getWordFromCache(word, !!contextSentence);
      if (cachedResult) {
        return new Response(JSON.stringify({
          ...cachedResult,
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

    let wordInfo: WordInfo;
    let provider: string;

    // 优先使用腾讯词典API
    if (finalUseTencent && process.env.TENCENT_APP_ID && process.env.TENCENT_APP_KEY) {
      try {
        wordInfo = await callTencentDictAPI(word);
        provider = 'tencent';
        // 缓存结果
        await cacheWordResult(word, !!contextSentence, wordInfo, provider);
        return new Response(JSON.stringify({
          ...wordInfo,
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
        console.error('腾讯词典API调用失败，尝试使用百度翻译API:', tencentError);
        // 继续使用百度翻译API作为备用
      }
    }

    // 使用百度翻译API作为备用
    if (finalUseBaidu && BAIDU_APP_ID && BAIDU_SECRET_KEY) {
      try {
        wordInfo = await callBaiduTranslateAPI(word);
        provider = 'baidu';
        // 缓存结果
        await cacheWordResult(word, !!contextSentence, wordInfo, provider);
        return new Response(JSON.stringify({
          ...wordInfo,
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

    // 使用火山AI接口查询单词信息
    provider = 'volcano';
    let prompt = `请提供单词"${word}"的以下信息：\n1. 音标\n2. 考研核心释义（优先显示常考含义）\n`;
    
    if (contextSentence) {
      prompt += `3. 在句子"${contextSentence}"中的例句分析\n`;
    }
    
    prompt += '请使用以下格式返回，不要添加其他信息：\n音标:/phonetic/\n释义:definition1,definition2,...\n例句:example1,example2,...';
    
    const messages = [
      { role: 'system', content: '你是一个专业的英语词典助手，专注于提供准确的单词释义和考研常考用法。' },
      { role: 'user', content: prompt }
    ];
    
    const apiResponse = await callVolcanoAPI(messages);
    
    // 解析API响应
    wordInfo = {
      phonetic: '',
      definitions: []
    };
    
    // 提取音标
    const phoneticMatch = apiResponse.match(/音标:\/(.*?)\//);
    if (phoneticMatch && phoneticMatch[1]) {
      wordInfo.phonetic = phoneticMatch[1];
    }
    
    // 提取释义
    const definitionMatch = apiResponse.match(/释义:(.*?)(?=\n例句:|$)/);
    if (definitionMatch && definitionMatch[1]) {
      wordInfo.definitions = definitionMatch[1].split(',').map(d => d.trim());
    }
    
    // 提取例句
    const exampleMatch = apiResponse.match(/例句:(.*)/);
    if (exampleMatch && exampleMatch[1]) {
      wordInfo.examples = exampleMatch[1].split(',').map(e => e.trim());
    }
    
    // 缓存结果
    await cacheWordResult(word, !!contextSentence, wordInfo, provider);
    
    return new Response(JSON.stringify({
      ...wordInfo,
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
    console.error('查询单词处理失败:', error);
    return new Response(JSON.stringify({ 
      error: '查询单词失败', 
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