<template>
  <div class="article-container">
    <!-- 页面头部 -->
    <UnifiedHeader 
      type="detail"
      @back="router.push('/manage')"
    >
      <template #actions>
        <ThemeToggle />
      </template>
    </UnifiedHeader>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadData">重试</button>
    </div>
    
    <!-- 文章详情 -->
    <div v-else-if="essayTitle || content || loading" class="article-body">
      <!-- 文章标题 -->
      <h1 v-if="essayTitle" class="article-title">{{ essayTitle }}</h1>
      
      <!-- 作文信息区域 -->
      <div v-if="year || type || loading" class="essay-info-section">
        <div class="info-tags">
          <div class="main-tags">
            <span v-if="year" class="year-tag">{{ year }}年</span>
            <span v-if="type" class="type-tag">{{ type }}</span>
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-tag">
              <div class="loading-spinner-small"></div>
              <span>加载中...</span>
            </div>
            <!-- 翻译状态显示 -->
            <div v-if="translationStatus !== 'idle'" class="translation-status-tag" :class="translationStatus">
              <div v-if="translationStatus === 'translating'" class="status-content">
                <div class="loading-spinner-small"></div>
                <span>翻译中...</span>
                <span v-if="translationProgress" class="progress-text">{{ translationProgress }}</span>
              </div>
              <div v-else-if="translationStatus === 'completed'" class="status-content">
                <span>✅ 翻译完成</span>
              </div>
              <div v-else-if="translationStatus === 'failed'" class="status-content">
                <span>❌ {{ translationProgress || '翻译失败' }}</span>
                <button class="retry-button" @click="retryTranslation">重试</button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    @click.stop="handleWordClick(token.text, $event)">
                <span class="word-text">{{ token.text }}</span>
                <!-- 显示难度≥3的单词翻译或点击查询的翻译 -->
                <span v-if="getWordTranslationForDisplay(token.text) || getClickTranslation(token.text)" 
                      class="word-translation">
                  {{ getWordTranslationForDisplay(token.text) || getClickTranslation(token.text) }}
                </span>
              </span>
              <!-- 非单词（标点、空格） -->
              <span v-else class="token">{{ token.text }}</span>
            </template>
          </p>
          
          <!-- 段落翻译 -->
          <div v-if="paragraphInfos[idx]?.translation" class="paragraph-translation">
            <div class="translation-label">翻译：</div>
            <div class="translation-text">{{ paragraphInfos[idx].translation }}</div>
          </div>
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
      :difficulty-level="currentWordDifficultyLevel"
      :is-refreshing="isRefreshing"
      @close="closePopup"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../store'
import { queryWord } from '../utils/api'
import { WordDifficultyService } from '../services/wordDifficultyService'
import { tokenizeText, queryWordWithComparison } from '../utils/wordService'
import { TranslationService } from '../services/translationService'
import ThemeToggle from '../components/ui/ThemeToggle.vue'
import WordPopup from '../components/common/WordPopup.vue'
import UnifiedHeader from '../components/common/UnifiedHeader.vue'

// 定义本地WordInfo类型，不包含examples属性
interface WordInfo {
  phonetic: string
  definitions: string[]
}

// 定义段落相关的数据结构
interface ParagraphInfo {
  text: string
  translation: string
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

// 当前单词的难度级别 - 只显示数据库中存在且难度≥3的单词
const currentWordDifficultyLevel = computed(() => {
  if (!currentWord.value) return 0
  const key = currentWord.value.toLowerCase()
  const dbWord = databaseDifficultWords.value[key]
  return dbWord ? dbWord.difficulty_level : 0
})

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
const wordInfo = ref<WordInfo>({
  phonetic: '',
  definitions: []
})
const selectedText = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const isRefreshing = ref(false)

// 翻译状态管理
const translationStatus = ref<'idle' | 'translating' | 'completed' | 'failed'>('idle')
const translationProgress = ref('')

// 用于存储数据库中的单词信息（难度≥3的单词）
const databaseDifficultWords = ref<{ [key: string]: any }>({})

// 简化的翻译存储
const wordTranslations = ref<Record<string, string>>({})

// 点击查询的翻译存储（临时显示）
const clickTranslations = ref<Record<string, string>>({})



// 请求队列管理
const activeRequests = new Set<string>()
const MAX_CONCURRENT_REQUESTS = 5

// 简化的单词查询函数（返回WordInfo对象）
const queryWordFromDatabase = async (word: string): Promise<WordInfo | null> => {
  const key = word.toLowerCase()
  
  // 限制并发请求数量
  if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
    // 如果请求过多，延迟处理
    await new Promise(resolve => setTimeout(resolve, 100))
    return queryWordFromDatabase(word)
  }
  
