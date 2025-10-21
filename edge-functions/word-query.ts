import axios from 'axios';
import { kv } from '@vercel/kv';

// 定义单词信息接口
export interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples?: string[];
}

// 本地词典数据（作为回退）
const localDictionary: Record<string, WordInfo> = {
  'the': {
    phonetic: '/ðə/',
    definitions: ['定冠词', '这，那']
  },
  'and': {
    phonetic: '/ænd/',
    definitions: ['和，与', '并且']
  },
  'is': {
    phonetic: '/ɪz/',
    definitions: ['是（be的第三人称单数现在时）']
  },
  'in': {
    phonetic: '/ɪn/',
    definitions: ['在...里面', '在...期间']
  },
  'to': {
    phonetic: '/tuː/',
    definitions: ['到，向', '为了']
  },
  'of': {
    phonetic: '/əv/',
    definitions: ['...的', '属于']
  },
  'a': {
    phonetic: '/ə/',
    definitions: ['一（个）', '不定冠词']
  },
  'waste': {
    phonetic: '/weɪst/',
    definitions: ['废物，垃圾', '浪费', '废弃的']
  },
  'separation': {
    phonetic: '/ˌsepəˈreɪʃn/',
    definitions: ['分离，分开', '间隔']
  }
};

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
    if (localDictionary[normalizedWord]) {
      return new Response(JSON.stringify({
        phonetic: localDictionary[normalizedWord].phonetic,
        definitions: localDictionary[normalizedWord].definitions,
        examples: localDictionary[normalizedWord].examples || [],
        source: 'local_dictionary'
      }), {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 如果没有本地词典数据，返回默认信息
    return new Response(JSON.stringify({
      phonetic: `/(${normalizedWord})/`,
      definitions: [`单词: ${normalizedWord}`],
      examples: [],
      source: 'default_response'
    }), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Word query error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
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