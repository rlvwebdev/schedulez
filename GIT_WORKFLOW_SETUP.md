# Schedulez Team Git Workflow Setup

## 🚀 Quick Setup

### 1. Initialize Repository
```powershell
# Navigate to project directory
cd c:\Users\rlvas\Schedulez\schedulez

# Initialize git if not already done
git init

# Add remote origin (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/schedulez.git

# Create and switch to develop branch
git checkout -b develop
git push -u origin develop
```

### 2. Install Development Dependencies
```powershell
# Install all workflow dependencies
npm install

# Initialize git hooks
npx husky install
```

### 3. Import PowerShell Module (Windows Users)
```powershell
# Import the Git workflow module
Import-Module .\scripts\GitWorkflow.psm1

# Install git hooks for commit validation
Install-GitHooks
```

## 📋 Team Workflow Summary

### Branch Structure
- **`main`** → Production code (protected)
- **`develop`** → Integration branch (protected)
- **`feature/*`** → New features
- **`bugfix/*`** → Bug fixes
- **`hotfix/*`** → Critical production fixes
- **`release/*`** → Release preparation

### Daily Workflow

#### Option 1: PowerShell (Windows)
```powershell
# Create new feature
New-GitBranch -Type feature -Identifier "123" -Description "add-new-dashboard"

# Work on your feature...
git add .
git commit -m "feat(dashboard): add analytics charts"

# Complete and create PR
Complete-GitBranch
```

#### Option 2: Node.js Script (Cross-platform)
```bash
# Create new feature
npm run git:create

# Check status
npm run git:status

# Complete and create PR
npm run git:finish
```

#### Option 3: Manual Git Commands
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/123-add-new-dashboard

# Work and commit
git add .
git commit -m "feat(dashboard): add analytics charts"

# Push and create PR
git push origin feature/123-add-new-dashboard
```

### Commit Message Format
```
<type>[optional scope]: <description>

Examples:
feat(analytics): add yearly goal tracking
fix(mobile): resolve navigation overlay issue
docs: update deployment instructions
refactor(utils): simplify date formatting
```

### Branch Naming Examples
- `feature/123-add-analytics-dashboard`
- `bugfix/456-fix-mobile-navigation`
- `hotfix/v1.2.1-critical-data-fix`
- `release/v1.3.0`

## 🔧 Available Scripts

### Git Workflow Scripts
```powershell
# PowerShell functions
New-GitBranch          # Create new branch
Complete-GitBranch     # Finish branch and create PR
Sync-GitBranch         # Sync with remote
Remove-MergedBranches  # Clean up merged branches
Show-GitStatus         # Show detailed status
Install-GitHooks       # Setup git hooks
```

### NPM Scripts
```bash
npm run git:create     # Create new branch
npm run git:finish     # Complete branch
npm run git:sync       # Sync branch
npm run git:status     # Show status
npm run git:cleanup    # Clean up branches

# Development scripts
npm run dev            # Start development server
npm run build          # Build for production
npm run lint           # Run linting
npm run test           # Run tests
npm run format         # Format code
```

## 🛡️ Code Quality Gates

### Pre-commit Hooks
- ESLint checks
- Prettier formatting
- Test execution
- Commit message validation

### Pull Request Requirements
- At least 1 approval required
- All status checks must pass
- Branch must be up to date
- No merge conflicts

### Automated Checks
- ✅ Linting (ESLint)
- ✅ Testing (Jest)
- ✅ Build verification
- ✅ Security audit
- ✅ Performance audit (Lighthouse)

## 👥 Team Roles

### Maintainers
- Merge PRs to `main`
- Manage releases
- Configure repository settings
- Handle hotfixes

### Developers
- Create feature branches
- Implement features/fixes
- Write tests
- Review code

## 🚨 Emergency Procedures

### Critical Production Bug
1. Create hotfix branch from `main`
2. Implement minimal fix
3. Get expedited review
4. Deploy immediately
5. Create follow-up issue

### Broken Build
1. Revert problematic commit
2. Investigate issue
3. Create proper fix in feature branch
4. Follow normal PR process

## 📚 Resources

- [Complete Workflow Guide](./docs/GIT_WORKFLOW.md)
- [Quick Reference](./docs/GIT_WORKFLOW_QUICK_REFERENCE.md)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎯 Getting Started Checklist

- [ ] Repository cloned and setup
- [ ] Development dependencies installed
- [ ] Git hooks configured
- [ ] PowerShell module imported (Windows)
- [ ] First feature branch created
- [ ] Team workflow understood
- [ ] PR template reviewed
- [ ] Code quality standards reviewed

## 💡 Pro Tips

1. **Use descriptive branch names** - Include issue number and brief description
2. **Make small, focused commits** - Easier to review and debug
3. **Write good commit messages** - Follow conventional commits format
4. **Test before pushing** - Avoid breaking the build
5. **Review PRs promptly** - Keep the team moving
6. **Keep branches short-lived** - Merge frequently to avoid conflicts
7. **Use the workflow scripts** - They handle common tasks automatically

## 🤝 Team Communication

- Use GitHub Issues for bug reports and feature requests
- Reference issue numbers in commit messages
- Use PR descriptions to explain changes
- Ask questions in PR comments
- Share knowledge in team meetings

Ready to start? Run `npm run git:create` to create your first feature branch! 🎉
