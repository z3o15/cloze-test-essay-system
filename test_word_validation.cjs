// 测试单词验证器对高级词汇的处理
const fs = require('fs');
const path = require('path');

// 读取并执行 wordValidator.ts 文件
const wordValidatorPath = path.join(__dirname, 'src/utils/wordValidator.ts');
const wordValidatorCode = fs.readFileSync(wordValidatorPath, 'utf8');

// 移除 TypeScript 语法，转换为 JavaScript
const jsCode = wordValidatorCode
  .replace(/export const/g, 'const')
  .replace(/export \{[^}]+\}/g, '')
  .replace(/: string\[\]/g, '')
  .replace(/: string/g, '')
  .replace(/: boolean/g, '');

// 执行代码
eval(jsCode);

// 测试高级词汇
const advancedWords = [
  'believe', 'sincere', 'opportunity', 'realities', 'highest', 
  'dreamer', 'revealed', 'journey', 'impossible', 'protect', 
  'tenderly', 'deepest', 'expectations'
];

console.log('=== 高级词汇验证测试 ===');
advancedWords.forEach(word => {
  const isValid = isValidWord(word);
  console.log(`${word}: ${isValid ? '✅ 有效' : '❌ 无效'}`);
});

// 测试基础词汇对比
const basicWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a'];
console.log('\n=== 基础词汇验证测试 ===');
basicWords.forEach(word => {
  const isValid = isValidWord(word);
  console.log(`${word}: ${isValid ? '✅ 有效' : '❌ 无效'}`);
});

// 测试提取函数
const sampleText = "Believe in your faith. Set the vision before your eyes.";
console.log('\n=== 单词提取测试 ===');
console.log('原文:', sampleText);
const extractedWords = extractValidWords(sampleText);
console.log('提取的有效单词:', extractedWords);