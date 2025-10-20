import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// 从环境变量获取API密钥，而不是硬编码
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

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
    const { text } = request.body;
    
    if (!text || typeof text !== 'string') {
      return response.status(400).json({ error: '文本内容不能为空' });
    }

    // 使用火山AI接口进行翻译
    const messages = [
      { role: 'system', content: '你是一个专业的翻译助手，请将英文文本准确翻译成中文，不要添加额外解释。' },
      { role: 'user', content: `请翻译以下英文：\n${text}` }
    ];
    
    const translation = await callVolcanoAPI(messages);
    
    return response.status(200).json({ translation });
  } catch (error) {
    console.error('翻译处理错误:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : '翻译服务暂时不可用' 
    });
  }
}