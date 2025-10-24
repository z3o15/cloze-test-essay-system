import { reactive } from 'vue'
import type { Essay } from '../utils/essayService'
import { processEssayAsync } from '../utils/backendEssayService'

// 重新导出Essay类型以保持向后兼容
export type { Essay }

// 状态管理接口
interface Store {
  essays: Essay[]
  addEssay: (essay: Omit<Essay, 'id' | 'createTime'>) => Promise<void>
  deleteEssay: (id: string) => Promise<void>
  getEssay: (id: string) => Essay | undefined
  loadEssays: () => void
  saveEssays: () => void
}

// 创建store实例
const createStore = (): Store => {
  // 使用reactive创建响应式状态
  const state = reactive({
    essays: [] as Essay[]
  })

  // 从localStorage加载数据
  const loadEssays = () => {
    try {
      const data = localStorage.getItem('essays')
      
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          
          // 确保是数组
          if (Array.isArray(parsedData)) {
            // 使用替换数组的方式确保响应式更新
            state.essays.splice(0, state.essays.length, ...parsedData)
          } else {
            state.essays = []
          }
        } catch (parseError) {
          state.essays = []
        }
      } else {
        state.essays = []
      }
    } catch (error) {
      state.essays = []
    }
  }

  // 保存数据到localStorage
  const saveEssays = () => {
    try {
      localStorage.setItem('essays', JSON.stringify(state.essays))
    } catch (error) {
      // 保存失败时静默处理
    }
  }

  // 添加作文
  const addEssay = async (essay: Omit<Essay, 'id' | 'createTime'>) => {
    // 检查是否已存在内容相同的作文（去重逻辑）
    const contentNormalized = essay.content.trim().replace(/\s+/g, ' ')
    const isDuplicate = state.essays.some(existingEssay => {
      const existingContentNormalized = existingEssay.content.trim().replace(/\s+/g, ' ')
      return existingContentNormalized === contentNormalized
    })
    
    if (isDuplicate) {
      throw new Error('作文内容重复，已存在相同内容的作文')
    }
    
    const newEssay: Essay = {
      ...essay,
      id: Date.now().toString(),
      createTime: new Date().toISOString()
    }
    
    // 使用unshift添加到数组开头
    state.essays.unshift(newEssay)
    
    // 保存到localStorage
    saveEssays()
    
    // 异步处理作文：调用后端API翻译段落并提取单词保存到数据库
    // 这个过程不会阻塞用户界面
    processEssayAsync(essay.content, essay.title).catch(error => {
      console.error('作文处理失败:', error)
      // 这里可以添加用户通知逻辑，但不影响作文保存
    })
  }

  // 删除作文
  const deleteEssay = async (id: string) => {
    const index = state.essays.findIndex(essay => essay.id === id)
    if (index !== -1) {
      state.essays.splice(index, 1)
      saveEssays()
    }
  }

  // 获取作文
  const getEssay = (id: string): Essay | undefined => {
    return state.essays.find(e => e.id === id)
  }



  // 返回状态和方法，确保essays的响应式引用正确传递
  return {
    essays: state.essays,
    addEssay,
    deleteEssay,
    getEssay,
    loadEssays,
    saveEssays
  }
}

// 创建store实例
const store = createStore()

// 立即加载数据
store.loadEssays()

// 导出store
export const useStore = (): Store => {
  return store
}

export default store