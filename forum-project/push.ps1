

# 论坛项目 GitHub SSH 推送脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送代码到 GitHub (SSH方式)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
Set-Location $PSScriptRoot

# 检查 Git 状态
Write-Host "📊 当前 Git 状态如下：" -ForegroundColor Yellow
git status
Write-Host ""


# 获取所有远程仓库（显示仓库名和地址）
$remotes = git remote -v | Select-String "(fetch)" | ForEach-Object {
    $line = $_.ToString().Trim()
    $parts = $line.Split(' ')
    @{ Name = $parts[0]; Url = $parts[1] }
}

if ($remotes.Count -eq 0) {
    Write-Host "未检测到远程仓库，请先添加远程仓库！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit
}

Write-Host "可用远程仓库：" -ForegroundColor Yellow
for ($i=0; $i -lt $remotes.Count; $i++) {
    Write-Host "  $($i+1). 仓库名: $($remotes[$i].Name)  地址: $($remotes[$i].Url)"
}
$remote_choice = Read-Host "请选择要推送的仓库编号 (1-$($remotes.Count))"
if ($remote_choice -match '^[0-9]+$' -and $remote_choice -ge 1 -and $remote_choice -le $remotes.Count) {
    $remote_name = $remotes[$remote_choice-1].Name
    $remote_url = $remotes[$remote_choice-1].Url
} else {
    $remote_name = $remotes[0].Name
    $remote_url = $remotes[0].Url
}

# 获取提交信息
$commit_msg = Read-Host "📝 请输入本次提交信息 (默认: Update code)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $commit_msg = "Update code"
}

Write-Host "🔄 正在添加所有更改文件..." -ForegroundColor Green
git add .

Write-Host "📤 正在提交到本地仓库..." -ForegroundColor Green
git commit -m $commit_msg

# 选择分支
Write-Host ""
Write-Host "🏷️ 请选择要推送的分支：" -ForegroundColor Yellow
Write-Host "  1. master"
Write-Host "  2. main"
Write-Host "  3. 其他分支 (手动输入)"
$branch_choice = Read-Host "请输入分支编号 (1/2/3)"
switch ($branch_choice) {
    "1" { $branch_name = "master" }
    "2" { $branch_name = "main" }
    "3" { $branch_name = Read-Host "请输入分支名称" }
    default { $branch_name = "master" }
}

Write-Host ""
Write-Host "🚀 正在通过 SSH 推送到 [$remote_name] ($remote_url) 分支 [$branch_name] ..." -ForegroundColor Green
git push $remote_name $branch_name:$branch_name
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败，请检查网络或 SSH 配置！" -ForegroundColor Red
} else {
    Write-Host "✅ 推送成功！" -ForegroundColor Green
}

Write-Host ""
Write-Host "📍 仓库地址: $remote_url" -ForegroundColor Yellow
Write-Host "📦 分支: $branch_name" -ForegroundColor Yellow
Write-Host ""
Read-Host "操作已完成，按 Enter 键退出..."
