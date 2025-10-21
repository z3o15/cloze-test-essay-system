<template>
  <div class="article-container">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadData">重试</button>
    </div>
    
    <!-- 文章详情 -->
    <div v-else-if="essayTitle || content" class="article-body">
      <!-- 文章标题 -->
      <h1 class="article-title">{{ essayTitle }}</h1>
      
      <!-- 作文信息区域 -->
      <div class="essay-info-section">
        <div class="info-tags">
          <div class="main-tags">
            <span class="year-tag">{{ year }}年</span>
            <span class="type-tag">{{ type }}</span>
          </div>
        </div>
      </div>

      <!-- 翻译按钮已移除，选中后自动翻译 -->
      
      <!-- 文章正文 -->
      <div class="article-text" @click="handleWordClick">
        <div v-for="(paragraph, idx) in paragraphs" :key="idx" class="paragraph-section">
          <!-- 原始段落内容 -->
          <p class="paragraph">
            <template v-for="(token, tokenIdx) in tokenizeText(paragraph)" :key="tokenIdx">
              <!-- 单词 -->
              <span v-if="token.type === 'word'" 
                    class="token word-token" 
                    :data-word="token.text"
                    @click.stop="showWordPopup(token.text)">
                <!-- 将单词和翻译包裹在一个inline-block容器中 -->
                <div class="word-with-translation">
                  <span class="word-text">{{ token.text }}</span>
                  <!-- 单词翻译 - 置于单词正下方 -->
                  <span v-if="getTranslation(token.text)" 
                        class="word-translation-below">
                    {{ getTranslation(token.text) }}
                  </span>
                </div>
              </span>
              <!-- 非单词（标点、空格） -->
              <span v-else class="token">{{ token.text }}</span>
            </template>
          </p>
          
          <!-- 段落翻译 -->
            <div class="paragraph-translation" v-if="paragraphInfos[idx]">
              {{ paragraphInfos[idx].isTranslating ? '翻译中...' : paragraphInfos[idx].translation || '翻译失败' }}
            </div>
        </div>
      </div>
      
      
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>暂无作文内容</p>
      <button class="add-btn" @click="router.push('/record')">录入新作文</button>
    </div>
    
    <!-- 共用弹窗组件 -->
    <div v-if="showPopup" class="word-popup">
      <div class="popup-content">
        <div class="popup-header">
          <div class="header-left">
            <div class="word-container">
              <h3 class="word-title">{{ popupType === 'word' ? currentWord : '翻译结果' }}
                <span v-if="popupType === 'word' && wordInfo.phonetic" class="inline-phonetic">{{ wordInfo.phonetic }}</span>
              </h3>
            </div>
            <button class="speaker-btn" title="发音" @click="playPronunciation" style="margin-left: 20px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <!-- 重新翻译按钮 -->
            <!-- 重新翻译按钮已移动到核心释义标题右侧 -->
          </div>
        </div>
        
        <div class="popup-body">
          <!-- 单词查询内容 -->
          <template v-if="popupType === 'word'">
            
            <!-- 释义 -->
            <div class="definitions-section">
              <div class="section-header">
                <h4 class="section-title">考研核心释义</h4>
                <!-- 将重新翻译按钮移动到考研核心释义标题右侧 -->
                <button v-if="popupType === 'word'" class="retranslate-btn" title="重新翻译" @click="reTranslateWord">
                  <svg :class="{ 'rotate-icon': isRefreshing }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                </button>
              </div>
              <div class="definitions-list">
                <div v-for="(def, idx) in wordInfo.definitions" :key="idx" class="definition-item">
                  <p class="definition-text">{{ def }}</p>
                </div>
              </div>
            </div>
            
            <!-- 例句板块已移除 -->
          </template>
          
          <!-- 翻译结果内容 -->
          <template v-else-if="popupType === 'translation'">
            <div class="translation-result-section">
              <h4 class="section-title">翻译内容</h4>
              <div class="translation-result-compact">
                <!-- 原文部分 -->
                <div class="original-text-container">
                  <p class="text-label">原文：</p>
                  <p class="original-text">{{ originalSelectedText }}</p>
                </div>
                <!-- 翻译部分 -->
                <div class="translation-text-container">
                  <p class="text-label">翻译：</p>
                  <p class="translation-text">{{ currentTranslation }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="popup-footer">
          <button class="close-button" @click="closePopup">
            关闭
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载提示 -->
    <div v-if="isTranslating" class="loading-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
      <div class="loading-content bg-white rounded-xl p-6 shadow-lg">
        <div class="loading-spinner w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-gray-700">翻译中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../store'
import { tokenizeText, queryWord, isAdvancedWord } from '../modules/word/wordService'
import { translateText } from '../modules/translate/translateService'
// 定义本地WordInfo类型，不包含examples属性
interface WordInfo {
  phonetic: string
  definitions: string[]
}

// 定义段落相关的数据结构
interface ParagraphInfo {
  text: string
  translation: string
  isTranslating: boolean
  keyWords: Array<{
    word: string
    info: WordInfo
    isLoading: boolean
  }>
}



const router = useRouter()
const route = useRoute()
const id = computed(() => route.params.id as string)
const store = useStore()

// 数据状态
const essayTitle = ref('')
const year = ref('')
const type = ref('')
const content = ref('')
const createTime = ref('')
const paragraphs = ref<string[]>([])
const paragraphInfos = ref<ParagraphInfo[]>([])
const showPopup = ref(false)
const currentWord = ref('')
// 移除currentSentence变量，不再需要
const wordInfo = ref<WordInfo>({
  phonetic: '',
  definitions: []
})
const selectedText = ref('')
const currentTranslation = ref('')
const popupType = ref<'word' | 'translation'>('word')
const isTranslating = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false) // 新增：刷新按钮加载状态
const originalSelectedText = ref('') // 保存原始选中的文本用于发音

