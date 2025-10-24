const text = `Your life can be enhanced,and your happiness enriched,when you choose 
 to change your perspective.Don't leave your future to chance,or wait for things 
 to get better mysteriously on their own.You must go in the direction of your hopes 
 and aspirations.Begin to build your confidence,and work duanwenw through 
 problems rather than avoid them.Remember that power is not necessarily control 
 over situations,but the ability to deal with whatever es your way.`;

console.log('原文:', text);
console.log('='.repeat(50));

// 提取3个字母以上的单词
const words = text.match(/\b[a-zA-Z']{3,}\b/g) || [];
console.log('提取的所有单词:', words);
console.log('单词数量:', words.length);

// 检查特定单词
const targetWords = ['enhanced', 'enriched', 'perspective', 'mysteriously', 'aspirations', 'confidence', 'situations'];
console.log('\n检查目标单词:');
targetWords.forEach(word => {
  console.log(`${word}: ${words.includes(word) ? '✅ 已提取' : '❌ 未提取'}`);
});

// 去重后的单词
const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
console.log('\n去重后单词数量:', uniqueWords.length);
console.log('去重后的单词:', uniqueWords);