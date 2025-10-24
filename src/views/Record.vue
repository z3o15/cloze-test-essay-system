<template>
  <div class="record-container">
    <!-- 页面头部 -->
    <UnifiedHeader 
      type="form"
      title="录入作文"
      subtitle="Record Essay"
    >
      <template #actions>
        <ThemeToggle />
      </template>
    </UnifiedHeader>
    
    <!-- 年份选择 -->
    <div class="form-group">
      <div class="field-label">年份</div>
      <select 
        v-model="formData.year" 
        class="year-select"
      >
        <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
    
    <!-- 题目类型选择 -->
    <div class="form-group">
      <div class="field-label">题目类型</div>
      <div class="type-buttons">
        <button
          class="type-btn type-btn-primary"
          @click="formData.type = '英语一'"
        >
          英语一
        </button>
        <button
          class="type-btn type-btn-secondary"
          @click="formData.type = '英语二'"
        >
          英语二
        </button>
      </div>
    </div>
    
    <!-- 作文标题 -->
    <div class="form-group">
      <input
        v-model="formData.title"
        type="text"
        placeholder="请输入作文标题，例如：环境保护主题"
        class="title-input"
      />
    </div>
    
    <!-- 作文内容 -->
    <div class="form-group">
      <div class="textarea-container">
        <textarea
          v-model="formData.content"
          placeholder="请输入或粘贴作文内容.."
          class="content-textarea"
          @paste="handlePaste"
        ></textarea>
        <div class="char-count">已输入{{ formData.content.length }}字符</div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="button-group">
      <button class="btn btn-confirm" @click="submitForm">确认录入</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
// 移除未使用的导入
import { useStore } from '../store'
import UnifiedHeader from '../components/common/UnifiedHeader.vue'
import ThemeToggle from '../components/ui/ThemeToggle.vue'

interface FormData {
  year: string
  title: string
  type: string
  content: string
}

// 生成2005-2025年的年份选项数组
const yearOptions = Array.from({ length: 21 }, (_, i) => (2005 + i).toString())

// 表单数据
const formData = reactive<FormData>({
  year: '2024', // 默认显示2024
  title: '',
  type: '英语一', // 默认选中英语一
  content: ''
})

// 路由实例
const router = useRouter()
// 导入store
const store = useStore()

// 处理粘贴事件，保留原始格式
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  
  const pastedText = event.clipboardData?.getData('text') || ''
  
  const textarea = event.target as HTMLTextAreaElement
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  
  formData.content = 
    formData.content.substring(0, start) + 
    pastedText + 
    formData.content.substring(end)
  
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + pastedText.length
    textarea.focus()
  }, 0)
}



// 提交表单
const submitForm = async () => {
  // 验证表单
  if (!formData.title.trim() || !formData.content.trim()) {
    alert('请填写标题和内容')
    return
  }
  
  try {
    // 使用store的addEssay方法添加作文，确保数据一致性
    const essayToAdd = {
      year: formData.year,
      title: formData.title,
      type: formData.type,
      content: formData.content
    }
    
    // 调用store的addEssay方法（等待异步操作完成）
    await store.addEssay(essayToAdd)
    
    // 获取刚刚添加的作文（应该是数组中的第一个元素）
    if (store.essays && store.essays.length > 0) {
      const addedEssay = store.essays[0]
      if (addedEssay && addedEssay.id) {
        // 使用store中返回的实际ID跳转
        router.push(`/display/${addedEssay.id}`)
      } else {
        alert('作文添加成功但数据不完整，请刷新页面后查看')
      }
    } else {
      alert('作文添加成功但无法获取ID，请刷新页面后查看')
    }
    
  } catch (error) {
    // 处理重复内容错误
    if (error instanceof Error && error.message.includes('作文内容重复')) {
      alert('提交失败：作文内容重复，请检查是否已添加过相同内容的作文')
    } else {
      console.error('作文提交失败:', error)
      alert('作文提交失败，请重试')
    }
  }
}
</script>

<style scoped>
/* 容器样式 - Apple风格 */
.record-container {
  position: relative;
  width: 100%;
  max-width: 720px;
  padding: var(--spacing-xl) var(--spacing-lg);
  background-color: var(--color-background);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

/* 表单组样式 */
.form-group {
  margin-bottom: var(--spacing-xl);
}

/* 字段标签 */
.field-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  display: block;
  letter-spacing: -0.02em;
}

/* 年份选择 */
.year-select {
  width: 100%;
  height: 48px;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 0 var(--spacing-lg);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  cursor: pointer;
  appearance: none;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236B7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-lg) center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.year-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.year-select::-ms-expand {
  display: none;
}

/* 类型按钮 */
.type-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.type-btn {
  height: 48px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  backdrop-filter: blur(4px);
}

.type-btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.type-btn-secondary {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.type-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.type-btn:active {
  transform: translateY(0);
  opacity: 0.9;
}

/* 标题输入框 */
.title-input {
  width: 100%;
  height: 48px;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 0 var(--spacing-lg);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.title-input::placeholder {
  color: var(--color-text-light);
}

.title-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

/* 内容文本框 */
.content-textarea {
  width: 100%;
  height: 320px;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  resize: none;
  line-height: 1.6;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.content-textarea::placeholder {
  color: var(--color-text-light);
}

.content-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

/* 文本框容器 */
.textarea-container {
  position: relative;
  width: 100%;
}

/* 字符计数 - 移动到输入框内部 */
.char-count {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-light);
  pointer-events: none;
  z-index: 1;
  background-color: transparent;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  flex: 1;
  height: 48px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-confirm {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-confirm:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .record-container {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .form-group {
    margin-bottom: var(--spacing-lg);
  }
  
  /* 保持类型按钮横向布局 */
  .type-buttons {
    flex-direction: row;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .type-btn,
  .btn {
    min-height: 48px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .record-container {
    padding: var(--spacing-md);
  }
  
  .content-textarea {
    height: 280px;
  }
  
  .button-group {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
  }
}
</style>