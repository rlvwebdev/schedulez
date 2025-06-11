// Event Management Module
// This module handles CRUD operations and event management functionality

// Render the manage events page with all events
export function renderManageEvents() {
    const container = document.getElementById('events-list');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<div class="no-events" role="status" aria-live="polite">No events configured. Start by adding your first event!</div>';
        return;
    }
    
    // Sort events by schedule type and time
    const sortedEvents = [...events].sort((a, b) => {
        if (a.schedule !== b.schedule) {
            const scheduleOrder = { daily: 1, weekly: 2, monthly: 3 };
            return scheduleOrder[a.schedule] - scheduleOrder[b.schedule];
        }
        return a.time.localeCompare(b.time);
    });
    
    // Set ARIA attributes for the container
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', `Event management list with ${sortedEvents.length} events`);
    
    container.innerHTML = sortedEvents.map((event, index) => {
        const isCompleted = event.schedule === 'daily' ? event.completedToday : event.completed;
        
        return `
            <div class="event-item ${isCompleted ? 'completed' : ''}" 
                 data-id="${event.id}" 
                 draggable="true"
                 role="listitem"
                 aria-label="Event: ${escapeHTML(event.title)} scheduled for ${escapeHTML(event.schedule)}"
                 aria-describedby="event-manage-desc-${event.id}"
                 tabindex="0">
                <div class="drag-handle" 
                     title="Drag to reorder" 
                     aria-label="Drag handle for ${escapeHTML(event.title)}"
                     role="button"
                     tabindex="0"
                     onkeydown="handleDragKeydown(event, ${event.id})">⋮⋮</div>
                <div class="event-checkbox-container">
                    <input type="checkbox" 
                           class="event-checkbox" 
                           id="manage-checkbox-${event.id}"
                           ${isCompleted ? 'checked' : ''} 
                           onchange="toggleTaskCompletion(${event.id})"
                           aria-label="Mark ${escapeHTML(event.title)} as ${isCompleted ? 'incomplete' : 'complete'}">
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <h4 class="event-title" id="manage-title-${event.id}">${escapeHTML(event.title)}</h4>
                        <div class="event-meta">
                            <span class="event-time" aria-label="Scheduled time">${escapeHTML(event.time)}</span>
                            <span class="event-category category-${escapeHTML(event.category)}" 
                                  aria-label="Category: ${escapeHTML(event.category)}">${escapeHTML(event.category)}</span>
                            <span class="event-schedule" aria-label="Schedule type">${escapeHTML(event.schedule)}</span>
                            ${event.day ? `<span class="event-day" aria-label="Day: ${escapeHTML(event.day)}">${escapeHTML(event.day)}</span>` : ''}
                            ${event.week ? `<span class="event-week" aria-label="Week: ${escapeHTML(event.week)}">${escapeHTML(event.week)}</span>` : ''}
                        </div>
                    </div>
                    ${event.description ? `<p class="event-description" id="event-manage-desc-${event.id}">${escapeHTML(event.description)}</p>` : ''}
                    ${event.lastCompleted ? `<p class="event-last-completed" aria-label="Last completed on">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</p>` : ''}
                </div>
                <div class="event-actions" role="group" aria-label="Event actions">
                    <button onclick="editEvent(${event.id})" 
                            class="btn-edit" 
                            title="Edit ${escapeHTML(event.title)}" 
                            aria-label="Edit event: ${escapeHTML(event.title)}">✏️</button>
                    <button onclick="deleteEvent(${event.id})" 
                            class="btn-delete" 
                            title="Delete ${escapeHTML(event.title)}" 
                            aria-label="Delete event: ${escapeHTML(event.title)}">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.dataset.schedule = 'manage';
}

// Event form handling
export function saveEvent() {
    const form = document.getElementById('event-form');
    const formData = new FormData(form);
    
    const eventData = {
        title: formData.get('title').trim(),
        time: formData.get('time'),
        category: formData.get('category'),
        schedule: formData.get('schedule'),
        day: formData.get('day') || '',
        week: formData.get('week') || '',
        description: formData.get('description').trim(),
        completed: false,
        completedToday: false,
        lastCompleted: null
    };
    
    // Validation
    if (!eventData.title || !eventData.time || !eventData.category || !eventData.schedule) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (editingEventId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = { ...events[index], ...eventData };
            showNotification('Event updated successfully!', 'success');
        }
    } else {
        // Add new event
        eventData.id = generateUniqueId();
        events.push(eventData);
        showNotification('Event added successfully!', 'success');
    }
    
    saveEvents();
    clearEventForm();
}

// Edit an existing event
export function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    editingEventId = id;
    
    // Populate form
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-time').value = event.time;
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-schedule').value = event.schedule;
    document.getElementById('event-day').value = event.day;
    document.getElementById('event-week').value = event.week;
    document.getElementById('event-description').value = event.description;
    
    updateDayWeekFields();
    
    // Change form title and button text
    document.querySelector('#add-event h3').textContent = 'Edit Event';
    document.querySelector('#event-form button[type="submit"]').textContent = 'Update Event';
    
    // Navigate to add event page
    document.querySelector('[data-page="add-event"]').click();
}

// Delete an event
export function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        showNotification('Event deleted successfully!', 'success');
    }
}

// Clear the event form
export function clearEventForm() {
    document.getElementById('event-form').reset();
    editingEventId = null;
    updateDayWeekFields();
    
    // Reset form title and button text
    document.querySelector('#add-event h3').textContent = 'Add New Event';
    document.querySelector('#event-form button[type="submit"]').textContent = 'Add Event';
}

// Search functionality
export function performSearch(query) {
    if (!query.trim()) {
        renderAllViews();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm) ||
        event.schedule.toLowerCase().includes(searchTerm) ||
        (event.day && event.day.toLowerCase().includes(searchTerm)) ||
        (event.week && event.week.toLowerCase().includes(searchTerm))
    );
    
    renderSearchResults(filteredEvents);
}

// Render search results
export function renderSearchResults(filteredEvents) {
    const searchResults = document.getElementById('events-list');
    if (!searchResults) return;
    
    if (filteredEvents.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No events found matching your search.</div>';
        return;
    }
    
    let html = '<div class="search-results-container">';
    
    // Group results by schedule type
    const groupedResults = {
        daily: filteredEvents.filter(e => e.schedule === 'daily'),
        weekly: filteredEvents.filter(e => e.schedule === 'weekly'),
        monthly: filteredEvents.filter(e => e.schedule === 'monthly')
    };
    
    Object.entries(groupedResults).forEach(([scheduleType, scheduleEvents]) => {
        if (scheduleEvents.length > 0) {
            html += `<div class="search-group">
                        <h3 class="search-group-title">${capitalizeFirst(scheduleType)} Tasks (${scheduleEvents.length})</h3>
                        <div class="search-group-events">`;
            
            scheduleEvents.forEach(event => {
                const isCompleted = event.schedule === 'daily' ? event.completedToday : event.completed;
                html += `
                    <div class="search-result-item ${isCompleted ? 'completed' : ''}" data-id="${event.id}">
                        <div class="event-checkbox-container">
                            <input type="checkbox" 
                                   ${isCompleted ? 'checked' : ''} 
                                   onchange="toggleTaskCompletion(${event.id})"
                                   aria-label="Mark as ${isCompleted ? 'incomplete' : 'complete'}">
                        </div>
                        <div class="event-content">
                            <h4>${escapeHTML(event.title)}</h4>
                            <div class="event-meta">
                                <span class="event-time">${escapeHTML(event.time)}</span>
                                <span class="event-category">${escapeHTML(event.category)}</span>
                                ${event.day ? `<span class="event-day">${escapeHTML(event.day)}</span>` : ''}
                                ${event.week ? `<span class="event-week">${escapeHTML(event.week)}</span>` : ''}
                            </div>
                            ${event.description ? `<p class="event-description">${escapeHTML(event.description)}</p>` : ''}
                        </div>
                        <div class="event-actions">
                            <button onclick="editEvent(${event.id})" class="btn-edit" title="Edit event" aria-label="Edit event">✏️</button>
                            <button onclick="deleteEvent(${event.id})" class="btn-delete" title="Delete event" aria-label="Delete event">🗑️</button>
                        </div>
                    </div>`;
            });
            
            html += '</div></div>';
        }
    });
    
    searchResults.innerHTML = html;
}
