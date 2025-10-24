<template>
  <div v-if="show" class="word-popup">
    <div class="popup-content">
      <div class="popup-header">
        <div class="header-left">
          <div class="word-container">
            <h3 class="word-title">{{ word }}
              <span v-if="wordInfo.phonetic" class="inline-phonetic">{{ wordInfo.phonetic }}</span>
            </h3>
            <div v-if="difficultyLevel && difficultyLevel > 0" class="difficulty-badge">
              <span class="difficulty-label">难度级别:</span>
              <span class="difficulty-level" :class="getDifficultyClass(difficultyLevel)">
                {{ difficultyLevel }}/10
              </span>
              <span class="difficulty-desc">{{ getDifficultyDescription(difficultyLevel) }}</span>
            </div>
          </div>
          <button class="speaker-btn" @click="playPronunciation" style="margin-left: 20px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
        <div class="header-right">
          <button class="close-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="popup-body">
        <div class="definitions-section">
          <div class="section-header">
            <h4 class="section-title">考研核心释义</h4>
            <button class="retranslate-btn" @click="$emit('retranslate')">
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
      </div>
      
      <div class="popup-footer">
        <button class="close-button" @click="$emit('close')">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface WordInfo {
  phonetic: string
  definitions: string[]
}

interface Props {
  show: boolean
  word: string
  wordInfo: WordInfo
  difficultyLevel?: number
  isRefreshing?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  retranslate: []
}>()

const playPronunciation = () => {
  // 使用Web Speech API播放发音
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(props.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

// 获取难度级别对应的CSS类
const getDifficultyClass = (level: number): string => {
  if (level <= 2) return 'difficulty-easy'
  if (level <= 4) return 'difficulty-medium'
  if (level <= 6) return 'difficulty-hard'
  if (level <= 8) return 'difficulty-very-hard'
  return 'difficulty-extreme'
}

// 获取难度级别描述
const getDifficultyDescription = (level: number): string => {
  const descriptions: { [key: number]: string } = {
    1: '基础词汇',
    2: '常用词汇', 
    3: '中等词汇',
    4: '进阶词汇',
    5: '高级词汇',
    6: '专业词汇',
    7: '学术词汇',
    8: '高难词汇',
    9: '专家词汇',
    10: '极难词汇'
  }
  return descriptions[level] || '未知难度'
}
</script>

<style scoped>
/* 弹窗样式 */
.word-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-popup-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.popup-content {
  background: var(--color-bg-elevated);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.popup-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--color-bg-soft);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.word-container {
  flex: 1;
}

.word-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.inline-phonetic {
  font-size: 16px;
  color: var(--color-text-light);
  font-weight: 400;
  font-style: italic;
}

.difficulty-badge {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.difficulty-label {
  color: var(--color-text-light);
  font-weight: 500;
}

.difficulty-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.difficulty-easy {
  background: #e8f5e8;
  color: #2e7d32;
}

.difficulty-medium {
  background: #fff3e0;
  color: #f57c00;
}

.difficulty-hard {
  background: #ffebee;
  color: #d32f2f;
}

.difficulty-very-hard {
  background: #f3e5f5;
  color: #7b1fa2;
}

.difficulty-extreme {
  background: #e8eaf6;
  color: #3f51b5;
}

.difficulty-desc {
  color: var(--color-text-light);
  font-size: 12px;
}

.speaker-btn {
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speaker-btn:hover {
  background: var(--color-primary-600);
  transform: scale(1.05);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.popup-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.definitions-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.retranslate-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.retranslate-btn:hover {
  background: var(--color-bg-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.rotate-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.definitions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.definition-item {
  padding: 12px 16px;
  background: var(--color-bg-soft);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
}

.definition-text {
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-text);
  margin: 0;
}

.popup-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  background: var(--color-bg-soft);
}

.close-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}
</style>