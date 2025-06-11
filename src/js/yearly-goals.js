// Yearly Goals Module
// This module handles yearly goal setting, 5-year plans, and 10-year vision planning

// Yearly goals data storage
let yearlyGoalsData = {
    oneYear: JSON.parse(localStorage.getItem('schedulez_goals_1year') || '[]'),
    fiveYear: JSON.parse(localStorage.getItem('schedulez_goals_5year') || '[]'),
    tenYear: JSON.parse(localStorage.getItem('schedulez_goals_10year') || '[]'),
    milestones: JSON.parse(localStorage.getItem('schedulez_milestones') || '{}'),
    progress: JSON.parse(localStorage.getItem('schedulez_goals_progress') || '{}')
};

// Current view state
let currentGoalPeriod = '1year';
let currentGoalView = 'overview';

// Initialize yearly goals system
export function initializeYearlyGoals() {
    setupYearlyGoalsEventListeners();
    loadYearlyGoalsData();
}

// Setup event listeners for yearly goals
function setupYearlyGoalsEventListeners() {
    // Goal period tabs
    document.querySelectorAll('.goal-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchGoalPeriod(tab.dataset.period);
        });
    });
    
    // Goal management buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="add-goal"]')) {
            openGoalModal(e.target.dataset.period);
        }
        if (e.target.matches('[data-action="edit-goal"]')) {
            editGoal(e.target.dataset.goalId);
        }
        if (e.target.matches('[data-action="delete-goal"]')) {
            deleteGoal(e.target.dataset.goalId);
        }
        if (e.target.matches('[data-action="update-progress"]')) {
            updateGoalProgress(e.target.dataset.goalId);
        }
    });
}

// Main yearly goals rendering function
export function renderYearlyGoals() {
    const container = document.getElementById('yearly-goals-content');
    if (!container) return;

    container.innerHTML = `
        <div class="yearly-goals-header">
            <h2>🎯 Long-term Planning & Goals</h2>
            <div class="goals-actions">
                <button class="btn btn-primary" data-action="add-goal" data-period="${currentGoalPeriod}">
                    Add ${getGoalPeriodLabel(currentGoalPeriod)} Goal
                </button>
                <button class="btn btn-outline" onclick="exportGoalsData()">Export Goals</button>
            </div>
        </div>
        
        <div class="goals-tabs">
            <button class="goal-tab ${currentGoalPeriod === '1year' ? 'active' : ''}" data-period="1year">
                📅 1 Year Goals
            </button>
            <button class="goal-tab ${currentGoalPeriod === '5year' ? 'active' : ''}" data-period="5year">
                🎯 5 Year Plan
            </button>
            <button class="goal-tab ${currentGoalPeriod === '10year' ? 'active' : ''}" data-period="10year">
                🌟 10 Year Vision
            </button>
        </div>
        
        <div class="goals-content-area">
            ${renderGoalsPeriodContent(currentGoalPeriod)}
        </div>
        
        <div class="goals-progress-overview">
            <h3>📊 Progress Overview</h3>
            ${renderGoalsProgressOverview()}
        </div>
    `;
    
    setupYearlyGoalsEventListeners();
}

// Switch between goal periods
function switchGoalPeriod(period) {
    currentGoalPeriod = period;
    
    // Update tab active state
    document.querySelectorAll('.goal-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.period === period);
    });
    
    // Render the new period content
    const contentArea = document.querySelector('.goals-content-area');
    if (contentArea) {
        contentArea.innerHTML = renderGoalsPeriodContent(period);
    }
}

