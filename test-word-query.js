// 测试word-query边缘函数的脚本
import axios from 'axios';

async function testWordQuery() {
  console.log('开始测试单词查询API...');
  
  // 测试GET请求方式
  try {
    // 测试开发服务器环境
    const getResponse = await axios.get('http://localhost:5175/api/word-query?encodedWord=waste');
    console.log('GET请求成功:');
    console.log(getResponse.data);
  } catch (getError) {
    console.error('GET请求失败:');
    if (getError.response) {
      console.error('状态码:', getError.response.status);
      console.error('响应数据:', getError.response.data);
    } else if (getError.request) {
      console.error('请求已发送但没有收到响应:', getError.request);
    } else {
      console.error('请求配置错误:', getError.message);
    }
  }
  
  // 测试POST请求方式
  try {
    const postResponse = await axios.post('http://localhost:5175/api/word-query', {
      encodedWord: 'separation'
    });
    console.log('\nPOST请求成功:');
    console.log(postResponse.data);
  } catch (postError) {
    console.error('\nPOST请求失败:');
    if (postError.response) {
      console.error('状态码:', postError.response.status);
      console.error('响应数据:', postError.response.data);
    } else if (postError.request) {
      console.error('请求已发送但没有收到响应:', postError.request);
    } else {
      console.error('请求配置错误:', postError.message);
    }
  }
}

// 运行测试
testWordQuery().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试过程中出现错误:', error);
});