// 用于存储每个单词的翻译
const wordTranslations = ref<{ [key: string]: string }>({})

// 安全获取单词翻译的辅助函数
const getTranslation = (word: string): string => {
  const key = word.toLowerCase()
  return wordTranslations.value[key] || ''
}


// 禁止背景滚动
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
};

// 恢复背景滚动
const enableBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
};

// 监听弹窗显示状态，控制背景滚动
watch(() => showPopup.value, (newValue) => {
  if (newValue) {
    disableBodyScroll();
  } else {
    enableBodyScroll();
  }
});

// 处理单个段落的翻译
const processParagraph = async (paragraph: string, index: number) => {
  // 初始化段落信息
  const paragraphInfo: ParagraphInfo = {
    text: paragraph,
    translation: '',
    isTranslating: true,
    keyWords: [] // 保留字段但不使用
  }
  
  // 更新响应式数据
  paragraphInfos.value[index] = paragraphInfo
  
  try {
    // 仅翻译段落
    paragraphInfo.isTranslating = true
    const translation = await translateText(paragraph)
    paragraphInfo.translation = translation
  } catch (error) {
    console.error(`处理段落翻译失败:`, error)
    paragraphInfo.translation = '翻译失败'
  } finally {
    paragraphInfo.isTranslating = false
  }
}

// 单词翻译相关的函数将在后面定义

