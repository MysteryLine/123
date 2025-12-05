

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



REM 获取所有远程仓库（只取仓库名和地址，不带 (fetch)）
setlocal enabledelayedexpansion
set remote_count=0
for /f "tokens=1,2 delims= " %%A in ('git remote -v') do (
	echo %%A %%B | findstr /v "(push)" >nul
	if not errorlevel 1 (
		set /a remote_count+=1
		set remote_name_!remote_count!=%%A
		for /f "tokens=1 delims= " %%C in ("%%B") do (
			set remote_url_!remote_count!=%%C
		)
	)
)

if %remote_count%==0 (
	echo 未检测到远程仓库，请先添加远程仓库！
	pause
	exit /b
)

echo 可用远程仓库：
for /l %%i in (1,1,%remote_count%) do (
	set name=!remote_name_%%i!
	set url=!remote_url_%%i!
	echo   %%i. 仓库名: !name!  地址: !url!
)
set /p remote_choice=请选择要推送的仓库编号 (1-%remote_count%): 
if "%remote_choice%"=="" set remote_choice=1
set remote_name=
set remote_url=
for /l %%i in (1,1,%remote_count%) do (
	if "%%i"=="%remote_choice%" (
		set remote_name=!remote_name_%%i!
		set remote_url=!remote_url_%%i!
	)
)
if "%remote_name%"=="" set remote_name=!remote_name_1!
if "%remote_url%"=="" set remote_url=!remote_url_1!

echo.
echo 📝 请输入本次提交信息 (默认: Update code):
set /p commit_msg=提交信息: 
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
set /p branch_choice=请输入分支编号 (1/2/3): 
set branch_name=
if "%branch_choice%"=="1" set branch_name=master
if "%branch_choice%"=="2" set branch_name=main
if "%branch_choice%"=="3" (
	set /p branch_name=请输入分支名称: 
)
if "%branch_name%"=="" set branch_name=master

echo.
echo 🚀 正在通过 SSH 推送到 [%remote_name%] (%remote_url%) 分支 [%branch_name%] ...
git push %remote_name% %branch_name%:%branch_name%
if errorlevel 1 (
	echo ❌ 推送失败，请检查网络或 SSH 配置！
) else (
	echo ✅ 推送成功！
)

echo.
echo 📍 仓库地址: %remote_url%
echo 📦 分支: %branch_name%
echo.
echo 操作已完成，按任意键退出...
pause
