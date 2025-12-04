@echo off
chcp 65001 >nul
title 论坛项目启动器
color 0A

echo ========================================
echo   论坛项目一键启动
echo ========================================
echo.

echo � 检查并关闭占用端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 端口已清理
echo.

echo �🚀 正在启动后端服务器...
start "后端服务器 - Port 5000" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo 🚀 正在启动前端服务器...
start "前端服务器 - Port 3000" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ 前后端服务已启动！
echo.
echo 📍 后端运行在: http://localhost:5000/api
echo 📍 前端运行在: http://localhost:3000
echo.
echo 提示: 关闭对应窗口可停止服务
echo.
pause
