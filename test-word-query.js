// 测试word-query边缘函数的脚本
import axios from 'axios';

// 详细记录响应数据的函数
const logResponseDetails = (response, requestType, word) => {
  console.log(`${requestType} ${word} - 响应状态码:`, response.status);
  console.log(`${requestType} ${word} - 响应数据类型:`, typeof response.data);
  
  // 检查是否是HTML
  if (typeof response.data === 'string') {
    const isHtml = response.data.toLowerCase().includes('<!doctype html>') ||
                  response.data.toLowerCase().includes('<html');
    console.log(`${requestType} ${word} - 是否是HTML:`, isHtml);
    if (isHtml) {
      // 记录HTML开头以帮助调试
      console.log(`${requestType} ${word} - HTML内容预览:`, response.data.substring(0, 300) + '...');
    }
  }
  
  console.log(`${requestType} ${word} - 响应数据:`, response.data);
};

async function testWordQuery() {
  console.log('开始测试单词查询API...');
  
  // 测试函数
  const testWord = async (word, requestType = 'GET') => {
    try {
      let response;
      
      console.log(`\n===== 测试 ${word} (${requestType}) =====`);
      
      if (requestType === 'GET') {
        response = await axios.get('http://localhost:5175/api/word-query', {
          params: { word: word, encodedWord: word },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axios.post('http://localhost:5175/api/word-query', {
          word: word,
          encodedWord: word
        }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      }
      
      logResponseDetails(response, requestType, word);
      
    } catch (error) {
      console.error(`\n${requestType} ${word} - 请求失败:`, error.message);
      if (error.response) {
        console.log(`${requestType} ${word} - 错误状态码:`, error.response.status);
        console.log(`${requestType} ${word} - 错误数据类型:`, typeof error.response.data);
        
        // 检查是否是HTML错误响应
        if (typeof error.response.data === 'string') {
          const isHtml = error.response.data.toLowerCase().includes('<!doctype html>') ||
                        error.response.data.toLowerCase().includes('<html');
          console.log(`${requestType} ${word} - 是否是HTML错误:`, isHtml);
          if (isHtml) {
            console.log(`${requestType} ${word} - HTML错误内容预览:`, 
                        error.response.data.substring(0, 300) + '...');
          }
        }
        
        console.log(`${requestType} ${word} - 错误详情:`, error.response.data);
      } else if (error.request) {
        console.log(`${requestType} ${word} - 无响应:`, error.request);
      } else {
        console.error(`${requestType} ${word} - 请求配置错误:`, error.message);
      }
    }
  };
  
  // 测试多个单词和请求方式
  await testWord('waste', 'GET');
  await testWord('separation', 'GET');
  await testWord('waste', 'POST');
  await testWord('separation', 'POST');
  
  // 测试直接访问开发服务器的代理
  console.log('\n===== 测试直接访问测试服务器 =====');
  try {
    const directResponse = await axios.get('http://localhost:3000/api/word-query?word=test');
    console.log('直接访问测试服务器成功:', directResponse.data);
  } catch (error) {
    console.error('直接访问测试服务器失败:', error.message);
  }
}

// 运行测试
testWordQuery().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试过程中出现错误:', error);
});