# API 405错误修复待办事项

## 已修复的问题

✅ **路由配置错误** - 已将edgeone.json中的`pattern`字段修改为正确的`path`字段
✅ **函数路径不完整** - 已将function字段更新为包含完整路径前缀"edge-functions/"
✅ **环境变量定义** - 已在edgeone.json中添加腾讯API相关环境变量声明

## 待完成配置

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