// 从store加载数据
const loadData = () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('开始加载作文数据，当前ID:', id.value)
    
    // 首先尝试直接从localStorage读取数据
    try {
      const localStorageData = localStorage.getItem('essays')
      console.log('localStorage中的原始数据:', localStorageData)
      
      if (localStorageData) {
        const essays = JSON.parse(localStorageData)
        console.log('从localStorage解析的作文数量:', Array.isArray(essays) ? essays.length : 0)
        
        // 在localStorage数据中查找
        const essay = essays.find((item: any) => item.id === id.value)
        if (essay) {
          console.log('从localStorage成功找到作文:', essay.title)
          essayTitle.value = essay.title
          year.value = essay.year
          type.value = essay.type
          content.value = essay.content
          createTime.value = essay.createTime || new Date().toISOString()
          paragraphs.value = essay.content.split('\n').filter((p: string) => p.trim())
          loading.value = false
          
          // 加载完成后处理所有段落
          processAllParagraphs()
          return
        } else {
          console.warn('在localStorage中未找到指定ID的作文:', id.value)
        }
      } else {
        console.log('localStorage中没有essays数据')
      }
    } catch (storageError) {
      console.error('读取localStorage数据时出错:', storageError)
    }
    
    // 如果localStorage中没找到，再尝试从store查找
    // 先刷新store数据
    store.loadEssays()
    console.log('调用loadEssays后store中的作文数量:', store.essays.length)
    
    const found = store.getEssay(id.value)
    if (found) {
      console.log('从store找到作文:', found.title)
      essayTitle.value = found.title
      year.value = found.year
      type.value = found.type
      content.value = found.content
      createTime.value = found.createTime || new Date().toISOString()
      paragraphs.value = found.content.split('\n').filter((p: string) => p.trim())
    } else {
      console.error('在store中也未找到指定作文')
      error.value = '未找到该作文内容'
    }
  } catch (err) {
    error.value = '加载作文内容失败'
    console.error('加载数据错误:', err)
  } finally {
    loading.value = false
    
    // 加载完成后处理所有段落
    if (!error.value && paragraphs.value.length > 0) {
      processAllParagraphs()
    }
  }
}

// 获取单词翻译
const getWordTranslation = async (word: string): Promise<string> => {
  // 转换为小写以统一缓存键
  const normalizedWord = word.toLowerCase().trim()
  
  // 首先检查单词是否为四级及以上难度
  if (!isAdvancedWord(word)) {
    return ''
  }
  
  // 检查缓存
  if (wordTranslations.value[normalizedWord]) {
    return wordTranslations.value[normalizedWord]
  }
  
  try {
    // 查询单词信息
    const result = await queryWord(word)
    
    // 获取第一个翻译结果作为单词翻译
    let translation = ''
    if (result && result.definitions && result.definitions.length > 0 && result.definitions[0]) {
        // 只取第一个翻译结果，并移除多余的内容
        const firstDef = String(result.definitions[0])
        const parts = firstDef.split('；')
        const part1 = parts[0] || ''
        const dotParts = part1.split('. ')
        translation = dotParts[0] || ''
        
        // 将翻译结果严格限定在5个字符以内
        translation = translation.substring(0, 5)
      }
    
    return translation
  } catch (error) {
    console.error('获取单词翻译失败:', error)
    return ''
  }
}

// 预加载段落中所有单词的翻译
const preloadWordTranslations = async (paragraph: string) => {
  const tokens = tokenizeText(paragraph)
  const words = tokens
    .filter(token => token.type === 'word')
    .map(token => token.text)
    .filter((word, index, self) => self.indexOf(word) === index) // 去重
  
  for (const word of words) {
    if (!wordTranslations.value[word.toLowerCase()]) {
      const translation = await getWordTranslation(word)
      wordTranslations.value[word.toLowerCase()] = translation
    }
  }
}

// 批量处理所有段落，同时预加载单词翻译
const processAllParagraphs = async () => {
  // 重置段落信息
  paragraphInfos.value = []
  
  // 为每个段落创建初始信息
  paragraphs.value.forEach((paragraph, index) => {
    paragraphInfos.value[index] = {
      text: paragraph,
      translation: '',
      isTranslating: true,
      keyWords: [] // 保留字段但不使用
    }
  })
  
  // 预加载所有单词翻译
  for (const paragraph of paragraphs.value) {
    await preloadWordTranslations(paragraph)
  }
  
  // 顺序处理每个段落（避免同时发送过多请求）
    for (let i = 0; i < paragraphs.value.length; i++) {
      const paragraph = paragraphs.value[i]
      if (paragraph) {
        await processParagraph(paragraph, i)
      }
    }
}

