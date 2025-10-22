import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟翻译API
app.post('/api/translate', (req, res) => {
  const { text, source = 'en', target = 'zh' } = req.body;
  
  console.log(`翻译请求: "${text}" (${source} -> ${target})`);
  
  if (!text) {
    return res.status(400).json({ error: '文本内容不能为空' });
  }
  
  // 模拟翻译延迟
  setTimeout(() => {
    // 简单的模拟翻译
    const mockTranslations = {
      'hello': '你好',
      'world': '世界',
      'good morning': '早上好',
      'thank you': '谢谢你',
      'how are you': '你好吗',
      'I am fine': '我很好',
      'nice to meet you': '很高兴见到你',
      'goodbye': '再见',
      'see you later': '回头见',
      'have a good day': '祝你有美好的一天'
    };
    
    // 检查是否有预设翻译
    const lowerText = text.toLowerCase().trim();
    let translation = mockTranslations[lowerText];
    
    if (!translation) {
      // 如果没有预设翻译，生成一个模拟翻译
      translation = `[模拟翻译] ${text}`;
    }
    
    res.json({
      translation: translation,
      sourceLanguage: source,
      targetLanguage: target,
      provider: 'mock',
      fromCache: false
    });
  }, 500); // 模拟500ms延迟
});

// 模拟单词查询API
app.get('/api/word-query', (req, res) => {
  const { word } = req.query;
  
  console.log(`单词查询请求: "${word}"`);
  
  if (!word) {
    return res.status(400).json({ error: '单词参数不能为空' });
  }
  
  // 模拟单词词典
  const mockDictionary = {
    'hello': {
      phonetic: '/həˈloʊ/',
      definitions: ['你好', '问候语']
    },
    'world': {
      phonetic: '/wɜːrld/',
      definitions: ['世界', '地球']
    },
    'competitive': {
      phonetic: '/kəmˈpetətɪv/',
      definitions: ['竞争的', '有竞争力的']
    },
    'competition': {
      phonetic: '/ˌkɑːmpəˈtɪʃn/',
      definitions: ['竞争', '比赛']
    },
    'opportunity': {
      phonetic: '/ˌɑːpərˈtuːnəti/',
      definitions: ['机会', '时机']
    },
    'survival': {
      phonetic: '/sərˈvaɪvl/',
      definitions: ['生存', '幸存']
    },
    'successful': {
      phonetic: '/səkˈsesfl/',
      definitions: ['成功的', '有成就的']
    },
    'challenging': {
      phonetic: '/ˈtʃælɪndʒɪŋ/',
      definitions: ['具有挑战性的', '困难的']
    },
    'society': {
      phonetic: '/səˈsaɪəti/',
      definitions: ['社会', '社团']
    },
    'fragmented': {
      phonetic: '/ˈfræɡmentɪd/',
      definitions: ['碎片化的', '分散的']
    },
    'interactive': {
      phonetic: '/ˌɪntərˈæktɪv/',
      definitions: ['互动的', '交互式的']
    },
    'traditional': {
      phonetic: '/trəˈdɪʃənl/',
      definitions: ['传统的', '惯例的']
    }
  };
  
  const lowerWord = word.toLowerCase().trim();
  const wordInfo = mockDictionary[lowerWord];
  
  if (wordInfo) {
    res.json(wordInfo);
  } else {
    // 如果没有预设词汇，返回一个模拟的翻译
    res.json({
      phonetic: `/${lowerWord}/`,
      definitions: [`[模拟翻译] ${word}`]
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '翻译服务正常运行' });
});

app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log('翻译API端点: POST /api/translate');
  console.log('单词查询端点: GET /api/word-query');
  console.log('健康检查端点: GET /api/health');
});