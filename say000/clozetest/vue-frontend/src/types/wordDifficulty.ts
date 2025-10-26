// 单词难度等级定义 - 与后端保持一致
export enum WordDifficultyLevel {
  VERY_EASY = 1,    // 最简单 (a, the, is, am, are, etc.)
  EASY = 2,         // 简单 (basic verbs, common nouns)
  BASIC = 3,        // 基础 (everyday vocabulary)
  INTERMEDIATE = 4, // 中等 (high school level)
  ADVANCED = 5,     // 高级 (college level)
  EXPERT = 6,       // 专家级 (academic/professional)
  VERY_ADVANCED = 7,// 非常高级
  ACADEMIC = 8,     // 学术级
  SPECIALIZED = 9,  // 专业级
  RARE = 10         // 罕见词汇
}

// 单词难度分析结果接口
export interface WordDifficultyAnalysis {
  word: string
  difficulty_level: WordDifficultyLevel
  difficulty_description: string
  is_simple: boolean
  should_display: boolean
}

// 批量单词难度分析响应接口
export interface WordDifficultyAnalysisResponse {
  code: string
  data: {
    total_words: number
    complex_words_count: number
    simple_words_count: number
    analysis: WordDifficultyAnalysis[]
    complex_words: string[]
  }
  message: string
}