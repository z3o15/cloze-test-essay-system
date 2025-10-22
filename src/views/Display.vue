<template>
  <div class="article-container">
    <!-- 页面头部 -->
    <EssayHeader @back="router.push('/manage')">
      <template #actions>
        <ThemeToggle />
      </template>
    </EssayHeader>

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
                    @click.stop="handleWordClick(token.text, $event)"
                    @mouseenter="lazyLoadWordTranslation(token.text)">
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
          <ParagraphTranslation 
            v-if="paragraphInfos[idx]"
            :translation="paragraphInfos[idx].translation"
            :is-translating="paragraphInfos[idx].isTranslating"
          />
        </div>
      </div>
      
      
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>暂无作文内容</p>
      <button class="add-btn" @click="router.push('/record')">录入新作文</button>
    </div>
    
    <!-- 单词弹窗组件 -->
    <WordPopup 
      :show="showPopup"
      :word="currentWord"
      :word-info="wordInfo"
      :is-refreshing="isRefreshing"
      @close="closePopup"
      @retranslate="reTranslateWord"
    />
    
    <!-- 移除翻译加载弹窗，改为在段落下方直接显示翻译状态 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../store'
import { tokenizeText, queryWord, isAdvancedWord } from '../utils/api'
import { translateText } from '../utils/api'
import ThemeToggle from '../components/ui/ThemeToggle.vue'
import WordPopup from '../components/common/WordPopup.vue'
import ParagraphTranslation from '../components/common/ParagraphTranslation.vue'
import EssayHeader from '../components/essay/EssayHeader.vue'
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
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false) // 新增：刷新按钮加载状态

// 用于存储每个单词的翻译
const wordTranslations = ref<{ [key: string]: string }>({})

// 用于跟踪正在进行中的翻译请求，避免重复请求
const pendingTranslations = new Map<string, Promise<string>>()

// 获取单词翻译，只返回已缓存的翻译
const getTranslation = (word: string): string => {
  const key = word.toLowerCase()
  
  // 直接返回已缓存的翻译（预加载机制会负责填充缓存）
  return wordTranslations.value[key] || ''
}

// 懒加载单词翻译 - 当用户悬停单词时调用
const lazyLoadWordTranslation = async (word: string) => {
  const key = word.toLowerCase()
  
  // 检查是否是高级词汇
  if (!isAdvancedWord(word)) {
    return
  }
  
  // 检查是否已有缓存或正在请求
  if (!wordTranslations.value[key] && !pendingTranslations.has(key)) {
    // 创建新的Promise并存储，避免重复请求
    const translationPromise = getWordTranslation(word)
      .catch((_err) => {
        return ''
      })
      .finally(() => {
        pendingTranslations.delete(key)
      })
    
    pendingTranslations.set(key, translationPromise)
  }
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
    
    // 设置翻译超时时间（8秒）
    const translationTimeout = 8000
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('翻译请求超时')), translationTimeout)
    })
    
    // 使用Promise.race来实现超时控制
    const translation = await Promise.race([
      translateText(paragraph),
      timeoutPromise
    ]) as string
    
    paragraphInfo.translation = translation
  } catch (error) {
    console.error('段落翻译失败:', error)
    
    // 根据错误类型提供不同的错误信息和重试机制
    let errorMessage = '翻译失败'
    let shouldRetry = false
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
        errorMessage = '翻译超时，点击重试'
        shouldRetry = true
      } else if (errorMsg.includes('network') || errorMsg.includes('网络') || errorMsg.includes('fetch')) {
        errorMessage = '网络连接异常，点击重试'
        shouldRetry = true
      } else if (errorMsg.includes('api') || errorMsg.includes('密钥') || errorMsg.includes('unauthorized')) {
        errorMessage = 'API配置错误，请检查设置'
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('限制')) {
        errorMessage = '请求过于频繁，请稍后重试'
        shouldRetry = true
      } else if (errorMsg.includes('server') || errorMsg.includes('服务器')) {
        errorMessage = '服务器暂时不可用，点击重试'
        shouldRetry = true
      } else {
        errorMessage = `翻译失败: ${error.message}`
        shouldRetry = true
      }
    }
    
    // 如果是可重试的错误，添加重试按钮标识
    if (shouldRetry) {
      paragraphInfo.translation = `${errorMessage} <button class="retry-btn" onclick="retryTranslation(${index})">重试</button>`
    } else {
      paragraphInfo.translation = errorMessage
    }
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
    // 首先尝试直接从localStorage读取数据
    try {
      const localStorageData = localStorage.getItem('essays')
      
      if (localStorageData) {
        const essays = JSON.parse(localStorageData)
        
        // 在localStorage数据中查找
        const essay = essays.find((item: any) => item.id === id.value)
        if (essay) {
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
        }
      }
    } catch (storageError) {
      // 读取localStorage失败时静默处理
    }
    
    // 如果localStorage中没找到，再尝试从store查找
    // 先刷新store数据
    store.loadEssays()
    
    const found = store.getEssay(id.value)
    if (found) {
      essayTitle.value = found.title
      year.value = found.year
      type.value = found.type
      content.value = found.content
      createTime.value = found.createTime || new Date().toISOString()
      paragraphs.value = found.content.split('\n').filter((p: string) => p.trim())
    } else {
      error.value = '未找到该作文内容'
    }
  } catch (err) {
    error.value = '加载作文内容失败'
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
        
        // 存储翻译结果到wordTranslations对象中
        wordTranslations.value[normalizedWord] = translation
      }
    
    return translation
  } catch (error) {
    return ''
  }
}

