@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Forum Project - GitHub SSH Push Script (带更新内容填写)
color 0A

cd /d %~dp0

echo ========================================
echo   Push Code to GitHub (SSH) - 增强版
echo ========================================
echo.

REM Check if Git repository
if not exist .git (
    echo Error: Not a Git repository!
    pause
    exit /b
)

echo Git Status:
git status
echo.

REM 获取所有远程仓库（优化去重逻辑）
set remote_count=0
for /f "tokens=1,2 delims= " %%A in ('git remote -v') do (
    echo %%A %%B | findstr /v "(push)" >nul
    if not errorlevel 1 (
        REM 去重处理，避免重复显示同一个仓库
        set "duplicate=0"
        for /l %%i in (1,1,!remote_count!) do (
            if "!remote_name_%%i!"=="%%A" set "duplicate=1"
        )
        if "!duplicate!"=="0" (
            set /a remote_count+=1
            set remote_name_!remote_count!=%%A
            for /f "tokens=1 delims= " %%C in ("%%B") do (
                set remote_url_!remote_count!=%%C
            )
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
echo 📝 提交信息填写
echo ----------------
echo 请输入提交标题（简短描述，必填）：
set /p commit_title=提交标题: 
REM 确保标题不为空
:check_title
if "%commit_title%"=="" (
    echo ❌ 提交标题不能为空，请重新输入：
    set /p commit_title=提交标题: 
    goto check_title
)

echo.
echo 请输入详细更新内容（可选，多行输入，结束后按 Ctrl+Z 再按回车确认）：
echo 提示：可填写修改的功能、修复的问题、优化点等详细信息
echo.
set "update_content="
for /f "delims=" %%a in ('more') do (
    set "update_content=!update_content!%%a"
)

echo.
echo 🔍 预览提交信息：
echo ----------------
echo 标题：%commit_title%
if not "!update_content!"=="" (
    echo 详细更新内容：
    echo !update_content!
)
echo.

REM 组合最终的提交信息（标题+换行+详细内容）
if "!update_content!"=="" (
    set "commit_msg=%commit_title%"
) else (
    set "commit_msg=%commit_title%^n^n!update_content!"
)

echo 🔄 正在添加所有更改文件...
git add .

echo 📤 正在提交到本地仓库...
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo.
    echo ⚠️ 警告：没有可提交的更改或提交失败！
    echo.
    echo 操作已完成，按任意键退出...
    pause
    exit /b
)

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
echo 📋 推送信息汇总
echo ----------------
echo 仓库地址: %remote_url%
echo 分支: %branch_name%
echo 提交标题: %commit_title%
if not "!update_content!"=="" (
    echo 详细更新内容: !update_content!
)
echo.
echo 操作已完成，按任意键退出...
pause
endlocal