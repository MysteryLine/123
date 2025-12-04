# 论坛项目 GitHub 推送脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送代码到 GitHub (123仓库)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
Set-Location $PSScriptRoot

# 检查 Git 状态
Write-Host "📊 检查 Git 状态..." -ForegroundColor Yellow
git status
Write-Host ""

# 获取提交信息
$commit_msg = Read-Host "📝 输入提交信息 (默认: Update code)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $commit_msg = "Update code"
}

Write-Host ""
Write-Host "🔄 正在添加所有文件..." -ForegroundColor Green
git add .

Write-Host "📤 正在提交..." -ForegroundColor Green
git commit -m $commit_msg

Write-Host "🚀 正在推送到 123 仓库..." -ForegroundColor Green
git push https://github.com/MysteryLine/123.git master:main

Write-Host ""
Write-Host "✅ 推送完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 仓库: https://github.com/MysteryLine/123" -ForegroundColor Yellow
Write-Host ""
Read-Host "按 Enter 键关闭"
