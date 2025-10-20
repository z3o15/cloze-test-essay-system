import type { Essay } from '../../store'
import { saveEssay } from '../../utils/api'

// 作文类型常量
export const ESSAY_TYPES = {
  ARGUMENTATIVE: '议论文',
  EXPOSITORY: '说明文',
  DESCRIPTIVE: '描写文',
  NARRATIVE: '叙述文'
}

// 验证作文数据
export const validateEssay = (essay: Partial<Essay>): string[] => {
  const errors: string[] = []
  
  if (!essay.year || essay.year.trim().length === 0) {
    errors.push('年份不能为空')
  }
  
  if (!essay.title || essay.title.trim().length === 0) {
    errors.push('标题不能为空')
  }
  
  if (!essay.type || !Object.values(ESSAY_TYPES).includes(essay.type)) {
    errors.push('请选择有效的作文类型')
  }
  
  if (!essay.content || essay.content.trim().length < 50) {
    errors.push('作文内容不能少于50个字符')
  }
  
  return errors
}

// 格式化创建时间
export const formatCreateTime = (timeString: string): string => {
  const date = new Date(timeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 保存作文到后端（实际项目中使用）
export const saveEssayToBackend = async (essay: Omit<Essay, 'id' | 'createTime'>): Promise<string> => {
  try {
    const response = await saveEssay({
      year: essay.year,
      title: essay.title,
      type: essay.type,
      content: essay.content
    })
    return response.id
  } catch (error) {
    console.error('保存到后端失败:', error)
    // 如果后端保存失败，返回本地生成的ID
    return Date.now().toString()
  }
}

// 清理粘贴的文本
export const cleanPastedText = (text: string): string => {
  // 先移除首尾空白
  let cleaned = text.trim();
  
  // 处理行内多余空格（保留单个空格）
  // 注意：只处理非换行符的空白字符，保留段落结构
  cleaned = cleaned.replace(/([^\n])\s+/g, '$1 ');
  
  // 处理连续空行，最多保留一个空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned;
}