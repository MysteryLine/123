# 论坛项目 GitHub SSH 推送脚本（最终修复版）
# 解决括号不匹配 + 中文乱码 + 变量解析错误
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

# 标题输出
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送代码到 GitHub (SSH方式)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
Set-Location $PSScriptRoot

# 检查是否为Git仓库
if (-not (Test-Path .git)) {
    Write-Host "❌ 当前目录不是 Git 仓库！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit
}

# 显示Git状态
Write-Host "📊 当前 Git 状态如下：" -ForegroundColor Yellow
git status
Write-Host ""

# 获取远程仓库列表
$remotes = @()
git remote -v | Select-String "(fetch)" | ForEach-Object {
    $line = $_.ToString().Trim()
    $parts = $line -split '\s+'
    $remotes += @{ Name = $parts[0]; Url = $parts[1] }
}

# 检查远程仓库是否存在
if ($remotes.Count -eq 0) {
    Write-Host "❌ 未检测到远程仓库，请先执行 git remote add 别名 仓库地址 添加！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit
}

# 选择远程仓库
Write-Host "🗂️  可用远程仓库：" -ForegroundColor Yellow
for ($i=0; $i -lt $remotes.Count; $i++) {
    Write-Host "  $($i+1). 仓库名: $($remotes[$i].Name)  | 地址: $($remotes[$i].Url)"
}
$remote_choice = Read-Host "请选择要推送的仓库编号 (1-$($remotes.Count))"
# 容错处理
if ($remote_choice -match '^[1-9]\d*$' -and [int]$remote_choice -le $remotes.Count) {
    $remote_name = $remotes[[int]$remote_choice-1].Name
    $remote_url = $remotes[[int]$remote_choice-1].Url
} else {
    Write-Host "⚠️  输入无效，默认选择第一个仓库" -ForegroundColor Yellow
    $remote_name = $remotes[0].Name
    $remote_url = $remotes[0].Url
}

# 获取提交信息
$commit_msg = Read-Host "📝 请输入本次提交信息 (默认: Update code)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $commit_msg = "Update code"
} else {
    $commit_msg = $commit_msg.Trim()
}

# 添加文件到暂存区
Write-Host "🔄 正在添加所有更改文件..." -ForegroundColor Green
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 添加文件失败，请检查文件权限！" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit
}

# 提交到本地仓库
Write-Host "📤 正在提交到本地仓库..." -ForegroundColor Green
git commit -m $commit_msg
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  本地提交失败（无代码更改），跳过提交直接推送..." -ForegroundColor Yellow
}

# 选择推送分支
Write-Host ""
Write-Host "🏷️ 请选择要推送的分支：" -ForegroundColor Yellow
Write-Host "  1. master"
Write-Host "  2. main"
Write-Host "  3. 其他分支 (手动输入)"
$branch_choice = Read-Host "请输入分支编号 (1/2/3)"
# 分支选择逻辑
$branch_name = "master" # 默认值
switch -Regex ($branch_choice) {
    "^1$" { $branch_name = "master" }
    "^2$" { $branch_name = "main" }
    "^3$" { 
        $input_branch = Read-Host "请输入分支名称"
        if (-not [string]::IsNullOrWhiteSpace($input_branch)) {
            $branch_name = $input_branch.Trim()
        }
    }
    default { 
        Write-Host "⚠️  输入无效，默认选择master分支" -ForegroundColor Yellow
    }
}

# 拉取远程最新代码（避免推送被拒）
Write-Host ""
Write-Host "🔍 拉取远程 [$remote_name] 分支 [$branch_name] 最新代码..." -ForegroundColor Green
git pull $remote_name $branch_name --allow-unrelated-histories -X theirs 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  拉取远程代码失败，尝试直接推送..." -ForegroundColor Yellow
}

# 推送代码到远程
Write-Host ""
Write-Host "🚀 正在通过 SSH 推送到 [$remote_name] ($remote_url) 分支 [$branch_name] ..." -ForegroundColor Green
git push $remote_name $branch_name

# 推送结果判断
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败！排查步骤：" -ForegroundColor Red
    Write-Host "  1. 执行 ssh -T git@github.com 验证SSH连接" -ForegroundColor Red
    Write-Host "  2. 强制推送（同步main→master用）：git push $remote_name $branch_name --force" -ForegroundColor Red
    Write-Host "  3. 检查仓库地址：$remote_url" -ForegroundColor Red
} else {
    Write-Host "✅ 推送成功！" -ForegroundColor Green
}

# 输出最终信息
Write-Host ""
Write-Host "📍 仓库地址: $remote_url" -ForegroundColor Yellow
Write-Host "📦 分支: $branch_name" -ForegroundColor Yellow
Write-Host ""
Read-Host "操作已完成，按 Enter 键退出..."