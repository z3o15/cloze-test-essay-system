# API 405错误修复待办事项

## 1. 部署与验证

- [ ] **EdgeOne Pages环境部署**：将修复后的代码部署到EdgeOne Pages环境
- [ ] **功能验证**：验证单词查询API在生产环境中正常工作
- [ ] **浏览器兼容性测试**：在不同浏览器中验证功能（Chrome、Firefox、Safari、Edge）
- [ ] **移动设备测试**：在各种移动设备上验证响应式表现

## 2. 文档完善

- [ ] **API文档更新**：明确标注所有API端点支持的HTTP方法
- [ ] **前后端交互规范**：制定统一的API设计和调用规范文档
- [ ] **部署文档更新**：更新EdgeOne Pages部署指南，包含HTTP方法配置说明

## 3. 代码优化

- [ ] **错误处理增强**：实现更友好的用户错误提示
- [ ] **API降级机制**：当本地API失败时，自动切换到火山AI API
- [ ] **请求参数验证**：在API调用前增加参数验证逻辑

## 4. 配置管理

- [ ] **环境变量统一**：确保所有环境变量在.env.example中完整记录
- [ ] **CI/CD配置**：设置自动构建和部署流程
- [ ] **配置验证脚本**：开发脚本自动检查配置文件格式

## 5. 监控与维护

- [ ] **API监控**：为关键API端点添加性能和错误监控
- [ ] **日志增强**：添加更详细的错误日志，便于问题排查
- [ ] **定期检查**：定期审查Web标准更新，及时调整过时的实现

## 6. 注意事项

- 确保在部署前更新所有环境变量
- 部署后立即进行功能验证，特别是API调用部分
- 保留旧版本的构建产物，以便需要时快速回滚
- 记录用户反馈，持续优化功能体验

## 已修复的问题

- [x] **API 405错误修复**：将前端API调用从POST改为GET方法
- [x] **meta标签警告修复**：将已弃用的apple-mobile-web-app-capable改为标准的mobile-web-app-capable
- [x] **代码构建验证**：确保修改后的代码能成功编译
- [x] **代码提交与推送**：修复代码已提交到clean-history分支并成功推送到远程仓库

### 1. 腾讯API密钥配置

- **状态**: 待配置
- **说明**: 虽然我们已经在edgeone.json中添加了环境变量声明，但这些变量需要在EdgeOne Pages控制台中实际配置具体值
- **操作指引**:
  1. 登录EdgeOne Pages控制台
  2. 选择Cloze Test项目
  3. 进入"环境变量"配置页面
  4. 添加以下环境变量:
     - `TENCENT_APP_ID`: 腾讯云API的App ID
     - `TENCENT_APP_KEY`: 腾讯云API的密钥
     - `TENCENT_DICT_URL`: 腾讯词典API的URL
  5. 保存配置并触发重新部署

### 2. 部署验证

- **状态**: 待执行
- **说明**: 修复配置后需要验证API是否正常工作
- **操作指引**:
  1. 使用curl或Postman测试API端点
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"word":"example"}' https://cloze-test-essay-system-zad91y1gjh.zh-cn.edgeone.run/api/word-query
  ```
  2. 验证返回状态码为200而非405
  3. 检查返回的单词信息格式是否正确

## 后续优化建议

### 1. 配置验证脚本

- **建议**: 创建配置验证脚本，自动检查edgeone.json格式
- **示例代码**:
  ```javascript
  // config-validator.js
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(__dirname, '../../edgeone.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  let isValid = true;
  
  // 检查路由配置
  if (config.functions && config.functions.routes) {
    config.functions.routes.forEach((route, index) => {
      if (!route.path) {
        console.error(`路由 ${index + 1} 缺少 path 字段`);
        isValid = false;
      }
      if (!route.function || !route.function.startsWith('edge-functions/')) {
        console.error(`路由 ${index + 1} 的 function 字段格式不正确`);
        isValid = false;
      }
    });
  }
  
  console.log(`配置${isValid ? '验证通过' : '验证失败'}`);
  process.exit(isValid ? 0 : 1);
  ```

### 2. 添加API监控

- **建议**: 实现API监控，及时发现异常
- **操作指引**:
  1. 在函数中添加日志记录
  2. 配置日志收集和告警
  3. 设置关键指标监控（响应时间、错误率等）

### 3. 完善错误处理

- **建议**: 增强错误处理和日志记录
- **代码修改建议**:
  在word-query.ts中添加更详细的错误日志:
  ```typescript
  try {
    // 现有代码
  } catch (error) {
    console.error('处理请求时出错:', error);
    console.error('请求详情:', { method: request.method, url: request.url });
    return new Response(JSON.stringify({
      code: 500,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  ```

## 注意事项

1. **环境变量安全**: 腾讯API密钥等敏感信息必须通过环境变量配置，不要硬编码在代码中

2. **部署依赖**: 修改配置后必须重新部署项目，配置更改不会自动生效

3. **多环境一致性**: 确保测试环境和生产环境的配置保持一致

4. **备用API**: 目前火山AI API作为备用方案正常工作，确保其API密钥也保持有效

5. **缓存配置**: 检查KV存储配置是否正确，确保缓存功能正常工作