// Analytics Module
// This module handles all analytics, progress tracking, and detailed reporting functionality

// Analytics data storage
let analyticsData = {
    dailyCompletions: JSON.parse(localStorage.getItem('schedulez_daily_completions') || '{}'),
    weeklyProgress: JSON.parse(localStorage.getItem('schedulez_weekly_progress') || '{}'),
    monthlyGoals: JSON.parse(localStorage.getItem('schedulez_monthly_goals') || '{}'),
    yearlyGoals: JSON.parse(localStorage.getItem('schedulez_yearly_goals') || '{}'),
    completionHistory: JSON.parse(localStorage.getItem('schedulez_completion_history') || '[]')
};

// Current analytics view state
let currentAnalyticsTab = 'overview';
let currentPeriod = 'current';

// Initialize analytics system
export function initializeAnalytics() {
    // Ensure analytics data structure exists
    if (!analyticsData.dailyCompletions[getCurrentDateKey()]) {
        analyticsData.dailyCompletions[getCurrentDateKey()] = {};
    }
    
    // Set up event listeners for analytics navigation
    setupAnalyticsEventListeners();
    
    // Update analytics data periodically
    setInterval(updateAnalyticsData, 60000); // Every minute
}

// Setup event listeners for analytics navigation
function setupAnalyticsEventListeners() {
    // Tab switching
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchAnalyticsTab(tab.dataset.tab);
        });
    });
    
    // Period switching
    document.querySelectorAll('.period-selector').forEach(selector => {
        selector.addEventListener('change', (e) => {
            currentPeriod = e.target.value;
            renderCurrentAnalyticsView();
        });
    });
}

// Main analytics rendering function
export function renderAnalytics() {
    const container = document.getElementById('analytics-content');
    if (!container) return;

    container.innerHTML = `
        <div class="analytics-header">
            <h2>📊 Analytics & Progress</h2>
            <div class="analytics-controls">
                <div class="period-selector-container">
                    <label>Time Period:</label>
                    <select class="period-selector">
                        <option value="current">Current</option>
                        <option value="lastWeek">Last Week</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="yearly">Yearly View</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="analytics-tabs">
            <button class="analytics-tab ${currentAnalyticsTab === 'overview' ? 'active' : ''}" data-tab="overview">
                📈 Overview
            </button>
            <button class="analytics-tab ${currentAnalyticsTab === 'daily' ? 'active' : ''}" data-tab="daily">
                📅 Daily Tasks
            </button>
            <button class="analytics-tab ${currentAnalyticsTab === 'weekly' ? 'active' : ''}" data-tab="weekly">
                📊 Weekly Progress
            </button>
            <button class="analytics-tab ${currentAnalyticsTab === 'monthly' ? 'active' : ''}" data-tab="monthly">
                🗓️ Monthly Goals
            </button>
            <button class="analytics-tab ${currentAnalyticsTab === 'yearly' ? 'active' : ''}" data-tab="yearly">
                🎯 Yearly Goals
            </button>
        </div>
        
        <div class="analytics-content-area">
            <div id="analytics-view-container">
                ${renderAnalyticsView()}
            </div>
        </div>
    `;
    
    // Re-setup event listeners after rendering
    setupAnalyticsEventListeners();
}

// Switch between analytics tabs
function switchAnalyticsTab(tabName) {
    currentAnalyticsTab = tabName;
    
    // Update tab active state
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Render the new view
    renderCurrentAnalyticsView();
}

// Render current analytics view
function renderCurrentAnalyticsView() {
    const container = document.getElementById('analytics-view-container');
    if (!container) return;
    
    container.innerHTML = renderAnalyticsView();
}

// Render analytics view based on current tab
function renderAnalyticsView() {
    switch (currentAnalyticsTab) {
        case 'overview':
            return renderOverviewAnalytics();
        case 'daily':
            return renderDailyAnalytics();
        case 'weekly':
            return renderWeeklyAnalytics();
        case 'monthly':
            return renderMonthlyAnalytics();
        case 'yearly':
            return renderYearlyAnalytics();
        default:
            return renderOverviewAnalytics();
    }
}