// 显示单词查询弹窗 - 移除了例句相关功能
const showWordPopup = async (word: string) => {
  // 设置弹窗类型为单词
  popupType.value = 'word'
  currentWord.value = word
  
  // 显示加载状态
  wordInfo.value = {
    phonetic: '加载中...',
    definitions: []
  }
  
  // 打开弹窗
  showPopup.value = true
  
  try {
    // 使用更新后的queryWord函数，只传入单词
    const result = await queryWord(word)
    console.log('单词查询API返回结果:', result)
    console.log('返回的音标数据:', result.phonetic)
    // 如果查询成功但返回空数据，显示默认提示
    if (!result.definitions || result.definitions.length === 0) {
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: ['暂无详细释义']
      }
    } else {
      // 只保留需要的字段，忽略examples，并限制只显示前3个核心释义
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: result.definitions.slice(0, 3) // 只返回3个核心翻译
      }
    }
    console.log('设置后的wordInfo:', wordInfo.value)
    
    // 点击单词后自动发音
    setTimeout(() => {
      playPronunciation()
    }, 300) // 延迟一点时间确保弹窗已经显示
  } catch (error) {
    console.error('查询单词失败:', error)
    wordInfo.value = {
      phonetic: '',
      definitions: ['查询失败，请重试']
    }
  }
}

// 重新翻译单词
const reTranslateWord = async () => {
  console.log('=== 开始重新翻译流程 ===');
  
  if (!currentWord.value || typeof currentWord.value !== 'string') {
    console.warn('当前单词无效，无法重新翻译，currentWord.value:', currentWord.value);
    return;
  }
  
  console.log('当前待翻译单词:', currentWord.value);
  
  // 设置刷新状态为true，显示转动动画
  isRefreshing.value = true;
  console.log('设置刷新状态为true，动画应该显示');
  
  // 保存当前数据的副本，防止闪烁
  const tempWordInfo = { ...wordInfo.value };
  console.log('保存当前单词信息副本:', tempWordInfo);
  
  try {
    console.log('开始调用queryWord函数，使用forceRefresh=true强制刷新');
    
    // 使用新的forceRefresh参数强制绕过缓存和本地词典，直接调用API
    const startTime = Date.now();
    const result = await queryWord(currentWord.value, true);
    const endTime = Date.now();
    
    console.log(`API调用完成，耗时: ${endTime - startTime}ms`);
    console.log('重新查询原始结果:', JSON.stringify(result));
    
    // 验证结果的有效性
    if (!result || typeof result !== 'object') {
      console.error('API返回的结果无效或不是对象');
      throw new Error('API返回无效结果');
    }
    
    // 确保有翻译内容
    if (!result.definitions || result.definitions.length === 0) {
      console.log('未获取到释义，使用默认值');
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: ['暂无详细释义']
      }
    } else {
      // 一次性更新数据，避免多次重绘
      console.log(`获取到${result.definitions.length}条释义，更新显示`);
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: result.definitions.slice(0, 3)
      }
    }
    
    console.log('单词信息更新完成:', wordInfo.value);
    
  } catch (error) {
    console.error('重新翻译单词过程中发生错误:', error);
    // 恢复原始数据，减少闪烁感
    wordInfo.value = {
      phonetic: tempWordInfo.phonetic || '',
      definitions: ['重新翻译失败，请稍后重试']
    }
    console.log('恢复到原始数据:', wordInfo.value);
  } finally {
    // 无论成功失败，都设置刷新状态为false，停止转动动画
    console.log('设置刷新状态为false，动画应该停止');
    isRefreshing.value = false;
    console.log('=== 重新翻译流程完成 ===');
  }
}

