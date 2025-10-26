// 简化版类型定义 - 只保留核心功能

// 基础类型定义
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// 简化的单词类型 - 只保留核心字段
export interface Word extends BaseEntity {
  word: string;
  pronunciation?: string;
  meaning: string;
  difficulty_level?: number;
  part_of_speech?: string;
}

export interface WordCreateRequest {
  word: string;
  pronunciation?: string;
  meaning: string;
}

export interface WordUpdateRequest extends Partial<WordCreateRequest> {
  translation?: string;
}

export interface WordQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 翻译相关类型
export interface TranslationResponse {
  original: string;
  translated: string;
  source_language: string;
  target_language: string;
  cached?: boolean;
  service?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  code: string;
  data?: T;
  message: string;
  timestamp?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}



// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 常量定义
export const API_CODES = {
  SUCCESS: 'SUCCESS',
  ERROR_001: 'ERROR_001', // 参数错误
  ERROR_002: 'ERROR_002', // 数据库错误
  ERROR_003: 'ERROR_003', // 外部服务错误
  ERROR_500: 'ERROR_500'  // 服务器内部错误
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20
} as const;