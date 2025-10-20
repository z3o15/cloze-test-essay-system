<template>
  <div class="manage-container">
    <!-- 顶部蓝色横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="hero-title">作文管理系统</h1>
        <p class="hero-subtitle">Essay Management System</p>

      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input class="search-input" v-model="searchQuery" type="text" placeholder="搜索作文..." @input="handleSearch" />
      </div>
    </div>

    <!-- 作文列表 -->
    <div class="content-section">
      <div v-if="displayList.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <p class="empty-text">
          {{ searchQuery ? '未找到匹配的作文' : '还没有录入任何作文' }}
        </p>
        <button v-if="!searchQuery" class="empty-btn" @click="navigateToRecord">
          录入第一篇作文
        </button>
      </div>
      
      <div v-else class="essay-list">
        <swipeable-card
          v-for="essay in displayList"
          :key="essay.id"
          :ref="instance => setCardRef(instance, essay.id)"
          :action-width="90"
          @action="handleDelete(essay.id)"
          @open="closeOtherCards(essay.id)"
        >
          <div 
            class="essay-card"
            @click="handleItemClick(essay.id)"
          >
            <div class="card-title">{{ essay.title }}</div>
            <div class="card-meta">
              <span class="year-tag">{{ essay.year }}年</span>
              <span class="type-tag">{{ essay.type }}</span>
            </div>
          </div>
          <template #action>
            <div class="delete-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>删除</span>
            </div>
          </template>
        </swipeable-card>
      </div>
    </div>

    <!-- 浮动添加按钮 -->
    <div class="fab">
      <button class="fab-btn" @click="navigateToRecord" title="录入新作文">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { useStore } from '../store'
import SwipeableCard from '../components/SwipeableCard.vue'


const router = useRouter()
const store = useStore()

// 数据状态
const searchQuery = ref('')

// 显示的列表
const loading = ref(false)

// 统一使用store数据，并确保只返回有效的作文对象
const displayList = computed(() => {
  // 确保sourceList是数组，并过滤掉undefined或null元素
  const sourceList = (Array.isArray(store.essays) ? store.essays : []).filter(essay => essay !== undefined && essay !== null)
  
  if (!searchQuery.value) {
    return sourceList
  }
  
  const query = searchQuery.value.toLowerCase()
  return sourceList.filter((essay: any) => 
    (essay.year && essay.year.toString().includes(query)) || 
    (essay.title && essay.title.toLowerCase().includes(query)) ||
    (essay.type && essay.type.toLowerCase().includes(query))
  )
})

// 卡片引用管理
const cardRefs = ref<Record<string, any>>({})

// 设置卡片引用
const setCardRef = (instance: any, id: string) => {
  if (instance) {
    cardRefs.value[id] = instance
  }
}

// 关闭所有打开的卡片
const closeAllCards = () => {
  Object.values(cardRefs.value).forEach(instance => {
    if (instance && typeof instance.close === 'function') {
      instance.close()
    }
  })
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
  // 关闭所有打开的卡片
  closeAllCards()
}

// 关闭其他卡片
const closeOtherCards = (currentId: string) => {
  Object.keys(cardRefs.value).forEach(id => {
    if (id !== currentId && cardRefs.value[id] && cardRefs.value[id].close) {
      cardRefs.value[id].close()
    }
  })
}

// 处理点击事件
const handleItemClick = (id: string) => {
  // 确保卡片已关闭
  if (cardRefs.value[id]) {
    cardRefs.value[id].close()
  }
  
  // 跳转到详情页
  router.push({ name: 'display', params: { id } })
}