// 处理文本选择
const handleTextSelection = async () => {
  const selection = window.getSelection()
  if (selection && !selection.isCollapsed) {
    const text = selection.toString().trim()
    if (text) {
      // 确保选择的是完整句子（包含句号、问号或感叹号）
      if (/[.!?]$/.test(text)) {
        selectedText.value = text
        // 选中后直接调用翻译
        await handleTranslate()
      }
    }
  } else {
    selectedText.value = ''
  }
}

// 处理文本翻译
const handleTranslate = async () => {
  if (!selectedText.value) return
  
  isTranslating.value = true
  try {
    // 保存原始选中的文本用于发音
    originalSelectedText.value = selectedText.value
    
    // 使用更新后的translateText函数调用火山AI接口
    const translation = await translateText(selectedText.value)
    
    // 设置弹窗类型为翻译
    popupType.value = 'translation'
    // 设置当前翻译内容
    currentTranslation.value = translation
    // 打开弹窗
    showPopup.value = true
    
    // 清除选中状态，防止关闭后再次触发
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
    
    selectedText.value = ''
  } catch (error) {
    console.error('翻译失败:', error)
    console.error('翻译失败，请重试')
  } finally {
    isTranslating.value = false
  }
}

// 处理单词点击
const handleWordClick = () => {
  // 获取选中文本
  const selection = window.getSelection()
  if (selection && selection.toString()) {
    selectedText.value = selection.toString()
  } else {
    selectedText.value = ''
  }
}

// 已移除未使用的handleBack函数

// 已移除顶部导航栏相关函数

// 播放发音（单词或句子）
const playPronunciation = () => {
  // 根据弹窗类型决定朗读内容
  const textToRead = popupType.value === 'word' ? currentWord.value : originalSelectedText.value;
  if (textToRead) {
    // 使用浏览器的SpeechSynthesis API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      // 设置为英语发音
      utterance.lang = 'en-US';
      // 播放发音
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('浏览器不支持语音合成功能');
    }
  }
};

// 关闭弹窗的函数
const closePopup = () => {
  showPopup.value = false
  enableBodyScroll() // 确保弹窗关闭时恢复滚动  // 清除文本选中状态
  if (window.getSelection) {
    window.getSelection()?.removeAllRanges()
  }
  selectedText.value = ''
  originalSelectedText.value = '' // 同时清空保存的原始文本
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  document.addEventListener('mouseup', handleTextSelection)
  document.addEventListener('touchend', handleTextSelection)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleTextSelection)
  document.removeEventListener('touchend', handleTextSelection)
})
</script>

<style scoped>
/* 文章容器 - 采用Apple风格的简洁设计 */
.article-container {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

/* 加载状态 */
.loading-state {
  padding: 80px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(0, 122, 255, 0.1);
  border-radius: 50%;
  border-top-color: #007AFF;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  font-size: 17px;
  color: #86868B;
  margin: 0;
}

/* 错误状态 */
.error-state {
  padding: 80px 30px;
  text-align: center;
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 单词样式 */
.word-token {
  display: inline-flex;
  flex-direction: column;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 2px 0;
  border-radius: 4px;
}

.word-token:hover {
  background-color: rgba(0, 122, 255, 0.05);
}

/* 单词翻译样式 */
.word-translation {
  font-size: 12px;
  color: #666;
  font-weight: normal;
  line-height: 1.4;
  margin-top: 2px;
  display: inline-block;
  text-align: center;
}

.error-state p {
  font-size: 17px;
  color: #3C3C43;
  margin-bottom: 24px;
}

.retry-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(20px);
}

.retry-btn:hover {
  background-color: #0066CC;
  transform: scale(1.02);
}

/* 文章主体 */
.article-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 30px 60px;
  background-color: #ffffff;
}

