# 完形填空系统部署指南

## 📋 部署前准备

### 1. 系统要求
- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- Docker Compose v2.0+
- 至少 4GB 可用内存
- 至少 2GB 可用磁盘空间

### 2. API密钥配置
在部署前，您需要获取以下API服务的密钥：

#### 腾讯翻译API
1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通机器翻译服务
3. 获取 `SecretId` 和 `SecretKey`

#### 火山引擎AI API
1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 开通豆包大模型服务
3. 获取 API Key

### 3. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
# 填入您的API密钥
```

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）
```powershell
# 启动服务
.\deploy.ps1 start

# 重新构建并启动
.\deploy.ps1 start -Build

# 查看服务状态
.\deploy.ps1 status

# 停止服务
.\deploy.ps1 stop

# 清理所有资源
.\deploy.ps1 clean -Clean
```

### 方法二：使用Docker Compose
```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🌐 访问地址

部署成功后，您可以通过以下地址访问系统：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080
- **Nginx代理**: http://localhost:80
- **API文档**: http://localhost:8080/api-docs

## 📊 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vue.js)      │    │   (Node.js)     │    │   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Cache)       │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🔧 配置说明

### 数据库配置
- **数据库名**: cloze_test
- **用户名**: postgres
- **密码**: postgres123
- **端口**: 5432

### Redis配置
- **主机**: redis
- **端口**: 6379
- **数据库**: 0

### 环境变量说明
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TENCENT_APP_ID` | 腾讯云SecretId | 必填 |
| `TENCENT_APP_KEY` | 腾讯云SecretKey | 必填 |
| `VOLCANO_API_KEY` | 火山引擎API Key | 必填 |
| `JWT_SECRET` | JWT签名密钥 | 建议修改 |
| `NODE_ENV` | 运行环境 | production |
| `LOG_LEVEL` | 日志级别 | info |

## 🐛 故障排除

### 常见问题

#### 1. Docker启动失败
```bash
# 检查Docker是否运行
docker ps

# 重启Docker服务
# Windows: 重启Docker Desktop
# Linux: sudo systemctl restart docker
```

#### 2. 端口冲突
如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:3000"  # 将前端端口改为3001
  - "8081:8080"  # 将后端端口改为8081
```

#### 3. API调用失败
- 检查 `.env` 文件中的API密钥是否正确
- 确认API服务是否已开通并有足够余额
- 查看后端日志：`docker-compose logs backend`

#### 4. 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 重启数据库服务
docker-compose restart postgres
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis

# 实时查看日志
docker-compose logs -f backend
```

### 数据备份
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres cloze_test > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres cloze_test < backup.sql
```

## 🔄 更新部署

### 更新代码
```bash
# 拉取最新代码
git pull

# 重新构建并部署
.\deploy.ps1 restart -Build
```

### 更新配置
```bash
# 修改环境变量后重启
.\deploy.ps1 restart
```

## 📈 性能优化

### 1. 缓存配置
根据使用情况调整缓存时间：
```env
CACHE_TTL_TRANSLATION=86400  # 翻译缓存24小时
CACHE_TTL_WORD=604800        # 单词缓存7天
CACHE_TTL_SESSION=1800       # 会话缓存30分钟
```

### 2. 数据库优化
- 定期清理过期数据
- 监控数据库性能
- 根据需要调整连接池大小

### 3. 资源监控
```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用情况
docker system df
```

## 🔒 安全建议

1. **修改默认密码**: 生产环境中修改数据库默认密码
2. **使用HTTPS**: 配置SSL证书启用HTTPS
3. **API密钥安全**: 妥善保管API密钥，不要提交到代码仓库
4. **定期更新**: 定期更新Docker镜像和依赖包
5. **访问控制**: 配置防火墙限制不必要的端口访问

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查服务日志获取详细错误信息
3. 确认环境配置是否正确
4. 联系技术支持团队