<template>
  <div class="hero-banner">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-subtitle">{{ subtitle }}</p>
      </div>
      <div class="hero-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="hero-icon">
      <van-icon name="notes-o" size="24" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

withDefaults(defineProps<Props>(), {
  title: '作文管理',
  subtitle: '管理和查看您的作文练习'
})
</script>

<style scoped>
/* 顶部横幅 - Apple风格的渐变横幅 */
.hero-banner {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary) 100%);
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.hero-text {
  flex: 1;
}

.hero-actions {
  flex-shrink: 0;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.hero-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.hero-icon {
  position: absolute;
  right: 20px;
  top: 36px;
  width: 48px;
  height: 48px;
  background: var(--color-primary-bg);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
  transition: background-color 0.2s ease;
}

.hero-icon:hover {
  background: var(--color-primary-hover);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-banner {
    padding: 32px 16px 40px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-icon {
    width: 44px;
    height: 44px;
    right: 16px;
    top: 32px;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    padding: 28px 16px 36px;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
  }
  
  .hero-title {
    font-size: 26px;
  }
  
  .hero-subtitle {
    font-size: 15px;
  }
  
  .hero-icon {
    width: 40px;
    height: 40px;
    right: 16px;
    top: 28px;
  }
}
</style>