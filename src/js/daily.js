// Daily Schedule Module
// This module handles all daily schedule related functionality

// Import utility functions (these will be available globally when script.js loads)
// formatTime, capitalizeFirst, isTaskCompleted, escapeHTML, events array

// Render daily schedule view
export function renderDailySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('daily-schedule');
    
    if (!container) return;
      container.innerHTML = dailyEvents.map((event, index) => `
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
                    </div>
                </div>
            ` : `
                <div class="event-card-body">
                    <div class="event-card-tags">
                        <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                        <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                    </div>
                </div>
            `}
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => initializeDragAndDrop(), 0);
}

// Render today's schedule overview for dashboard
export function renderTodaySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('today-schedule');
    
    if (!container) return;
    
    // Get current time for highlighting
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    container.innerHTML = dailyEvents.slice(0, 8).map(event => {
        const isActive = event.time <= currentTime;
        const completed = isTaskCompleted(event);
        return `
            <div class="time-block ${completed ? 'completed' : ''} ${isActive ? 'active' : ''}">
                <div class="time">${formatTime(event.time)}</div>
                <div class="task">
                    <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                    ${event.title}
                    ${completed ? ' ✅' : ''}
                </div>
                <div class="task-actions">
                    <label class="completion-checkbox" title="Mark as ${completed ? 'incomplete' : 'completed'}">
                        <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                        <span class="checkmark">${completed ? '✅' : '☐'}</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

// Reset daily tasks completion status
export function resetDailyTasks() {
    events.forEach(event => {
        if (event.schedule === 'daily') {
            event.completedToday = false;
        }
    });
    saveEvents();
}

// Initialize daily task progress tracking
export function initializeDailyProgressTracking() {
    // Reset daily tasks at midnight
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        resetDailyTasks();
        localStorage.setItem('lastDailyReset', today);
    }
}
