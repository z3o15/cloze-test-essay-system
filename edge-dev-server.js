import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 从环境变量获取配置
const BAIDU_APP_ID = process.env.BAIDU_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';
const BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// MD5哈希函数
function md5Hash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// 调用百度翻译API的函数
async function callBaiduTranslateAPI(text, from, to) {
  try {
    console.log('调用百度翻译API进行翻译');
    
    // 生成随机数
    const salt = Math.floor(Math.random() * 1000000000).toString();
    // 构建签名
    const sign = md5Hash(`${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET_KEY}`);
    
    // 构建请求参数
    const params = {
      q: text,
      from: from,
      to: to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    };
    
    // 发送请求
    const response = await axios.get(BAIDU_TRANSLATE_URL, { 
      params,
      timeout: 10000
    });
    
    console.log(`百度翻译API响应状态: ${response.status}`);
    
    // 检查API错误
    if (response.data && response.data.error_code) {
      console.log(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`);
      throw new Error(`百度翻译API错误: ${response.data.error_code} - ${response.data.error_msg}`);
    }
    
    // 检查响应
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      const translatedText = response.data.trans_result.map((item) => item.dst).join('\n');
      console.log(`翻译成功: "${text}" -> "${translatedText}"`);
      return translatedText;
    } else {
      console.log(`翻译响应格式异常:`, response.data);
      throw new Error('百度翻译API响应格式错误');
    }
  } catch (error) {
    console.error('百度翻译API调用失败:', error);
    throw error;
  }
}

// 翻译API端点
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'en', targetLanguage = 'zh' } = req.body;
    
    console.log(`翻译请求: "${text}" (${sourceLanguage} -> ${targetLanguage})`);
    
    if (!text) {
      return res.status(400).json({ error: '文本不能为空' });
    }
    
    // 调用百度翻译API
    const translation = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage);
    
    res.json({
      translation,
      provider: 'baidu',
      sourceLanguage,
      targetLanguage
    });
    
  } catch (error) {
    console.error('翻译失败:', error);
    res.status(500).json({ 
      error: '翻译服务暂时不可用',
      details: error.message 
    });
  }
});

// 单词查询API端点
app.get('/api/word-query', async (req, res) => {
  try {
    const { word } = req.query;
    
    console.log(`单词查询请求: "${word}"`);
    
    if (!word) {
      return res.status(400).json({ error: '单词参数不能为空' });
    }
    
    // 调用百度翻译API获取单词翻译
    const translation = await callBaiduTranslateAPI(word, 'en', 'zh');
    
    // 返回单词信息格式
    res.json({
      phonetic: `/${word}/`, // 简化的音标
      definitions: [translation]
    });
    
  } catch (error) {
    console.error('单词查询失败:', error);
    
    // 如果API失败，返回基本信息
    res.json({
      phonetic: `/${req.query.word}/`,
      definitions: [`[查询失败] ${req.query.word}`]
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Edge Functions开发服务器正常运行',
    apis: ['POST /api/translate', 'GET /api/word-query']
  });
});

app.listen(PORT, () => {
  console.log(`Edge Functions开发服务器运行在 http://localhost:${PORT}`);
  console.log('翻译API端点: POST /api/translate');
  console.log('单词查询端点: GET /api/word-query');
  console.log('健康检查端点: GET /api/health');
  console.log('使用真实的百度翻译API');
});