/* 文章标题 - Apple风格的清晰标题 */
.article-title {
  font-size: 28px;
  font-weight: 700;
  color: #1C1C1E;
  line-height: 1.3;
  margin: 0 0 24px 0;
  word-break: break-word;
  letter-spacing: -0.02em;
}

/* 作文信息区域 - 标签采用半透明背景 */
.essay-info-section {
  margin-bottom: 32px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.essay-info-section .info-tags .main-tags {
  display: flex !important;
  gap: 10px !important;
  align-items: center !important;
  margin: 0 !important;
  padding: 0 !important;
  flex-direction: row !important;
  width: auto !important;
  flex-wrap: nowrap !important;
}

.year-tag, .type-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  transition: all 0.2s ease;
}

.type-tag {
  background-color: rgba(122, 204, 77, 0.1);
  color: #7ACC4D;
}



/* 文章正文 - 排版优化 */
.article-text {
  font-size: 17px;
  line-height: 1.7;
  color: #1C1C1E;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

.paragraph {
  margin-bottom: 22px;
  word-break: break-word;
  letter-spacing: -0.01em;
  text-align: left;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* 单词标记 - 增强交互反馈 */
.token {
  cursor: pointer;
  user-select: auto;
  padding: 2px 0;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline;
  white-space: normal;
  color: #1C1C1E;
}

.token[data-word] {
  border-bottom: 1px dashed transparent; /* 默认不显示下划线 */
  position: relative;
}

.token[data-word]:hover {
  color: #007AFF; /* 只在鼠标悬停时显示蓝色 */
  border-bottom-color: rgba(0, 122, 255, 0.5); /* 悬停时显示下划线 */
  background-color: rgba(0, 122, 255, 0.08);
  text-decoration: none;
}

/* 空状态 */
.empty-state {
  padding: 80px 30px;
  text-align: center;
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state p {
  font-size: 17px;
  color: #86868B;
  margin-bottom: 24px;
}

.add-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background-color: #0066CC;
  transform: scale(1.02);
}

/* 弹窗样式 - Apple风格的模态框 */
.word-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 24px;
  animation: fadeIn 0.25s ease-out;
}

.popup-content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 弹窗头部 - 简洁设计 */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #F2F2F7;
  background: #ffffff;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.word-container {
  display: flex;
  align-items: center;
}

