// 作文服务模块

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

// 作文接口 - 与后端API兼容
export interface Essay {
  id: string
  title: string
  content: string
  difficulty_level?: number
  word_count?: number
  language: string
  category?: string
  tags?: string[]
  source_url?: string
  author?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // 兼容旧版本字段
  year?: string
  type?: string
  createTime?: string
}

// 验证作文数据
const validateEssay = (essay: any): boolean => {
  return essay &&
         typeof essay.id === 'string' &&
         typeof essay.title === 'string' &&
         typeof essay.content === 'string' &&
         typeof essay.language === 'string' &&
         typeof essay.is_active === 'boolean' &&
         (typeof essay.created_at === 'string' || typeof essay.createTime === 'string')
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
  
  // 基于字数简单判断难度
  if (wordCount < 200) {
    return 'easy'
  } else if (wordCount < 400) {
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
export const processEssayData = (essay: Omit<Essay, 'id' | 'created_at' | 'updated_at'>): Essay => {
  const now = new Date().toISOString()
  return {
    ...essay,
    id: generateEssayId(),
    language: essay.language || 'en',
    is_active: essay.is_active !== undefined ? essay.is_active : true,
    created_at: now,
    updated_at: now,
    // 兼容旧版本
    createTime: now
  }
}

// 生成作文ID
export const generateEssayId = (): string => {
  return `essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}



// 保存作文到本地存储
export const saveEssayToLocal = (essay: Essay): void => {
  try {
    const essays = getLocalEssays()
    essays.push(essay)
    localStorage.setItem('essays', JSON.stringify(essays))
  } catch (error: any) {
    console.error('保存作文到本地失败:', error)
  }
}

// 获取本地作文列表
export const getLocalEssays = (): Essay[] => {
  try {
    const stored = localStorage.getItem('essays')
    return stored ? JSON.parse(stored) : []
  } catch (error: any) {
    console.error('获取本地作文失败:', error)
    return []
  }
}

// 根据ID获取作文
export const getEssayById = (id: string): Essay | null => {
  const localEssays = getLocalEssays()
  return localEssays.find(essay => essay.id === id) || null
}



// 删除作文
export const deleteEssay = (id: string): boolean => {
  try {
    const essays = getLocalEssays()
    const filteredEssays = essays.filter(essay => essay.id !== id)
    localStorage.setItem('essays', JSON.stringify(filteredEssays))
    return true
  } catch (error: any) {
    console.error('删除作文失败:', error)
    return false
  }
}

// 更新作文
export const updateEssay = (id: string, updates: Partial<Essay>): Essay | null => {
  try {
    const essays = getLocalEssays()
    const index = essays.findIndex(essay => essay.id === id)
    if (index !== -1) {
      essays[index] = { ...essays[index], ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem('essays', JSON.stringify(essays))
      return essays[index]
    }
    return null
  } catch (error: any) {
    console.error('更新作文失败:', error)
    return null
  }
}

// 搜索作文
export const searchEssays = (query: string, filters?: {
  difficulty_level?: number
  language?: string
  category?: string
  tags?: string[]
}): Essay[] => {
  const essays = getLocalEssays()
  return essays.filter(essay => {
    // 文本搜索
    const matchesQuery = essay.title.toLowerCase().includes(query.toLowerCase()) ||
                        essay.content.toLowerCase().includes(query.toLowerCase())
    
    if (!matchesQuery) return false
    
    // 应用过滤器
    if (filters) {
      if (filters.difficulty_level && essay.difficulty_level !== filters.difficulty_level) return false
      if (filters.language && essay.language !== filters.language) return false
      if (filters.category && essay.category !== filters.category) return false
      if (filters.tags && filters.tags.length > 0) {
        const essayTags = essay.tags || []
        const hasMatchingTag = filters.tags.some(tag => essayTags.includes(tag))
        if (!hasMatchingTag) return false
      }
    }
    
    return true
  })
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
  } catch (error: any) {
    console.error('导入作文数据失败:', error)
    return false
  }
}