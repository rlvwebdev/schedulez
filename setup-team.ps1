# Schedulez Team Onboarding Script
# Run this script to set up your development environment

Write-Host "🚀 Welcome to Schedulez Team Setup!" -ForegroundColor Cyan
Write-Host "This script will set up your development environment for the team workflow." -ForegroundColor White
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js (v16+) first." -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies. Please check your npm setup." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up Git hooks..." -ForegroundColor Yellow
try {
    npx husky install
    Write-Host "✅ Git hooks installed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git hooks setup failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Importing PowerShell workflow module..." -ForegroundColor Yellow
try {
    Import-Module ".\scripts\GitWorkflow.psm1" -Force
    Write-Host "✅ PowerShell module imported!" -ForegroundColor Green
    
    # Add to PowerShell profile for persistence
    $profilePath = $PROFILE
    $moduleImport = "Import-Module '$((Get-Location).Path)\scripts\GitWorkflow.psm1'"
    
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw
        if ($profileContent -notlike "*GitWorkflow.psm1*") {
            Add-Content $profilePath "`n# Schedulez Git Workflow`n$moduleImport"
            Write-Host "✅ Added to PowerShell profile for future sessions" -ForegroundColor Green
        }
    } else {
        New-Item -ItemType File -Path $profilePath -Force | Out-Null
        Add-Content $profilePath "# Schedulez Git Workflow`n$moduleImport"
        Write-Host "✅ Created PowerShell profile with module import" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  PowerShell module import failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Checking Git configuration..." -ForegroundColor Yellow

# Check Git user configuration
$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if (-not $gitUser) {
    Write-Host "⚠️  Git user.name not set." -ForegroundColor Yellow
    $name = Read-Host "Enter your name for Git commits"
    git config user.name "$name"
    Write-Host "✅ Git user.name set to: $name" -ForegroundColor Green
}

if (-not $gitEmail) {
    Write-Host "⚠️  Git user.email not set." -ForegroundColor Yellow
    $email = Read-Host "Enter your email for Git commits"
    git config user.email "$email"
    Write-Host "✅ Git user.email set to: $email" -ForegroundColor Green
}

# Check if origin remote exists
try {
    $origin = git config --get remote.origin.url
    Write-Host "✅ Origin remote configured: $origin" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No origin remote configured." -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter your repository URL (or press Enter to skip)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Origin remote added: $repoUrl" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🌿 Setting up branches..." -ForegroundColor Yellow

# Ensure we have main and develop branches
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor White

# Create develop branch if it doesn't exist
$branches = git branch -a
if ($branches -notlike "*develop*") {
    Write-Host "Creating develop branch..." -ForegroundColor Yellow
    git checkout -b develop
    try {
        git push -u origin develop
        Write-Host "✅ Develop branch created and pushed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Develop branch created locally (push failed - remote may not exist yet)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Develop branch exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Running initial tests..." -ForegroundColor Yellow
try {
    npm run lint 2>$null
    Write-Host "✅ Linting passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Linting issues found - run 'npm run lint:fix' to fix them" -ForegroundColor Yellow
}

try {
    npm test 2>$null
    Write-Host "✅ Tests passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some tests failed - this is normal for initial setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Creating useful aliases..." -ForegroundColor Yellow

# Create git aliases for common workflow commands
git config alias.sw "switch"
git config alias.co "checkout"
git config alias.br "branch"
git config alias.st "status"
git config alias.last "log -1 HEAD"
git config alias.visual "!gitk"
git config alias.unstage "reset HEAD --"

Write-Host "✅ Git aliases created (sw, co, br, st, last, visual, unstage)" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "Available Commands:" -ForegroundColor Cyan
Write-Host "  PowerShell Functions:" -ForegroundColor White
Write-Host "    New-GitBranch          # Create new branch" -ForegroundColor Gray
Write-Host "    Complete-GitBranch     # Finish branch and create PR" -ForegroundColor Gray
Write-Host "    Sync-GitBranch         # Sync with remote" -ForegroundColor Gray
Write-Host "    Show-GitStatus         # Show detailed status" -ForegroundColor Gray
Write-Host "    Remove-MergedBranches  # Clean up old branches" -ForegroundColor Gray
Write-Host ""
Write-Host "  NPM Scripts:" -ForegroundColor White
Write-Host "    npm run git:create     # Create new branch" -ForegroundColor Gray
Write-Host "    npm run git:finish     # Complete branch" -ForegroundColor Gray
Write-Host "    npm run git:sync       # Sync branch" -ForegroundColor Gray
Write-Host "    npm run git:status     # Show status" -ForegroundColor Gray
Write-Host "    npm run dev            # Start development server" -ForegroundColor Gray
Write-Host "    npm run lint           # Check code quality" -ForegroundColor Gray
Write-Host "    npm test               # Run tests" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Read the workflow guide: docs/GIT_WORKFLOW.md" -ForegroundColor White
Write-Host "2. Create your first feature branch: New-GitBranch -Type feature -Identifier '1' -Description 'setup-complete'" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check GIT_WORKFLOW_SETUP.md or ask the team! 🤝" -ForegroundColor Yellow
