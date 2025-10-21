// 腾讯翻译API测试脚本
const axios = require('axios');
const crypto = require('crypto');

// 从环境变量或配置文件加载API密钥
const TENCENT_APP_ID = process.env.TENCENT_APP_ID || 'your_app_id_here';
const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || 'your_app_key_here';

// 测试翻译API
async function testTranslateAPI() {
  console.log('\n=== 测试腾讯翻译API ===');
  
  const text = 'Hello world';
  const from = 'auto';
  const to = 'zh';
  
  try {
    // 生成随机字符串
    const nonceStr = Math.random().toString(36).substr(2, 15);
    // 时间戳
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    
    // 构建签名字符串
    const params = {
      app_id: TENCENT_APP_ID,
      nonce_str: nonceStr,
      time_stamp: timeStamp,
      text: text,
      source: from,
      target: to
    };

    // 对参数进行排序并拼接签名
    const sortedKeys = Object.keys(params).sort();
    let signStr = '';
    for (const key of sortedKeys) {
      signStr += `${key}=${params[key]}&`;
    }
    signStr += `app_key=${TENCENT_APP_KEY}`;
    
    // 计算MD5签名
    const sign = crypto
      .createHash('md5')
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    params.sign = sign;

    const response = await axios.post('https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate', 
      new URLSearchParams(params));
    
    console.log('翻译API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ret === 0 && response.data.data) {
      console.log('✅ 翻译成功:', text, '→', response.data.data.target_text);
      return true;
    } else {
      console.error('❌ 翻译失败:', response.data.msg || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ 翻译API调用异常:', error.message);
    return false;
  }
}

// 测试词典API
async function testDictAPI() {
  console.log('\n=== 测试腾讯词典API ===');
  
  const word = 'test';
  
  try {
    // 生成随机字符串
    const nonceStr = Math.random().toString(36).substr(2, 15);
    // 时间戳
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    
    // 构建签名字符串
    const params = {
      app_id: TENCENT_APP_ID,
      nonce_str: nonceStr,
      time_stamp: timeStamp,
      word: word
    };

    // 对参数进行排序并拼接签名
    const sortedKeys = Object.keys(params).sort();
    let signStr = '';
    for (const key of sortedKeys) {
      signStr += `${key}=${params[key]}&`;
    }
    signStr += `app_key=${TENCENT_APP_KEY}`;
    
    // 计算MD5签名
    const sign = crypto
      .createHash('md5')
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    params.sign = sign;

    const response = await axios.post('https://api.ai.qq.com/fcgi-bin/nlp/nlp_worddict', 
      new URLSearchParams(params));
    
    console.log('词典API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ret === 0 && response.data.data) {
      const data = response.data.data;
      console.log('✅ 词典查询成功:', word);
      console.log('音标:', data.phonetic || '无');
      console.log('释义:', data.translation ? data.translation.join(', ') : '无');
      if (data.examples && data.examples.length > 0) {
        console.log('例句:', data.examples[0]);
      }
      return true;
    } else {
      console.error('❌ 词典查询失败:', response.data.msg || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ 词典API调用异常:', error.message);
    return false;
  }
}

// 测试API端点
async function testEndpoints() {
  console.log('\n=== 测试API端点 ===');
  
  // 假设API端点运行在本地开发服务器
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
  
  // 测试翻译端点
  try {
    const translateResponse = await axios.post(`${baseUrl}/translate`, {
      text: 'Hello world',
      from: 'auto',
      to: 'zh',
      useTencent: true
    });
    
    console.log('翻译端点响应:', JSON.stringify(translateResponse.data, null, 2));
    if (translateResponse.data.translatedText) {
      console.log('✅ 翻译端点测试成功');
    }
  } catch (error) {
    console.error('❌ 翻译端点测试失败:', error.message);
  }
  
  // 测试单词查询端点
  try {
    const wordQueryResponse = await axios.post(`${baseUrl}/word-query`, {
      word: 'test',
      useTencent: true
    });
    
    console.log('单词查询端点响应:', JSON.stringify(wordQueryResponse.data, null, 2));
    if (wordQueryResponse.data.definitions && wordQueryResponse.data.definitions.length > 0) {
      console.log('✅ 单词查询端点测试成功');
    }
  } catch (error) {
    console.error('❌ 单词查询端点测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始腾讯翻译API测试...');
  console.log('注意：请确保已配置正确的环境变量 TENCENT_APP_ID 和 TENCENT_APP_KEY');
  
  const translateSuccess = await testTranslateAPI();
  const dictSuccess = await testDictAPI();
  
  // 如果API直接测试成功，可以选择测试端点
  if (translateSuccess && dictSuccess) {
    // 只有在API直接测试成功后才测试端点
    // 注意：需要先启动开发服务器
    // await testEndpoints();
  }
  
  console.log('\n测试完成！');
  console.log(`翻译API: ${translateSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`词典API: ${dictSuccess ? '✅ 通过' : '❌ 失败'}`);
}

// 执行测试
runAllTests();