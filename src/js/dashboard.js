// Dashboard Module
// This module handles dashboard functionality and overview statistics

// Update dashboard overview
export function updateDashboard() {
    // Update total tasks count
    const totalTasksElement = document.getElementById('total-tasks');
    if (totalTasksElement) {
        totalTasksElement.textContent = events.length;
    }
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update today's schedule overview
    renderTodaySchedule();
    
    // Update progress statistics
    updateProgressStats();
}

// Update dashboard statistics cards
export function updateDashboardStats() {
    // Update daily completed count
    const dailyCompletedElement = document.getElementById('daily-completed-count');
    if (dailyCompletedElement) {
        const dailyTasks = events.filter(e => e.schedule === 'daily');
        const dailyCompleted = dailyTasks.filter(e => e.completedToday).length;
        dailyCompletedElement.textContent = dailyCompleted;
    }
    
    // Update weekly completed count
    const weeklyCompletedElement = document.getElementById('weekly-completed-count');
    if (weeklyCompletedElement) {
        const weeklyTasks = events.filter(e => e.schedule === 'weekly');
        const weeklyCompleted = weeklyTasks.filter(e => e.completed).length;
        weeklyCompletedElement.textContent = weeklyCompleted;
    }
    
    // Update monthly completed count
    const monthlyCompletedElement = document.getElementById('monthly-completed-count');
    if (monthlyCompletedElement) {
        const monthlyTasks = events.filter(e => e.schedule === 'monthly');
        const monthlyCompleted = monthlyTasks.filter(e => e.completed).length;
        monthlyCompletedElement.textContent = monthlyCompleted;
    }
}

// Get comprehensive completion summary
export function getCompletionSummary() {
    const today = new Date().toDateString();
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const weeklyTasks = events.filter(e => e.schedule === 'weekly');
    const monthlyTasks = events.filter(e => e.schedule === 'monthly');
    
    const dailyCompleted = dailyTasks.filter(e => e.completedToday && e.lastCompleted === today).length;
    const weeklyCompleted = weeklyTasks.filter(e => e.completed).length;
    const monthlyCompleted = monthlyTasks.filter(e => e.completed).length;
    
    return {
        daily: { completed: dailyCompleted, total: dailyTasks.length },
        weekly: { completed: weeklyCompleted, total: weeklyTasks.length },
        monthly: { completed: monthlyCompleted, total: monthlyTasks.length },
        overall: { 
            completed: dailyCompleted + weeklyCompleted + monthlyCompleted, 
            total: events.length 
        }
    };
}

// Update progress statistics
export function updateProgressStats() {
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const weeklyTasks = events.filter(e => e.schedule === 'weekly');
    const monthlyTasks = events.filter(e => e.schedule === 'monthly');
    
    const dailyCompleted = dailyTasks.filter(e => e.completedToday).length;
    const weeklyCompleted = weeklyTasks.filter(e => e.completed).length;
    const monthlyCompleted = monthlyTasks.filter(e => e.completed).length;
    
    const totalTasks = events.length;
    const totalCompleted = dailyCompleted + weeklyCompleted + monthlyCompleted;
    
    // Update progress bars
    updateProgressBar('daily-progress', dailyCompleted, dailyTasks.length);
    updateProgressBar('weekly-progress', weeklyCompleted, weeklyTasks.length);
    updateProgressBar('monthly-progress', monthlyCompleted, monthlyTasks.length);
    updateProgressBar('overall-progress', totalCompleted, totalTasks);
    
    // Update achievement badges
    updateAchievements(dailyCompleted, dailyTasks.length, weeklyCompleted, weeklyTasks.length, monthlyCompleted, monthlyTasks.length);
}

// Update individual progress bar
export function updateProgressBar(id, completed, total) {
    const progressBar = document.getElementById(id);
    if (!progressBar) return;
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        progressFill.setAttribute('aria-valuenow', percentage);
    }
    
    if (progressText) {
        progressText.textContent = `${completed}/${total} (${percentage}%)`;
    }
    
    // Update ARIA attributes
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('aria-label', `Progress: ${completed} of ${total} completed (${percentage}%)`);
}

// Update achievement badges
export function updateAchievements(dailyCompleted, dailyTotal, weeklyCompleted, weeklyTotal, monthlyCompleted, monthlyTotal) {
    const achievementsContainer = document.getElementById('achievements');
    if (!achievementsContainer) return;
    
    const achievements = [];
    
    // Calculate percentages
    const dailyPercent = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;
    const weeklyPercent = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
    const monthlyPercent = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;
    const totalPercent = (dailyTotal + weeklyTotal + monthlyTotal) > 0 ? 
        Math.round(((dailyCompleted + weeklyCompleted + monthlyCompleted) / (dailyTotal + weeklyTotal + monthlyTotal)) * 100) : 0;
    
    // Achievement criteria
    if (dailyPercent === 100) {
        achievements.push({ icon: '🌟', title: 'Daily Champion', description: 'Completed all daily tasks!' });
    }
    if (weeklyPercent === 100) {
        achievements.push({ icon: '🏆', title: 'Weekly Winner', description: 'Completed all weekly tasks!' });
    }
    if (monthlyPercent === 100) {
        achievements.push({ icon: '👑', title: 'Monthly Master', description: 'Completed all monthly tasks!' });
    }
    if (totalPercent === 100) {
        achievements.push({ icon: '🎯', title: 'Perfect Score', description: 'Completed ALL tasks!' });
    }
    if (dailyPercent >= 75) {
        achievements.push({ icon: '⚡', title: 'Daily Dynamo', description: 'Completed 75% of daily tasks!' });
    }
    if (weeklyPercent >= 75) {
        achievements.push({ icon: '🚀', title: 'Weekly Warrior', description: 'Completed 75% of weekly tasks!' });
    }
    
    // Render achievements
    if (achievements.length > 0) {
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div class="achievement-badge" title="${achievement.description}">
                <span class="achievement-icon">${achievement.icon}</span>
                <span class="achievement-title">${achievement.title}</span>
            </div>
        `).join('');
    } else {
        achievementsContainer.innerHTML = '<div class="no-achievements">Complete tasks to earn achievements!</div>';
    }
}