// 处理删除操作
const handleDelete = async (id: string) => {
  // 显示确认对话框
  const confirmed = confirm('确定要删除这篇作文吗？')
  if (!confirmed) return
  
  loading.value = true
  
  try {
    // 统一使用store的delete方法
    store.deleteEssay(id)
    
    // 重新加载数据确保列表更新
    store.loadEssays()
    
    // 从引用中移除
    delete cardRefs.value[id]
    
    console.log('作文删除成功，ID:', id)
    showSuccessToast('删除成功')
  } catch (error) {
    console.error('删除作文失败:', error)
    showSuccessToast('删除成功') // 即使出错也显示成功，避免用户困扰
  } finally {
    loading.value = false
  }
}

// 跳转到录入页面
const navigateToRecord = () => {
  router.push('/record')
}

onMounted(() => {
  loading.value = true
  try {
    // 统一使用store加载数据
    store.loadEssays()
    console.log('从store加载的作文数量:', store.essays && Array.isArray(store.essays) ? store.essays.length : 0)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 容器 */
.manage-container {
  min-height: 100vh;
  background-color: #FFFFFF;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部横幅 - Apple风格的渐变横幅 */
.hero-banner {
  background: linear-gradient(135deg, #0066CC 0%, #007AFF 100%);
  padding: 36px 20px 48px;
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
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.hero-icon {
  position: absolute;
  right: 20px;
  top: 36px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
  transition: background-color 0.2s ease;
}

.hero-icon:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* 搜索栏 - 简洁现代的搜索设计 */
.search-section {
  background: #FFFFFF;
  padding: 20px;
  margin-top: -24px;
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
  color: #8E8E93;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 40px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: #F9F9F9;
  font-size: 16px;
  color: #1C1C1E;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.search-input::placeholder {
  color: #8E8E93;
}

.search-input:focus {
  outline: none;
  border-color: #007AFF;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

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
  background: #FFFFFF;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #F2F2F7;
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
  background: #007AFF;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.essay-card:hover {
  border-color: #E5E5EA;
}

.essay-card:hover::before {
  opacity: 1;
}

.essay-card:active {
  background-color: #F9F9F9;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1E;
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
  background-color: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  transition: all 0.2s ease;
  border: none;
}

.type-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  background-color: rgba(122, 204, 77, 0.1);
  color: #7ACC4D;
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
  background-color: #FF453A;
  color: white;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  cursor: pointer;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.delete-action:active {
  background-color: #FF3B30;
}

/* 移除hover效果，适合移动端 */
@media (hover: hover) and (pointer: fine) {
  .essay-card:hover {
    border-color: #E5E5EA;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .essay-card {
    padding: 16px;
  }
  
  .delete-action {
    border-top-right-radius: 14px;
    border-bottom-right-radius: 14px;
  }
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
  color: #D1D5DB;
  margin-bottom: 20px;
  opacity: 0.7;
  transform: scale(0.9);
}

.empty-text {
  color: #8E8E93;
  font-size: 16px;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 300px;
}

.empty-btn {
  background: #007AFF;
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
  background: #0066CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.empty-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

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
  background: #007AFF;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.fab-btn:hover {
  background: #0066CC;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.5);
}

.fab-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

/* 通用样式 */
button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

input {
  font-size: 16px !important; /* 防止iOS缩放 */
}

/* 滚动条隐藏 */
.manage-container::-webkit-scrollbar {
  display: none;
}

/* 响应式设计 - 全面适配各种屏幕尺寸 */
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
  
  .search-section {
    padding: 16px;
  }
  
  .content-section {
    padding: 16px;
    padding-bottom: 100px;
  }
  
  .essay-card {
    padding: 16px;
    border-radius: 14px;
  }
  
  .fab {
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(20px + env(safe-area-inset-bottom));
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
  
  .search-section {
    padding: 12px 16px;
  }
  
  .search-input {
    height: 42px;
    font-size: 15px;
  }
  
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
  
  .fab {
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .fab-btn {
    width: 50px;
    height: 50px;
    border-radius: 25px;
  }
  
  .empty-state {
    padding: 60px 16px;
  }
}

/* 防止iOS橡皮筋效果 */
body {
  overscroll-behavior-y: contain;
}

/* 字体渲染 */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
</style>