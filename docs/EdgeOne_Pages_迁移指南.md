# EdgeOne Pages 迁移指南

本文档详细说明如何将项目从 Vercel 平滑迁移到 EdgeOne Pages。

## 已完成的迁移准备工作

### 1. 创建 EdgeOne Pages 配置文件

已创建 `edgeone.json` 配置文件，包含以下核心配置：
- 构建命令和输出目录
- 路由规则（与 Vercel 配置保持一致）
- CORS 头设置
- 环境变量配置

### 2. 兼容性修改

已修改 API 函数文件，使其兼容 EdgeOne Pages：
- 移除 `@vercel/node` 依赖
- 定义通用的 Request/Response 接口
- 改进请求体解析逻辑
- 简化 CORS 头设置

### 3. 项目配置更新

已在 `package.json` 中添加 EdgeOne Pages 构建命令：
```json
"edgeone-build": "npm run build"
```

## 迁移步骤

### 步骤 1: 准备 EdgeOne 账号

1. 访问 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 注册/登录腾讯云账号
3. 开通 EdgeOne 服务

### 步骤 2: 创建 EdgeOne Pages 项目

1. 在 EdgeOne 控制台中，进入「网站托管」->「新增项目」
2. 选择「从代码仓库导入」
3. 授权连接您的 GitHub/GitLab/Gitee 仓库
4. 选择项目仓库

### 步骤 3: 配置构建参数

1. 选择主分支（如 `master` 或 `main`）
2. 构建命令：`npm run edgeone-build`
3. 输出目录：`dist`
4. 环境变量配置：添加以下环境变量
   - `VOLCANO_API_KEY`
   - `VOLCANO_API_URL`
   - `BAIDU_APP_ID`
   - `BAIDU_SECRET_KEY`
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 步骤 4: 部署项目

1. 点击「立即部署」
2. 等待构建和部署完成
3. 查看部署日志确认是否成功

## 注意事项

### 1. 环境变量配置

- EdgeOne Pages 的环境变量需要在控制台中单独配置
- 确保所有敏感信息（如 API 密钥）都通过环境变量注入，不要硬编码在代码中

### 2. API 函数兼容性

- EdgeOne Pages 的 API 函数执行环境与 Vercel 略有不同
- 已修改的代码使用了通用的 Web API，应能在 EdgeOne 环境中正常运行

### 3. 缓存功能

- 当前代码使用 `@vercel/kv` 进行缓存
- 在 EdgeOne 环境中，可能需要调整为兼容的缓存方案
- 建议测试缓存功能是否正常工作

### 4. 监控与调试

- 使用 EdgeOne 控制台的「日志」功能监控 API 调用和错误
- 部署后进行全面功能测试，特别是翻译和单词查询功能

## 测试计划

部署后，请按以下步骤进行测试：

1. **基本页面访问**：确认网站能正常加载
2. **翻译功能测试**：测试中英文翻译是否正常工作
3. **单词查询功能测试**：测试单词查询和释义是否正确
4. **缓存功能测试**：重复查询相同内容，确认缓存生效
5. **错误处理测试**：测试异常输入和网络错误情况下的表现

## 回滚方案

如遇迁移问题，可按以下步骤回滚：

1. 保留 Vercel 项目的配置和部署
2. 在 EdgeOne 控制台中暂停或删除有问题的部署
3. 继续使用 Vercel 服务，待问题解决后重新尝试迁移

## 后续优化

1. 考虑使用 EdgeOne 提供的边缘缓存功能优化性能
2. 探索 EdgeOne 的其他特性，如边缘函数、安全防护等
3. 根据实际使用情况调整配置，优化成本和性能