// Render overview analytics
function renderOverviewAnalytics() {
    const stats = calculateOverviewStats();
    
    return `
        <div class="analytics-overview">
            <div class="stats-grid">
                <div class="stat-card category-personal">
                    <div class="stat-header">
                        <h3>Total Tasks Completed</h3>
                        <span class="stat-icon">✅</span>
                    </div>
                    <div class="stat-value">${stats.totalCompleted}</div>
                    <div class="stat-change ${stats.completionTrend > 0 ? 'positive' : 'negative'}">
                        ${stats.completionTrend > 0 ? '↗' : '↘'} ${Math.abs(stats.completionTrend)}% vs ${getPreviousPeriodLabel()}
                    </div>
                </div>
                
                <div class="stat-card category-development">
                    <div class="stat-header">
                        <h3>Completion Rate</h3>
                        <span class="stat-icon">📊</span>
                    </div>
                    <div class="stat-value">${stats.completionRate}%</div>
                    <div class="stat-change ${stats.rateTrend > 0 ? 'positive' : 'negative'}">
                        ${stats.rateTrend > 0 ? '↗' : '↘'} ${Math.abs(stats.rateTrend)}% vs ${getPreviousPeriodLabel()}
                    </div>
                </div>
                
                <div class="stat-card category-cleaning">
                    <div class="stat-header">
                        <h3>Daily Average</h3>
                        <span class="stat-icon">📈</span>
                    </div>
                    <div class="stat-value">${stats.dailyAverage}</div>
                    <div class="stat-change ${stats.avgTrend > 0 ? 'positive' : 'negative'}">
                        ${stats.avgTrend > 0 ? '↗' : '↘'} ${Math.abs(stats.avgTrend)}% vs ${getPreviousPeriodLabel()}
                    </div>
                </div>
                
                <div class="stat-card category-kitchen">
                    <div class="stat-header">
                        <h3>Current Streak</h3>
                        <span class="stat-icon">🔥</span>
                    </div>
                    <div class="stat-value">${stats.currentStreak} days</div>
                    <div class="stat-change">
                        Record: ${stats.longestStreak} days
                    </div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-container">
                    <h3>Completion Trend (Last 30 Days)</h3>
                    <div class="chart-area">
                        ${renderCompletionChart(stats.last30Days)}
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Category Breakdown</h3>
                    <div class="chart-area">
                        ${renderCategoryChart(stats.categoryBreakdown)}
                    </div>
                </div>
            </div>
            
            <div class="insights-section">
                <h3>🔍 Insights & Recommendations</h3>
                <div class="insights-grid">
                    ${generateInsights(stats)}
                </div>
            </div>
        </div>
    `;
}

// Render daily analytics
function renderDailyAnalytics() {
    const dailyStats = calculateDailyStats();
    
    return `
        <div class="daily-analytics">
            <div class="daily-header">
                <h3>📅 Daily Task Analytics</h3>
                <div class="daily-controls">
                    <button class="btn btn-primary" onclick="exportDailyData()">Export Data</button>
                </div>
            </div>
            
            <div class="daily-stats-grid">
                <div class="stat-card">
                    <h4>Today's Progress</h4>
                    <div class="progress-ring">
                        <div class="progress-circle" style="--progress: ${dailyStats.todayProgress}%">
                            <span>${dailyStats.todayProgress}%</span>
                        </div>
                    </div>
                    <p>${dailyStats.todayCompleted} of ${dailyStats.todayTotal} tasks</p>
                </div>
                
                <div class="stat-card">
                    <h4>This Week Average</h4>
                    <div class="metric-value">${dailyStats.weekAverage}%</div>
                    <div class="metric-change ${dailyStats.weekTrend > 0 ? 'positive' : 'negative'}">
                        ${dailyStats.weekTrend > 0 ? '↗' : '↘'} ${Math.abs(dailyStats.weekTrend)}%
                    </div>
                </div>
                
                <div class="stat-card">
                    <h4>Best Day</h4>
                    <div class="metric-value">${dailyStats.bestDay.day}</div>
                    <p>${dailyStats.bestDay.percentage}% completion</p>
                </div>
            </div>
            
            <div class="daily-chart-section">
                <h4>Daily Completion Patterns</h4>
                <div class="time-heatmap">
                    ${renderDailyHeatmap(dailyStats.completionPattern)}
                </div>
            </div>
            
            <div class="daily-tasks-list">
                <h4>Today's Task List</h4>
                <div class="task-filter-tabs">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="completed">Completed</button>
                    <button class="filter-tab" data-filter="pending">Pending</button>
                    <button class="filter-tab" data-filter="overdue">Overdue</button>
                </div>
                <div class="filtered-tasks-list">
                    ${renderFilteredTasksList('all')}
                </div>
            </div>
        </div>
    `;
}

