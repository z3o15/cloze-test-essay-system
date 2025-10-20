<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
interface Props {
  actionWidth?: number; // Width of the action area (default: 100px)
  threshold?: number; // Threshold for triggering the action (default: 0.5)
  disabled?: boolean; // Disable swipe functionality
}

const props = withDefaults(defineProps<Props>(), {
  actionWidth: 100,
  threshold: 0.5,
  disabled: false
});

// Emits
const emit = defineEmits<{
  action: []; // Emitted when the action button is clicked
  open: []; // Emitted when the card is opened
  close: []; // Emitted when the card is closed
  swiping: [isSwiping: boolean]; // Emitted when swiping state changes
}>();

// State
const cardPosition = ref(0);
const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwiping = ref(false);
const isOpen = computed(() => cardPosition.value < 0);
const showActionArea = ref(false); // 控制操作区域的显示/隐藏

// Methods
const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled) return;
  
  const touches = e.touches;
  if (touches && touches.length > 0 && touches[0]) {
    touchStartX.value = touches[0].clientX;
    touchStartY.value = touches[0].clientY;
  }
  isSwiping.value = false;
  emit('swiping', true);
};

const handleTouchMove = (e: TouchEvent) => {
  if (props.disabled || !touchStartX.value) return;
  
  const touches = e.touches;
  if (!touches || touches.length === 0 || !touches[0]) return;
  
  const touchX = touches[0].clientX;
  const diffX = touchX - touchStartX.value;
  
  // Only consider horizontal swiping
  const touchY = touches[0].clientY;
  const diffY = Math.abs(touchY - touchStartY.value);
  
  if (Math.abs(diffX) > Math.abs(diffY) * 2) {
    // 当开始水平滑动时，显示操作区域
    if (!showActionArea.value) {
      showActionArea.value = true;
    }
    
    isSwiping.value = true;
    e.preventDefault(); // Prevent page scrolling
    
    // Limit swipe range between 0 and -actionWidth
    let newPosition = Math.max(-props.actionWidth, Math.min(0, diffX));
    
    // If already open, allow closing
    if (cardPosition.value < 0) {
      newPosition = Math.max(-props.actionWidth, Math.min(0, cardPosition.value + diffX));
    }
    
    cardPosition.value = newPosition;
  }
};

const handleTouchEnd = () => {
  if (props.disabled) return;
  
  // If swiping distance exceeds threshold, fully open; otherwise close
  if (cardPosition.value < -props.actionWidth * props.threshold) {
    cardPosition.value = -props.actionWidth;
    emit('open');
    // 保持操作区域显示
  } else {
    cardPosition.value = 0;
    emit('close');
    // 当完全关闭时，隐藏操作区域
    showActionArea.value = false;
  }
  
  touchStartX.value = 0;
  isSwiping.value = false;
  emit('swiping', false);
};

const handleContentClick = (e: Event) => {
  // If card is open, close it instead of propagating the click
  if (isOpen.value) {
    e.preventDefault();
    e.stopPropagation();
    close();
  }
};

const handleActionClick = (e: Event) => {
  e.stopPropagation();
  emit('action');
};

const open = () => {
  cardPosition.value = -props.actionWidth;
  emit('open');
};

const close = () => {
  cardPosition.value = 0;
  // 关闭时隐藏操作区域
  showActionArea.value = false;
  emit('close');
};

const reset = () => {
  cardPosition.value = 0;
  touchStartX.value = 0;
  isSwiping.value = false;
  // 重置时隐藏操作区域
  showActionArea.value = false;
};

// Expose methods to parent
defineExpose({
  open,
  close,
  reset,
  isOpen
});
</script>

<template>
  <div class="swipeable-card-container">
    <!-- Swipeable content -->
    <div 
      class="swipeable-content"
      :style="{ transform: `translateX(${cardPosition}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleContentClick"
    >
      <slot></slot>
    </div>
    
    <!-- Action area - 动态显示/隐藏 -->
    <div 
      class="swipe-action"
      :style="{ 
        width: `${actionWidth}px`,
        opacity: showActionArea ? 1 : 0,
        pointerEvents: showActionArea ? 'auto' : 'none'
      }"
      @click="handleActionClick"
    >
      <slot name="action"></slot>
    </div>
  </div>
</template>

<style scoped>
.swipeable-card-container {
  position: relative;
  height: auto;
  overflow: hidden;
  border-radius: inherit;
  box-shadow: inherit;
}

.swipeable-content {
  position: relative;
  z-index: 2;
  width: 100%;
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: inherit;
  box-sizing: border-box;
  overflow: hidden;
}

.swipeable-content:active {
  background-color: #f5f5f5;
}

/* 滑动操作按钮容器 */
.swipe-action {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  cursor: pointer;
  /* 确保按钮区域与内容区域高度一致 */
  box-sizing: border-box;
  border-radius: 0 16px 16px 0; /* 右侧圆角与列表项一致 */
  transition: opacity 0.3s ease; /* 平滑过渡显示/隐藏 */
}
</style>