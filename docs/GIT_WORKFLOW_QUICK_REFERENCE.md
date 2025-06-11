# Schedulez Git Workflow Quick Reference

## PowerShell Commands (Windows)

First, import the module:
```powershell
Import-Module .\scripts\GitWorkflow.psm1
```

### Create New Branch
```powershell
# Feature branch
New-GitBranch -Type feature -Identifier "123" -Description "add-analytics-dashboard"

# Bug fix
New-GitBranch -Type bugfix -Identifier "456" -Description "fix-mobile-navigation"

# Hotfix
New-GitBranch -Type hotfix -Identifier "1.2.1" -Description "critical-data-fix"

# Release
New-GitBranch -Type release -Identifier "1.3.0"
```

### Complete Branch
```powershell
Complete-GitBranch
# Opens browser with PR creation page
```

### Sync Branch
```powershell
Sync-GitBranch
# Syncs current branch with its base (develop/main)
```

### Clean Up
```powershell
Remove-MergedBranches
# Removes local branches that have been merged
```

### Status Check
```powershell
Show-GitStatus
# Shows detailed branch and commit status
```

### Install Git Hooks
```powershell
Install-GitHooks
# Sets up pre-commit and commit-msg hooks
```

## Node.js Commands (Cross-platform)

### Create New Branch
```bash
node scripts/git-workflow.js create
# Interactive prompts for branch creation
```

### Complete Branch
```bash
node scripts/git-workflow.js finish
# Completes branch and opens PR
```

### Sync Branch
```bash
node scripts/git-workflow.js sync
# Syncs with remote
```

### Clean Up
```bash
node scripts/git-workflow.js cleanup
# Cleans up merged branches
```

### Status Check
```bash
node scripts/git-workflow.js status
# Shows git status and info
```

## Manual Git Commands

### Feature Development Flow
```bash
# Start feature
git checkout develop
git pull origin develop
git checkout -b feature/123-add-analytics

# Work and commit
git add .
git commit -m "feat(analytics): add dashboard component"

# Push and create PR
git push origin feature/123-add-analytics
```

### Bug Fix Flow
```bash
# Start bug fix
git checkout develop
git pull origin develop
git checkout -b bugfix/456-fix-navigation

# Fix and commit
git add .
git commit -m "fix(nav): resolve mobile overlay issue"

# Push and create PR
git push origin bugfix/456-fix-navigation
```

### Hotfix Flow
```bash
# Start hotfix
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-critical-fix

# Fix and commit
git add .
git commit -m "hotfix(data): prevent data loss on refresh"

# Push and create PR to main
git push origin hotfix/v1.2.1-critical-fix
```

### Release Flow
```bash
# Start release
git checkout develop
git pull origin develop
git checkout -b release/v1.3.0

# Finalize release
npm version 1.3.0
git add .
git commit -m "chore: bump version to 1.3.0"

# Push and create PR to main
git push origin release/v1.3.0
```

## Commit Message Examples

### Features
```bash
git commit -m "feat(analytics): add yearly goal tracking dashboard"
git commit -m "feat(mobile): implement swipe gestures for navigation"
git commit -m "feat(data): add export functionality for user data"
```

### Bug Fixes
```bash
git commit -m "fix(tasks): resolve completion state persistence issue"
git commit -m "fix(mobile): correct navigation overlay on small screens"
git commit -m "fix(data): handle undefined values in task completion"
```

### Documentation
```bash
git commit -m "docs: update README with deployment instructions"
git commit -m "docs(api): add JSDoc comments to utility functions"
```

### Refactoring
```bash
git commit -m "refactor(utils): simplify date formatting functions"
git commit -m "refactor(components): extract reusable modal component"
```

### Performance
```bash
git commit -m "perf(render): optimize task list rendering for large datasets"
git commit -m "perf(images): implement lazy loading for dashboard icons"
```

### Tests
```bash
git commit -m "test(analytics): add unit tests for goal calculation"
git commit -m "test(integration): add end-to-end tests for task flow"
```

### Chores
```bash
git commit -m "chore: update dependencies to latest versions"
git commit -m "chore(ci): configure automated testing pipeline"
```

## Branch Naming Examples

### Feature Branches
- `feature/123-add-analytics-dashboard`
- `feature/456-implement-yearly-goals`
- `feature/789-mobile-swipe-navigation`
- `feature/101-dark-mode-theme`

### Bug Fix Branches
- `bugfix/234-fix-task-completion-bug`
- `bugfix/567-resolve-mobile-nav-overlap`
- `bugfix/890-correct-data-persistence`

### Hotfix Branches
- `hotfix/v1.2.1-critical-data-loss-fix`
- `hotfix/v1.2.2-security-vulnerability`
- `hotfix/v1.3.1-performance-regression`

### Release Branches
- `release/v1.3.0`
- `release/v2.0.0`
- `release/v1.4.0-beta`

## Team Workflow Examples

### Daily Workflow
```bash
# Start of day
git checkout develop
git pull origin develop

# Work on feature
git checkout -b feature/123-new-feature
# ... make changes ...
git add .
git commit -m "feat: implement new feature"
git push origin feature/123-new-feature

# Create PR via GitHub web interface or script
```

### Code Review Process
1. Create PR with descriptive title and description
2. Request review from team member
3. Address feedback with additional commits
4. Squash merge into develop once approved

### Release Process
1. Create release branch from develop
2. Final testing and bug fixes
3. Version bump and changelog update
4. Merge to main and tag release
5. Deploy to production
6. Merge back to develop

## Troubleshooting

### Merge Conflicts
```bash
# During rebase/merge
git status  # Check conflicted files
# Resolve conflicts in editor
git add .
git rebase --continue  # or git merge --continue
```

### Accidental Commit to Wrong Branch
```bash
# Move last commit to new branch
git branch feature/new-branch
git reset --hard HEAD~1
git checkout feature/new-branch
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Clean Working Directory
```bash
git stash  # Save changes temporarily
git clean -fd  # Remove untracked files
git checkout .  # Discard modifications
```
