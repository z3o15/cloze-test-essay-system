// 翻译服务模块
import axios from 'axios'

// 创建超时Promise
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms)
  })
}

// 翻译缓存
const translationCache = new Map<string, string>()

// 本地翻译字典
const localTranslationDict: Record<string, string> = {
  'hello': '你好',
  'world': '世界',
  'good': '好的',
  'morning': '早上',
  'evening': '晚上',
  'night': '夜晚',
  'thank': '谢谢',
  'you': '你',
  'welcome': '欢迎',
  'please': '请',
  'sorry': '对不起',
  'excuse': '打扰',
  'me': '我',
  'yes': '是的',
  'no': '不',
  'ok': '好的',
  'fine': '很好',
  'great': '很棒',
  'wonderful': '精彩的',
  'beautiful': '美丽的'
}

// 获取本地翻译
const getLocalTranslation = (text: string): string | null => {
  const normalizedText = text.toLowerCase().trim()
  return localTranslationDict[normalizedText] || null
}

// MD5哈希函数（用于签名）
async function md5Hash(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 获取环境变量
const getEnvVar = (key: string): string => {
  // 针对常见不同命名的兼容别名
  const aliases: Record<string, string[]> = {
    TENCENT_APP_ID: ['TENCENT_APP_ID', 'TENCENT_ID', 'TENCENT_SECRET_ID', 'SecretId'],
    TENCENT_APP_KEY: ['TENCENT_APP_KEY', 'TENCENT_KEY', 'TENCENT_SECRET_KEY', 'SecretKey'],
    VOLCANO_API_URL: ['VOLCANO_API_URL', 'VOLCANO_APIURL'],
    VOLCANO_API_KEY: ['VOLCANO_API_KEY'],
    BAIDU_APP_ID: ['BAIDU_APP_ID'],
    BAIDU_SECRET_KEY: ['BAIDU_SECRET_KEY']
  }
  const candidates = [key, ...(aliases[key] || [])]
  for (const k of candidates) {
    const v = (import.meta.env?.[`VITE_${k}`] as string) || (import.meta.env?.[k] as string) || process.env?.[`VITE_${k}`] || process.env?.[k]
    if (v) return v
  }
  return ''
}

// 调用腾讯翻译API
const callTencentTranslateAPI = async (text: string): Promise<string> => {
  const TENCENT_APP_ID = getEnvVar('TENCENT_APP_ID')
  const TENCENT_APP_KEY = getEnvVar('TENCENT_APP_KEY')
  const TENCENT_TRANSLATE_URL = getEnvVar('TENCENT_TRANSLATE_URL') || 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate'
  
  if (!TENCENT_APP_ID || !TENCENT_APP_KEY) {
    throw new Error('腾讯翻译API密钥未配置')
  }

  try {
    // 生成随机字符串
    const nonceStr = Math.random().toString(36).substr(2, 15)
    // 时间戳
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    
    // 构建签名字符串
    const params: any = {
      app_id: TENCENT_APP_ID,
      nonce_str: nonceStr,
      time_stamp: timeStamp,
      text: text,
      source: 'auto',
      target: 'zh'
    }

    // 对参数进行排序并拼接签名
    const sortedKeys = Object.keys(params).sort()
    let signStr = ''
    for (const key of sortedKeys) {
      signStr += `${key}=${params[key]}&`
    }
    signStr += `app_key=${TENCENT_APP_KEY}`
    
    // 计算MD5签名
    const sign = (await md5Hash(signStr)).toUpperCase()
    params.sign = sign

    const response = await Promise.race([
      axios.post(TENCENT_TRANSLATE_URL, new URLSearchParams(params)),
      createTimeoutPromise(10000) // 10秒超时
    ])
    
    if (response.data.ret === 0 && response.data.data) {
      return response.data.data.target_text
    } else {
      throw new Error(`腾讯API错误: ${response.data.msg || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('腾讯翻译API调用失败:', error)
    throw error
  }
}

// 调用火山AI接口
const callVolcanoAPI = async (text: string): Promise<string> => {
  const VOLCANO_API_KEY = getEnvVar('VOLCANO_API_KEY')
  const VOLCANO_API_URL = getEnvVar('VOLCANO_API_URL') || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  
  if (!VOLCANO_API_KEY) {
    throw new Error('火山AI API密钥未配置')
  }

  try {
    // 构建翻译提示
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的翻译助手，将用户提供的文本翻译成指定语言。只返回翻译结果，不要添加任何解释或其他内容。'
      },
      {
        role: 'user',
        content: `请将以下文本翻译成中文：\n\n${text}`
      }
    ]

    const response = await Promise.race([
      axios.post(
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
      ),
      createTimeoutPromise(30000) // 30秒超时
    ])
    
    return response.data.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    console.error('火山AI API调用失败:', error)
    throw error
  }
}

// 调用百度翻译API
const callBaiduTranslateAPI = async (text: string): Promise<string> => {
  const BAIDU_APP_ID = getEnvVar('BAIDU_APP_ID')
  const BAIDU_SECRET_KEY = getEnvVar('BAIDU_SECRET_KEY')
  const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
  
  if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
    throw new Error('百度翻译API密钥未配置')
  }

  try {
    const salt = Date.now().toString()
    const signStr = BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY
    const sign = await md5Hash(signStr)

    const params = new URLSearchParams({
      q: text,
      from: 'auto',
      to: 'zh',
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    })

    const response = await Promise.race([
      axios.post(BAIDU_TRANSLATE_URL, params),
      createTimeoutPromise(10000) // 10秒超时
    ])

    if (response.data.trans_result && response.data.trans_result.length > 0) {
      return response.data.trans_result[0].dst
    } else {
      throw new Error(`百度API错误: ${response.data.error_msg || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('百度翻译API调用失败:', error)
    throw error
  }
}

// 多级API调用策略
const callTranslateAPIWithFallback = async (text: string): Promise<string> => {
  const errors: string[] = []
  
  // 第一级：腾讯翻译API
  try {
    return await callTencentTranslateAPI(text)
  } catch (error: any) {
    errors.push(`腾讯翻译: ${error.message}`)
    console.warn('腾讯翻译API失败，尝试火山AI:', error.message)
  }
  
  // 第二级：火山AI
  try {
    return await callVolcanoAPI(text)
  } catch (error: any) {
    errors.push(`火山AI: ${error.message}`)
    console.warn('火山AI失败，尝试百度翻译:', error.message)
  }
  
  // 第三级：百度翻译API
  try {
    return await callBaiduTranslateAPI(text)
  } catch (error: any) {
    errors.push(`百度翻译: ${error.message}`)
    console.error('所有翻译API都失败了:', errors)
  }
  
  // 所有API都失败
  throw new Error(`翻译服务暂时不可用: ${errors.join('; ')}`)
}

// 主要的翻译函数
export const translateText = async (text: string): Promise<string> => {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const trimmedText = text.trim()
  if (!trimmedText) {
    return ''
  }

  // 检查缓存
  if (translationCache.has(trimmedText)) {
    return translationCache.get(trimmedText) || ''
  }

  // 检查本地字典
  const localTranslation = getLocalTranslation(trimmedText)
  if (localTranslation) {
    translationCache.set(trimmedText, localTranslation)
    return localTranslation
  }

  try {
    // 使用多级API调用策略
    const translation = await callTranslateAPIWithFallback(trimmedText)
    
    // 缓存结果
    translationCache.set(trimmedText, translation)
    
    return translation
  } catch (error: any) {
    console.error('翻译失败:', error)
    
    // 如果是网络错误或超时，返回更友好的错误信息
    if (error.message === '请求超时') {
      throw new Error('翻译请求超时，请稍后重试')
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error('翻译服务暂时不可用，请稍后重试')
    }
  }
}

// 批量翻译
export const translateBatch = async (texts: string[]): Promise<string[]> => {
  const results: string[] = []
  
  for (const text of texts) {
    try {
      const translation = await translateText(text)
      results.push(translation)
    } catch (error) {
      console.error('批量翻译中的单个文本失败:', error)
      results.push(`[翻译失败]`)
    }
  }
  
  return results
}

// 清空翻译缓存
export const clearTranslationCache = (): void => {
  translationCache.clear()
}

// 获取缓存大小
export const getTranslationCacheSize = (): number => {
  return translationCache.size
}