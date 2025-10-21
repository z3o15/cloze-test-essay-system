# EdgeOne API 405错误修复文档

## 问题分析

通过控制台日志分析，我们发现核心问题是**API接口HTTP方法不匹配（405错误）**，具体表现为：

1. `/api/word-query` 接口的POST请求被拒绝（405 Method Not Allowed）
2. `/translate` 接口的POST请求被拒绝（405 Method Not Allowed）

## 根本原因

经过分析，问题的根本原因是**EdgeOne Pages Functions的函数导出格式要求与我们当前实现不匹配**：

- EdgeOne Pages要求使用特定的函数名来处理不同HTTP方法的请求，如`onRequestPost`处理POST请求，`onRequestOptions`处理OPTIONS请求
- 我们之前的实现使用了通用的`handler`函数，通过检查请求方法来决定如何处理
- 由于没有导出`onRequestPost`函数，EdgeOne Pages无法正确识别和路由POST请求

## 修复方案

我们对API函数进行了以下修改：

### 1. 修改函数导出格式

- 将通用的`handler`函数替换为特定的HTTP方法处理函数：
  - `onRequestPost`: 专门处理POST请求
  - `onRequestOptions`: 专门处理OPTIONS请求（用于CORS预检）

### 2. 改进请求类型定义

- 将`type`定义改为`interface`
- 添加`json()`方法到Request接口，确保能正确解析请求体
- 使`body`属性为可选

### 3. 优化请求体解析逻辑

添加了更健壮的请求体解析逻辑，支持多种可能的数据格式：
```typescript
let body;
try {
  if (request.body) {
    body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } else if (typeof request.json === 'function') {
    body = await request.json();
  } else {
    body = {};
  }
} catch (e) {
  console.error('解析请求体失败:', e);
  body = {};
}
```

### 4. 保留向后兼容性

在`word-query.ts`中添加了向后兼容的默认导出，确保在其他环境中仍能正常工作：
```typescript
export default async function handler(request: Request, response: Response) {
  if (request.method === 'OPTIONS') {
    return onRequestOptions(request, response);
  }
  return onRequestPost(request, response);
}
```

## 修复的文件

1. `api/translate.ts` - 修改了导出函数格式，适配EdgeOne Pages
2. `api/word-query.ts` - 修改了导出函数格式，适配EdgeOne Pages

## 预期效果

完成修复后，EdgeOne Pages应该能够正确处理：
- POST请求到 `/api/word-query` 接口
- POST请求到 `/translate` 接口
- OPTIONS请求用于CORS预检

这将解决控制台中的405错误，使单词查询和翻译功能恢复正常工作。

## 部署说明

1. 代码已提交到本地仓库，需要推送到GitHub
2. 推送到GitHub后，EdgeOne Pages会自动重新构建和部署
3. 部署完成后，建议测试API功能以验证修复效果

## 注意事项

- 如果在其他环境（如Vercel）部署，可能需要进行额外的适配
- 确保EdgeOne Pages的环境变量已正确配置
- 监控部署后的应用日志，确保没有新的错误出现