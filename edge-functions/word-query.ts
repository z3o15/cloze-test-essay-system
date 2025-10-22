import axios from 'axios'
import crypto from 'crypto'

// 简化的MD5哈希函数（使用crypto-js替代Web Crypto API）
async function md5Hash(text: string): Promise<string> {
  try {
    return crypto.createHash('md5').update(text, 'utf8').digest('hex')
  } catch (error) {
    console.error('MD5计算失败:', error)
    return Date.now().toString(16)
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
  phonetic: string
  definitions: string[]
}

// 环境变量
const BAIDU_APP_ID = process.env.VITE_BAIDU_APP_ID || process.env.BAIDU_APP_ID || ''
const BAIDU_SECRET_KEY = process.env.VITE_BAIDU_SECRET_KEY || process.env.BAIDU_SECRET_KEY || ''
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'

// 本地词典数据（作为回退）
const localDictionary: Record<string, WordInfo> = {
  'the': { phonetic: '/ðə/', definitions: ['定冠词', '这，那'] },
  'and': { phonetic: '/ænd/', definitions: ['和，与', '并且'] },
  'is': { phonetic: '/ɪz/', definitions: ['是（be的第三人称单数现在时）'] },
  'in': { phonetic: '/ɪn/', definitions: ['在...里面', '在...期间'] },
  'to': { phonetic: '/tuː/', definitions: ['到，向', '为了'] },
  'of': { phonetic: '/əv/', definitions: ['...的', '属于'] },
  'a': { phonetic: '/ə/', definitions: ['一（个）', '不定冠词'] },
  'waste': { phonetic: '/weɪst/', definitions: ['废物，垃圾', '浪费', '废弃的'] },
  'separation': { phonetic: '/ˌsepəˈreɪʃn/', definitions: ['分离，分开', '间隔'] }
}

// 调用腾讯翻译API的函数
const getEnvVar = (key: string): string => {
  return process.env[`VITE_${key}`] || process.env[key] || ''
}
async function callTencentTranslateAPI(word: string): Promise<string> {
  const TENCENT_APP_ID = getEnvVar('TENCENT_APP_ID')
  const TENCENT_APP_KEY = getEnvVar('TENCENT_APP_KEY')
  const TENCENT_TRANSLATE_URL = getEnvVar('TENCENT_TRANSLATE_URL') || 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate'
  if (!TENCENT_APP_ID || !TENCENT_APP_KEY) throw new Error('腾讯翻译API密钥未配置')
  const nonceStr = Math.random().toString(36).slice(2, 17)
  const timeStamp = Math.floor(Date.now() / 1000).toString()
  const params: any = { app_id: TENCENT_APP_ID, nonce_str: nonceStr, time_stamp: timeStamp, text: word, source: 'auto', target: 'zh' }
  const sortedKeys = Object.keys(params).sort()
  let signStr = ''
  for (const key of sortedKeys) signStr += `${key}=${params[key]}&`
  signStr += `app_key=${TENCENT_APP_KEY}`
  const sign = md5Hash(signStr).toUpperCase()
  params.sign = sign
  const response = await axios.post(TENCENT_TRANSLATE_URL, new URLSearchParams(params), { timeout: 10000 })
  if (response.data?.ret === 0 && response.data?.data?.target_text) return response.data.data.target_text
  throw new Error(`腾讯API错误: ${response.data?.msg || '未知错误'}`)
}

// 调用百度翻译API的函数
async function callBaiduTranslateAPI(word: string): Promise<WordInfo | null> {
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    console.log('百度翻译API密钥未配置，跳过百度翻译')
    return null
  }
  try {
    const salt = Date.now().toString()
    const sign = md5Hash(`${BAIDU_APP_ID}${word}${salt}${BAIDU_SECRET_KEY}`)
    const params = new URLSearchParams({ q: word, from: 'en', to: 'zh', appid: BAIDU_APP_ID, salt, sign })
    const response = await axios.post(BAIDU_TRANSLATE_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 })
    if (response.data?.error_code) {
      console.error(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`, response.data)
      return null
    }
    if (response.data?.trans_result?.length > 0) {
      const translatedText = response.data.trans_result.map((item: any) => item.dst).join(', ')
      return { phonetic: `/${word}/`, definitions: [translatedText] }
    }
    console.error('翻译响应格式异常:', response.data)
    return null
  } catch (error: any) {
    console.error('百度翻译API调用失败:', { error: error?.message || error, response: error?.response?.data, status: error?.response?.status })
    return null
  }
}

// 翻译单词函数（包含缓存和回退机制）
async function translateWord(word: string): Promise<WordInfo> {
  const cacheKey = `word_translation:${word.toLowerCase()}`
  try {
    const cached = await kv.get<string>(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch (e) {
    console.error('从缓存读取失败:', e)
  }
  const tryBuild = (zh: string): WordInfo => ({ phonetic: `/${word}/`, definitions: [zh] })
  const errors: string[] = []
  // 1) 腾讯
  try {
    const zh = await callTencentTranslateAPI(word)
    const res = tryBuild(zh)
    await kv.set(cacheKey, JSON.stringify(res), { ex: 3600 })
    return res
  } catch (e: any) {
    errors.push(`腾讯翻译: ${e.message}`)
    console.warn('腾讯翻译API失败，尝试火山AI:', e.message)
  }
  // 2) 火山
  try {
    const zh = await callVolcanoAPI(word)
    const res = tryBuild(zh)
    await kv.set(cacheKey, JSON.stringify(res), { ex: 3600 })
    return res
  } catch (e: any) {
    errors.push(`火山AI: ${e.message}`)
    console.warn('火山AI失败，尝试百度翻译:', e.message)
  }
  // 3) 百度
  try {
    const baidu = await callBaiduTranslateAPI(word)
    if (baidu) {
      await kv.set(cacheKey, JSON.stringify(baidu), { ex: 3600 })
      return baidu
    }
  } catch (e: any) {
    errors.push(`百度翻译: ${e.message}`)
  }
  console.error('所有翻译API都失败了:', errors)
  return { phonetic: `/${word}/`, definitions: [word] }
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
    const localResult = localDictionary[normalizedWord]
    if (localResult) {
      return new Response(JSON.stringify(localResult), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    // 如果没有本地词典数据，使用翻译服务
    const translationResult = await translateWord(normalizedWord)
    return new Response(JSON.stringify(translationResult), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })


async function callVolcanoAPI(word: string): Promise<string> {
  const VOLCANO_API_KEY = getEnvVar('VOLCANO_API_KEY')
  const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  if (!VOLCANO_API_KEY) throw new Error('火山AI API密钥未配置')
  const messages = [
    { role: 'system', content: '你是一个专业的翻译助手，将用户提供的文本翻译成指定语言。只返回翻译结果。' },
    { role: 'user', content: `请将以下文本翻译成中文：\n\n${word}` }
  ]
  const response = await axios.post(
    VOLCANO_API_URL,
    { model: 'doubao-1-5-lite-32k-250115', messages },
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VOLCANO_API_KEY}` }, timeout: 30000 }
  )
  return response.data?.choices?.[0]?.message?.content || ''
}