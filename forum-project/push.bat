
@echo off
chcp 65001 >nul
title 论坛项目 GitHub SSH 推送脚本
color 0A

echo ========================================
echo   推送代码到 GitHub (SSH方式)
echo ========================================
echo.

cd /d %~dp0

echo 📊 当前 Git 状态如下：
git status
echo.

echo 📝 请输入本次提交信息 (默认: Update code):
set /p commit_msg="提交信息: "
if "%commit_msg%"=="" set commit_msg=Update code

echo 🔄 正在添加所有更改文件...
git add .

echo 📤 正在提交到本地仓库...
git commit -m "%commit_msg%"

echo.
echo 🏷️ 请选择要推送的分支：
echo   1. master
echo   2. main
echo   3. 其他分支 (请手动输入)
set /p branch_choice="请输入分支编号 (1/2/3): "
set branch_name=
if "%branch_choice%"=="1" set branch_name=master
if "%branch_choice%"=="2" set branch_name=main
if "%branch_choice%"=="3" (
	set /p branch_name="请输入分支名称: "
)
if "%branch_name%"=="" set branch_name=master

echo.
echo 🚀 正在通过 SSH 推送到 GitHub 分支 [%branch_name%] ...
git push git@github.com:MysteryLine/forum-project.git %branch_name%:%branch_name%

if errorlevel 1 (
	echo ❌ 推送失败，请检查网络或 SSH 配置！
) else (
	echo ✅ 推送成功！
)

echo.
echo 📍 仓库地址: git@github.com:MysteryLine/forum-project.git
echo 📦 分支: %branch_name%
echo.
echo 操作已完成，按任意键退出...
pause
