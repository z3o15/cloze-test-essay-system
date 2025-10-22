<template>
  <button 
    class="theme-toggle" 
    @click="handleToggle"
    :title="getTooltip()"
    aria-label="切换主题"
  >
    <svg 
      class="theme-icon" 
      :class="{ 'rotating': isToggling }"
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <!-- 太阳图标 (浅色模式) -->
      <g v-if="currentTheme === 'light'" class="sun-icon">
        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41" stroke="currentColor" stroke-width="2"/>
      </g>
      
      <!-- 月亮图标 (深色模式) -->
      <path v-else-if="currentTheme === 'dark'" class="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
      
      <!-- 自动图标 (跟随系统) -->
      <g v-else class="auto-icon">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="10" r="2" fill="currentColor"/>
      </g>
    </svg>
    
    <span class="theme-text">{{ getThemeText() }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { themeManager, type ThemeMode } from '../../utils/theme'

const currentTheme = ref<ThemeMode>('auto')
const isToggling = ref(false)

const handleToggle = async () => {
  if (isToggling.value) return
  
  isToggling.value = true
  themeManager.toggleTheme()
  
  // 添加旋转动画延迟
  setTimeout(() => {
    isToggling.value = false
  }, 300)
}

const getThemeText = () => {
  switch (currentTheme.value) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    case 'auto': return '自动'
    default: return '自动'
  }
}

const getTooltip = () => {
  switch (currentTheme.value) {
    case 'light': return '当前: 浅色模式，点击切换到深色模式'
    case 'dark': return '当前: 深色模式，点击切换到自动模式'
    case 'auto': return '当前: 自动模式，点击切换到浅色模式'
    default: return '切换主题'
  }
}

const updateTheme = () => {
  currentTheme.value = themeManager.getTheme()
}

onMounted(() => {
  updateTheme()
  themeManager.addListener(updateTheme)
})

onUnmounted(() => {
  themeManager.removeListener(updateTheme)
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 36px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.theme-toggle:hover {
  background: var(--color-bg-soft);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.theme-toggle:active {
  transform: translateY(0);
  box-shadow: none;
}

.theme-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: var(--color-primary);
}

.theme-icon.rotating {
  transform: rotate(180deg);
}

.theme-text {
  font-weight: 500;
  white-space: nowrap;
}

/* 图标动画 */
.sun-icon {
  animation: sunRotate 20s linear infinite;
}

.moon-icon {
  opacity: 0.9;
}

.auto-icon {
  opacity: 0.8;
}

@keyframes sunRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .theme-text {
    display: none;
  }
  
  .theme-toggle {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }
}
</style>