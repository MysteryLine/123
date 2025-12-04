@echo off
chcp 65001 >nul
title 论坛项目 GitHub 推送脚本
color 0A

echo ========================================
echo   推送代码到 GitHub
echo ========================================
echo.

cd /d %~dp0

echo 📊 检查 Git 状态...
git status
echo.

echo 📝 输入提交信息 (默认: Update code):
set /p commit_msg="提交信息: "
if "%commit_msg%"=="" set commit_msg=Update code

echo.
echo 🔄 正在添加所有文件...
git add .

echo 📤 正在提交...
git commit -m "%commit_msg%"

echo 🚀 正在推送到 GitHub...
git push origin master:main

echo.
echo ✅ 推送完成！
echo.
echo 📍 仓库: https://github.com/MysteryLine/forum-project
echo.
pause
