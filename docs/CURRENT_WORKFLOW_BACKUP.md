# 完形填空系统 - 当前工作流程备份

## 系统概述

这是一个基于Vue 3 + TypeScript的完形填空学习系统，支持英文文章的段落翻译和单词翻译功能。

## 核心架构

### 前端架构 (Vue 3 + Vite)
- **主要页面**: `src/views/Display.vue` - 文章显示和翻译功能
- **路由**: `src/router.ts` - 页面路由配置
- **状态管理**: `src/store/index.ts` - Pinia状态管理

### 后端架构 (Node.js + Express)
- **API服务**: `backend/src/index.ts` - 主服务入口
- **翻译接口**: `/api/translate` - 段落翻译API
- **数据库**: PostgreSQL (Docker容器)

## 核心功能流程

### 1. 段落翻译流程
```
用户访问文章 → 自动触发段落翻译 → 调用后端API → 返回中文翻译 → 缓存结果
```

**关键文件**:
- `src/utils/translateService.ts` - 翻译服务
- `src/utils/paragraphWordMappingService.ts` - 段落映射服务
- `backend/src/routes/translate.ts` - 翻译API路由

### 2. 单词翻译流程
```
用户点击单词 → 查询本地词典 → 查询段落映射 → 显示翻译和音标
```

**关键文件**:
- `src/utils/wordService.ts` - 单词查询服务
- `src/utils/paragraphWordMappingService.ts` - 段落单词映射

### 3. 数据缓存机制
- **段落翻译缓存**: 避免重复翻译相同段落
- **单词翻译缓存**: 提高单词查询性能
- **段落单词映射**: 从翻译结果中提取单词对应关系

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Vite (构建工具)
- Pinia (状态管理)

### 后端
- Node.js
- Express.js
- TypeScript
- PostgreSQL

### 部署
- Docker (容器化)
- Docker Compose (多服务编排)

## 核心配置文件

### 前端配置
- `package.json` - 依赖和脚本
- `vite.config.ts` - Vite构建配置
- `tsconfig.json` - TypeScript配置

### 后端配置
- `backend/package.json` - 后端依赖
- `backend/tsconfig.json` - 后端TypeScript配置
- `docker-compose.yml` - Docker服务配置

## 数据库结构

### 主要表
- `essays` - 文章信息
- `translation_history` - 翻译历史记录
- `words` - 单词信息

## 启动流程

1. **启动数据库**: `docker-compose up -d postgres`
2. **启动后端**: `cd backend && npm run dev`
3. **启动前端**: `npm run dev`
4. **访问应用**: `http://localhost:5173/display/1`

## 关键特性

### 1. 智能翻译
- 自动检测需要翻译的段落
- 缓存翻译结果避免重复请求
- 支持批量翻译优化性能

### 2. 单词学习
- 点击单词显示翻译和音标
- 智能识别高级词汇
- 预定义常用词汇映射

### 3. 用户体验
- 响应式设计
- 加载状态提示
- 错误处理和重试机制
- 主题切换支持

## 文件结构 (核心部分)

```
src/
├── views/
│   └── Display.vue          # 主要显示页面
├── utils/
│   ├── translateService.ts  # 翻译服务
│   ├── wordService.ts       # 单词服务
│   └── paragraphWordMappingService.ts  # 段落映射服务
├── components/
│   └── essay/              # 文章相关组件
└── router.ts               # 路由配置

backend/
├── src/
│   ├── routes/
│   │   └── translate.ts    # 翻译API
│   ├── services/           # 业务逻辑
│   └── index.ts           # 服务入口
└── sql/                   # 数据库脚本
```

## 备份时间
创建时间: 2024年12月23日
系统状态: 功能正常，段落翻译和单词翻译均工作正常