<template>
  <div class="content-section">
    <!-- 空状态 -->
    <div v-if="essays.length === 0" class="empty-state">
      <van-icon name="notes-o" size="64" class="empty-icon" />
      <p class="empty-text">{{ emptyText }}</p>
      <button class="empty-btn" @click="handleCreateEssay">
        开始创建第一篇作文
      </button>
    </div>

    <!-- 作文列表 -->
    <div v-else class="essay-list">
      <SwipeableCard
        v-for="essay in essays"
        :key="essay.id"
        :ref="(el) => setCardRef(essay.id!, el)"
        @click="() => handleItemClick(essay)"
        @delete="() => handleDelete(essay.id!)"
        @close-others="closeOtherCards"
      >
        <div class="essay-card">
          <h3 class="card-title">{{ essay.title }}</h3>
          <div class="card-meta">
            <span class="year-tag">{{ formatYear(essay.createTime) }}</span>
            <span class="type-tag">{{ formatType(essay.type) }}</span>
          </div>
        </div>
        <template #action>
          <div class="delete-action">
            <van-icon name="delete-o" size="16" />
            删除
          </div>
        </template>
      </SwipeableCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SwipeableCard from '../ui/SwipeableCard.vue'

import type { Essay } from '../../utils/essayService'

interface ExtendedEssay extends Essay {
  updateTime?: string
  difficulty?: string
  tags?: string[]
  wordCount?: number
  readingTime?: number
  source?: string
  author?: string
  description?: string
}

interface Props {
  essays: ExtendedEssay[]
  emptyText?: string
}

interface Emits {
  (e: 'item-click', essay: Essay): void
  (e: 'delete', essayId: string): void
  (e: 'create-essay'): void
}

withDefaults(defineProps<Props>(), {
  emptyText: '还没有作文，快来创建第一篇吧！'
})

const emit = defineEmits<Emits>()

// 卡片引用管理
const cardRefs = ref<Map<string, any>>(new Map())

const setCardRef = (id: string, el: any) => {
  if (el) {
    cardRefs.value.set(id, el)
  } else {
    cardRefs.value.delete(id)
  }
}

const closeOtherCards = (currentId: string) => {
  cardRefs.value.forEach((cardRef, id) => {
    if (id !== currentId && cardRef?.closeCard) {
      cardRef.closeCard()
    }
  })
}

// 事件处理
const handleItemClick = (essay: Essay) => {
  emit('item-click', essay)
}

const handleDelete = (essayId: string) => {
  emit('delete', essayId)
}

const handleCreateEssay = () => {
  emit('create-essay')
}

// 格式化函数
const formatYear = (createTime?: string): string => {
  if (!createTime) return '未知'
  return new Date(createTime).getFullYear().toString()
}

const formatType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'cloze': '完形填空',
    'reading': '阅读理解',
    'writing': '写作练习'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
/* 内容区域 */
.content-section {
  padding: 20px;
  padding-bottom: 100px;
  max-width: 720px;
  margin: 0 auto;
}

/* 作文列表 */
.essay-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 作文卡片样式 */
.essay-card {
  background: var(--color-bg-elevated);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid var(--color-border);
  position: relative;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.essay-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.essay-card:hover {
  border-color: var(--color-border-hover);
}

.essay-card:hover::before {
  opacity: 1;
}

.essay-card:active {
  background-color: var(--color-bg-soft);
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.5;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0;
  width: 100%;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: 10px;
}

.year-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  background-color: var(--color-info-bg);
  color: var(--color-primary);
  transition: all 0.2s ease;
  border: none;
}

.type-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  background-color: var(--color-success-bg);
  color: var(--color-success);
  transition: all 0.2s ease;
  border: none;
}

/* 删除操作按钮样式 */
.delete-action {
  height: 100%;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-error);
  color: white;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  cursor: pointer;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.delete-action:active {
  background-color: var(--color-error-600);
}

/* 空状态 - Apple风格的空状态设计 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  color: var(--color-text-light);
  margin-bottom: 20px;
  opacity: 0.7;
  transform: scale(0.9);
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 16px;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 300px;
}

.empty-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.empty-btn:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-primary-shadow);
}

.empty-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px var(--color-primary-shadow);
}

/* 移除hover效果，适合移动端 */
@media (hover: hover) and (pointer: fine) {
  .essay-card:hover {
    border-color: var(--color-border-hover);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .content-section {
    padding: 16px;
    padding-bottom: 100px;
  }
  
  .essay-card {
    padding: 16px;
  }
  
  .delete-action {
    border-top-right-radius: 14px;
    border-bottom-right-radius: 14px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
    padding-bottom: 96px;
  }
  
  .essay-card {
    padding: 14px;
    border-radius: 12px;
  }
  
  .card-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .card-meta {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  
  .year-tag,
  .type-tag {
    font-size: 12px;
    padding: 5px 10px;
  }
  
  .delete-action {
    font-size: 12px;
    padding: 5px 10px;
  }
  
  .empty-state {
    padding: 60px 16px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.essay-card {
  animation: fadeIn 0.3s ease-out;
}

/* 通用样式 */
button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
</style>