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
                <div class="task-list-container sortable-container">                    ${weekEvents.map((event, index) => `
                        <div class="event-card category-${event.category} ${isTaskCompleted(event) ? 'completed' : ''}" data-event-id="${event.id}" data-index="${index}">
                            <div class="event-card-header category-${event.category}">
                                <div class="event-card-drag-handle" title="Drag to reorder">⋮⋮</div>
                                <div class="event-card-title-time">
                                    <h3 class="event-card-title">${escapeHTML(event.title)}</h3>
                                    <div class="event-card-time">${formatTime(event.time)}</div>
                                </div>
                                <div class="event-card-completion">
                                    <input type="checkbox" 
                                           class="event-card-checkbox" 
                                           ${isTaskCompleted(event) ? 'checked' : ''} 
                                           onchange="toggleTaskCompletion(${event.id})"
                                           title="Mark as ${isTaskCompleted(event) ? 'incomplete' : 'completed'}">
                                </div>
                            </div>
                            ${event.description ? `
                                <div class="event-card-body">
                                    <div class="event-card-description">${escapeHTML(event.description)}</div>
                                    <div class="event-card-tags">
                                        <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                                        <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                                        <span class="event-card-tag tag-${event.week}">${capitalizeFirst(event.week)} Week</span>
                                    </div>
                                </div>
                            ` : `
                                <div class="event-card-body">
                                    <div class="event-card-tags">
                                        <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                                        <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                                        <span class="event-card-tag tag-${event.week}">${capitalizeFirst(event.week)} Week</span>
                                    </div>
                                </div>
                            `}
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
