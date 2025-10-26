#!/bin/bash
# 宝塔面板Docker路径修复脚本

echo "🔧 开始修复宝塔面板Docker路径问题..."

# 检查当前目录
current_dir=$(pwd)
echo "当前目录: $current_dir"

# 检查目录中是否包含空格
if [[ "$current_dir" == *" "* ]]; then
    echo "⚠️  警告：目录路径包含空格，这可能导致Docker构建问题"
    echo "建议将目录重命名为不包含空格的名称"
    
    # 提供重命名建议
    new_dir="${current_dir// /-}"
    echo "建议重命名为: $new_dir"
    echo "执行: mv \"$current_dir\" \"$new_dir\""
    exit 1
fi

# 检查backend目录是否存在
if [ ! -d "backend" ]; then
    echo "❌ 错误：backend目录不存在"
    echo "请确保上传的文件结构正确"
    ls -la
    exit 1
fi

echo "✅ backend目录存在"

# 检查Docker Compose文件
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误：docker-compose.yml不存在"
    exit 1
fi

echo "✅ docker-compose.yml存在"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：.env文件不存在，从.example文件创建"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已创建.env文件，请编辑配置"
    else
        echo "❌ 错误：.env.example也不存在"
        exit 1
    fi
fi

echo "✅ 环境变量文件检查完成"

# 尝试构建backend服务
echo "🚀 尝试构建backend服务..."
cd backend

# 检查backend的Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo "❌ 错误：backend/Dockerfile不存在"
    exit 1
fi

echo "✅ backend/Dockerfile存在"

# 回到项目根目录
cd ..

# 尝试使用docker-compose构建
echo "🏗️  使用docker-compose构建服务..."
docker-compose build backend

if [ $? -eq 0 ]; then
    echo "🎉 backend服务构建成功！"
    echo "接下来可以运行: docker-compose up -d"
else
    echo "❌ docker-compose构建失败"
    echo "尝试手动构建backend..."
    
    cd backend
    docker build -t cloze-test-backend .
    
    if [ $? -eq 0 ]; then
        echo "✅ 手动构建backend成功"
        echo "现在可以运行: docker-compose up -d"
    else
        echo "❌ 手动构建也失败，请检查Dockerfile和文件权限"
        exit 1
    fi
fi