// Render content for specific goal period
function renderGoalsPeriodContent(period) {
    const goals = getGoalsForPeriod(period);
    const periodInfo = getGoalPeriodInfo(period);
    
    return `
        <div class="goals-period-content">
            <div class="period-overview">
                <div class="period-stats">
                    <div class="stat-item">
                        <h4>Total Goals</h4>
                        <span class="stat-value">${goals.length}</span>
                    </div>
                    <div class="stat-item">
                        <h4>Completed</h4>
                        <span class="stat-value">${goals.filter(g => g.completed).length}</span>
                    </div>
                    <div class="stat-item">
                        <h4>In Progress</h4>
                        <span class="stat-value">${goals.filter(g => g.status === 'in-progress').length}</span>
                    </div>
                    <div class="stat-item">
                        <h4>Average Progress</h4>
                        <span class="stat-value">${calculateAverageProgress(goals)}%</span>
                    </div>
                </div>
                
                <div class="period-description">
                    <h4>${periodInfo.title}</h4>
                    <p>${periodInfo.description}</p>
                </div>
            </div>
            
            <div class="goals-grid">
                ${goals.length > 0 ? renderGoalsList(goals, period) : renderEmptyGoalsState(period)}
            </div>
            
            ${period === '1year' ? renderYearlyMilestones() : ''}
            ${period === '5year' ? renderFiveYearBreakdown() : ''}
            ${period === '10year' ? renderTenYearVision() : ''}
        </div>
    `;
}

