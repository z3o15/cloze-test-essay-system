# API 405错误问题待办事项

## 待解决的配置问题

1. **环境变量配置**
   - 在EdgeOne Pages控制台中设置以下环境变量：
     - VOLCANO_API_KEY
     - VOLCANO_API_URL
     - BAIDU_APP_ID
     - BAIDU_SECRET_KEY
     - KV_URL
     - KV_REST_API_URL
     - KV_REST_API_TOKEN
     - KV_REST_API_READ_ONLY_TOKEN
   - 操作指引：EdgeOne Pages控制台 → 项目设置 → 环境变量 → 添加变量

2. **函数部署验证**
   - 检查EdgeOne Pages控制台中的函数部署状态
   - 确认translate.ts和word-query.ts函数是否成功部署
   - 操作指引：EdgeOne Pages控制台 → 边缘函数 → 函数管理 → 检查部署状态

3. **路由规则验证**
   - 在控制台中验证路由规则是否正确应用
   - 确认/api/translate和/api/word-query路径是否正确映射
   - 操作指引：EdgeOne Pages控制台 → 边缘函数 → 路由配置 → 检查规则

## 待优化的代码改进

1. **添加详细日志**
   - 在onRequest函数开头添加请求详情日志
   - 在关键操作点添加执行状态日志
   - 操作指引：修改translate.ts和word-query.ts文件，在onRequest函数中添加console.log语句

2. **增强错误处理**
   - 为不同类型的错误添加更具体的错误码
   - 改进错误信息的可读性
   - 操作指引：修改catch块中的错误处理逻辑

3. **添加请求验证**
   - 在函数开始处添加更严格的请求验证
   - 验证Content-Type头是否正确设置
   - 操作指引：在请求体解析前添加请求头验证逻辑

## 测试任务

1. **API端点测试**
   - 使用curl或Postman测试翻译API：
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"text":"test","from":"en","to":"zh"}' https://your-domain.com/api/translate
     ```
   - 使用curl或Postman测试单词查询API：
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"word":"test"}' https://your-domain.com/api/word-query
     ```

2. **CORS测试**
   - 从不同域名测试API，确认CORS配置有效
   - 操作指引：使用不同域名的网页或工具测试API访问

3. **预检请求测试**
   - 验证OPTIONS预检请求是否正常处理
   - 操作指引：使用curl发送OPTIONS请求测试
     ```bash
     curl -X OPTIONS -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" https://your-domain.com/api/translate
     ```

## 需要技术支持的事项

1. **EdgeOne Pages部署问题**
   - 如果重新部署后问题仍然存在，可能需要联系EdgeOne Pages技术支持
   - 提供完整的错误日志和配置信息

2. **权限问题**
   - 如果怀疑是权限问题导致函数无法执行，需要检查项目权限设置
   - 操作指引：EdgeOne Pages控制台 → 项目设置 → 权限管理

3. **自定义域名配置**
   - 如果使用了自定义域名，需要确认域名配置是否正确
   - 操作指引：EdgeOne Pages控制台 → 域名管理 → 检查域名配置