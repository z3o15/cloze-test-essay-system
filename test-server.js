import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建Express应用
const app = express();
const port = 3000;

// 配置CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// 解析JSON请求体
app.use(express.json());

// 模拟EdgeOne环境变量
const mockEnv = {
  VOLCANO_API_KEY: process.env.VOLCANO_API_KEY || '',
  VOLCANO_API_URL: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  BAIDU_APP_ID: process.env.BAIDU_APP_ID || '',
  BAIDU_SECRET_KEY: process.env.BAIDU_SECRET_KEY || ''
};

// 模拟EdgeOne上下文对象
function createEdgeContext(request, response) {
  return {
    request: {
      method: request.method,
      headers: request.headers,
      json: async () => request.body,
      url: request.url
    },
    env: mockEnv,
    next: async () => {},
    response: {
      status: (statusCode) => {
        response.status(statusCode);
        return {
          json: (data) => {
            response.json(data);
            return { ok: true };
          },
          headers: (headers) => {
            Object.entries(headers).forEach(([key, value]) => {
              response.setHeader(key, value);
            });
            return { json: (data) => { response.json(data); return { ok: true }; } };
          }
        };
      },
      headers: (headers) => {
        Object.entries(headers).forEach(([key, value]) => {
          response.setHeader(key, value);
        });
        return {
          status: (statusCode) => {
            response.status(statusCode);
            return { json: (data) => { response.json(data); return { ok: true }; } };
          }
        };
      }
    }
  };
}

// 加载Edge Functions
let translateFunction;
let wordQueryFunction;

try {
  // 动态导入translate函数
  const translateModulePath = path.resolve(__dirname, 'edge-functions/translate.ts');
  if (fs.existsSync(translateModulePath)) {
    console.log('加载translate函数...');
    // 注意：在实际环境中，您可能需要使用ts-node或其他方式来直接运行TypeScript
    // 这里我们使用一个简单的模拟实现
    translateFunction = async (context) => {
      const requestBody = await context.request.json();
      console.log('翻译请求:', requestBody);
      
      // 模拟翻译响应
      const response = {
        translatedText: `[模拟翻译] ${requestBody.text}`,
        from: requestBody.from || 'en',
        to: requestBody.to || 'zh',
        provider: 'mock',
        fromCache: false
      };
      
      return context.response
        .status(200)
        .headers({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        })
        .json(response);
    };
  }
  
  // 动态导入word-query函数
  const wordQueryModulePath = path.resolve(__dirname, 'edge-functions/word-query.ts');
  if (fs.existsSync(wordQueryModulePath)) {
    console.log('加载word-query函数...');
    // 同样，使用模拟实现
    wordQueryFunction = async (context) => {
      const requestBody = await context.request.json();
      console.log('单词查询请求:', requestBody);
      
      // 模拟单词查询响应
      const response = {
        phonetic: `/fəˈnetɪk/`,
        definitions: [`${requestBody.word}的模拟释义`, `这是第二个模拟释义`],
        examples: [`这是包含"${requestBody.word}"的模拟例句。`],
        provider: 'mock',
        fromCache: false
      };
      
      return context.response
        .status(200)
        .headers({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        })
        .json(response);
    };
  }
} catch (error) {
  console.error('加载Edge Functions失败:', error);
}

// 路由：翻译接口
app.post('/api/translate', async (req, res) => {
  try {
    const context = createEdgeContext(req, res);
    if (translateFunction) {
      await translateFunction(context);
    } else {
      res.status(200).json({
        translatedText: `[模拟翻译] ${req.body.text}`,
        from: req.body.from || 'en',
        to: req.body.to || 'zh',
        provider: 'mock-server',
        fromCache: false
      });
    }
  } catch (error) {
    console.error('翻译接口错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 路由：单词查询接口
app.post('/api/word-query', async (req, res) => {
  try {
    const context = createEdgeContext(req, res);
    if (wordQueryFunction) {
      await wordQueryFunction(context);
    } else {
      res.status(200).json({
        phonetic: `/fəˈnetɪk/`,
        definitions: [`${req.body.word}的模拟释义`, `这是第二个模拟释义`],
        examples: [`这是包含"${req.body.word}"的模拟例句。`],
        provider: 'mock-server',
        fromCache: false
      });
    }
  } catch (error) {
    console.error('单词查询接口错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 路由：测试根路径
app.get('/', (req, res) => {
  res.json({
    message: 'EdgeOne Pages API 测试服务器',
    availableEndpoints: [
      { path: '/api/translate', method: 'POST', description: '翻译接口' },
      { path: '/api/word-query', method: 'POST', description: '单词查询接口' }
    ],
    testExamples: {
      translate: 'curl -X POST -H "Content-Type: application/json" -d "{\"text\":\"I love apples\",\"from\":\"en\",\"to\":\"zh\"}" http://localhost:3000/api/translate',
      wordQuery: 'curl -X POST -H "Content-Type: application/json" -d "{\"word\":\"apple\",\"from\":\"en\",\"to\":\"zh\"}" http://localhost:3000/api/word-query'
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`测试服务器运行在 http://localhost:${port}`);
  console.log('可用接口:');
  console.log('  - POST http://localhost:3000/api/translate');
  console.log('  - POST http://localhost:3000/api/word-query');
  console.log('访问 http://localhost:3000 获取测试示例');
});