// 预加载段落中所有单词的翻译（添加并发限制）
const preloadWordTranslations = async (paragraph: string) => {
  const tokens = tokenizeText(paragraph)
  const words = tokens
    .filter((token: any) => token.type === 'word')
    .map((token: any) => token.text)
    .filter((word: string, index: number, self: string[]) => self.indexOf(word) === index) // 去重
    .filter((word: string) => isAdvancedWord(word)) // 只预加载高级词汇
  
  // 设置并发限制，每次最多5个请求
  const concurrencyLimit = 5;
  
  // 分批次处理单词
  for (let i = 0; i < words.length; i += concurrencyLimit) {
    const batch = words.slice(i, i + concurrencyLimit);
    
    // 并行处理当前批次的单词，但限制并发数量
    await Promise.all(batch.map(async (word: string) => {
      const normalizedWord = word.toLowerCase();
      if (!wordTranslations.value[normalizedWord]) {
        try {
          const translation = await getWordTranslation(word);
          wordTranslations.value[normalizedWord] = translation;
        } catch (error) {
          // 错误处理，但不中断整体流程
        }
      }
    }));
    
    // 每批次之间添加短暂延迟，避免连续发送过多请求
    if (i + concurrencyLimit < words.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// 批量处理所有段落，同时预加载单词翻译
const processAllParagraphs = async () => {
  // 重置段落信息，初始状态为未开始翻译
  paragraphInfos.value = []
  
  // 为每个段落创建初始信息（未开始翻译状态）
  paragraphs.value.forEach((paragraph, index) => {
    paragraphInfos.value[index] = {
      text: paragraph,
      translation: '',
      isTranslating: false, // 初始状态为未开始
      keyWords: [] // 保留字段但不使用
    }
  })
  
  // 优化处理策略：并发处理，提高速度
  const concurrentLimit = 3; // 同时处理3个段落翻译
  
  // 先快速预加载所有段落的单词翻译（并发进行，不阻塞翻译）
  const wordPreloadPromises = paragraphs.value.map(paragraph => 
    preloadWordTranslations(paragraph).catch(() => {}) // 忽略预加载错误
  )
  
  // 创建翻译任务队列
  const translationTasks = paragraphs.value.map((paragraph, index) => {
    if (!paragraph) return null
    
    return async () => {
      // 设置当前段落为翻译中状态
      paragraphInfos.value[index].isTranslating = true
      await processParagraph(paragraph, index)
    }
  }).filter((task): task is (() => Promise<void>) => task !== null)
  
  // 使用简单的并发控制处理翻译任务
  const executeWithConcurrency = async (tasks: (() => Promise<void>)[], limit: number) => {
    const executing: Promise<void>[] = []
    
    for (const task of tasks) {
      const promise = task()
      executing.push(promise)
      
      if (executing.length >= limit) {
        await Promise.race(executing)
        // 移除已完成的任务
        const completed = await Promise.allSettled(executing)
        for (let i = executing.length - 1; i >= 0; i--) {
          if (completed[i].status === 'fulfilled' || completed[i].status === 'rejected') {
            executing.splice(i, 1)
          }
        }
      }
    }
    
    // 等待剩余任务完成
    await Promise.all(executing)
  }
  
  // 执行翻译任务
  await executeWithConcurrency(translationTasks, concurrentLimit)
  
  // 等待单词预加载完成（如果还未完成）
  await Promise.allSettled(wordPreloadPromises)
}

// 重试翻译段落
const retryTranslation = async (index: number) => {
  if (index < 0 || index >= paragraphInfos.value.length) {
    return
  }
  
  const paragraphInfo = paragraphInfos.value[index]
  const paragraph = paragraphs.value[index]
  
  if (!paragraph || !paragraphInfo) {
    return
  }
  
  // 重置翻译状态
  paragraphInfo.translation = ''
  paragraphInfo.isTranslating = true
  
  try {
    // 设置翻译超时时间（8秒）
    const translationTimeout = 8000
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('翻译请求超时')), translationTimeout)
    })
    
    // 使用Promise.race来实现超时控制
    const translation = await Promise.race([
      translateText(paragraph),
      timeoutPromise
    ]) as string
    
    paragraphInfo.translation = translation
  } catch (error) {
    console.error('重试翻译失败:', error)
    
    // 根据错误类型提供不同的错误信息
    let errorMessage = '重试翻译失败'
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
        errorMessage = '翻译仍然超时，请检查网络连接'
      } else if (errorMsg.includes('network') || errorMsg.includes('网络') || errorMsg.includes('fetch')) {
        errorMessage = '网络连接异常，请检查网络设置'
      } else if (errorMsg.includes('api') || errorMsg.includes('密钥') || errorMsg.includes('unauthorized')) {
        errorMessage = 'API配置错误，请检查设置'
      } else {
        errorMessage = `重试失败: ${error.message}`
      }
    }
    
    paragraphInfo.translation = errorMessage
  } finally {
    paragraphInfo.isTranslating = false
  }
}

