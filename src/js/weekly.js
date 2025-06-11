// Weekly Tasks Module
// This module handles all weekly task related functionality

// Render weekly tasks view organized by day
export function renderWeeklyTasks() {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const container = document.getElementById('weekly-tasks');
    
    if (!container) return;
    
    container.innerHTML = weekDays.map(day => {
        const dayEvents = events.filter(e => e.schedule === 'weekly' && e.day === day);
        return `
            <div class="task-card">
                <h3>
                    📅 ${capitalizeFirst(day)}
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>
                <div class="task-list-container sortable-container">                    ${dayEvents.map((event, index) => `
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
                                        <span class="event-card-tag tag-${event.day}">${capitalizeFirst(event.day)}</span>
                                    </div>
                                </div>
                            ` : `
                                <div class="event-card-body">
                                    <div class="event-card-tags">
                                        <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                                        <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                                        <span class="event-card-tag tag-${event.day}">${capitalizeFirst(event.day)}</span>
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

// Get weekly tasks completion summary
export function getWeeklyCompletionSummary() {
    const weeklyTasks = events.filter(e => e.schedule === 'weekly');
    const completed = weeklyTasks.filter(e => e.completed).length;
    
    return {
        total: weeklyTasks.length,
        completed: completed,
        percentage: weeklyTasks.length > 0 ? Math.round((completed / weeklyTasks.length) * 100) : 0
    };
}

// Reset weekly tasks for new week (optional functionality)
export function resetWeeklyTasks() {
    events.forEach(event => {
        if (event.schedule === 'weekly') {
            event.completed = false;
            event.lastCompleted = null;
        }
    });
    saveEvents();
}

// Get tasks for a specific day
export function getTasksForDay(dayName) {
    return events.filter(e => e.schedule === 'weekly' && e.day === dayName.toLowerCase());
}
