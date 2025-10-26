<template>
  <div class="manage-container">
    <!-- 顶部横幅 -->
    <UnifiedHeader 
      type="banner"
      title="作文管理" 
      subtitle="管理和查看您的作文练习"
    >
      <template #actions>
        <ThemeToggle />
      </template>
    </UnifiedHeader>

    <!-- 搜索栏 -->
    <SearchBar 
      v-model="searchQuery"
      placeholder="搜索作文标题或内容..."
      @search="handleSearch"
    />

    <!-- 作文列表 -->
    <EssayList 
      :essays="displayList"
      empty-text="还没有作文，快来创建第一篇吧！"
      @item-click="handleItemClick"
      @delete="handleDelete"
      @create-essay="navigateToRecord"
    />

    <!-- 浮动操作按钮 -->
    <FloatingActionButton 
      icon="plus"
      @click="navigateToRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import { showConfirmDialog } from 'vant'

// 组件导入
import UnifiedHeader from '../components/common/UnifiedHeader.vue'
import SearchBar from '../components/ui/SearchBar.vue'
import EssayList from '../components/essay/EssayList.vue'
import FloatingActionButton from '../components/ui/FloatingActionButton.vue'
import ThemeToggle from '../components/ui/ThemeToggle.vue'

// 路由和状态管理
const router = useRouter()
const store = useStore()

// 响应式数据
const searchQuery = ref('')
const loading = ref(false)

// 计算属性
const displayList = computed(() => {
  const essays = store.essays || []
  if (!searchQuery.value.trim()) {
    return essays
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return essays.filter(essay => 
    essay.title?.toLowerCase().includes(query) ||
    essay.content?.toLowerCase().includes(query)
  )
})

// 方法定义
const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleItemClick = (essay: any) => {
  router.push({
    name: 'display',
    params: { id: essay.id }
  })
}

const handleDelete = async (essayId: string) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这篇作文吗？此操作不可撤销。',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    
    await store.deleteEssay(essayId)
  } catch (error) {
    // 用户取消删除或删除失败，静默处理
  }
}

const navigateToRecord = () => {
  router.push('/record')
}



// 生命周期
onMounted(() => {
  loading.value = true
  try {
    // 统一使用store加载数据
    store.loadEssays()
  } catch (error) {
    // 加载失败时静默处理
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 容器 */
.manage-container {
  min-height: 100vh;
  background-color: var(--color-background);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

/* 滚动条隐藏 */
.manage-container::-webkit-scrollbar {
  display: none;
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

/* API测试按钮样式 */
.api-test-btn {
  padding: 8px 16px;
  margin-right: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.api-test-btn:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}


</style>