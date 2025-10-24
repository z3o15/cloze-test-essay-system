# 开发环境启动脚本
Write-Host "启动完形填空项目开发环境..." -ForegroundColor Green

# 检查Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查Node.js版本
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)\.(\d+)\.") {
    $majorVersion = [int]$matches[1]
    $minorVersion = [int]$matches[2]
    if ($majorVersion -lt 16 -or ($majorVersion -eq 16 -and $minorVersion -lt 20)) {
        Write-Host "❌ 需要Node.js 16.20.0或更高版本，当前版本: $nodeVersion" -ForegroundColor Red
        exit 1
    }
}

# 检查Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "警告: 未找到Docker，将跳过数据库服务启动" -ForegroundColor Yellow
    $useDocker = $false
} else {
    $useDocker = $true
}

# 创建.env文件（如果不存在）
if (-not (Test-Path ".env")) {
    Write-Host "创建.env文件..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "请编辑.env文件配置API密钥" -ForegroundColor Yellow
}

# 启动数据库服务（如果有Docker）
if ($useDocker) {
    Write-Host "启动数据库服务..." -ForegroundColor Blue
    docker-compose up -d postgres redis
    Start-Sleep -Seconds 5
}

# 安装后端依赖
Write-Host "安装后端依赖..." -ForegroundColor Blue
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
}

# 启动后端服务
Write-Host "启动后端服务..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# 返回根目录
Set-Location ..

# 安装前端依赖
Write-Host "安装前端依赖..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    npm install
}

# 等待后端启动
Write-Host "等待后端服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "启动前端服务..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host "开发环境启动完成!" -ForegroundColor Green
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API测试页面: http://localhost:5173/test-backend.html" -ForegroundColor Cyan

if ($useDocker) {
    Write-Host "数据库管理:" -ForegroundColor Cyan
    Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Gray
    Write-Host "  Redis: localhost:6379" -ForegroundColor Gray
}

Write-Host "`n按任意键退出..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")