import express from 'express';
import cors from 'cors';

// 创建Express应用
const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());
// 解析JSON请求体
app.use(express.json());

// 本地词典数据（与word-query.ts中的数据保持一致）
const localDictionary = {
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

// 模拟word-query API端点
app.get('/api/word-query', (req, res) => {
  try {
    const word = req.query.encodedWord || req.query.word || '';
    const useBaidu = req.query.useBaidu !== 'false';
    
    console.log(`收到GET单词查询请求: ${word}`);
    
    // 解码单词
    let decodedWord = word;
    try {
      decodedWord = decodeURIComponent(word);
    } catch (e) {
      // 如果解码失败，使用原始单词
    }
    
    if (!decodedWord.trim()) {
      return res.status(400).json({
        error: 'Missing word parameter',
        message: 'Please provide a word to query'
      });
    }
    
    // 标准化单词（转小写）
    const normalizedWord = decodedWord.toLowerCase().trim();
    
    // 检查本地词典
    if (localDictionary[normalizedWord]) {
      return res.json({
        phonetic: localDictionary[normalizedWord].phonetic,
        definitions: localDictionary[normalizedWord].definitions,
        examples: localDictionary[normalizedWord].examples || [],
        source: 'local_dictionary'
      });
    }
    
    // 如果没有本地词典数据，返回默认信息
    return res.json({
      phonetic: `/${normalizedWord}/`,
      definitions: [`单词: ${normalizedWord}`],
      examples: [],
      source: 'default_response'
    });
  } catch (error) {
    console.error('GET单词查询错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST版本的word-query API端点
app.post('/api/word-query', (req, res) => {
  try {
    const word = req.body.encodedWord || req.body.word || '';
    const useBaidu = req.body.useBaidu !== false;
    
    console.log(`收到POST单词查询请求: ${word}`);
    
    // 解码单词
    let decodedWord = word;
    try {
      decodedWord = decodeURIComponent(word);
    } catch (e) {
      // 如果解码失败，使用原始单词
    }
    
    if (!decodedWord.trim()) {
      return res.status(400).json({
        error: 'Missing word parameter',
        message: 'Please provide a word to query'
      });
    }
    
    // 标准化单词（转小写）
    const normalizedWord = decodedWord.toLowerCase().trim();
    
    // 检查本地词典
    if (localDictionary[normalizedWord]) {
      return res.json({
        phonetic: localDictionary[normalizedWord].phonetic,
        definitions: localDictionary[normalizedWord].definitions,
        examples: localDictionary[normalizedWord].examples || [],
        source: 'local_dictionary'
      });
    }
    
    // 如果没有本地词典数据，返回默认信息
    return res.json({
      phonetic: `/${normalizedWord}/`,
      definitions: [`单词: ${normalizedWord}`],
      examples: [],
      source: 'default_response'
    });
  } catch (error) {
    console.error('POST单词查询错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log('可用的API端点:');
  console.log(`- GET  http://localhost:${PORT}/api/word-query?encodedWord=[单词]`);
  console.log(`- POST http://localhost:${PORT}/api/word-query`);
});