<template>
  <div class="test-translation">
    <h1>段落翻译测试</h1>
    
    <div class="test-section">
      <h3>测试段落翻译</h3>
      <textarea 
        v-model="testParagraph" 
        placeholder="输入要翻译的英文段落..."
        rows="4"
        cols="50"
      ></textarea>
      <button @click="testParagraphTranslation" :disabled="!testParagraph.trim()">
        翻译段落
      </button>
      
      <div v-if="paragraphTranslation" class="translation-result">
        <h4>翻译结果：</h4>
        <p>{{ paragraphTranslation }}</p>
      </div>
      
      <div v-if="paragraphError" class="error">
        <h4>错误：</h4>
        <p>{{ paragraphError }}</p>
      </div>
    </div>

    <div class="test-section">
      <h3>测试单词翻译</h3>
      <input 
        v-model="testWord" 
        placeholder="输入要翻译的单词..."
        @keyup.enter="testWordTranslation"
      />
      <button @click="testWordTranslation" :disabled="!testWord.trim()">
        翻译单词
      </button>
      
      <div v-if="wordTranslation" class="translation-result">
        <h4>翻译结果：</h4>
        <p>{{ wordTranslation }}</p>
      </div>
      
      <div v-if="wordError" class="error">
        <h4>错误：</h4>
        <p>{{ wordError }}</p>
      </div>
    </div>

    <div class="test-section">
      <h3>测试批量单词难度分析</h3>
      <textarea 
        v-model="testWords" 
        placeholder="输入多个单词，用逗号或空格分隔..."
        rows="3"
        cols="50"
      ></textarea>
      <button @click="testBatchWords" :disabled="!testWords.trim()">
        分析单词难度
      </button>
      
      <div v-if="batchResult" class="translation-result">
        <h4>分析结果：</h4>
        <pre>{{ JSON.stringify(batchResult, null, 2) }}</pre>
      </div>
      
      <div v-if="batchError" class="error">
        <h4>错误：</h4>
        <p>{{ batchError }}</p>
      </div>
    </div>

    <div class="test-section">
      <h3>API连接测试</h3>
      <button @click="testAPIConnection">
        测试API连接
      </button>
      
      <div v-if="apiStatus" class="translation-result">
        <h4>API状态：</h4>
        <p :class="{ success: apiStatus === '连接成功', error: apiStatus !== '连接成功' }">
          {{ apiStatus }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TranslationService } from '../services/translationService'
import { WordDifficultyService } from '../services/wordDifficultyService'
import httpClient from '../utils/httpClient'

// 测试数据
const testParagraph = ref('Artificial intelligence is transforming the way we live and work.')
const testWord = ref('artificial')
const testWords = ref('artificial, intelligence, transform, technology, innovation')

// 测试结果
const paragraphTranslation = ref('')
const wordTranslation = ref('')
const batchResult = ref<any>(null)
const apiStatus = ref('')

// 错误信息
const paragraphError = ref('')
const wordError = ref('')
const batchError = ref('')

// 测试段落翻译
const testParagraphTranslation = async () => {
  paragraphError.value = ''
  paragraphTranslation.value = ''
  
  try {
    console.log('🚀 开始测试段落翻译...')
    const result = await TranslationService.translateParagraph(testParagraph.value)
    console.log('✅ 段落翻译成功:', result)
    paragraphTranslation.value = result.translated
  } catch (error) {
    console.error('❌ 段落翻译失败:', error)
    paragraphError.value = error.message || '翻译失败'
  }
}

// 测试单词翻译
const testWordTranslation = async () => {
  wordError.value = ''
  wordTranslation.value = ''
  
  try {
    console.log('🚀 开始测试单词翻译...')
    const result = await TranslationService.translate(testWord.value)
    console.log('✅ 单词翻译成功:', result)
    wordTranslation.value = result.translated
  } catch (error) {
    console.error('❌ 单词翻译失败:', error)
    wordError.value = error.message || '翻译失败'
  }
}

// 测试批量单词难度分析
const testBatchWords = async () => {
  batchError.value = ''
  batchResult.value = null
  
  try {
    console.log('🚀 开始测试批量单词难度分析...')
    const words = testWords.value.split(/[,\s]+/).filter(w => w.trim())
    console.log('📋 分析单词列表:', words)
    
    const result = await WordDifficultyService.analyzeWordDifficulty(words)
    console.log('✅ 批量分析成功:', result)
    batchResult.value = result
  } catch (error) {
    console.error('❌ 批量分析失败:', error)
    batchError.value = error.message || '分析失败'
  }
}

// 测试API连接
const testAPIConnection = async () => {
  apiStatus.value = '测试中...'
  
  try {
    console.log('🚀 开始测试API连接...')
    const response = await httpClient.get('/api/health')
    console.log('✅ API连接成功:', response.data)
    apiStatus.value = '连接成功'
  } catch (error) {
    console.error('❌ API连接失败:', error)
    apiStatus.value = `连接失败: ${error.message}`
  }
}
</script>

<style scoped>
.test-translation {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

textarea, input {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.translation-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
}

.translation-result h4 {
  margin-top: 0;
  color: #2e7d32;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background-color: #ffeaea;
  border: 1px solid #f44336;
  border-radius: 4px;
}

.error h4 {
  margin-top: 0;
  color: #d32f2f;
}

.success {
  color: #2e7d32;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>