// Render weekly analytics
function renderWeeklyAnalytics() {
    const weeklyStats = calculateWeeklyStats();
    
    return `
        <div class="weekly-analytics">
            <div class="weekly-header">
                <h3>📊 Weekly Progress Analytics</h3>
                <div class="week-navigation">
                    <button class="btn btn-outline" onclick="navigateWeek(-1)">← Previous Week</button>
                    <span class="current-week">${getCurrentWeekLabel()}</span>
                    <button class="btn btn-outline" onclick="navigateWeek(1)">Next Week →</button>
                </div>
            </div>
            
            <div class="weekly-comparison">
                <div class="comparison-card">
                    <h4>This Week vs Last Week</h4>
                    <div class="comparison-metrics">
                        <div class="metric">
                            <span class="metric-label">Completion Rate</span>
                            <span class="metric-value">${weeklyStats.thisWeek.completionRate}%</span>
                            <span class="metric-change ${weeklyStats.weeklyTrend > 0 ? 'positive' : 'negative'}">
                                ${weeklyStats.weeklyTrend > 0 ? '+' : ''}${weeklyStats.weeklyTrend}%
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Tasks Completed</span>
                            <span class="metric-value">${weeklyStats.thisWeek.completed}</span>
                            <span class="metric-change ${weeklyStats.tasksTrend > 0 ? 'positive' : 'negative'}">
                                ${weeklyStats.tasksTrend > 0 ? '+' : ''}${weeklyStats.tasksTrend}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="weekly-chart">
                    <h4>Weekly Progress Chart</h4>
                    <div class="bar-chart">
                        ${renderWeeklyBarChart(weeklyStats.dailyProgress)}
                    </div>
                </div>
            </div>
            
            <div class="weekly-tasks-breakdown">
                <h4>Tasks by Category</h4>
                <div class="category-breakdown">
                    ${renderCategoryBreakdown(weeklyStats.categoryStats)}
                </div>
            </div>
            
            <div class="weekly-goals-section">
                <h4>Weekly Goals Progress</h4>
                <div class="goals-list">
                    ${renderWeeklyGoals(weeklyStats.goals)}
                </div>
            </div>
        </div>
    `;
}

// Render monthly analytics
function renderMonthlyAnalytics() {
    const monthlyStats = calculateMonthlyStats();
    
    return `
        <div class="monthly-analytics">
            <div class="monthly-header">
                <h3>🗓️ Monthly Goals & Analytics</h3>
                <div class="month-navigation">
                    <button class="btn btn-outline" onclick="navigateMonth(-1)">← Previous Month</button>
                    <span class="current-month">${getCurrentMonthLabel()}</span>
                    <button class="btn btn-outline" onclick="navigateMonth(1)">Next Month →</button>
                </div>
            </div>
            
            <div class="monthly-overview">
                <div class="month-stats-grid">
                    <div class="stat-card">
                        <h4>Monthly Progress</h4>
                        <div class="circular-progress" style="--progress: ${monthlyStats.monthProgress}%">
                            <span>${monthlyStats.monthProgress}%</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>Goals Achieved</h4>
                        <div class="goals-fraction">
                            <span class="achieved">${monthlyStats.goalsAchieved}</span>
                            <span class="separator">/</span>
                            <span class="total">${monthlyStats.totalGoals}</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>Best Week</h4>
                        <div class="best-week">
                            <span class="week-number">Week ${monthlyStats.bestWeek.number}</span>
                            <span class="week-percentage">${monthlyStats.bestWeek.percentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="monthly-calendar">
                <h4>Monthly Completion Calendar</h4>
                <div class="calendar-heatmap">
                    ${renderMonthlyCalendar(monthlyStats.dailyCompletions)}
                </div>
            </div>
            
            <div class="monthly-goals-management">
                <h4>Monthly Goals</h4>
                <div class="goals-actions">
                    <button class="btn btn-primary" onclick="openMonthlyGoalModal()">Add Monthly Goal</button>
                </div>
                <div class="goals-list">
                    ${renderMonthlyGoalsList(monthlyStats.goals)}
                </div>
            </div>
        </div>
    `;
}

