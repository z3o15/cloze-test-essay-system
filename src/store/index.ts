import { reactive } from 'vue'

// 定义作文数据类型
export interface Essay {
  id: string
  year: string
  title: string
  type: string
  content: string
  createTime: string
}

// 状态管理接口
interface Store {
  essays: Essay[]
  addEssay: (essay: Omit<Essay, 'id' | 'createTime'>) => void
  deleteEssay: (id: string) => void
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
      console.log('开始从localStorage加载数据')
      const data = localStorage.getItem('essays')
      console.log('localStorage中的原始数据:', data)
      
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          console.log('解析后的数据:', parsedData)
          console.log('解析后的数据类型:', Array.isArray(parsedData) ? '数组' : typeof parsedData)
          console.log('解析后的数据长度:', Array.isArray(parsedData) ? parsedData.length : 0)
          
          // 确保是数组
          if (Array.isArray(parsedData)) {
            // 使用替换数组的方式确保响应式更新
            state.essays.splice(0, state.essays.length, ...parsedData)
            console.log('成功加载数据到state.essays，数量:', state.essays.length)
            if (state.essays.length > 0 && state.essays[0]) {
              console.log('加载的第一篇作文:', state.essays[0].title)
            }
          } else {
            console.log('localStorage中的数据不是数组格式')
            state.essays = []
          }
        } catch (parseError) {
          console.error('解析JSON数据失败:', parseError)
          state.essays = []
        }
      } else {
        console.log('localStorage中没有essays数据')
        state.essays = []
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      state.essays = []
    }
  }

  // 保存数据到localStorage
  const saveEssays = () => {
    try {
      console.log('保存数据到localStorage，当前essays数量:', state.essays.length)
      localStorage.setItem('essays', JSON.stringify(state.essays))
      console.log('数据保存成功')
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 添加作文
  const addEssay = (essay: Omit<Essay, 'id' | 'createTime'>) => {
    console.log('开始添加作文:', essay.title)
    
    // 检查是否已存在内容相同的作文（去重逻辑）
    const contentNormalized = essay.content.trim().replace(/\s+/g, ' ')
    const isDuplicate = state.essays.some(existingEssay => {
      const existingContentNormalized = existingEssay.content.trim().replace(/\s+/g, ' ')
      return existingContentNormalized === contentNormalized
    })
    
    if (isDuplicate) {
      console.warn('作文内容重复，已存在相同内容的作文')
      throw new Error('作文内容重复，已存在相同内容的作文')
    }
    
    const newEssay: Essay = {
      ...essay,
      id: Date.now().toString(),
      createTime: new Date().toISOString()
    }
    console.log('创建的新作文对象:', newEssay)
    
    // 使用unshift添加到数组开头
    state.essays.unshift(newEssay)
    console.log('添加后state.essays数量:', state.essays.length)
    
    // 保存到localStorage
    saveEssays()
    console.log('addEssay方法执行完成')
  }

  // 删除作文
  const deleteEssay = (id: string) => {
    console.log('开始删除作文，ID:', id)
    const index = state.essays.findIndex(e => e.id === id)
    if (index > -1) {
      state.essays.splice(index, 1)
      console.log('删除后state.essays数量:', state.essays.length)
      saveEssays()
    } else {
      console.log('未找到要删除的作文，ID:', id)
    }
  }

  // 获取作文
  const getEssay = (id: string): Essay | undefined => {
    console.log('获取作文，ID:', id)
    const essay = state.essays.find(e => e.id === id)
    console.log('获取结果:', essay ? '找到' : '未找到')
    return essay
  }

  // 返回状态和方法，确保essays的响应式引用正确传递
  return {
    // 使用getter函数来获取最新的essays数组，确保组件总是能访问到最新状态
    get essays() {
      return state.essays;
    },
    addEssay,
    deleteEssay,
    getEssay,
    loadEssays,
    saveEssays
  } as Store
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