# 待办事项清单：腾讯翻译君词典API集成

## 1. 环境配置项

以下是需要用户配置的环境变量，这些配置对于API正常工作至关重要：

| 环境变量名称 | 必需 | 说明 | 示例值 |
|------------|------|------|--------|
| `TENCENT_APP_ID` | ✅ | 腾讯翻译API的应用ID | `1234567890` |
| `TENCENT_APP_KEY` | ✅ | 腾讯翻译API的密钥 | `abcdef1234567890` |
| `TENCENT_DICT_URL` | ✅ | 腾讯词典API的请求地址 | `https://api.ai.qq.com/fcgi-bin/nlp/nlp_worddict` |
| `TENCENT_TRANSLATE_URL` | ✅ | 腾讯翻译API的请求地址 | `https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate` |
| `BAIDU_APP_ID` | ❌ | 百度翻译API的应用ID（备用） | `123456789` |
| `BAIDU_APP_KEY` | ❌ | 百度翻译API的密钥（备用） | `abcdef123456` |
| `VOLCANO_API_KEY` | ❌ | 火山AI API的密钥（备用） | `abcdef123456` |
| `VOLCANO_API_HOST` | ❌ | 火山AI API的主机地址（备用） | `translation-api.volcengineapi.com` |

### 配置步骤

1. 访问腾讯云官网，申请翻译服务的应用ID和密钥
2. 将获取的密钥添加到项目的环境变量配置中
3. 重新启动服务以加载新的环境变量

## 2. 测试验证

### 2.1 运行测试脚本

```bash
node test-tencent-api.js
```

运行测试脚本前，请确保已配置好环境变量。测试脚本将验证腾讯翻译API和词典API的调用是否正常工作。

### 2.2 手动测试端点

可以使用Postman或curl等工具测试以下端点：

1. **翻译API端点**：
   - URL: `http://localhost:3000/api/translate`
   - 方法: POST
   - 请求体: 
     ```json
     {
       "text": "你好世界",
       "from": "zh",
       "to": "en",
       "useTencent": true
     }
     ```

2. **单词查询API端点**：
   - URL: `http://localhost:3000/api/word-query`
   - 方法: POST
   - 请求体: 
     ```json
     {
       "word": "hello",
       "useTencent": true
     }
     ```

## 3. 监控与维护

### 3.1 日志监控

建议关注以下日志信息以确保API正常工作：
- API调用的错误日志
- 环境变量缺失的警告
- 缓存操作的记录

### 3.2 定期维护

- **密钥轮换**：建议每90天更换一次API密钥，提高安全性
- **性能监控**：定期检查API响应时间和成功率
- **缓存清理**：根据实际使用情况，定期清理过期缓存

## 4. 可能遇到的问题及解决方案

### 4.1 环境变量配置问题

- **症状**：API返回"Missing API credentials"错误
- **解决方案**：检查环境变量是否正确配置，确保变量名称完全一致

### 4.2 API调用失败

- **症状**：API返回错误码或无法连接
- **解决方案**：
  1. 检查网络连接是否正常
  2. 验证API密钥是否有效
  3. 检查API请求参数是否正确

### 4.3 翻译质量问题

- **症状**：翻译结果不符合预期
- **解决方案**：
  1. 可以通过设置`useTencent=false`临时切换回百度翻译API
  2. 检查源文本和目标语言设置是否正确

## 5. 后续优化建议

1. **添加更多翻译服务提供商**：考虑集成更多翻译服务作为备选
2. **实现批量翻译**：使用批量翻译API减少请求次数，提高性能
3. **添加API调用监控**：实现监控系统，实时跟踪API使用情况
4. **优化缓存策略**：根据实际使用情况调整缓存过期时间

## 6. 联系与支持

如果在配置或使用过程中遇到任何问题，请参考以下资源：

1. **腾讯翻译API文档**：https://cloud.tencent.com/document/product/551
2. **项目文档**：查看`docs`目录下的相关文档
3. **测试脚本**：使用`test-tencent-api.js`进行问题诊断