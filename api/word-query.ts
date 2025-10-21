import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// 从环境变量获取API密钥，而不是硬编码
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 定义单词信息接口
export interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples?: string[];
}

// 调用百度翻译API的函数
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
      throw new Error('百度翻译API响应格式错误');
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
};

// 调用火山AI接口的通用函数
const callVolcanoAPI = async (messages: { role: string; content: string }[]): Promise<string> => {
  if (!VOLCANO_API_KEY) {
    throw new Error('API密钥未配置');
  }

  try {
    const response = await axios.post(VOLCANO_API_URL, {
      model: 'doubao-1-5-lite-32k-250115',
      messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCANO_API_KEY}`
      },
      timeout: 20000
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('火山AI接口调用失败:', error);
    throw error;
  }
};

// 生成单词查询缓存键
function generateWordCacheKey(word: string, withContext: boolean): string {
  return `word:query:${withContext ? 'with_context:' : ''}${crypto.createHash('md5').update(word).digest('hex')}`;
}

// 从缓存获取单词查询结果
async function getWordFromCache(word: string, withContext: boolean): Promise<WordInfo | null> {
  try {
    const cacheKey = generateWordCacheKey(word, withContext);
    const cachedData = await kv.get<string>(cacheKey);
    
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

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    // 设置CORS头
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // 验证请求方法
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 获取请求体数据
    const { word, contextSentence, useBaidu = true, skipCache = false } = request.body;
    
    if (!word || typeof word !== 'string') {
      return response.status(400).json({ error: '单词内容不能为空' });
    }

    // 尝试从缓存获取（除非明确跳过缓存）
    if (!skipCache) {
      const cachedResult = await getWordFromCache(word, !!contextSentence);
      if (cachedResult) {
        return response.status(200).json({
          ...cachedResult,
          fromCache: true
        });
      }
    }

    let wordInfo: WordInfo;
    let provider: string;

    // 优先使用百度翻译API
    if (useBaidu && BAIDU_APP_ID && BAIDU_SECRET_KEY) {
      try {
        wordInfo = await callBaiduTranslateAPI(word);
        provider = 'baidu';
        // 缓存结果
        await cacheWordResult(word, !!contextSentence, wordInfo, provider);
        return response.status(200).json({
          ...wordInfo,
          provider,
          fromCache: false
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
    const wordInfo: WordInfo = {
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
    
    return response.status(200).json({
      ...wordInfo,
      provider,
      fromCache: false
    });
  } catch (error) {
    console.error('单词查询处理错误:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : '单词查询服务暂时不可用' 
    });
  }
}