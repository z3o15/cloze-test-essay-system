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
// const BAIDU_APP_ID = process.env.BAIDU_APP_ID || ''; // 已注释，仅使用腾讯翻译官和火山翻译
// const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || ''; // 已注释，仅使用腾讯翻译官和火山翻译
// const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/vip/translate'; // 已注释，仅使用腾讯翻译官和火山翻译

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

// 调用百度翻译API的函数（已注释，仅使用腾讯翻译官和火山翻译）
/*
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
*/

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
  
  console.log(`收到请求: ${request.method} ${request.url}`);
  console.log('请求头:', Object.fromEntries(request.headers.entries()));
  
  // 设置CORS头 - 更加完整的CORS配置
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    console.log('处理OPTIONS预检请求');
    return new Response(null, {
      status: 204,
      headers
    });
  }
  
  // 处理GET请求作为备选方法
  if (request.method === 'GET') {
    console.log('处理GET请求作为备选方法');
    try {
      // 从URL参数中获取单词
      const url = new URL(request.url);
      const word = url.searchParams.get('word');
      
      if (!word) {
        return new Response(JSON.stringify({ error: '缺少word参数' }), {
          status: 400,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // 使用与POST相同的逻辑处理请求
      const result = await handleWordQuery({
        word,
        contextSentence: url.searchParams.get('contextSentence'),
        forceRefresh: url.searchParams.get('forceRefresh') === 'true',
        useBaidu: url.searchParams.get('useBaidu') !== 'false'
      });
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('GET请求处理失败:', error);
      return new Response(JSON.stringify({
        error: '处理请求失败',
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
  
  // 处理Word查询的函数
  async function handleWordQuery(params: { 
    word: string; 
    contextSentence?: string; 
    forceRefresh?: boolean; 
    debug?: boolean
  }) {
    const { word, contextSentence, forceRefresh = false, debug = false } = params;
    const startTime = Date.now();
    
    // 添加详细的调试日志，包含时间戳
    console.log(`[${new Date().toISOString()}] handleWordQuery参数:`, { 
      word, 
      contextSentence: contextSentence ? `${contextSentence.substring(0, 30)}...` : null, 
      forceRefresh,
      debug 
    });
    
    // 环境变量状态检查
    const hasTencentKey = !!process.env.TENCENT_APP_ID && !!process.env.TENCENT_APP_KEY;
    // const hasBaiduKey = !!BAIDU_APP_ID && !!BAIDU_SECRET_KEY;
    const hasVolcanoKey = !!VOLCANO_API_KEY;
    
    console.log(`[${new Date().toISOString()}] 环境变量状态 - 腾讯:${hasTencentKey}, 火山:${hasVolcanoKey}`);
    
    // 验证单词参数
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      console.error(`[${new Date().toISOString()}] 无效的单词参数:`, word);
      return {
        phonetic: '',
        definitions: ['无效的单词参数'],
        examples: [],
        error: '单词参数不能为空',
        provider: 'error',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
    }
    
    // 标准化单词
    const normalizedWord = word.toLowerCase().trim();
    console.log(`[${new Date().toISOString()}] 标准化后的单词: "${normalizedWord}"`);
    
    // 尝试从缓存获取（除非强制刷新）
    if (!forceRefresh) {
      console.log(`[${new Date().toISOString()}] 检查缓存...`);
      const cachedResult = await getWordFromCache(normalizedWord, !!contextSentence);
      if (cachedResult) {
        console.log(`[${new Date().toISOString()}] 缓存命中! 缓存数据:`, cachedResult);
        return {
          ...cachedResult,
          fromCache: true,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        };
      }
      console.log(`[${new Date().toISOString()}] 缓存未命中`);
    } else {
      console.log(`[${new Date().toISOString()}] 强制刷新模式，跳过缓存检查`);
    }
    
    let wordInfo: WordInfo = null;
    let provider: string = 'unknown';
    const apiErrors: string[] = [];
    let apiAttempted = 0;
    
    // 优先使用腾讯词典API
    if (hasTencentKey) {
      apiAttempted++;
      console.log(`[${new Date().toISOString()}] 尝试使用腾讯词典API (${apiAttempted}/3)...`);
      try {
        const tencentStart = Date.now();
        wordInfo = await callTencentDictAPI(normalizedWord);
        const tencentEnd = Date.now();
        
        // 验证API返回的数据
        if (wordInfo && (wordInfo.phonetic || (wordInfo.definitions && wordInfo.definitions.length > 0))) {
          provider = 'tencent';
          console.log(`[${new Date().toISOString()}] 腾讯词典API调用成功，耗时: ${tencentEnd - tencentStart}ms`);
          console.log(`[${new Date().toISOString()}] 腾讯API返回数据:`, wordInfo);
          
          // 缓存结果
          try {
            await cacheWordResult(normalizedWord, !!contextSentence, wordInfo, provider);
            console.log(`[${new Date().toISOString()}] 缓存保存成功`);
          } catch (cacheError) {
            console.warn(`[${new Date().toISOString()}] 缓存保存失败:`, cacheError);
          }
          
          return {
            ...wordInfo,
            provider,
            fromCache: false,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          };
        } else {
          console.warn(`[${new Date().toISOString()}] 腾讯词典API返回数据不完整，继续尝试`);
          apiErrors.push('腾讯API返回空数据');
          wordInfo = null;
        }
      } catch (tencentError) {
        console.error(`[${new Date().toISOString()}] 腾讯词典API调用失败:`, tencentError);
        apiErrors.push(`腾讯API错误: ${tencentError instanceof Error ? tencentError.message : String(tencentError)}`);
        wordInfo = null;
      }
    }
    
    // 使用百度翻译API作为备用（已注释，仅使用腾讯翻译官和火山翻译）
    /*
    if (!wordInfo && useBaidu && hasBaiduKey) {
      apiAttempted++;
      console.log(`[${new Date().toISOString()}] 尝试使用百度翻译API (${apiAttempted}/3)...`);
      try {
        const baiduStart = Date.now();
        wordInfo = await callBaiduTranslateAPI(normalizedWord);
        const baiduEnd = Date.now();
        
        // 验证API返回的数据
        if (wordInfo && (wordInfo.phonetic || (wordInfo.definitions && wordInfo.definitions.length > 0))) {
          provider = 'baidu';
          console.log(`[${new Date().toISOString()}] 百度翻译API调用成功，耗时: ${baiduEnd - baiduStart}ms`);
          console.log(`[${new Date().toISOString()}] 百度API返回数据:`, wordInfo);
          
          // 缓存结果
          try {
            await cacheWordResult(normalizedWord, !!contextSentence, wordInfo, provider);
            console.log(`[${new Date().toISOString()}] 缓存保存成功`);
          } catch (cacheError) {
            console.warn(`[${new Date().toISOString()}] 缓存保存失败:`, cacheError);
          }
          
          return {
            ...wordInfo,
            provider,
            fromCache: false,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          };
        } else {
          console.warn(`[${new Date().toISOString()}] 百度翻译API返回数据不完整，继续尝试`);
          apiErrors.push('百度API返回空数据');
          wordInfo = null;
        }
      } catch (baiduError) {
        console.error(`[${new Date().toISOString()}] 百度翻译API调用失败:`, baiduError);
        apiErrors.push(`百度API错误: ${baiduError instanceof Error ? baiduError.message : String(baiduError)}`);
        wordInfo = null;
      }
    }
    */
    // 已移除百度翻译API相关代码，仅使用腾讯翻译官和火山翻译
    
    // 使用火山AI接口查询单词信息
      if (!wordInfo && hasVolcanoKey) {
        apiAttempted++;
        console.log(`[${new Date().toISOString()}] 尝试使用火山AI接口 (${apiAttempted}/3)...`);
        provider = 'volcano';
        const volcanoStart = Date.now();
        
        let prompt = `请提供单词"${normalizedWord}"的以下信息：\n1. 音标\n2. 考研核心释义（优先显示常考含义）\n`;
    
    if (contextSentence) {
      prompt += `3. 在句子"${contextSentence}"中的例句分析\n`;
    }
    
    prompt += '请使用以下格式返回，不要添加其他信息：\n音标:/phonetic/\n释义:definition1,definition2,...\n例句:example1,example2,...';
    
    console.log('火山AI提示词:', prompt);
    
    const messages = [
      { role: 'system', content: '你是一个专业的英语词典助手，专注于提供准确的单词释义和考研常考用法。' },
      { role: 'user', content: prompt }
    ];
    
    let apiResponse: string;
    try {
      apiResponse = await callVolcanoAPI(messages);
      console.log('火山AI原始响应:', apiResponse);
    } catch (volcanoError) {
      console.error('火山AI调用失败:', volcanoError);
      // 返回默认空结果，但包含错误信息
      return {
        phonetic: '',
        definitions: [`查询单词"${normalizedWord}"失败，请稍后重试`],
        examples: [],
        provider: 'error',
        fromCache: false,
        error: String(volcanoError)
      };
    }
    
    // 初始化结果对象
    wordInfo = {
      phonetic: '',
      definitions: [],
      examples: []
    };
    
    console.log('开始解析火山AI响应，原始内容长度:', apiResponse.length);
    
    // 提取音标 - 增强版，尝试多种格式
    const phoneticPatterns = [
      /音标:\/(.*?)\//,          // 标准格式: 音标:/fəˈnetɪk/
      /音标[：:]([^\n]+)/,        // 中文冒号格式: 音标:fəˈnetɪk
      /\[([^\]]+)\]/,            // 方括号格式: [fəˈnetɪk]
      /发音[：:]([^\n]+)/         // 发音格式: 发音:fəˈnetɪk
    ];
    
    for (const pattern of phoneticPatterns) {
      const match = apiResponse.match(pattern);
      if (match && match[1]) {
        wordInfo.phonetic = match[1].trim();
        console.log('提取到音标:', wordInfo.phonetic);
        break;
      }
    }
    
    // 提取释义 - 增强版，尝试多种格式和策略
    const definitionPatterns = [
      /释义:(.*?)(?=\n例句:|$)/s,  // 标准格式，跨行匹配
      /释义[：:]([^\n]+)/g,         // 中文冒号格式
      /解释[：:]([^\n]+)/g,         // 解释格式
      /意思[：:]([^\n]+)/g          // 意思格式
    ];
    
    const extractedDefinitions: string[] = [];
    
    // 尝试所有正则表达式模式
    for (const pattern of definitionPatterns) {
      const matches = apiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const definitions = match[1].split(',').map(d => d.trim());
          extractedDefinitions.push(...definitions);
        }
      }
    }
    
    // 如果通过正则没有提取到释义，尝试基于内容的智能提取
    if (extractedDefinitions.length === 0) {
      console.log('尝试基于内容智能提取释义');
      
      // 分割文本为句子
      const sentences = apiResponse.split(/[。！？\n;]/);
      
      // 查找包含关键信息的句子
      for (const sentence of sentences) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 5 && 
            (cleanSentence.includes('表示') || 
             cleanSentence.includes('指') || 
             cleanSentence.includes('意为') || 
             (cleanSentence.includes(normalizedWord) && cleanSentence.length > 10))) {
          extractedDefinitions.push(cleanSentence);
          if (extractedDefinitions.length >= 2) break;
        }
      }
    }
    
    // 确保至少有一个有意义的释义
    if (extractedDefinitions.length === 0) {
      console.log('未提取到有效释义，添加详细默认释义');
      extractedDefinitions.push(
        `单词"${normalizedWord}"的考研核心释义`,
        `作为名词/动词/形容词的基本含义`
      );
    }
    
    wordInfo.definitions = extractedDefinitions;
    console.log('最终提取到的释义数量:', wordInfo.definitions.length);
    console.log('释义内容:', wordInfo.definitions);
    
    // 提取例句 - 增强版，尝试多种格式和策略
    const examplePatterns = [
      /例句:(.*)/s,                // 标准格式，跨行匹配
      /例句[：:]([^\n]+)/g,         // 中文冒号格式
      /例如[：:]([^\n]+)/g,         // 例如格式
      /例[：:]([^\n]+)/g            // 例格式
    ];
    
    const extractedExamples: string[] = [];
    
    // 尝试所有正则表达式模式
    for (const pattern of examplePatterns) {
      const matches = apiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const examples = match[1].split(',').map(e => e.trim());
          extractedExamples.push(...examples);
        }
      }
    }
    
    // 如果通过正则没有提取到例句，尝试基于内容的智能提取
    if (extractedExamples.length === 0) {
      console.log('尝试基于内容智能提取例句');
      
      // 分割文本为句子
      const sentences = apiResponse.split(/[。！？\n;]/);
      
      // 查找包含单词的完整句子作为例句
      for (const sentence of sentences) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length >= 15 && 
            cleanSentence.length <= 100 && 
            cleanSentence.includes(normalizedWord)) {
          // 确保句子以句号结尾
          const formattedSentence = cleanSentence.endsWith('。') ? cleanSentence : cleanSentence + '。';
          extractedExamples.push(formattedSentence);
          if (extractedExamples.length >= 2) break;
        }
      }
    }
    
    // 如果还是没有例句，添加一个默认例句
    if (extractedExamples.length === 0) {
      console.log('未提取到例句，添加默认例句');
      extractedExamples.push(
        `This is an example sentence containing the word "${normalizedWord}".`,
        `在考研英语中，"${normalizedWord}"是一个重要的词汇。`
      );
    }
    
    wordInfo.examples = extractedExamples;
    console.log('最终提取到的例句数量:', wordInfo.examples.length);
    console.log('例句内容:', wordInfo.examples);
    
    console.log('解析后的单词信息:', wordInfo);
    
    // 缓存结果
    await cacheWordResult(normalizedWord, !!contextSentence, wordInfo, provider);
    
    return {
      ...wordInfo,
      provider,
      fromCache: false
    };
  }
  
  // 主要处理POST请求
  if (request.method === 'POST') {
    console.log('处理POST请求');
  } else {
    // 对于其他方法，返回更友好的错误信息
    console.log(`不支持的请求方法: ${request.method}`);
    return new Response(JSON.stringify({ 
      error: `Method ${request.method} not allowed`,
      allowedMethods: ['POST', 'GET', 'OPTIONS']
    }), {
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
    
    const { word, contextSentence, forceRefresh = false, useBaidu = true } = body;
    
    // 参数验证
    if (!word || typeof word !== 'string') {
      return new Response(JSON.stringify({ error: '单词不能为空' }), {
        status: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 使用handleWordQuery函数处理请求
    const result = await handleWordQuery({ word, contextSentence, forceRefresh, useBaidu });
    
    console.log('单词查询结果:', result); // 添加调试日志，查看返回的数据结构
    
    return new Response(JSON.stringify(result), {
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