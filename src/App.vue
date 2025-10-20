<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from './store'

const store = useStore()

// 组件挂载时确保数据已加载
onMounted(() => {
  store.loadEssays()
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Apple 风格色彩定义 - 极简灰白蓝配色 */
  --color-primary: #0066CC;
  --color-primary-hover: #0055AA;
  --color-primary-light: #EBF5FF;
  --color-text-primary: #1D1D1F;
  --color-text-secondary: #86868B;
  --color-text-light: #A1A1A6;
  --color-background: #FFFFFF;
  --color-background-secondary: #F5F5F7;
  --color-background-tertiary: #E8E8ED;
  --color-border: #D2D2D7;
  --color-border-light: #E5E5EA;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-error: #FF3B30;
  
  /* 阴影效果 - Apple 风格柔和阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.1);
  
  /* 圆角定义 - Apple 风格大圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-full: 9999px;
  
  /* 间距标准 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 40px;
  --spacing-3xl: 56px;
  
  /* 字体定义 - Apple 系统字体优先 */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #64B5F6;
    --color-primary-hover: #42A5F5;
    --color-primary-light: #0D47A1;
    --color-text-primary: #F5F5F7;
    --color-text-secondary: #86868B;
    --color-text-light: #6E6E73;
    --color-background: #111111;
    --color-background-secondary: #1C1C1E;
    --color-background-tertiary: #2C2C2E;
    --color-border: #3A3A3C;
    --color-border-light: #2C2C2E;
    --color-success: #34C759;
    --color-warning: #FF9500;
    --color-error: #FF453A;
    
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.6);
  }
}

body {
  background-color: var(--color-background-secondary);
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  font-family: inherit;
  overflow-x: hidden;
}

#app {
  max-width: 720px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--color-background);
  position: relative;
  overflow: hidden;
}

/* 移动端适配 */
@media (max-width: 768px) {
  #app {
    max-width: 100%;
  }
}

/* 公共容器样式 */
.display-container, .record-container, .manage-container {
  padding-bottom: var(--spacing-2xl);
  background-color: var(--color-background);
}

/* 卡片式布局样式 - Apple 风格卡片 */
.card {
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 按钮基础样式 - Apple 风格按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 44px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(4px);
}

.btn:active {
  transform: scale(0.98);
}

/* 主按钮样式 */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

/* 次要按钮样式 */
.btn-secondary {
  background-color: var(--color-background-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border-light);
}

/* 输入框样式 - Apple 风格输入框 */
.input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
  font-family: inherit;
  backdrop-filter: blur(4px);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.input::placeholder {
  color: var(--color-text-light);
}

/* 标签样式 - Apple 风格标签 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  backdrop-filter: blur(4px);
}

.tag-primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-success {
  background-color: rgba(52, 199, 89, 0.1);
  color: var(--color-success);
}

.tag-warning {
  background-color: rgba(255, 149, 0, 0.1);
  color: var(--color-warning);
}

/* 滚动条样式 - Apple 风格滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-light);
}

/* 动画效果 - Apple 风格动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(var(--spacing-md));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 加载动画 - Apple 风格加载 */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.loading-pulse {
  animation: pulse 1.2s infinite ease-in-out;
}

/* 响应式工具类 - Apple 风格响应式 */
.container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .card {
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
  }
  
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .section-title {
    font-size: 18px;
  }
}

/* 通用过渡效果 */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-duration: 0.2s;
}

/* 文本选择样式 */
::selection {
  background-color: rgba(0, 102, 204, 0.2);
  color: var(--color-text-primary);
}

::-moz-selection {
  background-color: rgba(0, 102, 204, 0.2);
  color: var(--color-text-primary);
}
</style>
