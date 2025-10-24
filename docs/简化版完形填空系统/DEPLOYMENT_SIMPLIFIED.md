# 简化版完形填空系统部署说明

## 系统架构简化

本系统已简化为以下架构：

### 前端
- 文章管理：使用 localStorage 本地存储
- 翻译功能：调用后端API
- 单词查询：调用后端API

### 后端
- 翻译服务：腾讯云翻译API
- 单词存储：PostgreSQL数据库
- 翻译历史：PostgreSQL数据库

## 部署步骤

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd cloze_test

# 配置环境变量
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. 配置翻译API

编辑 `backend/.env` 文件：

```env
# 腾讯云翻译配置
TENCENT_APP_ID=your_app_id
TENCENT_APP_KEY=your_app_key

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloze_test
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. 启动服务

#### 使用Docker（推荐）

```bash
# 启动数据库
docker-compose up -d postgres

# 启动后端
docker-compose up -d backend

# 启动前端
docker-compose up -d frontend nginx
```

#### 手动启动

```bash
# 启动数据库
docker-compose up -d postgres

# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd ..
npm install
npm run dev
```

### 4. 访问应用

- 前端应用：http://localhost:5173
- 后端API：http://localhost:8080

## 功能说明

### 已简化的功能

1. **文章管理**
   - 不再使用后端API
   - 数据存储在浏览器localStorage中
   - 支持导入/导出功能

2. **翻译功能**
   - 保持后端API调用
   - 支持缓存机制
   - 自动保存翻译历史

3. **单词查询**
   - 保持后端API调用
   - 自动保存到数据库
   - 支持本地词典

### 数据存储

- **localStorage**: 文章数据、用户设置
- **PostgreSQL**: 翻译历史、单词数据
- **内存缓存**: 翻译结果临时缓存

## 维护说明

### 数据备份

```bash
# 备份数据库
docker exec -t cloze_postgres pg_dump -U postgres cloze_test > backup.sql

# 恢复数据库
docker exec -i cloze_postgres psql -U postgres cloze_test < backup.sql
```

### 日志查看

```bash
# 查看后端日志
docker-compose logs backend

# 查看实时日志
docker-compose logs -f backend
```

### 性能优化

1. **前端优化**
   - localStorage数据定期清理
   - 组件懒加载
   - 图片压缩

2. **后端优化**
   - 翻译结果缓存
   - 数据库连接池
   - API请求限流

## 故障排除

### 常见问题

1. **翻译功能不可用**
   - 检查腾讯云API配置
   - 确认网络连接正常
   - 查看后端日志

2. **文章数据丢失**
   - 检查浏览器localStorage
   - 确认未清除浏览器数据
   - 使用导出功能备份

3. **数据库连接失败**
   - 检查PostgreSQL服务状态
   - 确认连接配置正确
   - 查看数据库日志

### 重置环境

```bash
# 停止所有服务
docker-compose down

# 清理数据（注意：会删除所有数据）
docker-compose down -v

# 重新启动
docker-compose up -d
```