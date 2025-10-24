# 🧮 任务文档：查词翻译流程优化

## 一、任务目标
优化查词和段落翻译的执行流程，实现先查词提交后台对比数据库，同时进行段落翻译的并行处理机制，提升用户体验和系统性能。

## 二、当前问题分析

### 2.1 现有流程问题
| 问题类型 | 具体表现 | 影响 |
|---------|----------|------|
| 顺序执行瓶颈 | 段落翻译完成后才开始查词 | 用户等待时间过长 |
| 重复翻译 | 单词翻译和段落翻译重复处理 | API调用浪费，成本增加 |
| 资源浪费 | 已知单词仍被重新翻译 | 数据库查询效率低 |
| 用户体验差 | 无法在翻译过程中查词 | 交互体验不佳 |

### 2.2 现有执行顺序
```
用户输入文本 → 段落翻译(串行) → 段落翻译完成 → 预加载单词翻译 → 用户可查词
```

## 三、优化方案设计

### 3.1 优化后的执行流程
```
用户输入文本 → 提取所有单词 → 数据库批量预查询
                ↓                    ↓
            段落翻译(并行)      单词翻译(仅未知单词)
                ↓                    ↓
            翻译结果合并 ← 用户可立即查词(已知单词)
```

### 3.2 核心优化策略
| 策略 | 实现方式 | 预期效果 |
|------|----------|----------|
| 并行处理 | 段落翻译与单词查询同时进行 | 减少50%等待时间 |
| 预查询机制 | 先从数据库批量查询已知单词 | 避免重复翻译 |
| 增量更新 | 已知单词立即可查，未知单词异步补充 | 提升用户体验 |
| 智能缓存 | 合并段落翻译和单词翻译的缓存 | 减少API调用 |

## 四、技术实现方案

### 4.1 后端API优化
#### 新增接口：POST /api/v1/words/batch-prequery
```json
{
  "words": ["example", "hello", "world"],
  "include_translation": true
}
```

**响应格式：**
```json
{
  "code": "SUCCESS",
  "data": {
    "known_words": [
      {"word": "hello", "translation": "你好", "source": "database"}
    ],
    "unknown_words": ["example", "world"],
    "cache_hit_rate": 0.33
  }
}
```

#### 优化接口：POST /api/v1/translate/enhanced-paragraph
```json
{
  "text": "Hello world example",
  "known_words": [
    {"word": "hello", "translation": "你好"}
  ],
  "translate_unknown_only": true
}
```

### 4.2 前端流程优化
#### 新增服务：WordPreQueryService
```typescript
class WordPreQueryService {
  // 批量预查询单词
  static async batchPreQuery(words: string[]): Promise<PreQueryResult>
  
  // 获取已知单词翻译
  static async getKnownWordTranslations(words: string[]): Promise<WordTranslation[]>
  
  // 异步补充未知单词翻译
  static async supplementUnknownWords(words: string[]): Promise<void>
}
```

#### 优化Display.vue处理流程
```typescript
const optimizedProcessAllParagraphs = async () => {
  // 1. 提取所有段落中的单词
  const allWords = extractAllWordsFromParagraphs(paragraphs.value)
  
  // 2. 并行执行：预查询单词 + 段落翻译
  const [preQueryResult, paragraphTranslations] = await Promise.all([
    WordPreQueryService.batchPreQuery(allWords),
    translateAllParagraphs(paragraphs.value)
  ])
  
  // 3. 立即提供已知单词翻译
  updateWordTranslationsCache(preQueryResult.known_words)
  
  // 4. 异步补充未知单词翻译
  WordPreQueryService.supplementUnknownWords(preQueryResult.unknown_words)
}
```

## 五、实现步骤

### 5.1 后端实现
| 步骤 | 内容 | 文件 | 预期输出 |
|------|------|------|----------|
| 1 | 创建单词预查询服务 | `wordPreQueryService.ts` | 批量数据库查询功能 |
| 2 | 实现批量预查询接口 | `wordRoutes.ts` | POST /words/batch-prequery |
| 3 | 优化段落翻译接口 | `enhancedTranslationController.ts` | 支持已知单词跳过 |
| 4 | 添加缓存优化 | `cacheService.ts` | 统一缓存管理 |

### 5.2 前端实现
| 步骤 | 内容 | 文件 | 预期输出 |
|------|------|------|----------|
| 1 | 创建预查询服务 | `wordPreQueryService.ts` | 单词预查询API调用 |
| 2 | 优化Display.vue流程 | `Display.vue` | 并行处理逻辑 |
| 3 | 更新API配置 | `api.ts` | 新增预查询接口配置 |
| 4 | 优化缓存机制 | `wordTranslationCache.ts` | 统一缓存管理 |

## 六、性能预期

### 6.1 性能指标对比
| 指标 | 优化前 | 优化后 | 改善幅度 |
|------|--------|--------|----------|
| 首次查词可用时间 | 段落翻译完成后 | 立即可用(已知单词) | 减少80% |
| 总处理时间 | 串行累加 | 并行处理 | 减少50% |
| API调用次数 | 重复翻译 | 去重优化 | 减少30% |
| 用户等待时间 | 长时间等待 | 渐进式加载 | 显著改善 |

### 6.2 用户体验改善
- **即时反馈**：已知单词立即可查
- **渐进加载**：未知单词异步补充
- **减少等待**：并行处理提升速度
- **智能缓存**：避免重复请求

## 七、验收标准

### 7.1 功能验收
- [ ] 单词预查询接口正常工作
- [ ] 已知单词立即可查询
- [ ] 未知单词异步补充完成
- [ ] 段落翻译与单词查询并行执行
- [ ] 缓存机制正常工作

### 7.2 性能验收
- [ ] 首次查词响应时间 < 500ms
- [ ] 总处理时间减少 ≥ 40%
- [ ] API调用次数减少 ≥ 25%
- [ ] 缓存命中率 ≥ 60%

### 7.3 用户体验验收
- [ ] 用户可在翻译过程中查词
- [ ] 已知单词查询无延迟
- [ ] 未知单词补充过程用户无感知
- [ ] 整体流程流畅无卡顿

## 八、风险控制

### 8.1 技术风险
- **并发控制**：避免过多并发请求导致服务器压力
- **数据一致性**：确保预查询和实时翻译结果一致
- **错误处理**：并行处理中的错误隔离

### 8.2 降级方案
- **预查询失败**：回退到原有顺序处理流程
- **并行处理异常**：自动切换到串行模式
- **缓存失效**：直接调用API获取翻译

## 九、后续优化方向

### 9.1 智能预测
- 基于用户历史查询预测常用单词
- 智能预加载高频词汇翻译

### 9.2 缓存策略
- 实现多级缓存机制
- 基于使用频率的缓存淘汰策略

### 9.3 性能监控
- 添加性能监控指标
- 实时调整并发参数