// 将重试函数暴露到全局，以便HTML中的onclick可以调用
if (typeof window !== 'undefined') {
  (window as any).retryTranslation = retryTranslation
}

// 处理单词点击事件 - 立即播放发音
const handleWordClick = (wordOrEvent?: string | Event, event?: Event) => {
  // 如果第一个参数是字符串，说明是直接调用
  if (typeof wordOrEvent === 'string') {
    const word = wordOrEvent
    // 添加视觉反馈
    if (event && event.target) {
      const element = event.target as HTMLElement
      element.classList.add('playing')
      
      // 600ms后移除动画类
      setTimeout(() => {
        element.classList.remove('playing')
      }, 600)
    }
    
    // 立即播放发音
    playWordPronunciation(word)
  }
  // 如果第一个参数是Event，说明是从模板的@click调用，不做任何处理
}

// 播放单词发音（独立函数）
const playWordPronunciation = (word: string) => {
  if (word && 'speechSynthesis' in window) {
    // 停止当前正在播放的语音
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(word)
    // 设置为英语发音
    utterance.lang = 'en-US'
    // 设置语音参数
    utterance.rate = 0.8 // 稍微慢一点，便于听清
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // 播放发音
    window.speechSynthesis.speak(utterance)
  }
}

// 显示单词查询弹窗 - 移除了例句相关功能（备用函数，当前未使用）
// const showWordPopup = async (word: string) => {
//   currentWord.value = word
//   
//   // 显示加载状态
//   wordInfo.value = {
//     phonetic: '加载中...',
//     definitions: []
//   }
//   
//   // 打开弹窗
//   showPopup.value = true
//   
//   try {
//     // 使用更新后的queryWord函数，只传入单词
//     const result = await queryWord(word)

//     // 如果查询成功但返回空数据，显示默认提示
//     if (!result.definitions || result.definitions.length === 0) {
//       wordInfo.value = {
//         phonetic: result.phonetic || '',
//         definitions: ['暂无详细释义']
//       }
//     } else {
//       // 只保留需要的字段，忽略examples，并限制只显示前3个核心释义
//       wordInfo.value = {
//         phonetic: result.phonetic || '',
//         definitions: result.definitions.slice(0, 3) // 只返回3个核心翻译
//       }
//     }
//     
//     // 点击单词后自动发音
//     setTimeout(() => {
//       playPronunciation()
//     }, 300) // 延迟一点时间确保弹窗已经显示
//   } catch (error) {
//     wordInfo.value = {
//       phonetic: '',
//       definitions: ['查询失败，请重试']
//     }
//   }
// }

// 重新翻译单词
const reTranslateWord = async () => {
  if (!currentWord.value || typeof currentWord.value !== 'string') {
    return;
  }
  
  // 设置刷新状态为true，显示转动动画
  isRefreshing.value = true;
  
  // 保存当前数据的副本，防止闪烁
  const tempWordInfo = { ...wordInfo.value };
  
  try {
    // 查询单词信息
    const result = await queryWord(currentWord.value);
    
    // 验证结果的有效性
    if (!result || typeof result !== 'object') {
      throw new Error('API返回无效结果');
    }
    
    // 确保有翻译内容
    if (!result.definitions || result.definitions.length === 0) {
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: ['暂无详细释义']
      }
    } else {
      // 一次性更新数据，避免多次重绘
      wordInfo.value = {
        phonetic: result.phonetic || '',
        definitions: result.definitions.slice(0, 3)
      }
    }
    
  } catch (error) {
    // 恢复原始数据，减少闪烁感
    wordInfo.value = {
      phonetic: tempWordInfo.phonetic || '',
      definitions: ['重新翻译失败，请稍后重试']
    }
  } finally {
    // 无论成功失败，都设置刷新状态为false，停止转动动画
    isRefreshing.value = false;
  }
}

