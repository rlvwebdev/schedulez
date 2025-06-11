// Monthly Tasks Module
// This module handles all monthly task related functionality

// Render monthly tasks view organized by week
export function renderMonthlyTasks() {
    const weeks = ['first', 'second', 'third', 'fourth'];
    const container = document.getElementById('monthly-tasks');
    
    if (!container) return;
    
    container.innerHTML = weeks.map(week => {
        const weekEvents = events.filter(e => e.schedule === 'monthly' && e.week === week);
        return `
            <div class="task-card">
                <h3>
                    🗓️ ${capitalizeFirst(week)} Week
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>
                <div class="task-list-container sortable-container">
                    ${weekEvents.map((event, index) => `
                        <div class="time-block sortable-item ${isTaskCompleted(event) ? 'completed' : ''}" data-event-id="${event.id}" data-index="${index}">
                            <div class="time">
                                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                                ${formatTime(event.time)}
                            </div>
                            <div class="task">
                                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                                ${event.title}
                                ${event.description ? `<br><small class="event-description">${event.description}</small>` : ''}
                            </div>
                            <div class="task-actions">
                                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'incomplete' : 'completed'}">
                                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                                </label>
                                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => initializeDragAndDrop(), 0);
}

// Get monthly tasks completion summary
export function getMonthlyCompletionSummary() {
    const monthlyTasks = events.filter(e => e.schedule === 'monthly');
    const completed = monthlyTasks.filter(e => e.completed).length;
    
    return {
        total: monthlyTasks.length,
        completed: completed,
        percentage: monthlyTasks.length > 0 ? Math.round((completed / monthlyTasks.length) * 100) : 0
    };
}

// Reset monthly tasks for new month (optional functionality)
export function resetMonthlyTasks() {
    events.forEach(event => {
        if (event.schedule === 'monthly') {
            event.completed = false;
            event.lastCompleted = null;
        }
    });
    saveEvents();
}

// Get tasks for a specific week
export function getTasksForWeek(weekName) {
    return events.filter(e => e.schedule === 'monthly' && e.week === weekName.toLowerCase());
}

// Get current week of month (1-4)
export function getCurrentWeekOfMonth() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekNumber = Math.ceil((today.getDate() + firstDay.getDay()) / 7);
    
    const weekNames = ['first', 'second', 'third', 'fourth'];
    return weekNames[weekNumber - 1] || 'fourth';
}

// Get tasks for current week
export function getCurrentWeekTasks() {
    const currentWeek = getCurrentWeekOfMonth();
    return getTasksForWeek(currentWeek);
}
