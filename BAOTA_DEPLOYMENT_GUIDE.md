# 宝塔面板部署指南 - 解决路径问题

## 问题分析

您在宝塔面板上遇到的错误：
```
unable to prepare context path "/www/wwwroot/cloze test/backend" not found
```

**问题原因：**
1. 目录路径包含空格（"cloze test"）
2. Docker对包含空格的路径处理有问题
3. 宝塔面板的默认路径结构

## 解决方案

### 方案一：重命名目录（推荐）

1. **登录宝塔面板**，进入文件管理
2. **重命名目录**：
   ```bash
   # 在宝塔终端执行
   cd /www/wwwroot
   mv "cloze test" cloze-test
   ```

3. **更新网站配置**（如果在宝塔创建了网站）：
   - 进入宝塔面板 → 网站
   - 找到对应的网站，点击"设置"
   - 修改"根目录"为：`/www/wwwroot/cloze-test`
   - 保存配置

### 方案二：修改Docker Compose配置

如果无法重命名目录，可以修改`docker-compose.yml`：

```yaml
# 修改backend服务的构建上下文
backend:
  build:
    context: .
    dockerfile: backend/Dockerfile
  # 其他配置保持不变
```

### 方案三：使用符号链接

```bash
# 创建不带空格的符号链接
cd /www/wwwroot
ln -s "cloze test" cloze-test
cd cloze-test

# 然后在这个目录中运行Docker
```

## 完整部署步骤

### 1. 准备环境

```bash
# 登录服务器SSH
ssh root@your-server-ip

# 进入项目目录（使用重命名后的目录）
cd /www/wwwroot/cloze-test

# 设置文件权限
chmod -R 755 .
chown -R www:www .
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**需要配置的重要变量：**
```env
# 腾讯翻译API
TENCENT_APP_ID=your_app_id
TENCENT_APP_KEY=your_app_key
TENCENT_TRANSLATE_URL=https://tmt.tencentcloudapi.com

# 火山引擎API  
VOLCANO_API_KEY=your_volcano_key
VOLCANO_API_URL=https://ark.cn-beijing.volces.com/api/v3

# 数据库配置（使用Docker Compose中的默认值）
DB_HOST=postgres
DB_PORT=5432
DB_NAME=cloze_test
DB_USER=postgres
DB_PASSWORD=142152Qa@

# JWT密钥
JWT_SECRET=your_secure_jwt_secret_here
```

### 3. 启动Docker服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 验证部署

```bash
# 检查后端服务
curl http://localhost:8080/health
# 应该返回: {"status":"ok"}

# 检查前端服务
curl http://localhost:3000
# 应该返回HTML内容

# 检查Nginx代理
curl http://localhost/api/health  
# 应该返回: {"status":"ok"}
```

### 5. 宝塔面板配置

1. **创建网站**（如果尚未创建）：
   - 域名：您的域名
   - 根目录：`/www/wwwroot/cloze-test`
   - PHP版本：纯静态

2. **设置反向代理**：
   - 进入网站设置 → 反向代理
   - 添加反向代理：
     - 目标URL：`http://127.0.0.1:8080`
     - 发送域名：`$host`
     - 位置：`/api/`

3. **设置SSL证书**（可选）：
   - 进入SSL选项卡
   - 申请或上传SSL证书

## 常见问题解决

### 问题1: Docker构建失败
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 问题2: 端口冲突
```bash
# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :8080
netstat -tlnp | grep :3000

# 停止冲突的服务
systemctl stop nginx  # 如果宝塔的Nginx冲突
```

### 问题3: 文件权限问题
```bash
# 设置正确的文件权限
chmod -R 755 /www/wwwroot/cloze-test
chown -R www:www /www/wwwroot/cloze-test
```

### 问题4: 数据库连接失败
```bash
# 检查数据库服务
docker-compose logs postgres

# 重启数据库服务
docker-compose restart postgres
```

## 维护命令

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码后重新部署
git pull
docker-compose up -d --build
```

## 重要提示

1. **备份数据**：定期备份PostgreSQL数据
2. **监控资源**：使用宝塔面板监控服务器资源使用情况
3. **安全配置**：定期更新Docker镜像和安全补丁
4. **日志管理**：定期清理Docker日志文件

## 技术支持

如果遇到问题，可以检查：
- Docker日志：`docker-compose logs`
- 宝塔面板日志
- 系统资源使用情况

或者联系开发团队获取支持。