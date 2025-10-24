# 完形填空学习系统

一个基于Vue 3 + Node.js的英语完形填空学习平台，专注于段落翻译和单词学习功能。

## 🚀 核心功能

- **段落翻译**: 自动翻译英文段落，支持缓存机制
- **单词学习**: 点击单词显示翻译和音标
- **智能映射**: 从段落翻译中提取单词对应关系
- **文章管理**: 本地存储管理英文文章（使用localStorage）
- **响应式设计**: 支持多设备访问
- **主题切换**: 明暗主题支持

## 🏗️ 技术架构

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **UI组件**: Vant + 自定义组件
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **数据存储**: localStorage（文章管理）

### 后端
- **运行时**: Node.js + TypeScript
- **框架**: Express.js
- **数据库**: PostgreSQL（翻译历史和单词存储）
- **翻译API**: 腾讯云翻译

### 部署
- **容器化**: Docker + Docker Compose
- **缓存**: Redis (可选)
- **反向代理**: Nginx (生产环境)

## 📦 快速开始

### 环境要求

- Node.js 16.20.0+
- Docker & Docker Compose (可选)
- PostgreSQL 14+ (如不使用Docker)
- Redis 6+ (如不使用Docker)

### 开发环境启动

1. **克隆项目**
```bash
git clone <repository-url>
cd cloze_test
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑.env文件，配置API密钥
```

3. **使用启动脚本 (推荐)**
```powershell
# Windows PowerShell
.\start-dev.ps1
```

4. **手动启动**
```bash
# 启动数据库服务
docker-compose up -d postgres redis

# 启动后端
cd backend
npm install
npm run dev

# 启动前端 (新终端)
cd ..
npm install
npm run dev
```

### 生产环境部署

```bash
# 使用Docker Compose一键部署
docker-compose up -d

# 或者分步部署
docker-compose up -d postgres redis
docker-compose up -d backend
docker-compose up -d frontend nginx
```

## 🔧 配置说明

### 环境变量

#### 前端配置
```env
# API基础URL
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 后端配置
```env
# 服务器配置
PORT=8080
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloze_test
DB_USER=postgres
DB_PASSWORD=your_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 翻译API配置
TENCENT_APP_ID=your_app_id
TENCENT_APP_KEY=your_app_key
VOLCANO_API_KEY=your_api_key

# JWT密钥
JWT_SECRET=your_jwt_secret
```

## 📚 API文档

### 翻译接口

- `POST /api/translate` - 单文本翻译
- `POST /api/translate/batch` - 批量翻译
- `GET /api/translate/history` - 翻译历史
- `GET /api/translate/stats` - 翻译统计
- `DELETE /api/translate/cache` - 清除缓存

### 单词接口

- `POST /api/words` - 保存单词翻译
- `GET /api/words/:word` - 查询单词信息

### 系统接口

- `GET /api/health` - 健康检查
- `GET /api/info` - API信息

详细API文档请访问: `http://localhost:8080/api/info`

**注意**: 文章管理功能已迁移到前端localStorage，不再使用后端API。

## 🧪 测试

### API测试
访问 `http://localhost:5173/test-backend.html` 进行API接口测试

### 单元测试
```bash
# 后端测试
cd backend
npm test

# 前端测试
npm test
```

## 📁 项目结构

```
cloze_test/
├── backend/                 # 后端服务（翻译和单词功能）
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器（翻译、单词）
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── repositories/   # 数据访问层（翻译、单词）
│   │   ├── routes/         # 路由定义（翻译、单词）
│   │   ├── services/       # 业务逻辑（翻译、单词）
│   │   └── utils/          # 工具函数
│   ├── sql/               # 数据库脚本
│   └── Dockerfile         # 后端容器配置
├── src/                    # 前端源码
│   ├── components/        # Vue组件
│   │   ├── common/        # 通用组件
│   │   ├── essay/         # 文章相关组件（localStorage）
│   │   └── ui/            # UI组件
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── store/             # 状态管理（localStorage）
├── docs/                   # 项目文档
├── docker-compose.yml      # 容器编排
├── nginx.conf             # Nginx配置
└── start-dev.ps1          # 开发启动脚本
```

## 🔄 迁移说明

本项目已从EdgeOne边缘函数迁移到自托管Node.js服务器，并进行了架构简化：

- ✅ 翻译功能完全迁移
- ✅ 数据库持久化（翻译历史和单词）
- ✅ 缓存机制优化
- ✅ API接口标准化
- ✅ 容器化部署支持
- ✅ 文章管理简化为localStorage模式

### 最新更新（localStorage模式）

- 🔄 文章管理功能已从API模式迁移到localStorage
- 🗑️ 移除了essays相关的后端API和数据库表
- 📦 简化了前端状态管理，提升性能
- 🚀 减少了服务器负载，提高响应速度

迁移文档详见: `docs/edgeone_migration/`

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 🆘 故障排除

### 常见问题

1. **端口冲突**: 修改docker-compose.yml中的端口映射
2. **数据库连接失败**: 检查数据库服务状态和连接配置
3. **API请求失败**: 确认后端服务已启动且端口正确

### 日志查看

```bash
# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 查看实时日志
docker-compose logs -f backend
```

### 重置环境

```bash
# 停止所有服务
docker-compose down

# 清理数据卷 (注意：会删除数据)
docker-compose down -v

# 重新构建并启动
docker-compose up --build -d
```
