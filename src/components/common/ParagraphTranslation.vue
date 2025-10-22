<template>
  <div class="paragraph-translation">
    <div v-if="isTranslating" class="translation-loading">
      <div class="loading-spinner-small"></div>
      <span>翻译中...</span>
    </div>
    <div v-else-if="isTranslationError" class="translation-error">
      {{ errorMessage }}
    </div>
    <div v-else-if="translation && !isTranslationError" class="translation-result">
      {{ translation }}
    </div>
    <div v-else-if="!isTranslating && !translation" class="translation-waiting">
      <div class="waiting-indicator"></div>
      <span>等待翻译...</span>
    </div>
    <div v-else class="translation-error">
      翻译失败，请刷新页面重试
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  translation?: string
  isTranslating: boolean
}

const props = defineProps<Props>()

// 检查是否为翻译错误
const isTranslationError = computed(() => {
  return props.translation && props.translation.startsWith('[翻译失败')
})

// 提取错误信息
const errorMessage = computed(() => {
  if (isTranslationError.value && props.translation) {
    // 从 "[翻译失败: xxx]" 格式中提取错误信息
    const match = props.translation.match(/\[翻译失败:\s*(.+?)\]/)
    return match ? match[1] : '翻译服务暂时不可用'
  }
  return ''
})
</script>

<style scoped>
.paragraph-translation {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--color-bg-soft);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
  font-size: 14px;
  line-height: 1.6;
}

.translation-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-light);
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.translation-result {
  color: var(--color-text);
  font-style: italic;
}

.translation-waiting {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-light);
}

.waiting-indicator {
  width: 8px;
  height: 8px;
  background: var(--color-warning);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.translation-error {
  color: var(--color-danger);
  font-style: italic;
}
</style>