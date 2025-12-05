@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Forum Project - GitHub SSH Push

cd /d %~dp0

if not exist .git (
    echo Error: Not a Git repository!
    pause
    exit /b
)

echo.
echo ========================================
echo   GitHub SSH Push Tool
echo ========================================
echo.

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
    echo Error: No remote repository found!
    pause
    exit /b
)

echo Available remotes:
for /l %%i in (1,1,%remote_count%) do (
    set name=!remote_name_%%i!
    set url=!remote_url_%%i!
    echo   %%i. !name! - !url!
)
echo.
set /p remote_choice="Select repository (1-%remote_count%, default 1): "
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

echo.
echo Select branch:
echo   1. master
echo   2. main
echo   3. custom
set /p branch_choice="Enter choice (1/2/3, default 1): "
if "%branch_choice%"=="" set branch_choice=1

if "%branch_choice%"=="1" (
    set branch_name=master
) else if "%branch_choice%"=="2" (
    set branch_name=main
) else (
    set /p branch_name="Enter branch name: "
    if "%branch_name%"=="" set branch_name=master
)

echo.
echo Enter commit message (default: Update code):
set /p commit_msg="Message: "
if "%commit_msg%"=="" set commit_msg=Update code

echo.
echo Git Status:
git status --short
echo.

echo ========================================
echo Push Confirmation
echo ========================================
echo Repository: %remote_name% (%remote_url%)
echo Branch: %branch_name%
echo Message: %commit_msg%
echo ========================================
set /p confirm="Confirm push? (y/n, default y): "
if /i "%confirm%"=="n" (
    echo Operation cancelled
    pause
    exit /b
)

echo.
echo Processing...
echo   1. Adding files...
git add .

echo   2. Committing...
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo.
    echo Warning: No changes or commit failed
    echo.
    pause
    exit /b
)

echo   3. Pushing...
git push %remote_name% %branch_name%:%branch_name%

if errorlevel 1 (
    echo.
    echo Error: Push failed! Check network or SSH config
) else (
    echo.
    echo Success: Push completed!
)

echo.
echo ========================================
echo Done! Press any key to exit...
pause
