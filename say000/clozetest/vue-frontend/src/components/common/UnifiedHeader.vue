<template>
  <div class="unified-header" :class="headerClass">
    <!-- 主页横幅类型 -->
    <div v-if="type === 'banner'" class="banner-header">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="banner-title">{{ title }}</h1>
          <p class="banner-subtitle">{{ subtitle }}</p>
        </div>
        <div class="banner-actions">
          <slot name="actions">
            <ThemeToggle />
          </slot>
        </div>
      </div>
      <div class="banner-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
    </div>

    <!-- 详情页头部类型 -->
    <div v-else-if="type === 'detail'" class="detail-header">
      <div class="detail-content">
        <div class="detail-left">
          <button class="back-btn" @click="$emit('back')" title="返回管理页面">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回</span>
          </button>
        </div>
        <div class="detail-right">
          <slot name="actions">
            <ThemeToggle />
          </slot>
        </div>
      </div>
    </div>

    <!-- 录入页头部类型 -->
    <div v-else-if="type === 'form'" class="form-header">
      <div class="form-content">
        <div class="form-text">
          <h1 class="form-title">{{ title }}</h1>
          <p class="form-subtitle">{{ subtitle }}</p>
        </div>
        <div class="form-actions">
          <slot name="actions">
            <ThemeToggle />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ThemeToggle from '../ui/ThemeToggle.vue'

interface Props {
  type: 'banner' | 'detail' | 'form'
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'banner',
  title: '',
  subtitle: ''
})

defineEmits<{
  back: []
}>()

const headerClass = computed(() => {
  return `header-${props.type}`
})
</script>

<style scoped>
/* 基础头部样式 */
.unified-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-md);
}

/* 横幅类型头部 - 主页使用 */
.header-banner .banner-header {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary) 100%);
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.banner-text {
  flex: 1;
}

.banner-actions {
  flex-shrink: 0;
}

.banner-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.banner-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

.banner-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

/* 详情页头部 */
.header-detail .detail-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 100%);
  padding: 24px 20px;
}

.detail-content {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-left {
  display: flex;
  align-items: center;
}

.back-btn {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
}

.detail-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表单页头部 */
.header-form .form-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 100%);
  padding: 24px 20px;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}

.form-content {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.form-text {
  flex: 1;
}

.form-actions {
  flex-shrink: 0;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.form-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content,
  .detail-content,
  .form-content {
    gap: 16px;
  }
  
  .banner-title,
  .form-title {
    font-size: 24px;
  }
  
  .banner-subtitle,
  .form-subtitle {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header-banner .banner-header,
  .header-form .form-header {
    padding: 20px 16px;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
  }
  
  .header-detail .detail-header {
    padding: 20px 16px;
  }
  
  .banner-content,
  .detail-content,
  .form-content {
    gap: 12px;
  }
  
  .banner-title,
  .form-title {
    font-size: 22px;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 防止iOS缩放 */
input, button {
  font-size: 16px !important;
}

/* 字体渲染优化 */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>