# Git Workflow PowerShell Scripts

# Function to validate branch names
function Test-BranchName {
    param(
        [string]$BranchName,
        [string]$Type
    )
    
    $patterns = @{
        'feature' = '^feature\/\d+-[\w-]+$'
        'bugfix' = '^bugfix\/\d+-[\w-]+$'
        'hotfix' = '^hotfix\/v\d+\.\d+\.\d+-[\w-]+$'
        'release' = '^release\/v\d+\.\d+\.\d+$'
    }
    
    if (-not $patterns.ContainsKey($Type)) {
        Write-Error "Invalid branch type: $Type"
        return $false
    }
    
    if ($BranchName -notmatch $patterns[$Type]) {
        Write-Error "Branch name '$BranchName' doesn't match pattern for $Type"
        Write-Error "Expected pattern: $($patterns[$Type])"
        return $false
    }
    
    return $true
}

# Function to create a new branch
function New-GitBranch {
    param(
        [Parameter(Mandatory)]
        [ValidateSet('feature', 'bugfix', 'hotfix', 'release')]
        [string]$Type,
        
        [Parameter(Mandatory)]
        [string]$Identifier,
        
        [string]$Description = ''
    )
    
    # Build branch name
    $branchName = switch ($Type) {
        'feature' { "feature/$Identifier-$Description" }
        'bugfix' { "bugfix/$Identifier-$Description" }
        'hotfix' { "hotfix/v$Identifier-$Description" }
        'release' { "release/v$Identifier" }
    }
    
    # Validate branch name
    if (-not (Test-BranchName -BranchName $branchName -Type $Type)) {
        return
    }
    
    # Determine base branch
    $baseBranch = if ($Type -eq 'hotfix') { 'main' } else { 'develop' }
    
    Write-Host "Creating branch: $branchName from $baseBranch" -ForegroundColor Green
    
    try {
        # Switch to base branch and pull latest
        git checkout $baseBranch
        git pull origin $baseBranch
        
        # Create new branch
        git checkout -b $branchName
        
        Write-Host "✅ Branch $branchName created successfully!" -ForegroundColor Green
        
        # Push branch to remote
        git push -u origin $branchName
        Write-Host "✅ Branch pushed to remote" -ForegroundColor Green
        
    } catch {
        Write-Error "Failed to create branch: $_"
    }
}

# Function to finish a branch and create PR
function Complete-GitBranch {
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    if ($currentBranch -in @('main', 'develop')) {
        Write-Error "Cannot finish main or develop branch"
        return
    }
    
    Write-Host "Finishing branch: $currentBranch" -ForegroundColor Yellow
    
    # Check if there are uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Warning "You have uncommitted changes. Please commit or stash them first."
        return
    }
    
    # Push current branch
    try {
        git push origin $currentBranch
        Write-Host "✅ Pushed latest changes" -ForegroundColor Green
    } catch {
        Write-Warning "Could not push changes: $_"
    }
    
    # Get repository URL for PR
    $repoUrl = (git config --get remote.origin.url) -replace '\.git$', ''
    $targetBranch = if ($currentBranch.StartsWith('hotfix/')) { 'main' } else { 'develop' }
    
    # Create PR URL
    $prUrl = "$repoUrl/compare/$targetBranch...$currentBranch"
    
    Write-Host "Opening PR URL: $prUrl" -ForegroundColor Cyan
    Start-Process $prUrl
}

# Function to sync current branch
function Sync-GitBranch {
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    if ($currentBranch -in @('main', 'develop')) {
        Write-Host "Syncing $currentBranch with remote..." -ForegroundColor Yellow
        git pull origin $currentBranch
    } else {
        # Sync feature branch with its base
        $baseBranch = if ($currentBranch.StartsWith('hotfix/')) { 'main' } else { 'develop' }
        
        Write-Host "Syncing $currentBranch with $baseBranch..." -ForegroundColor Yellow
        
        # Check for uncommitted changes
        $status = git status --porcelain
        $stashed = $false
        
        if ($status) {
            Write-Host "Stashing uncommitted changes..." -ForegroundColor Yellow
            git stash push -m "Auto-stash before sync"
            $stashed = $true
        }
        
        try {
            # Fetch and rebase
            git fetch origin
            git rebase origin/$baseBranch
            
            # Restore stashed changes
            if ($stashed) {
                Write-Host "Restoring stashed changes..." -ForegroundColor Yellow
                git stash pop
            }
            
            Write-Host "✅ $currentBranch synced with $baseBranch" -ForegroundColor Green
        } catch {
            Write-Error "Sync failed: $_"
            if ($stashed) {
                Write-Host "Your changes are stashed. Use 'git stash pop' to restore them." -ForegroundColor Yellow
            }
        }
    }
}

