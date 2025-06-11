#!/usr/bin/env node

/**
 * Git Workflow Helper Script for Schedulez
 * This script provides utilities for managing the git workflow
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Error executing: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function getCurrentBranch() {
  return execCommand('git rev-parse --abbrev-ref HEAD').trim();
}

function validateBranchName(branchName, type) {
  const patterns = {
    feature: /^feature\/\d+-[\w-]+$/,
    bugfix: /^bugfix\/\d+-[\w-]+$/,
    hotfix: /^hotfix\/v\d+\.\d+\.\d+-[\w-]+$/,
    release: /^release\/v\d+\.\d+\.\d+$/
  };

  if (!patterns[type]) {
    console.error(`Invalid branch type: ${type}`);
    return false;
  }

  if (!patterns[type].test(branchName)) {
    console.error(`Branch name "${branchName}" doesn't match pattern for ${type}`);
    console.error(`Expected pattern: ${patterns[type].source}`);
    return false;
  }

  return true;
}

function createBranch() {
  rl.question('Branch type (feature/bugfix/hotfix/release): ', (type) => {
    rl.question('Issue number (for feature/bugfix) or version (for hotfix/release): ', (number) => {
      rl.question('Short description (kebab-case): ', (description) => {
        let branchName;
        
        switch (type) {
          case 'feature':
          case 'bugfix':
            branchName = `${type}/${number}-${description}`;
            break;
          case 'hotfix':
            branchName = `hotfix/v${number}-${description}`;
            break;
          case 'release':
            branchName = `release/v${number}`;
            break;
          default:
            console.error('Invalid branch type');
            rl.close();
            return;
        }

        if (!validateBranchName(branchName, type)) {
          rl.close();
          return;
        }

        // Determine base branch
        const baseBranch = (type === 'hotfix') ? 'main' : 'develop';
        
        console.log(`Creating branch: ${branchName} from ${baseBranch}`);
        
        try {
          execCommand(`git checkout ${baseBranch}`);
          execCommand(`git pull origin ${baseBranch}`);
          execCommand(`git checkout -b ${branchName}`);
          console.log(`✅ Branch ${branchName} created successfully!`);
          
          // Create initial commit structure
          if (type === 'feature') {
            console.log('Creating initial feature structure...');
            // Could add template files or initial commits here
          }
          
        } catch (error) {
          console.error('Failed to create branch:', error.message);
        }
        
        rl.close();
      });
    });
  });
}

function finishBranch() {
  const currentBranch = getCurrentBranch();
  
  if (currentBranch === 'main' || currentBranch === 'develop') {
    console.error('Cannot finish main or develop branch');
    return;
  }

  console.log(`Finishing branch: ${currentBranch}`);
  
  rl.question('Have you pushed all commits? (y/N): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Please push your commits first with: git push origin ' + currentBranch);
      rl.close();
      return;
    }

    rl.question('Create pull request URL? This will open your browser (y/N): ', (createPR) => {
      if (createPR.toLowerCase() === 'y') {
        const repoUrl = execCommand('git config --get remote.origin.url').trim().replace('.git', '');
        const targetBranch = currentBranch.startsWith('hotfix/') ? 'main' : 'develop';
        const prUrl = `${repoUrl}/compare/${targetBranch}...${currentBranch}?expand=1`;
        
        console.log(`Opening PR URL: ${prUrl}`);
        
        // Open URL in default browser
        const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        execCommand(`${start} "${prUrl}"`);
      }
      
      rl.close();
    });
  });
}

function syncBranch() {
  const currentBranch = getCurrentBranch();
  
  if (currentBranch === 'main' || currentBranch === 'develop') {
    console.log(`Syncing ${currentBranch} with remote...`);
    execCommand(`git pull origin ${currentBranch}`);
  } else {
    // Sync feature branch with its base
    const baseBranch = currentBranch.startsWith('hotfix/') ? 'main' : 'develop';
    
    console.log(`Syncing ${currentBranch} with ${baseBranch}...`);
    
    // Stash changes if any
    const status = execCommand('git status --porcelain').trim();
    let stashed = false;
    
    if (status) {
      console.log('Stashing uncommitted changes...');
      execCommand('git stash push -m "Auto-stash before sync"');
      stashed = true;
    }
    
    // Fetch and rebase
    execCommand('git fetch origin');
    execCommand(`git rebase origin/${baseBranch}`);
    
    // Restore stashed changes
    if (stashed) {
      console.log('Restoring stashed changes...');
      execCommand('git stash pop');
    }
    
    console.log(`✅ ${currentBranch} synced with ${baseBranch}`);
  }
}

function cleanupBranches() {
  console.log('Cleaning up merged branches...');
  
  // Switch to develop
  execCommand('git checkout develop');
  execCommand('git pull origin develop');
  
  // Get merged branches
  const mergedBranches = execCommand('git branch --merged develop')
    .split('\n')
    .map(branch => branch.trim())
    .filter(branch => branch && !branch.startsWith('*') && branch !== 'main' && branch !== 'develop');
  
  if (mergedBranches.length === 0) {
    console.log('No merged branches to clean up');
    return;
  }
  
  console.log('Merged branches found:');
  mergedBranches.forEach(branch => console.log(`  - ${branch}`));
  
  rl.question('Delete these branches? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      mergedBranches.forEach(branch => {
        try {
          execCommand(`git branch -d ${branch}`);
          console.log(`✅ Deleted ${branch}`);
        } catch (error) {
          console.log(`⚠️  Could not delete ${branch}: ${error.message}`);
        }
      });
    }
    rl.close();
  });
}

function showStatus() {
  const currentBranch = getCurrentBranch();
  const status = execCommand('git status --porcelain').trim();
  const ahead = execCommand(`git rev-list --count origin/${currentBranch}..HEAD 2>/dev/null || echo "0"`).trim();
  const behind = execCommand(`git rev-list --count HEAD..origin/${currentBranch} 2>/dev/null || echo "0"`).trim();
  
  console.log('📊 Git Workflow Status');
  console.log('======================');
  console.log(`Current branch: ${currentBranch}`);
  console.log(`Commits ahead: ${ahead}`);
  console.log(`Commits behind: ${behind}`);
  
  if (status) {
    console.log('\nUncommitted changes:');
    console.log(status);
  } else {
    console.log('\n✅ Working directory clean');
  }
  
  // Show recent commits
  console.log('\nRecent commits:');
  const commits = execCommand('git log --oneline -5').trim();
  console.log(commits);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Schedulez Git Workflow Helper\n');

  switch (command) {
    case 'create':
    case 'new':
      createBranch();
      break;
    case 'finish':
    case 'done':
      finishBranch();
      break;
    case 'sync':
    case 'update':
      syncBranch();
      break;
    case 'cleanup':
    case 'clean':
      cleanupBranches();
      break;
    case 'status':
    case 'info':
      showStatus();
      break;
    default:
      console.log('Available commands:');
      console.log('  create/new     - Create a new branch');
      console.log('  finish/done    - Finish current branch and create PR');
      console.log('  sync/update    - Sync branch with remote');
      console.log('  cleanup/clean  - Clean up merged branches');
      console.log('  status/info    - Show git status and branch info');
      console.log('\nUsage: node git-workflow.js <command>');
      break;
  }
}

main();
