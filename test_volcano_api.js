import axios from 'axios';

// 从环境变量读取配置
const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || '31fb0b92-d606-48ec-827b-45cf2feaa65a';
const VOLCANO_API_URL = process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 测试单词列表
const testWords = [
  { word: 'hello', translation: '你好' },
  { word: 'world', translation: '世界' },
  { word: 'computer', translation: '计算机' },
  { word: 'sophisticated', translation: '复杂的' },
  { word: 'methodology', translation: '方法论' }
];

// 构建提示词
function buildPrompt(wordInfo) {
  return `请作为英语教学专家，判断以下英语单词的学习难度等级（1-10级）：

单词信息：
- 英文单词：${wordInfo.word}
- 中文翻译：${wordInfo.translation}

难度等级标准：
1级（最简单）：最基础词汇，如 a, the, is, am, are
2级（简单）：基础动词和名词，如 go, come, man, woman
3级（基础）：日常词汇，如 about, after, good, bad
4级（中等）：高中水平，如 important, different, education
5级（高级）：大学水平，如 sophisticated, comprehensive
6级（专家级）：学术/专业词汇
7级（非常高级）：高级学术词汇
8级（学术级）：专业学术术语
9级（专业级）：特定领域专业词汇
10级（罕见）：极其罕见或古老词汇

请以JSON格式回复：
{
  "difficulty_level": 数字(1-10),
  "reasoning": "判断理由",
  "confidence": 数字(0.0-1.0)
}`;
}

// 调用火山API
async function callVolcanoAPI(prompt) {
  try {
    console.log('🔥 调用火山大模型API...');
    console.log('API URL:', VOLCANO_API_URL);
    console.log('API Key:', VOLCANO_API_KEY ? `${VOLCANO_API_KEY.substring(0, 8)}...` : '未设置');
    
    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: 'kimi-k2-250905', // 使用正确的KIM K2模型名称
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VOLCANO_API_KEY}`
        },
        timeout: 30000
      }
    );

    console.log('✅ API调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ API调用失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求错误:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
    throw error;
  }
}

// 解析AI响应
function parseResponse(word, response) {
  try {
    console.log(`\n📝 解析单词 "${word}" 的响应:`);
    console.log('原始响应:', response);
    
    // 尝试提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('响应中未找到JSON格式');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('解析结果:', parsed);
    
    return {
      word,
      difficulty_level: parsed.difficulty_level,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence
    };
  } catch (error) {
    console.error(`❌ 解析失败:`, error.message);
    return {
      word,
      difficulty_level: 1,
      reasoning: '解析失败，使用默认值',
      confidence: 0.0
    };
  }
}

// 主测试函数
async function testVolcanoAPI() {
  console.log('🚀 开始测试火山大模型API...\n');
  
  for (const wordInfo of testWords) {
    try {
      console.log(`\n🔍 测试单词: ${wordInfo.word} (${wordInfo.translation})`);
      
      const prompt = buildPrompt(wordInfo);
      const response = await callVolcanoAPI(prompt);
      const result = parseResponse(wordInfo.word, response);
      
      console.log(`✅ 结果: 难度级别 ${result.difficulty_level}, 理由: ${result.reasoning}`);
      
      // 延迟避免频率限制
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ 测试单词 ${wordInfo.word} 失败:`, error.message);
    }
  }
  
  console.log('\n🏁 测试完成');
}

// 运行测试
testVolcanoAPI().catch(console.error);