# Function to clean up merged branches
function Remove-MergedBranches {
    Write-Host "Cleaning up merged branches..." -ForegroundColor Yellow
    
    # Switch to develop
    git checkout develop
    git pull origin develop
    
    # Get merged branches
    $mergedBranches = git branch --merged develop | Where-Object { 
        $_.Trim() -and 
        -not $_.StartsWith('*') -and 
        $_.Trim() -notin @('main', 'develop')
    } | ForEach-Object { $_.Trim() }
    
    if (-not $mergedBranches) {
        Write-Host "No merged branches to clean up" -ForegroundColor Green
        return
    }
    
    Write-Host "Merged branches found:" -ForegroundColor Yellow
    $mergedBranches | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
    
    $confirmation = Read-Host "Delete these branches? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        $mergedBranches | ForEach-Object {
            try {
                git branch -d $_
                Write-Host "✅ Deleted $_" -ForegroundColor Green            } catch {
                Write-Warning "Could not delete $($_.Name): $($_.Exception.Message)"
            }
        }
    }
}

# Function to show git status and branch info
function Show-GitStatus {
    $currentBranch = git rev-parse --abbrev-ref HEAD
    $status = git status --porcelain
    
    try {
        $ahead = git rev-list --count "origin/$currentBranch..HEAD" 2>$null
        $behind = git rev-list --count "HEAD..origin/$currentBranch" 2>$null
    } catch {
        $ahead = "unknown"
        $behind = "unknown"
    }
    
    Write-Host "📊 Git Workflow Status" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host "Current branch: $currentBranch" -ForegroundColor White
    Write-Host "Commits ahead: $ahead" -ForegroundColor White
    Write-Host "Commits behind: $behind" -ForegroundColor White
    
    if ($status) {
        Write-Host "`nUncommitted changes:" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    } else {
        Write-Host "`n✅ Working directory clean" -ForegroundColor Green
    }
    
    # Show recent commits
    Write-Host "`nRecent commits:" -ForegroundColor Cyan
    git log --oneline -5 | ForEach-Object { Write-Host $_ -ForegroundColor White }
}

# Function to setup git hooks
function Install-GitHooks {
    $hooksDir = ".git/hooks"
    
    if (-not (Test-Path $hooksDir)) {
        Write-Error "Not in a git repository"
        return
    }
    
    # Pre-commit hook content
    $preCommitContent = @'
#!/bin/sh
# Pre-commit hook for Schedulez

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed"
'@

    # Commit message hook content
    $commitMsgContent = @'
#!/bin/sh
# Commit message hook for Schedulez

# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo "Format: <type>[optional scope]: <description>"
    echo "Example: feat(analytics): add yearly goal tracking"
    echo "Types: feat, fix, docs, style, refactor, perf, test, chore"
    exit 1
fi

echo "✅ Commit message format is valid"
'@

    # Write hooks
    $preCommitContent | Out-File -FilePath "$hooksDir/pre-commit" -Encoding ASCII
    $commitMsgContent | Out-File -FilePath "$hooksDir/commit-msg" -Encoding ASCII
    
    # Try to make hooks executable (will work on WSL/Git Bash)
    try {
        if (Get-Command chmod -ErrorAction SilentlyContinue) {
            chmod +x "$hooksDir/pre-commit"
            chmod +x "$hooksDir/commit-msg"
        }
    } catch {
        # Ignore chmod errors on Windows
    }
    
    Write-Host "✅ Git hooks installed successfully!" -ForegroundColor Green
}

# Export functions
Export-ModuleMember -Function @(
    'New-GitBranch',
    'Complete-GitBranch', 
    'Sync-GitBranch',
    'Remove-MergedBranches',
    'Show-GitStatus',
    'Install-GitHooks'
)
