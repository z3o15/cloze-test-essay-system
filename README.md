# 完形填空学习系统 - Web 部署版本

这是完形填空学习系统的 Web 部署分支，专门用于 GitHub Pages 部署。

## 🌐 在线访问

- **演示地址**: [https://z3o15.github.io/cloze-test-essay-system/](https://z3o15.github.io/cloze-test-essay-system/)

## 📋 功能特性

- ✅ 英文段落自动翻译
- ✅ 智能单词难度分析
- ✅ AI 复杂单词识别
- ✅ 单词点击查看翻译
- ✅ 响应式设计，支持移动端
- ✅ 主题切换（明暗模式）
- ✅ 文章管理和历史记录

## 🛠️ 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI 组件**: Vant UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
- **部署**: GitHub Pages

## 🚀 本地开发

```bash
# 克隆仓库
git clone https://github.com/z3o15/cloze-test-essay-system.git
cd cloze-test-essay-system

# 切换到 web 分支
git checkout web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📦 部署说明

本项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `web` 分支
2. GitHub Actions 自动触发构建
3. 构建完成后自动部署到 GitHub Pages

### 环境配置

生产环境配置文件：`.env.production`

```env
VITE_APP_TITLE=完形填空学习系统
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_PUBLIC_PATH=/cloze-test-essay-system/
```

## 📁 项目结构

```
src/
├── components/          # 组件
│   ├── common/         # 通用组件
│   ├── essay/          # 文章相关组件
│   └── ui/             # UI 组件
├── services/           # 服务层
├── utils/              # 工具函数
├── views/              # 页面组件
├── store/              # 状态管理
└── types/              # 类型定义
```

## 🔧 配置说明

### Vite 配置

- 生产环境 base 路径：`/cloze-test-essay-system/`
- 开发环境 base 路径：`./`
- 支持路径别名：`@` -> `src/`

### GitHub Actions

工作流文件：`.github/workflows/deploy.yml`

- 触发条件：推送到 `web` 分支
- 构建环境：Ubuntu Latest + Node.js 18
- 自动部署到 `gh-pages` 分支

## 📝 更新日志

### v1.0.0 (2024-12-XX)

- ✅ 完成基础功能开发
- ✅ 修复 AI 单词处理功能
- ✅ 优化数据格式处理
- ✅ 配置 GitHub Pages 部署
- ✅ 添加自动化部署流程

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License

## 🔗 相关链接

- [项目主分支](https://github.com/z3o15/cloze-test-essay-system/tree/main)
- [开发文档](./docs/)
- [API 文档](./docs/接口文档.md)
- [部署指南](./docs/DEPLOYMENT.md)