<template>
  <div class="fab">
    <button class="fab-btn" @click="handleClick" :disabled="disabled">
      <van-icon :name="icon" :size="iconSize" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  iconSize?: string | number
  disabled?: boolean
}

interface Emits {
  (e: 'click'): void
}

withDefaults(defineProps<Props>(), {
  icon: 'plus',
  iconSize: '24',
  disabled: false
})

const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
/* 浮动按钮 - Apple风格的浮动操作按钮 */
.fab {
  position: fixed;
  right: calc(20px + env(safe-area-inset-right));
  bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: 10;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--color-primary);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px var(--color-primary-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.fab-btn:hover {
  background: var(--color-primary-600);
  transform: scale(1.05);
  box-shadow: 0 6px 20px var(--color-primary-shadow);
}

.fab-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px var(--color-primary-shadow);
}

.fab-btn:disabled {
  background: var(--color-text-light);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-md);
}

.fab-btn:disabled:hover {
  background: var(--color-text-light);
  transform: none;
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fab {
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(20px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 480px) {
  .fab {
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .fab-btn {
    width: 50px;
    height: 50px;
    border-radius: 25px;
  }
}
</style>