// 简化文本选择处理，移除翻译功能
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && !selection.isCollapsed) {
    selectedText.value = selection.toString().trim()
  } else {
    selectedText.value = ''
  }
}

// 移除选中文本翻译功能，因为已经有段落自动翻译



// 已移除未使用的handleBack函数

// 已移除顶部导航栏相关函数



// 关闭弹窗的函数
const closePopup = () => {
  showPopup.value = false
  enableBodyScroll() // 确保弹窗关闭时恢复滚动  // 清除文本选中状态
  if (window.getSelection) {
    window.getSelection()?.removeAllRanges()
  }
  selectedText.value = ''
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
  background-color: var(--color-background);
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
  border: 4px solid var(--color-info-bg);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  font-size: 17px;
  color: var(--color-text-light);
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
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
  position: relative;
}

.word-token:hover {
  background-color: var(--color-info-bg);
  transform: translateY(-1px);
}

.word-token:active {
  background-color: var(--color-info-bg);
  transform: translateY(0);
}

/* 发音反馈效果 */
.word-token.playing {
  background-color: var(--color-info-bg);
  animation: pulse-pronunciation 0.6s ease-in-out;
}

@keyframes pulse-pronunciation {
  0% {
    background-color: var(--color-info-bg);
    transform: scale(1);
  }
  50% {
    background-color: var(--color-primary);
    opacity: 0.3;
    transform: scale(1.02);
  }
  100% {
    background-color: var(--color-info-bg);
    opacity: 1;
    transform: scale(1);
  }
}

/* 单词翻译样式 - 与单词样式完全统一 */
.word-translation {
  display: block;
  font-size: inherit; /* 继承单词的字体大小 */
  color: inherit; /* 继承单词的颜色 */
  font-weight: inherit; /* 继承单词的字体粗细 */
  font-family: inherit; /* 继承单词的字体族 */
  line-height: 1.4;
  margin-top: 2px;
  text-align: center;
  width: 100%;
  word-wrap: break-word;
}

.error-state p {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.retry-btn {
  background-color: var(--color-primary);
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
  background-color: var(--color-primary-600);
  transform: scale(1.02);
}

/* 文章主体 */
.article-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 30px 60px;
  background-color: var(--color-bg-elevated);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  line-height: 1.8;
  font-size: 16px;
  color: var(--color-text);
  transition: all 0.3s ease;
}

/* 文章标题 - Apple风格的清晰标题 */
.article-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
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
  background-color: var(--color-info-bg);
  color: var(--color-primary);
  transition: all 0.2s ease;
}

.type-tag {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}



/* 文章正文 - 排版优化 */
.article-text {
  font-size: 17px;
  line-height: 1.7;
  color: var(--color-text);
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
  color: var(--color-text);
}

.token[data-word] {
  border-bottom: 1px dashed transparent; /* 默认不显示下划线 */
  position: relative;
}

.token[data-word]:hover {
  color: var(--color-primary); /* 只在鼠标悬停时显示蓝色 */
  border-bottom-color: var(--color-primary); /* 悬停时显示下划线 */
  background-color: var(--color-info-bg);
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
  color: var(--color-text-light);
  margin-bottom: 24px;
}

.add-btn {
  background-color: var(--color-primary);
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
  background-color: var(--color-primary-600);
  transform: scale(1.02);
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
  background: var(--color-bg-elevated);
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
  border-bottom: 1px solid var(--color-border);
}



/* 重试按钮样式 */
.retry-btn {
  display: inline-block;
  margin-left: 8px;
  padding: 4px 8px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .paragraph-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
  }
}

/* 单词容器样式 */
.word-with-translation {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  vertical-align: top;
  position: relative;
}

/* 单词文本样式 */
.word-text {
  display: block;
  text-align: center;
}

/* 单词翻译样式 - 显示在单词正下方，继承原文样式 */
.word-translation-below {
  display: block;
  font-size: inherit; /* 继承原文字体大小 */
  color: inherit; /* 继承原文颜色 */
  line-height: 1.4;
  margin-top: 2px;
  text-align: center;
  font-weight: inherit; /* 继承原文字重 */
  font-family: inherit; /* 继承原文字体族 */
  width: 100%;
  word-wrap: break-word;
  opacity: 0.8; /* 稍微降低透明度以区分翻译文本 */
}
</style>