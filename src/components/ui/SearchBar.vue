<template>
  <div class="search-section">
    <div class="search-container">
      <van-icon name="search" class="search-icon" size="18" />
      <input
        v-model="searchValue"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索作文标题或内容...'
})

const emit = defineEmits<Emits>()

const searchValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})

// 监听内部值变化
watch(searchValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleInput = () => {
  emit('search', searchValue.value)
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style scoped>
/* 搜索栏 - 简洁现代的搜索设计 */
.search-section {
  background: var(--color-background);
  padding: 20px;
  margin-top: 0px;
  position: relative;
  z-index: 3;
}

.search-container {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 40px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-soft);
  font-size: 16px;
  color: var(--color-text);
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-bg-elevated);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .search-section {
    padding: 12px 16px;
  }
  
  .search-input {
    height: 42px;
    font-size: 15px;
  }
}

/* 防止iOS缩放 */
input {
  font-size: 16px !important;
}
</style>