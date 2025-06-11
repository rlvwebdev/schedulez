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
                <div class="task-list-container sortable-container">
                    ${dayEvents.map((event, index) => `
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