  // 添加到活跃请求集合
  activeRequests.add(key)
  
  try {
    const queryResult = await queryWordWithComparison(word)
    return queryResult.result
  } catch (error) {
    console.warn(`⚠️ 查询单词 "${word}" 失败:`, error)
    return null
  } finally {
    // 从活跃请求集合中移除
    activeRequests.delete(key)
  }
}

// 异步获取单词翻译
const fetchWordTranslation = async (word: string) => {
  if (!word) return
  
  const key = word.toLowerCase()
  
  // 避免重复查询
  if (wordTranslations.value[key] !== undefined) return
  
  try {
    const wordInfo = await queryWordFromDatabase(word)
    
    // 只有难度级别 >= 3 的单词才显示翻译
    if (wordInfo && (wordInfo as any).difficultyLevel >= 3 && wordInfo.definitions && wordInfo.definitions.length > 0) {
      wordTranslations.value[key] = wordInfo.definitions[0]
    } else {
      // 标记为已查询但不显示翻译
      wordTranslations.value[key] = ''
    }
  } catch (error) {
    console.error('查询单词翻译失败:', error)
    wordTranslations.value[key] = ''
  }
}

// 获取单词翻译用于显示（简化版本）
const getWordTranslationForDisplay = (word: string): string => {
  if (!word) return ''
  
  const key = word.toLowerCase()
  
  // 检查翻译存储
  if (wordTranslations.value[key] !== undefined) {
    return wordTranslations.value[key]
  }
  
  // 如果没有翻译，异步查询并存储
  fetchWordTranslation(word)
  
  return ''
}

// 获取点击查询的翻译
const getClickTranslation = (word: string): string => {
  if (!word) return ''
  
  const key = word.toLowerCase()
  return clickTranslations.value[key] || ''
}

// 清空翻译存储
const clearTranslations = () => {
  wordTranslations.value = {}
}


  
  // 获取段落翻译
const getParagraphTranslation = async (paragraph: string): Promise<string> => {
  try {
    const response = await TranslationService.translateParagraph(paragraph)
    return response.translated
  } catch (error) {
    console.error('段落翻译失败:', error)
    throw error
  }
}

// 从内容中提取所有单词
const extractAllWordsFromContent = (content: string): string[] => {
  const words = content.match(/\b[a-zA-Z]+\b/g) || []
  const uniqueWords = [...new Set(words)].map(word => word.toLowerCase())
  return uniqueWords
}