// Render yearly analytics
function renderYearlyAnalytics() {
    const yearlyStats = calculateYearlyStats();
    
    return `
        <div class="yearly-analytics">
            <div class="yearly-header">
                <h3>🎯 Yearly Goals & Long-term Planning</h3>
                <div class="year-navigation">
                    <button class="btn btn-outline" onclick="navigateYear(-1)">← Previous Year</button>
                    <span class="current-year">${getCurrentYear()}</span>
                    <button class="btn btn-outline" onclick="navigateYear(1)">Next Year →</button>
                </div>
            </div>
            
            <div class="yearly-goals-tabs">
                <button class="goal-tab active" data-period="1year">1 Year Goals</button>
                <button class="goal-tab" data-period="5year">5 Year Plan</button>
                <button class="goal-tab" data-period="10year">10 Year Vision</button>
            </div>
            
            <div class="yearly-content">
                <div id="yearly-goals-content">
                    ${renderYearlyGoalsContent('1year')}
                </div>
            </div>
            
            <div class="yearly-progress-section">
                <h4>Yearly Progress Overview</h4>
                <div class="year-stats-grid">
                    <div class="stat-card">
                        <h5>Year Progress</h5>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${yearlyStats.yearProgress}%"></div>
                        </div>
                        <span>${yearlyStats.yearProgress}% complete</span>
                    </div>
                    
                    <div class="stat-card">
                        <h5>Goals Achieved</h5>
                        <div class="achievement-fraction">
                            ${yearlyStats.goalsAchieved} / ${yearlyStats.totalGoals}
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h5>Monthly Average</h5>
                        <div class="average-score">
                            ${yearlyStats.monthlyAverage}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calculate overview statistics
function calculateOverviewStats() {
    const today = getCurrentDateKey();
    const thisWeek = getCurrentWeekKey();
    const thisMonth = getCurrentMonthKey();
    
    // Get completion data
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const completedToday = dailyTasks.filter(task => 
        analyticsData.dailyCompletions[today] && 
        analyticsData.dailyCompletions[today][task.id]
    ).length;
    
    const totalToday = dailyTasks.length;
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    return {
        totalCompleted: completedToday,
        completionRate: completionRate,
        dailyAverage: calculateDailyAverage(),
        currentStreak: calculateCurrentStreak(),
        longestStreak: calculateLongestStreak(),
        completionTrend: calculateCompletionTrend(),
        rateTrend: calculateRateTrend(),
        avgTrend: calculateAvgTrend(),
        last30Days: getLast30DaysData(),
        categoryBreakdown: getCategoryBreakdown()
    };
}

// Calculate daily statistics
function calculateDailyStats() {
    const today = getCurrentDateKey();
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const completedToday = dailyTasks.filter(task => 
        analyticsData.dailyCompletions[today] && 
        analyticsData.dailyCompletions[today][task.id]
    ).length;
    
    return {
        todayProgress: dailyTasks.length > 0 ? Math.round((completedToday / dailyTasks.length) * 100) : 0,
        todayCompleted: completedToday,
        todayTotal: dailyTasks.length,
        weekAverage: calculateWeekAverage(),
        weekTrend: calculateWeekTrend(),
        bestDay: getBestDay(),
        completionPattern: getDailyCompletionPattern()
    };
}

// Calculate weekly statistics
function calculateWeeklyStats() {
    return {
        thisWeek: {
            completionRate: 75,
            completed: 25
        },
        weeklyTrend: 8,
        tasksTrend: 5,
        dailyProgress: [80, 90, 75, 85, 70, 95, 85],
        categoryStats: getCategoryBreakdown(),
        goals: getWeeklyGoals()
    };
}

// Calculate monthly statistics
function calculateMonthlyStats() {
    return {
        monthProgress: 68,
        goalsAchieved: 3,
        totalGoals: 5,
        bestWeek: {
            number: 2,
            percentage: 92
        },
        dailyCompletions: getMonthlyCompletions(),
        goals: getMonthlyGoals()
    };
}

// Calculate yearly statistics
function calculateYearlyStats() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    const yearProgress = Math.round((dayOfYear / 365) * 100);
    
    return {
        yearProgress: yearProgress,
        goalsAchieved: 8,
        totalGoals: 12,
        monthlyAverage: 74
    };
}

// Utility functions for date handling
function getCurrentDateKey() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentWeekKey() {
    const date = new Date();
    const week = getWeekNumber(date);
    return `${date.getFullYear()}-W${week}`;
}

function getCurrentMonthKey() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Update analytics data
function updateAnalyticsData() {
    // Save current analytics data to localStorage
    localStorage.setItem('schedulez_daily_completions', JSON.stringify(analyticsData.dailyCompletions));
    localStorage.setItem('schedulez_weekly_progress', JSON.stringify(analyticsData.weeklyProgress));
    localStorage.setItem('schedulez_monthly_goals', JSON.stringify(analyticsData.monthlyGoals));
    localStorage.setItem('schedulez_yearly_goals', JSON.stringify(analyticsData.yearlyGoals));
    localStorage.setItem('schedulez_completion_history', JSON.stringify(analyticsData.completionHistory));
}

// Record task completion
export function recordTaskCompletion(taskId, completed) {
    const today = getCurrentDateKey();
    
    if (!analyticsData.dailyCompletions[today]) {
        analyticsData.dailyCompletions[today] = {};
    }
    
    if (completed) {
        analyticsData.dailyCompletions[today][taskId] = new Date().toISOString();
    } else {
        delete analyticsData.dailyCompletions[today][taskId];
    }
    
    updateAnalyticsData();
}

// Export analytics data
export function exportAnalyticsData() {
    const dataToExport = {
        dailyCompletions: analyticsData.dailyCompletions,
        weeklyProgress: analyticsData.weeklyProgress,
        monthlyGoals: analyticsData.monthlyGoals,
        yearlyGoals: analyticsData.yearlyGoals,
        completionHistory: analyticsData.completionHistory,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedulez-analytics-${getCurrentDateKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Placeholder functions for features to be implemented
function calculateDailyAverage() { return 85; }
function calculateCurrentStreak() { return 7; }
function calculateLongestStreak() { return 21; }
function calculateCompletionTrend() { return 12; }
function calculateRateTrend() { return 5; }
function calculateAvgTrend() { return 8; }
function getLast30DaysData() { return []; }
function getCategoryBreakdown() { return {}; }
function calculateWeekAverage() { return 82; }
function calculateWeekTrend() { return 3; }
function getBestDay() { return { day: 'Monday', percentage: 95 }; }
function getDailyCompletionPattern() { return []; }
function getPreviousPeriodLabel() { return currentPeriod === 'lastWeek' ? 'previous week' : 'last month'; }
function getWeeklyGoals() { return []; }
function getMonthlyGoals() { return []; }
function getMonthlyCompletions() { return {}; }

// Chart rendering placeholder functions
function renderCompletionChart(data) { return '<div class="chart-placeholder">Completion Chart</div>'; }
function renderCategoryChart(data) { return '<div class="chart-placeholder">Category Chart</div>'; }
function renderDailyHeatmap(data) { return '<div class="heatmap-placeholder">Daily Heatmap</div>'; }
function renderWeeklyBarChart(data) { return '<div class="chart-placeholder">Weekly Bar Chart</div>'; }
function renderMonthlyCalendar(data) { return '<div class="calendar-placeholder">Monthly Calendar</div>'; }

// Content rendering placeholder functions
function generateInsights(stats) { return '<div class="insight-card">Analytics insights coming soon...</div>'; }
function renderFilteredTasksList(filter) { return '<div class="tasks-placeholder">Filtered tasks list</div>'; }
function renderCategoryBreakdown(stats) { return '<div class="breakdown-placeholder">Category breakdown</div>'; }
function renderWeeklyGoals(goals) { return '<div class="goals-placeholder">Weekly goals</div>'; }
function renderMonthlyGoalsList(goals) { return '<div class="goals-placeholder">Monthly goals list</div>'; }
function renderYearlyGoalsContent(period) { return '<div class="goals-placeholder">Yearly goals content</div>'; }

// Navigation functions
function getCurrentWeekLabel() { return 'Week of ' + new Date().toLocaleDateString(); }
function getCurrentMonthLabel() { return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }