# 简化版系统配置待办事项

## 🔧 必需配置

### 1. 翻译API配置
**状态**: ⚠️ 需要配置

**位置**: `backend/.env`

**配置项**:
```env
# 腾讯云翻译API
TENCENT_APP_ID=your_app_id
TENCENT_APP_KEY=your_app_key

# 火山翻译API（备选）
VOLCANO_API_KEY=your_api_key
```

**操作指引**:
1. 登录腾讯云控制台
2. 开通机器翻译服务
3. 获取APP_ID和APP_KEY
4. 更新backend/.env文件

### 2. 数据库配置
**状态**: ⚠️ 需要确认

**位置**: `backend/.env`

**配置项**:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloze_test
DB_USER=postgres
DB_PASSWORD=your_password
```

**操作指引**:
1. 确认PostgreSQL服务正常运行
2. 验证数据库连接参数
3. 运行数据库初始化脚本

## 🗄️ 数据库清理

### 1. 删除essays相关表
**状态**: ⚠️ 建议执行

**SQL命令**:
```sql
-- 连接到数据库
docker exec -it cloze_postgres psql -U postgres -d cloze_test

-- 删除essays表（如果存在）
DROP TABLE IF EXISTS essays CASCADE;

-- 删除相关索引（如果存在）
DROP INDEX IF EXISTS idx_essays_category;
DROP INDEX IF EXISTS idx_essays_difficulty;
DROP INDEX IF EXISTS idx_essays_created_at;
```

**操作指引**:
1. 备份现有数据（如果需要）
2. 执行上述SQL命令
3. 验证表已删除

### 2. 清理学习记录表
**状态**: ⚠️ 建议执行

**SQL命令**:
```sql
-- 如果learning_records表存在essay_id字段，需要处理
ALTER TABLE learning_records DROP COLUMN IF EXISTS essay_id;
```

## 📦 前端优化

### 1. localStorage容量监控
**状态**: 💡 建议实现

**实现建议**:
```typescript
// 添加到utils/storageService.ts
export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  return total;
};

export const getStorageLimit = () => {
  // 大多数浏览器localStorage限制为5-10MB
  return 5 * 1024 * 1024; // 5MB
};
```

### 2. 数据导出功能增强
**状态**: 💡 建议实现

**功能建议**:
- 支持JSON格式导出
- 支持CSV格式导出
- 批量导入功能
- 数据验证功能

## 🚀 性能优化

### 1. 前端缓存策略
**状态**: 💡 建议实现

**优化建议**:
```typescript
// 翻译结果缓存优化
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

interface CacheItem {
  data: string;
  timestamp: number;
}

export const getCachedTranslation = (text: string): string | null => {
  const cached = localStorage.getItem(`translation_${text}`);
  if (cached) {
    const item: CacheItem = JSON.parse(cached);
    if (Date.now() - item.timestamp < CACHE_EXPIRY) {
      return item.data;
    }
    localStorage.removeItem(`translation_${text}`);
  }
  return null;
};
```

### 2. 后端API优化
**状态**: 💡 建议实现

**优化建议**:
- 添加请求频率限制
- 实现响应压缩
- 添加API缓存头
- 优化数据库查询

## 🔒 安全配置

### 1. 环境变量安全
**状态**: ⚠️ 需要检查

**检查项**:
- [ ] .env文件已添加到.gitignore
- [ ] 生产环境使用环境变量而非.env文件
- [ ] API密钥定期轮换
- [ ] 数据库密码强度足够

### 2. CORS配置
**状态**: ⚠️ 需要配置

**位置**: `backend/src/index.ts`

**配置建议**:
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173'],
  credentials: true
}));
```

## 📊 监控和日志

### 1. 错误监控
**状态**: 💡 建议实现

**实现建议**:
- 前端错误收集
- 后端日志记录
- API调用统计
- 性能监控

### 2. 使用统计
**状态**: 💡 建议实现

**统计项**:
- 翻译请求次数
- 单词查询频率
- 文章创建数量
- 用户活跃度

## 🔄 备份策略

### 1. 数据库备份
**状态**: ⚠️ 需要设置

**备份脚本**:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec cloze_postgres pg_dump -U postgres cloze_test > backup_$DATE.sql
```

**操作指引**:
1. 创建备份脚本
2. 设置定时任务（cron）
3. 配置备份存储位置

### 2. 配置文件备份
**状态**: 💡 建议实现

**备份内容**:
- docker-compose.yml
- nginx.conf
- .env.example
- 数据库初始化脚本

## 📋 部署检查清单

### 生产环境部署前检查

- [ ] 翻译API配置正确
- [ ] 数据库连接正常
- [ ] 环境变量已设置
- [ ] CORS配置正确
- [ ] SSL证书已配置
- [ ] 备份策略已实施
- [ ] 监控系统已部署
- [ ] 日志收集已配置

### 功能测试清单

- [ ] 文章创建/编辑/删除
- [ ] 段落翻译功能
- [ ] 单词查询功能
- [ ] 数据导入/导出
- [ ] 主题切换
- [ ] 响应式布局

## 📞 技术支持

如需技术支持，请提供以下信息：

1. **系统环境**: 操作系统、Node.js版本、数据库版本
2. **错误日志**: 前端控制台错误、后端日志
3. **配置信息**: 环境变量配置（隐藏敏感信息）
4. **重现步骤**: 详细的操作步骤

## 🎯 优先级说明

- ⚠️ **高优先级**: 必须完成，影响系统正常运行
- 💡 **中优先级**: 建议实现，提升用户体验
- 📋 **低优先级**: 可选实现，长期优化项目