.word-title {
  font-size: 22px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0;
  word-break: break-all;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

.inline-phonetic {
  margin-left: 10px;
  font-size: 18px;
  font-weight: normal;
  color: #8E8E93;
  vertical-align: middle;
  display: inline-block;
}

/* 圆形按钮设计 - 增大尺寸 */
  .speaker-btn, .close-btn, .retranslate-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .speaker-btn {
    color: #007AFF;
  }

  .close-btn {
    color: #8E8E93;
  }

  .retranslate-btn {
    color: #5856D6;
  }

  .speaker-btn:hover {
    background: #E5E5EA;
    color: #3C3C43;
  }

  .close-btn:hover {
    background: rgba(255, 69, 58, 0.1);
    color: #FF453A;
  }

  .retranslate-btn:hover {
    background: rgba(88, 86, 214, 0.1);
    color: #4846B0;
  }
  
  /* 刷新按钮转动动画 */
  .rotate-icon {
    animation: rotate 1s linear infinite;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

/* 弹窗主体 - 调整为更紧凑的布局，移除例句后高度自动适应 */
.popup-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
  /* 移除例句后，弹窗更紧凑 */
}

/* 音标区域 */
.phonetic-section {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid #007AFF;
}

.phonetic-text {
  font-size: 16px;
  color: #007AFF;
  font-weight: 500;
  font-style: italic;
}

/* 释义区域 */
.definitions-section {
  margin-bottom: 0;
  /* 移除例句后，释义区域不需要底部边距 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0;
  letter-spacing: -0.01em;
}

.definitions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%; /* 确保列表占满整个宽度 */
}

.definition-item {
  background: #F2F2F7;
  border: none;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  width: 100%; /* 确保每个释义项占满整个宽度 */
  box-sizing: border-box; /* 确保内边距不会导致宽度溢出 */
  display: block; /* 确保以块级元素显示 */
  clear: both; /* 确保不会与其他元素并排显示 */
}

.definition-item:hover {
  background: rgba(0, 122, 255, 0.1);
  transform: translateY(-1px);
}

.definition-text {
  font-size: 15px;
  line-height: 1.6;
  color: #3C3C43;
  margin: 0;
  word-break: break-word;
}

/* 翻译结果区域 - 紧凑版 */
.translation-result-section {
  margin-bottom: 0;
}

.translation-result-compact {
  background: #F2F2F7;
  border: none;
  border-radius: 12px;
  font-size: 15px;
}

.original-text-container,
.translation-text-container {
  margin-bottom: 12px;
}

.original-text-container:last-child,
.translation-text-container:last-child {
  margin-bottom: 0;
}

.text-label {
  font-weight: 600;
  color: #8E8E93;
  margin: 0 0 4px 0;
  font-size: 13px;
}

.original-text {
  color: #3C3C43;
  margin: 0;
  line-height: 1.6;
}

.translation-text {
  color: #1C1C1E;
  margin: 0;
  line-height: 1.6;
  font-style: normal;
}

/* 弹窗底部 */
.popup-footer {
  padding: 16px 24px;
  border-top: 1px solid #F2F2F7;
  background: #ffffff;
  flex-shrink: 0;
}

.close-button {
  width: 100%;
  height: 48px;
  background: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #0066CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.close-button:active {
  transform: translateY(0);
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.loading-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.25s ease-out;
}

/* 动画效果 - 优化曲线 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 - 适配各种屏幕 */
@media (max-width: 768px) {
  .article-body {
    padding: 24px 20px 60px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-text {
    font-size: 16px;
  }
  
  .word-popup {
    padding: 20px;
  }
  
  .popup-content {
    max-height: 90vh;
  }
}

@media (max-width: 480px) {
  .article-body {
    padding: 20px 16px 40px;
  }
  
  .article-title {
    font-size: 22px;
  }
  
  .article-text {
    font-size: 16px;
  }
  
  .word-popup {
    padding: 16px;
  }
  
  .popup-header {
    padding: 16px 20px;
  }
  
  .popup-body {
    padding: 20px;
  }
  
  .popup-footer {
    padding: 16px 20px;
  }
  
  .word-title {
    font-size: 20px;
  }
  
  .loading-content {
    margin: 16px;
  }
}

/* 自定义滚动条 - Apple风格 */
.popup-body::-webkit-scrollbar {
  width: 6px;
}

.popup-body::-webkit-scrollbar-track {
  background: transparent;
}

.popup-body::-webkit-scrollbar-thumb {
  background: rgba(142, 142, 147, 0.3);
  border-radius: 3px;
}

.popup-body::-webkit-scrollbar-thumb:hover {
  background: rgba(142, 142, 147, 0.5);
}
/* 段落相关样式 */
.paragraph-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

/* 确保翻译文本与原始段落样式一致 */
.paragraph-translation {
  margin-top: 10px;
  padding: 0;
  color: #666;
  line-height: 1.6;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .paragraph-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
  }
  
  .paragraph-translation {
    font-size: 15px;
  }
}

/* 单词容器样式 */
.word-with-translation {
  display: inline-block;
  text-align: center;
  vertical-align: top;
  position: relative;
}

/* 单词文本样式 */
.word-text {
  display: inline-block;
}

/* 单词翻译样式 - 显示在单词正下方 */
.word-translation-below {
  display: block;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-top: 2px;
  text-align: center;
  font-weight: normal;
  width: 100%;
  word-wrap: break-word;
}
</style>