// 完整的单词难度分析流程
const processWordsWithAI = async (words: string[]) => {
  if (!words || words.length === 0) return
  
  try {
    translationStatus.value = 'translating'
    translationProgress.value = `开始处理 ${words.length} 个单词`
    
    if (import.meta.env.DEV) {
      console.log(`🚀 开始完整单词处理流程: ${words.length}个单词（总数）`)
    }
    
    // 步骤1: 查询数据库中已有的难度≥3的单词
    translationProgress.value = '查询数据库中已有单词...'
    const difficultWordsFromDB = await WordDifficultyService.findDifficultWords(words)
    
    // 更新数据库难度级别≥3单词缓存
    databaseDifficultWords.value = {}
    const existingWords = new Set<string>()
    
    if (Array.isArray(difficultWordsFromDB) && difficultWordsFromDB.length > 0) {
      difficultWordsFromDB.forEach(wordData => {
        if (wordData && wordData.word) {
          const key = wordData.word.toLowerCase()
          databaseDifficultWords.value[key] = wordData
          existingWords.add(key)
        }
      })
    }
    
    // 步骤2: 去重
    const newWords = words.filter(word => !existingWords.has(word.toLowerCase()))
    
    if (import.meta.env.DEV) {
      console.log(`📊 数据对比结果: 总单词${words.length}个 → 数据库已有${existingWords.size}个 → 需AI分析${newWords.length}个`)
    }
    
    // 步骤3: 如果有新单词，使用火山AI进行分析（自动分批处理）
    if (newWords.length > 0) {
      if (newWords.length > 20) {
        translationProgress.value = `正在分批分析 ${newWords.length} 个新单词（每批最多20个）...`
        if (import.meta.env.DEV) {
          console.log(`📦 [分批处理] 将对 ${newWords.length} 个新单词进行分批AI分析`)
        }
      } else {
        translationProgress.value = `正在分析 ${newWords.length} 个新单词...`
      }
      
      try {
        const aiAnalysisResult = await WordDifficultyService.analyzeWordDifficulty(newWords)
        
        if (aiAnalysisResult.code === 'SUCCESS' && aiAnalysisResult.data) {
          const complexWords = aiAnalysisResult.data.analysis || []
          
          // 步骤4: 只将复杂单词（难度≥3）添加到缓存中
          complexWords.forEach((wordData: any) => {
            const key = wordData.word.toLowerCase()
            databaseDifficultWords.value[key] = {
              word: wordData.word,
              difficulty_level: wordData.difficulty_level,
              difficulty_description: `难度级别${wordData.difficulty_level}`,
              chinese: wordData.translation || wordData.chinese || '',
              phonetic: wordData.pronunciation || '',
              part_of_speech: wordData.part_of_speech || '',
              created_at: new Date().toISOString()
            }
          })
          
          if (import.meta.env.DEV) {
            console.log(`✅ 已将${complexWords.length}个复杂单词添加到缓存（难度≥3）`)
            // 输出前5个单词的详细信息用于调试
            complexWords.slice(0, 5).forEach((wordData: any) => {
              console.log(`📝 单词详情: ${wordData.word} -> ${wordData.translation} (难度: ${wordData.difficulty_level})`)
            })
          }
        }
      } catch (aiError) {
        console.warn('⚠️ 火山AI分析失败，跳过新单词分析:', aiError)
      }
    }
    
    // 输出最终统计信息
    const totalWords = Object.keys(databaseDifficultWords.value).length
    const displayableWords = Object.values(databaseDifficultWords.value).filter(word => word.difficulty_level >= 3).length
    if (import.meta.env.DEV) {
      console.log(`🎯 完整流程完成: 共${totalWords}个单词已缓存，其中${displayableWords}个难度≥3的单词可显示翻译`)
      console.log(`📊 缓存状态检查:`, {
        databaseDifficultWordsCount: Object.keys(databaseDifficultWords.value).length,
        wordTranslationsCount: Object.keys(wordTranslations.value).length,
        sampleWords: Object.keys(databaseDifficultWords.value).slice(0, 3)
      })
    }
    
    translationStatus.value = 'completed'
    translationProgress.value = `处理完成，共 ${totalWords} 个单词已分析，${displayableWords} 个可显示翻译`
    
    setTimeout(() => {
      translationStatus.value = 'idle'
      translationProgress.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('❌ 单词处理流程失败:', error)
    databaseDifficultWords.value = {}
    
    translationStatus.value = 'failed'
    
    let errorMessage = '处理失败'
    const errorObj = error as Error
    if (errorObj.message?.includes('ECONNABORTED') || errorObj.message?.includes('timeout')) {
      errorMessage = '请求超时，请稍后重试'
    } else if (errorObj.message?.includes('Network Error') || errorObj.message?.includes('网络连接失败')) {
      errorMessage = '网络连接失败，请检查网络'
    } else if (errorObj.message?.includes('500')) {
      errorMessage = '服务器错误，请稍后重试'
    } else if (errorObj.message?.includes('404')) {
      errorMessage = '服务未找到，请联系管理员'
    } else {
      errorMessage = '处理失败，请重试'
    }
    
    translationProgress.value = errorMessage
    
    setTimeout(() => {
      translationStatus.value = 'idle'
      translationProgress.value = ''
    }, 5000)
  }
}

// 重试翻译
const retryTranslation = async () => {
  console.log('🔄 用户点击重试翻译')
  
  translationStatus.value = 'idle'
  translationProgress.value = ''
  
  const words = extractAllWordsFromContent(content.value)
  if (words.length > 0) {
    await processWordsWithAI(words)
  }
}

// 简化的段落处理方法 - 恢复翻译功能
const processParagraph = async (paragraph: string, index: number) => {
  // 初始化段落信息
  const paragraphInfo: ParagraphInfo = {
    text: paragraph,
    translation: '', // 初始化翻译为空
    keyWords: []
  }
  
  // 更新响应式数据
  paragraphInfos.value[index] = paragraphInfo
  
  // 异步获取段落翻译
  try {
    const translation = await getParagraphTranslation(paragraph)
    paragraphInfo.translation = translation
    console.log(`段落 ${index + 1} 翻译完成: ${translation}`)
  } catch (error) {
    console.error(`段落 ${index + 1} 翻译失败:`, error)
    paragraphInfo.translation = '翻译失败'
  }
}

// 处理所有段落，初始化段落信息
const processAllParagraphs = async () => {
  // 重置段落信息
  paragraphInfos.value = []
  
  // 为每个段落创建初始信息
  paragraphs.value.forEach((paragraph, index) => {
    paragraphInfos.value[index] = {
      text: paragraph,
      translation: '',
      keyWords: []
    }
  })

  // 并行处理所有段落翻译
  const translationPromises = paragraphs.value.map((paragraph, index) => 
    processParagraph(paragraph, index)
  )
  
  try {
    await Promise.all(translationPromises)
    console.log('✅ 所有段落翻译已完成')
  } catch (error) {
    console.error('❌ 段落翻译失败:', error)
  }

  // 提取所有单词并进行AI处理
  try {
    const allWords = extractAllWordsFromContent(content.value)
    
    if (allWords.length > 0) {
      await processWordsWithAI(allWords)
    }
  } catch (error) {
    console.error('❌ AI单词处理失败:', error)
  }

  if (import.meta.env.DEV) {
      console.log('✅ 所有段落和单词处理已完成')
    }
}

// 处理单词点击事件
const handleWordClick = async (wordOrEvent?: string | Event, event?: Event) => {
  if (typeof wordOrEvent === 'string') {
    const word = wordOrEvent
    const key = word.toLowerCase()
    
    // 添加视觉反馈
    if (event && event.target) {
      const element = event.target as HTMLElement
      element.classList.add('playing')
      
      setTimeout(() => {
        element.classList.remove('playing')
      }, 600)
    }
    
    // 立即播放发音
    playWordPronunciation(word)
    
    // 检查是否已经有点击翻译显示
    if (clickTranslations.value[key]) {
      // 如果已经显示，则隐藏
      delete clickTranslations.value[key]
      return
    }
    
    // 查询并显示翻译
    await showClickTranslation(word)
  }
}

// 显示点击查询的翻译
const showClickTranslation = async (word: string) => {
  if (!word) return
  
  const key = word.toLowerCase()
  
  try {
    // 直接调用API查询单词信息，不受难度级别限制
    const result = await queryWord(word)
    
    let translation = ''
    if (result && typeof result === 'object' && result.definitions && result.definitions.length > 0) {
      translation = result.definitions[0]
    } else {
      // 如果API查询失败，尝试从数据库获取
      const dbResult = await queryWordFromDatabase(word)
      if (dbResult && dbResult.definitions && dbResult.definitions.length > 0) {
        translation = dbResult.definitions[0]
      } else {
        translation = `暂无翻译`
      }
    }
    
    // 显示翻译
    clickTranslations.value[key] = translation
    
    // 1秒后自动隐藏
    setTimeout(() => {
      if (clickTranslations.value[key]) {
        delete clickTranslations.value[key]
      }
    }, 1000)
    
  } catch (error) {
    console.error('查询单词翻译失败:', error)
    clickTranslations.value[key] = '查询失败'
    
    // 1秒后自动隐藏
    setTimeout(() => {
      if (clickTranslations.value[key]) {
        delete clickTranslations.value[key]
      }
    }, 1000)
  }
}



// 播放单词发音
const playWordPronunciation = (word: string) => {
  if (word && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    window.speechSynthesis.speak(utterance)
  }
}



// 关闭弹窗
const closePopup = () => {
  showPopup.value = false
  currentWord.value = ''
  if (window.getSelection) {
    window.getSelection()?.removeAllRanges()
  }
  selectedText.value = ''
}

// 从store加载数据
const loadData = () => {
  loading.value = true
  error.value = null
  let paragraphsProcessed = false
  
  // 清理所有缓存
  databaseDifficultWords.value = {}
  clearTranslations()
  
  try {
    // 首先尝试直接从localStorage读取数据
    try {
      const localStorageData = localStorage.getItem('essays')
      
      if (localStorageData) {
        const essays = JSON.parse(localStorageData)
        
        const essay = essays.find((item: any) => item.id === id.value)
        if (essay) {
          essayTitle.value = essay.title
          year.value = essay.year
          type.value = essay.type
          content.value = essay.content
          createTime.value = essay.createTime || new Date().toISOString()
          paragraphs.value = essay.content.split('\n').filter((p: string) => p.trim())
          loading.value = false
          
          processAllParagraphs()
          paragraphsProcessed = true
          return
        }
      }
    } catch (storageError) {
      // 读取localStorage失败时静默处理
    }
    
    // 如果localStorage中没找到，再尝试从store查找
    store.loadEssays()
    
    const found = store.getEssay(id.value)
    if (found) {
      essayTitle.value = found.title
      year.value = found.year || '未知'
      type.value = found.type || '未分类'
      content.value = found.content
      createTime.value = found.createTime || new Date().toISOString()
      paragraphs.value = found.content.split('\n').filter((p: string) => p.trim())
    } else {
      // 如果没有找到文章，使用测试数据
      essayTitle.value = '测试文章 - 英语学习'
      year.value = '2024'
      type.value = '测试'
      content.value = `Learning English is challenging but rewarding. Students often struggle with complex vocabulary and sophisticated grammar structures. However, persistent practice and dedication can lead to remarkable improvement. The acquisition of language skills requires comprehensive understanding of both fundamental concepts and advanced techniques.

Many educators emphasize the importance of immersive experiences. Reading authentic materials, engaging in conversations, and participating in academic discussions contribute significantly to language development. Furthermore, technological innovations have revolutionized traditional learning methodologies.`
      createTime.value = new Date().toISOString()
      paragraphs.value = content.value.split('\n').filter((p: string) => p.trim())
    }
  } catch (err) {
    error.value = '加载作文内容失败'
  } finally {
    loading.value = false
    
    if (!paragraphsProcessed && !error.value && paragraphs.value.length > 0) {
      processAllParagraphs()
    }
  }
}

// 监听路由参数变化
watch(id, () => {
  loadData()
}, { immediate: false })

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 文章容器 */
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

/* 翻译状态显示 */
.translation-status {
  margin: 16px 20px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: var(--color-info-bg);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-content.success {
  color: var(--color-success);
}

.status-content.error {
  color: var(--color-danger);
}

.progress-text {
  color: var(--color-text-light);
  font-size: 13px;
  margin-left: 4px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

.status-indicator.translating {
  color: var(--color-primary);
}

.status-indicator.completed {
  background-color: var(--color-success-bg, #f0f9ff);
}

.status-indicator.failed {
  background-color: var(--color-danger-bg, #fef2f2);
}

.retry-button {
  margin-left: 12px;
  padding: 4px 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: var(--color-primary-dark, #1976d2);
}

.retry-button:active {
  transform: scale(0.98);
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

/* 文章标题 */
.article-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin: 0 0 24px 0;
  word-break: break-word;
  letter-spacing: -0.02em;
}

/* 作文信息区域 */
.essay-info-section {
  margin-bottom: 12px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.main-tags {
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

.loading-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  background-color: var(--color-info-bg);
  color: var(--color-primary);
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
}

.loading-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.translation-status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.translation-status-tag .status-content {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

/* 翻译中状态 */
.translation-status-tag.translating {
  background-color: var(--color-info-bg);
  color: var(--color-primary);
}

/* 翻译成功状态 */
.translation-status-tag.completed {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

/* 翻译失败状态 */
.translation-status-tag.failed {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.translation-status-tag .retry-button {
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  background-color: var(--color-danger);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.translation-status-tag .retry-button:hover {
  background-color: var(--color-danger-600);
  transform: scale(1.05);
}

.translation-status-tag .progress-text {
  font-size: 12px;
  color: var(--color-text-light);
  margin-left: 0;
}

/* 文章正文 */
.article-text {
  font-size: 17px;
  line-height: 3.0;
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

/* 单词标记 */
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
  border-bottom: 1px dashed transparent;
  position: relative;
}

.token[data-word]:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background-color: var(--color-info-bg);
  text-decoration: none;
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

/* 单词文本样式 */
.word-text {
  display: inline-block;
}

/* 单词翻译样式 */
.word-translation {
  position: absolute;
  top: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 0.85em;
  color: var(--color-text-secondary);
  line-height: 1.2;
  white-space: nowrap;
  box-sizing: border-box;
  pointer-events: none;
  padding: 1px 4px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  z-index: 1;
  width: max-content;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 段落翻译样式 */
.paragraph-translation {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--color-info-bg);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.translation-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.translation-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
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

/* 段落相关样式 */
.paragraph-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.paragraph-section:last-child {
  border-bottom: none;
}

/* 动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
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
  
  .paragraph-translation {
    padding: 12px;
  }
  
  .translation-text {
    font-size: 14px;
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
  
  .paragraph-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
  }
}
</style>