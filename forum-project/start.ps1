# 论坛项目一键启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  论坛项目启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查并关闭占用端口的进程
Write-Host "🔍 检查并关闭占用端口的进程..." -ForegroundColor Yellow

# 关闭占用 5000 端口的进程
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    foreach ($conn in $port5000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ 已关闭占用 5000 端口的进程" -ForegroundColor Green
}

# 关闭占用 3000 端口的进程
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    foreach ($conn in $port3000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ 已关闭占用 3000 端口的进程" -ForegroundColor Green
}

Write-Host ""

# 启动后端服务器
Write-Host "🚀 正在启动后端服务器..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# 等待2秒让后端先启动
Start-Sleep -Seconds 2

# 启动前端服务器
Write-Host "🚀 正在启动前端服务器..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ 前后端服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 后端运行在: http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "📍 前端运行在: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "提示: 关闭窗口可停止对应服务" -ForegroundColor Gray
Write-Host ""
