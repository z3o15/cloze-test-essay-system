import axios from 'axios';
import { kv } from '@vercel/kv';

// 定义单词信息接口
export interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples?: string[];
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
    // 简单的实现，返回单词查询API的基本信息
    return new Response(JSON.stringify({
      message: 'Word query API is running',
      supportedMethods: ['GET', 'POST', 'OPTIONS']
    }), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
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