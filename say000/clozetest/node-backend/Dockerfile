# 第一阶段：构建阶段（安装所有依赖，包括开发依赖）
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖配置文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于编译 TypeScript）
RUN npm ci

# 复制源代码
COPY . .

# 执行 TypeScript 构建（此时 tsc 命令可用）
RUN npm run build


# 第二阶段：生产阶段（仅保留运行时所需文件）
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 重置并配置Alpine仓库，然后安装curl用于健康检查
RUN echo "https://dl-cdn.alpinelinux.org/alpine/v3.18/main" > /etc/apk/repositories && \
    echo "https://dl-cdn.alpinelinux.org/alpine/v3.18/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache curl

# 创建非 root 用户（提前创建，避免权限问题）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 从构建阶段复制编译结果和依赖配置
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 仅安装生产依赖（减小镜像体积）
RUN npm ci --only=production

# 创建日志目录并设置权限（非 root 用户可写）
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs /app/node_modules

# 切换到非 root 用户运行
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动应用（假设编译后的入口文件在 dist 目录下，根据实际情况调整）
CMD ["npm", "start"]