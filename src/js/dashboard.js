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
    // New structure with separate fill and text elements
    const progressFill = document.getElementById(`${id}-fill`);
    const progressText = document.getElementById(`${id}-text`);
    
    if (progressFill && progressText) {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressFill.style.width = `${percentage}%`;
        progressFill.setAttribute('aria-valuenow', percentage);
        progressText.textContent = `${completed}/${total} (${percentage}%)`;
        
        // Add completion classes for styling
        const progressBar = progressFill.closest('.progress-bar');
        if (progressBar) {
            progressBar.classList.toggle('progress-complete', percentage === 100);
            progressBar.classList.toggle('progress-high', percentage >= 80 && percentage < 100);
        }
    }
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

// Enhanced dashboard integration with analytics
export function updateDashboardWithAnalytics() {
    // Update basic dashboard stats first
    updateDashboardStats();
    
    // Update with analytics data if available
    if (typeof window.recordTaskCompletion === 'function') {
        updateAnalyticsIntegratedStats();
    }
}

// Update dashboard stats with analytics integration
function updateAnalyticsIntegratedStats() {
    const today = new Date().toISOString().split('T')[0];
    const completions = JSON.parse(localStorage.getItem('schedulez_daily_completions') || '{}');
    const todayCompletions = completions[today] || {};
    
    // Update total events count
    const totalEventsElement = document.getElementById('total-events');
    if (totalEventsElement && typeof events !== 'undefined') {
        totalEventsElement.textContent = events.length || 0;
    }
    
    // Calculate today's completion percentage
    const dailyTasks = events ? events.filter(e => e.schedule === 'daily') : [];
    const completedCount = Object.keys(todayCompletions).length;
    const totalDaily = dailyTasks.length;
    const completionPercentage = totalDaily > 0 ? Math.round((completedCount / totalDaily) * 100) : 0;
    
    // Update daily completed with percentage
    const dailyCompletedElement = document.getElementById('daily-completed-count');
    if (dailyCompletedElement) {
        dailyCompletedElement.innerHTML = `
            <span class="completion-number">${completedCount}</span>
            <small class="completion-percentage">${completionPercentage}%</small>
        `;
    }
    
    // Update weekly progress with analytics
    updateWeeklyAnalyticsStats();
    
    // Update monthly goals with analytics  
    updateMonthlyAnalyticsStats();
}

function updateWeeklyAnalyticsStats() {
    const weeklyCompletedElement = document.getElementById('weekly-completed-count');
    if (weeklyCompletedElement) {
        // Calculate weekly progress from analytics data
        const weeklyProgress = calculateWeeklyProgressFromAnalytics();
        weeklyCompletedElement.innerHTML = `
            <span class="completion-number">${weeklyProgress.completed}</span>
            <small class="completion-percentage">${weeklyProgress.percentage}%</small>
        `;
    }
}

function updateMonthlyAnalyticsStats() {
    const monthlyCompletedElement = document.getElementById('monthly-completed-count');
    if (monthlyCompletedElement) {
        // Calculate monthly progress from analytics data
        const monthlyProgress = calculateMonthlyProgressFromAnalytics();
        monthlyCompletedElement.innerHTML = `
            <span class="completion-number">${monthlyProgress.completed}</span>
            <small class="completion-percentage">${monthlyProgress.percentage}%</small>
        `;
    }
}

function calculateWeeklyProgressFromAnalytics() {
    // Get last 7 days of completion data
    const completions = JSON.parse(localStorage.getItem('schedulez_daily_completions') || '{}');
    let totalCompleted = 0;
    let totalPossible = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const dayCompletions = completions[dateKey] || {};
        totalCompleted += Object.keys(dayCompletions).length;
        
        // Assume similar number of daily tasks each day
        const dailyTasks = events ? events.filter(e => e.schedule === 'daily').length : 0;
        totalPossible += dailyTasks;
    }
    
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    return { completed: totalCompleted, total: totalPossible, percentage };
}

function calculateMonthlyProgressFromAnalytics() {
    // Get current month's completion data
    const completions = JSON.parse(localStorage.getItem('schedulez_daily_completions') || '{}');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyCompleted = 0;
    let monthlyPossible = 0;
    
    // Count completions for current month
    Object.keys(completions).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            monthlyCompleted += Object.keys(completions[dateKey]).length;
            
            // Add to possible count
            const dailyTasks = events ? events.filter(e => e.schedule === 'daily').length : 0;
            monthlyPossible += dailyTasks;
        }
    });
    
    const percentage = monthlyPossible > 0 ? Math.round((monthlyCompleted / monthlyPossible) * 100) : 0;
    return { completed: monthlyCompleted, total: monthlyPossible, percentage };
}
