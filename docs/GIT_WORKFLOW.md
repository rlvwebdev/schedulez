# Git Branching Workflow for Schedulez Team

## Branch Structure

### Main Branches
- **`main`** - Production-ready code. Protected branch.
- **`develop`** - Integration branch for features. Base for releases.

### Supporting Branches
- **`feature/*`** - New features and enhancements
- **`bugfix/*`** - Bug fixes for current release
- **`hotfix/*`** - Critical fixes for production
- **`release/*`** - Prepare new production releases

## Branch Naming Convention

### Feature Branches
```
feature/[issue-number]-[short-description]
```
Examples:
- `feature/123-add-analytics-dashboard`
- `feature/456-improve-mobile-navigation`
- `feature/789-yearly-goals-integration`

### Bug Fix Branches
```
bugfix/[issue-number]-[short-description]
```
Examples:
- `bugfix/321-fix-task-completion-bug`
- `bugfix/654-resolve-mobile-nav-overlap`

### Hotfix Branches
```
hotfix/[version]-[short-description]
```
Examples:
- `hotfix/v1.2.1-critical-data-loss-fix`
- `hotfix/v1.2.2-security-vulnerability`

### Release Branches
```
release/v[version-number]
```
Examples:
- `release/v1.3.0`
- `release/v2.0.0`

## Workflow Process

### 1. Feature Development
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/123-add-analytics-dashboard

# Work on feature
git add .
git commit -m "feat: add analytics dashboard component"

# Push and create PR
git push origin feature/123-add-analytics-dashboard
```

### 2. Bug Fixes
```bash
# Start from develop (or main for hotfixes)
git checkout develop
git pull origin develop

# Create bugfix branch
git checkout -b bugfix/321-fix-task-completion-bug

# Fix the bug
git add .
git commit -m "fix: resolve task completion state persistence"

# Push and create PR
git push origin bugfix/321-fix-task-completion-bug
```

### 3. Hotfixes
```bash
# Start from main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/v1.2.1-critical-data-loss-fix

# Apply fix
git add .
git commit -m "hotfix: prevent data loss on page refresh"

# Push and create PR to main
git push origin hotfix/v1.2.1-critical-data-loss-fix
```

### 4. Releases
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v1.3.0

# Bump version and finalize
npm version 1.3.0
git add .
git commit -m "chore: bump version to 1.3.0"

# Push and create PR to main
git push origin release/v1.3.0
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples:
```bash
git commit -m "feat(analytics): add yearly goal tracking"
git commit -m "fix(mobile): resolve navigation overlay issue"
git commit -m "docs: update README with deployment instructions"
git commit -m "refactor(utils): simplify date formatting functions"
```

## Pull Request Guidelines

### PR Title Format
```
[Type] Brief description (#issue-number)
```
Examples:
- `[Feature] Add analytics dashboard (#123)`
- `[Bugfix] Fix task completion persistence (#321)`
- `[Hotfix] Resolve critical data loss issue (#456)`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews (minimum 1)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes (no direct commits)
- Include administrators in restrictions

### Develop Branch
- Require pull request reviews (minimum 1)
- Require status checks to pass
- Allow force pushes for maintainers only

## Team Roles and Responsibilities

### Team Lead / Maintainer
- Review and merge PRs to `main`
- Manage releases
- Enforce workflow standards
- Handle hotfixes

### Senior Developers
- Review PRs
- Mentor junior developers
- Lead feature implementation
- Code architecture decisions

### Developers
- Implement features and bug fixes
- Write tests
- Follow coding standards
- Participate in code reviews

## Workflow Automation

### Automated Checks
- Code linting (ESLint)
- Unit tests (Jest)
- Build verification
- Security vulnerability scanning
- Performance audits (Lighthouse)

### Automated Actions
- Deploy preview environments for PRs
- Auto-label PRs based on files changed
- Notify team of critical failures
- Generate changelog on release

## Emergency Procedures

### Critical Bug in Production
1. Create hotfix branch from `main`
2. Implement minimal fix
3. Create emergency PR with expedited review
4. Deploy immediately after merge
5. Create follow-up issue for comprehensive fix

### Broken Build on Main
1. Revert problematic commit
2. Create issue to track problem
3. Implement proper fix in feature branch
4. Follow normal PR process

## Best Practices

### Daily Workflow
- Start each day by pulling latest changes
- Create focused, single-purpose branches
- Make frequent, small commits
- Write descriptive commit messages
- Test locally before pushing

### Code Quality
- Write self-documenting code
- Add comments for complex logic
- Maintain consistent formatting
- Keep functions small and focused
- Update documentation with changes

### Collaboration
- Communicate changes that affect others
- Review PRs promptly
- Provide constructive feedback
- Ask questions when unclear
- Share knowledge and learnings

## Tools and Resources

### Git Hooks
- Pre-commit: Run linting and tests
- Pre-push: Verify branch naming
- Commit-msg: Validate commit message format

### Recommended Tools
- **Git client**: GitHub Desktop, SourceTree, or command line
- **IDE integration**: VS Code Git extensions
- **Code review**: GitHub web interface
- **Project management**: GitHub Issues and Projects

### Learning Resources
- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
