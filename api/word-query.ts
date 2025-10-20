import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// 从环境变量获取API密钥，而不是硬编码
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 定义单词信息接口
export interface WordInfo {
  phonetic: string;
  definitions: string[];
  examples?: string[];
}

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
    const { word, contextSentence } = request.body;
    
    if (!word || typeof word !== 'string') {
      return response.status(400).json({ error: '单词内容不能为空' });
    }

    // 使用火山AI接口查询单词信息
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
    
    return response.status(200).json(wordInfo);
  } catch (error) {
    console.error('单词查询处理错误:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : '单词查询服务暂时不可用' 
    });
  }
}