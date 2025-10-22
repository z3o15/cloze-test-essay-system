// 作文服务模块
import httpClient from './httpClient'

// 作文类型常量
export const ESSAY_TYPES = {
  CET4: 'CET-4',
  CET6: 'CET-6',
  TOEFL: 'TOEFL',
  IELTS: 'IELTS',
  GRE: 'GRE',
  GMAT: 'GMAT',
  OTHER: '其他'
} as const

// 作文接口
export interface Essay {
  id: string
  title: string
  content: string
  year: string
  type: string
  createTime: string
}

// 验证作文数据
const validateEssay = (essay: any): boolean => {
  return essay &&
         typeof essay.title === 'string' &&
         typeof essay.content === 'string' &&
         typeof essay.year === 'string' &&
         typeof essay.type === 'string'
}

// 格式化创建时间
const formatCreateTime = (date: Date): string => {
  return date.toISOString()
}

// 计算字数
export const calculateWordCount = (content: string): number => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

// 估算阅读时间（按每分钟200词计算）
export const estimateReadingTime = (content: string): number => {
  const wordCount = calculateWordCount(content)
  return Math.ceil(wordCount / 200)
}

// 分析文章难度
export const analyzeDifficulty = (content: string): 'easy' | 'medium' | 'hard' => {
  const wordCount = calculateWordCount(content)
  const avgWordLength = content.replace(/\s+/g, '').length / wordCount
  
  if (wordCount < 200 && avgWordLength < 5) {
    return 'easy'
  } else if (wordCount < 400 && avgWordLength < 6) {
    return 'medium'
  } else {
    return 'hard'
  }
}

// 提取关键词
export const extractTags = (content: string): string[] => {
  // 简单的关键词提取逻辑
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
  const frequency: Record<string, number> = {}
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}

// 处理作文数据
export const processEssayData = (essay: Omit<Essay, 'id' | 'createTime'>): Essay => {
  return {
    ...essay,
    id: generateEssayId(),
    createTime: formatCreateTime(new Date())
  }
}

// 生成作文ID
export const generateEssayId = (): string => {
  return `essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 保存作文到后端
export const saveEssayToBackend = async (essay: Omit<Essay, 'id' | 'createTime'>): Promise<Essay> => {
  if (!validateEssay(essay)) {
    throw new Error('作文数据格式不正确')
  }

  try {
    const processedEssay = processEssayData(essay)
    
    const response = await httpClient.post('/api/essays', processedEssay)
    
    if (response.data && response.data.id) {
      return response.data
    } else {
      // 如果后端没有返回完整数据，返回处理后的数据
      return processedEssay
    }
  } catch (error: any) {
    console.error('保存作文到后端失败:', error)
    
    // 如果后端保存失败，仍然返回处理后的数据（本地保存）
    return processEssayData(essay)
  }
}

// 保存作文到本地存储
export const saveEssayToLocal = (essay: Essay): void => {
  try {
    const essays = getLocalEssays()
    essays.push(essay)
    localStorage.setItem('essays', JSON.stringify(essays))
  } catch (error) {
    console.error('保存作文到本地失败:', error)
  }
}

// 获取本地作文列表
export const getLocalEssays = (): Essay[] => {
  try {
    const stored = localStorage.getItem('essays')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('获取本地作文失败:', error)
    return []
  }
}

// 从后端获取作文列表
export const fetchEssaysFromBackend = async (): Promise<Essay[]> => {
  try {
    const response = await httpClient.get('/api/essays')
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.filter(validateEssay)
    } else {
      return []
    }
  } catch (error) {
    console.error('从后端获取作文失败:', error)
    return []
  }
}

// 删除作文
export const deleteEssay = async (id: string): Promise<boolean> => {
  try {
    // 尝试从后端删除
    await httpClient.delete(`/api/essays/${id}`)
    
    // 同时从本地删除
    const essays = getLocalEssays()
    const filteredEssays = essays.filter(essay => essay.id !== id)
    localStorage.setItem('essays', JSON.stringify(filteredEssays))
    
    return true
  } catch (error) {
    console.error('删除作文失败:', error)
    
    // 如果后端删除失败，仍然尝试本地删除
    try {
      const essays = getLocalEssays()
      const filteredEssays = essays.filter(essay => essay.id !== id)
      localStorage.setItem('essays', JSON.stringify(filteredEssays))
      return true
    } catch (localError) {
      console.error('本地删除作文失败:', localError)
      return false
    }
  }
}

// 更新作文
export const updateEssay = async (id: string, updates: Partial<Essay>): Promise<Essay | null> => {
  try {
    // 尝试更新后端
    const response = await httpClient.put(`/api/essays/${id}`, updates)
    
    if (response.data) {
      // 同时更新本地
      const essays = getLocalEssays()
      const index = essays.findIndex(essay => essay.id === id)
      if (index !== -1) {
        essays[index] = { ...essays[index], ...updates }
        localStorage.setItem('essays', JSON.stringify(essays))
      }
      
      return response.data
    }
    
    return null
  } catch (error) {
    console.error('更新作文失败:', error)
    return null
  }
}

// 搜索作文
export const searchEssays = async (query: string): Promise<Essay[]> => {
  try {
    // 先尝试后端搜索
    const response = await httpClient.get(`/api/essays/search?q=${encodeURIComponent(query)}`)
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.filter(validateEssay)
    }
  } catch (error) {
    console.error('后端搜索失败，使用本地搜索:', error)
  }
  
  // 后端搜索失败时使用本地搜索
  const essays = getLocalEssays()
  const lowerQuery = query.toLowerCase()
  
  return essays.filter(essay => 
    essay.title.toLowerCase().includes(lowerQuery) ||
    essay.content.toLowerCase().includes(lowerQuery) ||
    essay.type.toLowerCase().includes(lowerQuery) ||
    essay.year.includes(query)
  )
}

// 导出作文数据
export const exportEssays = (): string => {
  const essays = getLocalEssays()
  return JSON.stringify(essays, null, 2)
}

// 导入作文数据
export const importEssays = (jsonData: string): boolean => {
  try {
    const importedEssays = JSON.parse(jsonData)
    
    if (!Array.isArray(importedEssays)) {
      throw new Error('数据格式不正确')
    }
    
    const validEssays = importedEssays.filter(validateEssay)
    const existingEssays = getLocalEssays()
    
    // 合并数据，避免重复
    const allEssays = [...existingEssays]
    validEssays.forEach(essay => {
      if (!allEssays.find(existing => existing.id === essay.id)) {
        allEssays.push(essay)
      }
    })
    
    localStorage.setItem('essays', JSON.stringify(allEssays))
    return true
  } catch (error) {
    console.error('导入作文数据失败:', error)
    return false
  }
}