// Render goals list
function renderGoalsList(goals, period) {
    return goals.map(goal => `
        <div class="goal-card ${goal.completed ? 'completed' : ''} category-${goal.category || 'personal'}">
            <div class="goal-card-header">
                <div class="goal-title-section">
                    <h4 class="goal-title">${escapeHTML(goal.title)}</h4>
                    <div class="goal-meta">
                        <span class="goal-category">${capitalizeFirst(goal.category || 'personal')}</span>
                        <span class="goal-deadline">${formatGoalDeadline(goal.deadline)}</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-sm btn-outline" data-action="edit-goal" data-goal-id="${goal.id}" title="Edit Goal">✏️</button>
                    <button class="btn btn-sm btn-danger" data-action="delete-goal" data-goal-id="${goal.id}" title="Delete Goal">🗑️</button>
                </div>
            </div>
            
            <div class="goal-card-body">
                ${goal.description ? `<p class="goal-description">${escapeHTML(goal.description)}</p>` : ''}
                
                <div class="goal-progress-section">
                    <div class="progress-header">
                        <span>Progress</span>
                        <span class="progress-percentage">${goal.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                    </div>
                    <button class="btn btn-sm btn-primary" data-action="update-progress" data-goal-id="${goal.id}">
                        Update Progress
                    </button>
                </div>
                
                ${goal.milestones && goal.milestones.length > 0 ? `
                    <div class="goal-milestones">
                        <h5>Milestones</h5>
                        <div class="milestones-list">
                            ${goal.milestones.map(milestone => `
                                <div class="milestone ${milestone.completed ? 'completed' : ''}">
                                    <span class="milestone-title">${escapeHTML(milestone.title)}</span>
                                    <span class="milestone-date">${formatDate(milestone.date)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Render empty goals state
function renderEmptyGoalsState(period) {
    const periodInfo = getGoalPeriodInfo(period);
    
    return `
        <div class="empty-goals-state">
            <div class="empty-state-icon">${periodInfo.icon}</div>
            <h3>No ${periodInfo.title} Set Yet</h3>
            <p>${periodInfo.emptyStateMessage}</p>
            <button class="btn btn-primary btn-lg" data-action="add-goal" data-period="${period}">
                Create Your First ${periodInfo.title}
            </button>
        </div>
    `;
}

// Render yearly milestones
function renderYearlyMilestones() {
    return `
        <div class="yearly-milestones-section">
            <h4>🏆 Key Milestones This Year</h4>
            <div class="milestones-timeline">
                ${renderMilestonesTimeline(getCurrentYear())}
            </div>
        </div>
    `;
}

// Render five year breakdown
function renderFiveYearBreakdown() {
    return `
        <div class="five-year-breakdown">
            <h4>📈 5-Year Plan Breakdown</h4>
            <div class="year-breakdown-grid">
                ${renderYearBreakdown(5)}
            </div>
        </div>
    `;
}

// Render ten year vision
function renderTenYearVision() {
    return `
        <div class="ten-year-vision">
            <h4>🌟 10-Year Vision Board</h4>
            <div class="vision-categories">
                ${renderVisionCategories()}
            </div>
        </div>
    `;
}

// Render goals progress overview
function renderGoalsProgressOverview() {
    const allGoals = [
        ...yearlyGoalsData.oneYear,
        ...yearlyGoalsData.fiveYear,
        ...yearlyGoalsData.tenYear
    ];
    
    const overallProgress = calculateOverallProgress(allGoals);
    
    return `
        <div class="progress-overview-grid">
            <div class="progress-card">
                <h4>Overall Progress</h4>
                <div class="circular-progress" style="--progress: ${overallProgress}%">
                    <span>${overallProgress}%</span>
                </div>
            </div>
            
            <div class="progress-card">
                <h4>Goals by Status</h4>
                <div class="status-breakdown">
                    ${renderStatusBreakdown(allGoals)}
                </div>
            </div>
            
            <div class="progress-card">
                <h4>Upcoming Deadlines</h4>
                <div class="upcoming-deadlines">
                    ${renderUpcomingDeadlines(allGoals)}
                </div>
            </div>
        </div>
    `;
}

// Goal management functions
export function openGoalModal(period = '1year', goalId = null) {
    const isEdit = goalId !== null;
    const goal = isEdit ? findGoalById(goalId) : null;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal goal-modal">
            <div class="modal-header">
                <h3>${isEdit ? 'Edit' : 'Add'} ${getGoalPeriodLabel(period)} Goal</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <form id="goal-form">
                    <input type="hidden" name="period" value="${period}">
                    ${isEdit ? `<input type="hidden" name="goalId" value="${goalId}">` : ''}
                    
                    <div class="form-group">
                        <label for="goal-title">Goal Title</label>
                        <input type="text" id="goal-title" name="title" value="${goal ? goal.title : ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-description">Description</label>
                        <textarea id="goal-description" name="description" rows="3">${goal ? goal.description : ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="goal-category">Category</label>
                            <select id="goal-category" name="category">
                                <option value="personal" ${goal && goal.category === 'personal' ? 'selected' : ''}>Personal</option>
                                <option value="career" ${goal && goal.category === 'career' ? 'selected' : ''}>Career</option>
                                <option value="health" ${goal && goal.category === 'health' ? 'selected' : ''}>Health</option>
                                <option value="financial" ${goal && goal.category === 'financial' ? 'selected' : ''}>Financial</option>
                                <option value="relationships" ${goal && goal.category === 'relationships' ? 'selected' : ''}>Relationships</option>
                                <option value="skills" ${goal && goal.category === 'skills' ? 'selected' : ''}>Skills</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="goal-deadline">Target Deadline</label>
                            <input type="date" id="goal-deadline" name="deadline" value="${goal && goal.deadline ? goal.deadline : ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-progress">Current Progress (%)</label>
                        <input type="range" id="goal-progress" name="progress" min="0" max="100" value="${goal ? goal.progress || 0 : 0}" oninput="updateProgressValue(this.value)">
                        <span id="progress-value">${goal ? goal.progress || 0 : 0}%</span>
                    </div>
                    
                    <div class="milestones-section">
                        <h4>Milestones</h4>
                        <div id="milestones-container">
                            ${goal && goal.milestones ? renderMilestonesForm(goal.milestones) : ''}
                        </div>
                        <button type="button" class="btn btn-outline" onclick="addMilestoneField()">Add Milestone</button>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveGoal()">${isEdit ? 'Update' : 'Create'} Goal</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('goal-title').focus();
}

// Save goal function
export function saveGoal() {
    const form = document.getElementById('goal-form');
    const formData = new FormData(form);
    const period = formData.get('period');
    const goalId = formData.get('goalId');
    const isEdit = goalId !== null;
    
    const goal = {
        id: isEdit ? goalId : Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        deadline: formData.get('deadline'),
        progress: parseInt(formData.get('progress')) || 0,
        completed: parseInt(formData.get('progress')) === 100,
        status: getGoalStatus(parseInt(formData.get('progress'))),
        createdAt: isEdit ? findGoalById(goalId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: getMilestonesFromForm()
    };
    
    if (isEdit) {
        updateGoalInData(goal, period);
    } else {
        addGoalToData(goal, period);
    }
    
    saveYearlyGoalsData();
    closeModal();
    renderYearlyGoals();
}

// Utility functions
function getGoalsForPeriod(period) {
    switch (period) {
        case '1year': return yearlyGoalsData.oneYear;
        case '5year': return yearlyGoalsData.fiveYear;
        case '10year': return yearlyGoalsData.tenYear;
        default: return [];
    }
}

function getGoalPeriodInfo(period) {
    const periods = {
        '1year': {
            title: '1 Year Goals',
            description: 'Specific, achievable goals for the current year with clear deadlines and milestones.',
            emptyStateMessage: 'Start by setting 3-5 specific goals you want to achieve this year.',
            icon: '📅'
        },
        '5year': {
            title: '5 Year Plan',
            description: 'Medium-term strategic goals that will shape your next five years.',
            emptyStateMessage: 'Think about where you want to be in 5 years and work backwards.',
            icon: '🎯'
        },
        '10year': {
            title: '10 Year Vision',
            description: 'Long-term vision and aspirational goals for the next decade.',
            emptyStateMessage: 'Envision your ideal life 10 years from now and set ambitious goals.',
            icon: '🌟'
        }
    };
    return periods[period] || periods['1year'];
}

function getGoalPeriodLabel(period) {
    const labels = {
        '1year': '1-Year',
        '5year': '5-Year',
        '10year': '10-Year'
    };
    return labels[period] || '1-Year';
}

function calculateAverageProgress(goals) {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(total / goals.length);
}

function formatGoalDeadline(deadline) {
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString();
}

function getGoalStatus(progress) {
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
}

function findGoalById(goalId) {
    const allGoals = [
        ...yearlyGoalsData.oneYear,
        ...yearlyGoalsData.fiveYear,
        ...yearlyGoalsData.tenYear
    ];
    return allGoals.find(goal => goal.id === goalId);
}

function addGoalToData(goal, period) {
    switch (period) {
        case '1year': yearlyGoalsData.oneYear.push(goal); break;
        case '5year': yearlyGoalsData.fiveYear.push(goal); break;
        case '10year': yearlyGoalsData.tenYear.push(goal); break;
    }
}

function updateGoalInData(goal, period) {
    const goals = getGoalsForPeriod(period);
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
        goals[index] = goal;
    }
}

function saveYearlyGoalsData() {
    localStorage.setItem('schedulez_goals_1year', JSON.stringify(yearlyGoalsData.oneYear));
    localStorage.setItem('schedulez_goals_5year', JSON.stringify(yearlyGoalsData.fiveYear));
    localStorage.setItem('schedulez_goals_10year', JSON.stringify(yearlyGoalsData.tenYear));
    localStorage.setItem('schedulez_milestones', JSON.stringify(yearlyGoalsData.milestones));
    localStorage.setItem('schedulez_goals_progress', JSON.stringify(yearlyGoalsData.progress));
}

function loadYearlyGoalsData() {
    yearlyGoalsData.oneYear = JSON.parse(localStorage.getItem('schedulez_goals_1year') || '[]');
    yearlyGoalsData.fiveYear = JSON.parse(localStorage.getItem('schedulez_goals_5year') || '[]');
    yearlyGoalsData.tenYear = JSON.parse(localStorage.getItem('schedulez_goals_10year') || '[]');
    yearlyGoalsData.milestones = JSON.parse(localStorage.getItem('schedulez_milestones') || '{}');
    yearlyGoalsData.progress = JSON.parse(localStorage.getItem('schedulez_goals_progress') || '{}');
}

// Export goals data
export function exportGoalsData() {
    const dataToExport = {
        ...yearlyGoalsData,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedulez-goals-${getCurrentDateKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Placeholder functions for features to be implemented
function renderMilestonesTimeline(year) { return '<div class="timeline-placeholder">Milestones timeline</div>'; }
function renderYearBreakdown(years) { return '<div class="breakdown-placeholder">Year breakdown</div>'; }
function renderVisionCategories() { return '<div class="vision-placeholder">Vision categories</div>'; }
function calculateOverallProgress(goals) { return 65; }
function renderStatusBreakdown(goals) { return '<div class="status-placeholder">Status breakdown</div>'; }
function renderUpcomingDeadlines(goals) { return '<div class="deadlines-placeholder">Upcoming deadlines</div>'; }
function renderMilestonesForm(milestones) { return ''; }
function getMilestonesFromForm() { return []; }
function getCurrentDateKey() { return new Date().toISOString().split('T')[0]; }
function escapeHTML(text) { return text ? text.replace(/[&<>"']/g, '') : ''; }
function capitalizeFirst(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
function formatDate(date) { return new Date(date).toLocaleDateString(); }
function getCurrentYear() { return new Date().getFullYear(); }