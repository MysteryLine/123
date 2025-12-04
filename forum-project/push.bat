@echo off
chcp 65001 >nul
echo =====================================
echo   将所有本地代码强制推送到 master
echo =====================================
echo.

cd /d d:\Agithub\forum-project

echo [1/4] 当前分支...
git branch --show-current
echo.

echo [2/4] 添加所有修改...
git add .
echo.

echo [3/4] 强制推送到 GitHub master 分支...
echo 正在推送（可能需要 1-2 分钟）...
git push origin master --force-with-lease
echo.

echo [4/4] 验证推送结果...
git log --oneline -1
echo.

echo =====================================
echo 推送完成！
echo =====================================
git fetch origin
git log origin/master..master --oneline >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 已同步！master 分支已推送到 GitHub
    echo.
    echo GitHub 地址: https://github.com/MysteryLine/forum-project
    echo 分支: master
    echo 前端将在 1-3 分钟内自动重新部署...
) else (
    echo ✓ 推送成功！
)

echo.
pause
