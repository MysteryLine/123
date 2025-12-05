@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Forum Project - GitHub SSH Push

cd /d %~dp0

REM 检查是否是 Git 仓库
if not exist .git (
    echo ❌ 错误：当前不是 Git 仓库！
    pause
    exit /b
)

echo.
echo ========================================
echo   🚀 GitHub SSH 推送工具
echo ========================================
echo.

REM 获取所有远程仓库
set remote_count=0
for /f "tokens=1,2 delims= " %%A in ('git remote -v') do (
    echo %%B | findstr /v "(push)" >nul
    if not errorlevel 1 (
        set /a remote_count+=1
        set remote_name_!remote_count!=%%A
        set remote_url_!remote_count!=%%B
    )
)

if %remote_count%==0 (
    echo ❌ 未检测到远程仓库！
    pause
    exit /b
)

REM 选择仓库
echo 📋 可用的远程仓库：
for /l %%i in (1,1,%remote_count%) do (
    set name=!remote_name_%%i!
    set url=!remote_url_%%i!
    echo   %%i^. !name! - !url!
)
echo.
set /p remote_choice="请选择仓库 (1-%remote_count%, 默认 1): "
if "%remote_choice%"=="" set remote_choice=1

set remote_name=
set remote_url=
for /l %%i in (1,1,%remote_count%) do (
    if "%%i"=="%remote_choice%" (
        set remote_name=!remote_name_%%i!
        set remote_url=!remote_url_%%i!
    )
)

if "%remote_name%"=="" (
    set remote_name=!remote_name_1!
    set remote_url=!remote_url_1!
)

REM 选择分支
echo.
echo 🏷️  请选择分支：
echo   1. master
echo   2. main
echo   3. 自定义
set /p branch_choice="请输入选择 (1/2/3, 默认 1): "
if "%branch_choice%"=="" set branch_choice=1

if "%branch_choice%"=="1" (
    set branch_name=master
) else if "%branch_choice%"=="2" (
    set branch_name=main
) else (
    set /p branch_name="请输入分支名称: "
    if "%branch_name%"=="" set branch_name=master
)

REM 输入提交信息
echo.
echo 📝 请输入本次更新的简要内容：
set /p commit_msg="提交信息 (默认: Update code): "
if "%commit_msg%"=="" set commit_msg=Update code

REM 查看状态
echo.
echo 📊 当前 Git 状态：
git status --short
echo.

REM 确认
echo ========================================
echo 📤 推送信息确认
echo ========================================
echo 仓库：%remote_name% (%remote_url%)
echo 分支：%branch_name%
echo 提交信息：%commit_msg%
echo ========================================
set /p confirm="确认推送吗？(y/n, 默认 y): "
if /i "%confirm%"=="n" (
    echo 已取消操作
    pause
    exit /b
)

REM 执行推送
echo.
echo 🔄 正在操作...
echo   1. 添加文件...
git add .

echo   2. 提交...
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo.
    echo ⚠️  提示：没有更改或提交失败
    echo.
    pause
    exit /b
)

echo   3. 推送...
git push %remote_name% %branch_name%:%branch_name%

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！请检查网络或 SSH 配置
) else (
    echo.
    echo ✅ 推送成功！
)

echo.
echo ========================================
echo 操作完成，按任意键退出...
pause
