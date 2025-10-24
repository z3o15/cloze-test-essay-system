import axios from 'axios';

// 测试火山AI难度判断（使用批量API）
async function testVolcanoDifficulty() {
  const testWords = [
    'the',           // 应该是1级
    'beautiful',     // 应该是3-4级  
    'sophisticated', // 应该是5-6级
    'paradigm',      // 应该是7-8级
    'sesquipedalian' // 应该是9-10级
  ];

  console.log('🔥 测试火山AI单词难度判断...\n');

  // 测试单个单词处理API
  for (const word of testWords) {
    try {
      console.log(`\n测试单词: ${word}`);
      const response = await axios.post('http://localhost:8080/api/ai-words/process-single', {
        word: word
      });

      const result = response.data;
      console.log('📋 API响应数据:', JSON.stringify(result, null, 2));
      
      if (result.code === 'SUCCESS') {
        const wordInfo = result.data;
        console.log(`✅ ${word}: 难度级别 ${wordInfo.difficultyLevel} - ${wordInfo.reasoning || '无理由'}`);
      } else {
        console.log(`❌ ${word}: 处理失败 - ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ ${word}: 请求失败 - ${error.message}`);
      if (error.response) {
        console.log(`状态码: ${error.response.status}`);
        console.log(`响应数据:`, error.response.data);
      }
    }
  }
}

// 测试批量处理
async function testBatchDifficulty() {
  const testWords = ['the', 'beautiful', 'sophisticated', 'paradigm'];
  
  console.log('\n🔥 测试批量难度判断...\n');
  
  try {
    const response = await axios.post('http://localhost:8080/api/ai-words/batch-process', {
      words: testWords
    });

    const result = response.data;
    if (result.code === 'SUCCESS') {
      console.log('✅ 批量处理成功:');
      result.data.forEach(wordInfo => {
        console.log(`  ${wordInfo.word}: 难度级别 ${wordInfo.difficultyLevel}`);
      });
    } else {
      console.log(`❌ 批量处理失败: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ 批量处理请求失败: ${error.message}`);
  }
}

// 运行测试
async function runTests() {
  await testVolcanoDifficulty();
}

runTests().catch(console.error);