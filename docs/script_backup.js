// Global Variables
let events = JSON.parse(localStorage.getItem('homeEvents')) || [];
let editingEventId = null;
let deferredPrompt;

console.log('🔍 Loaded events from localStorage:', events.length);

// Initialize default events if none exist
if (events.length === 0) {
    console.log('📝 No events found, initializing defaults...');
    initializeDefaultEvents();
} else {
    console.log('✅ Found existing events:', events.length);
}

// Default events data
function initializeDefaultEvents() {
    const defaultEvents = [
        // Daily Events
        { id: 1, title: "Wake up, personal hygiene", time: "05:00", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 2, title: "Let dogs out for morning relief & quick exercise", time: "05:10", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 3, title: "Feed dogs breakfast", time: "05:20", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 4, title: "Wipe kitchen counters, load/start dishwasher if needed", time: "05:25", category: "cleaning", schedule: "daily", day: "", week: "", description: "" },
        { id: 5, title: "Check weather/news, quick snack if desired", time: "05:35", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 6, title: "Extra time for personal routine or TMS planning", time: "05:45", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 7, title: "Get dressed, gather work items", time: "06:00", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 8, title: "Quick potty break for dogs", time: "06:20", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 9, title: "Leave for work (26-mile commute to Springfield + 5min coffee stop)", time: "06:25", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 10, title: "Return home - let dogs out immediately, quick walk", time: "18:00", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 11, title: "Feed dogs dinner", time: "18:30", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 12, title: "Prepare and eat dinner", time: "18:45", category: "kitchen", schedule: "daily", day: "", week: "", description: "" },
        { id: 13, title: "Complete one daily cleaning task", time: "19:30", category: "cleaning", schedule: "daily", day: "", week: "", description: "Rotate: bedroom tidy, living room pickup, office organization" },
        { id: 14, title: "Clean dinner dishes, wipe counters, prep kitchen for next day", time: "20:00", category: "kitchen", schedule: "daily", day: "", week: "", description: "" },
        { id: 15, title: "TMS Development (1.5 hours Mon-Fri)", time: "20:15", category: "development", schedule: "daily", day: "", week: "", description: "Code/work on Transportation Management System project" },
        { id: 16, title: "Final potty break for dogs", time: "21:45", category: "dogs", schedule: "daily", day: "", week: "", description: "" },
        { id: 17, title: "Brief relaxation/wind down", time: "21:50", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 18, title: "Wind down routine, prepare for bed", time: "22:00", category: "personal", schedule: "daily", day: "", week: "", description: "" },
        { id: 19, title: "Bedtime", time: "22:15", category: "personal", schedule: "daily", day: "", week: "", description: "" },

        // Weekly Events
        { id: 20, title: "Kitchen Deep Clean", time: "19:30", category: "cleaning", schedule: "weekly", day: "monday", week: "", description: "Deep clean appliances, scrub sink, clean refrigerator, mop floor, organize pantry" },
        { id: 21, title: "Living Room Focus", time: "19:30", category: "cleaning", schedule: "weekly", day: "tuesday", week: "", description: "Vacuum furniture and carpets, dust surfaces, organize entertainment center, clean windows" },
        { id: 22, title: "Trash Out & Bedroom Clean", time: "19:30", category: "cleaning", schedule: "weekly", day: "wednesday", week: "", description: "Take trash out after dinner, change bed sheets, vacuum bedroom, dust furniture, organize closet" },
        { id: 23, title: "Office & Gaming Room", time: "19:30", category: "cleaning", schedule: "weekly", day: "thursday", week: "", description: "Organize desk, dust computer equipment, vacuum gaming room, organize tech storage, clean monitors" },
        { id: 24, title: "Laundry Day", time: "19:30", category: "cleaning", schedule: "weekly", day: "friday", week: "", description: "Wash, dry, and fold all laundry, clean laundry area, organize clothes, clean lint trap" },
        { id: 25, title: "Yard Work Day", time: "08:00", category: "maintenance", schedule: "weekly", day: "saturday", week: "", description: "Mow lawn, weed whack, water plants, pick up dog waste, basic yard maintenance" },
        { id: 26, title: "TMS Development Extended Session", time: "14:00", category: "development", schedule: "weekly", day: "saturday", week: "", description: "4-hour focused coding session for complex features" },
        { id: 27, title: "TMS Development Extended Session", time: "14:00", category: "development", schedule: "weekly", day: "sunday", week: "", description: "4-hour focused coding session and weekly planning" },
        { id: 28, title: "Rest & Development Prep", time: "10:00", category: "personal", schedule: "weekly", day: "sunday", week: "", description: "Light cleaning, meal prep, dog grooming, plan next week's TMS goals" },

        // Monthly Events
        { id: 29, title: "Deep Bathroom & Window Cleaning", time: "10:00", category: "cleaning", schedule: "monthly", day: "", week: "first", description: "Deep clean all bathrooms, wash windows, clean baseboards, organize spare bedroom, replace air filters" },
        { id: 30, title: "Basement & Maintenance Tasks", time: "10:00", category: "maintenance", schedule: "monthly", day: "", week: "second", description: "Deep clean basement laundry area, inspect gutters, test smoke detectors, clean garage, maintain yard equipment" },
        { id: 31, title: "Pet Care Deep Clean", time: "10:00", category: "dogs", schedule: "monthly", day: "", week: "third", description: "Deep clean dog areas and beds, wash dog toys, clean bowls thoroughly, vacuum pet hair, stock pet supplies" },
        { id: 32, title: "Deep House Cleaning", time: "10:00", category: "cleaning", schedule: "monthly", day: "", week: "fourth", description: "Steam clean carpets, deep clean kitchen appliances, organize and declutter, clean light fixtures, seasonal maintenance" }
    ].map(event => ({
        ...event,
        completed: false,
        completedToday: false,
        lastCompleted: null
    }));

    events = defaultEvents;
    saveEvents();
}

// Data Management Functions
function saveEvents() {
    try {
        localStorage.setItem('homeEvents', JSON.stringify(events));
        updateDashboard();
        renderAllViews();
    } catch (error) {
        console.error('Failed to save events:', error);
        showNotification('Failed to save data. Storage may be full.', 'error');
    }
}

// Navigation functionality
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            // Show selected page
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// Event form functionality
function initializeEventForm() {
    document.getElementById('event-schedule').addEventListener('change', function() {
        const weeklyGroup = document.getElementById('weekly-day-group');
        const monthlyGroup = document.getElementById('monthly-week-group');
        
        if (this.value === 'weekly') {
            weeklyGroup.setAttribute('data-hidden', 'false');
            weeklyGroup.style.display = 'block';
            monthlyGroup.setAttribute('data-hidden', 'true');
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = true;
            document.getElementById('event-week').required = false;
        } else if (this.value === 'monthly') {
            weeklyGroup.setAttribute('data-hidden', 'true');
            weeklyGroup.style.display = 'none';
            monthlyGroup.setAttribute('data-hidden', 'false');
            monthlyGroup.style.display = 'block';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = true;
        } else {
            weeklyGroup.setAttribute('data-hidden', 'true');
            weeklyGroup.style.display = 'none';
            monthlyGroup.setAttribute('data-hidden', 'true');
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = false;
        }
    });    // Event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Validate form data
            const title = document.getElementById('event-title').value.trim();
            const time = document.getElementById('event-time').value;
            const category = document.getElementById('event-category').value;
            const schedule = document.getElementById('event-schedule').value;
            const day = document.getElementById('event-day').value;
            const week = document.getElementById('event-week').value;
            const description = document.getElementById('event-description').value.trim();
            
            // Basic validation
            if (!title) {
                throw new Error('Event title is required');
            }
            if (!time) {
                throw new Error('Event time is required');
            }
            if (!category) {
                throw new Error('Please select a category');
            }
            if (!schedule) {
                throw new Error('Please select a schedule type');
            }
            if (schedule === 'weekly' && !day) {
                throw new Error('Please select a day for weekly events');
            }
            if (schedule === 'monthly' && !week) {
                throw new Error('Please select a week for monthly events');
            }
            
            // Check for duplicate daily events at same time
            if (schedule === 'daily') {
                const existingEvent = events.find(e => 
                    e.schedule === 'daily' && 
                    e.time === time && 
                    e.id !== editingEventId
                );
                if (existingEvent) {
                    throw new Error(`A daily event already exists at ${formatTime(time)}: ${existingEvent.title}`);
                }
            }
            
            const formData = {
                id: editingEventId || Date.now(),
                title: title,
                time: time,
                category: category,
                schedule: schedule,
                day: day,
                week: week,
                description: description,
                completed: false,
                completedToday: false,
                lastCompleted: null
            };

            if (editingEventId) {
                // Update existing event
                const index = events.findIndex(e => e.id === editingEventId);
                if (index !== -1) {
                    // Preserve completion status when editing
                    formData.completed = events[index].completed;
                    formData.completedToday = events[index].completedToday;
                    formData.lastCompleted = events[index].lastCompleted;
                    events[index] = formData;
                }
            } else {
                // Add new event
                events.push(formData);
            }

            saveEvents();
            closeEventModal();
            resetForm();
            showNotification('Event saved successfully!', 'success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(error.message, 'error');
        }
    });
}

// Modal functions
function openEventModal(eventId = null) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (eventId) {
        // Edit mode
        const event = events.find(e => e.id === eventId);
        if (event) {
            editingEventId = eventId;
            modalTitle.textContent = 'Edit Event';
            
            // Populate form
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-category').value = event.category;
            document.getElementById('event-schedule').value = event.schedule;
            document.getElementById('event-day').value = event.day;
            document.getElementById('event-week').value = event.week;
            document.getElementById('event-description').value = event.description;
            
            // Trigger schedule change to show/hide fields
            document.getElementById('event-schedule').dispatchEvent(new Event('change'));
        }
    } else {
        // Add mode
        editingEventId = null;
        modalTitle.textContent = 'Add New Event';
        resetForm();
    }
    
    modal.classList.add('show');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('show');
    resetForm();
}

function resetForm() {
    document.getElementById('event-form').reset();
    const weeklyGroup = document.getElementById('weekly-day-group');
    const monthlyGroup = document.getElementById('monthly-week-group');
    weeklyGroup.setAttribute('data-hidden', 'true');
    weeklyGroup.style.display = 'none';
    monthlyGroup.setAttribute('data-hidden', 'true');
    monthlyGroup.style.display = 'none';
    editingEventId = null;
}

function deleteEvent(eventId) {
    try {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            events = events.filter(e => e.id !== eventId);
            saveEvents();
            showNotification('Event deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to delete event:', error);
        showNotification('Failed to delete event. Please try again.', 'error');
    }
}

// Task completion functions
function toggleTaskCompletion(eventId) {
    try {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        
        const today = new Date().toDateString();
        
        if (event.schedule === 'daily') {
            event.completedToday = !event.completedToday;
            event.lastCompleted = event.completedToday ? today : null;
            
            if (event.completedToday) {
                showNotification(`✅ Daily task completed: ${event.title}`, 'success');
            } else {
                showNotification(`↩️ Daily task unmarked: ${event.title}`, 'info');
            }
        } else {
            event.completed = !event.completed;
            event.lastCompleted = event.completed ? today : null;
            
            if (event.completed) {
                showNotification(`✅ ${capitalizeFirst(event.schedule)} task completed: ${event.title}`, 'success');
            } else {
                showNotification(`↩️ ${capitalizeFirst(event.schedule)} task unmarked: ${event.title}`, 'info');
            }
        }
        
        saveEvents();
        updateProgressStats();
        
    } catch (error) {
        console.error('Failed to toggle task completion:', error);
        showNotification('Failed to update task status. Please try again.', 'error');
    }
}

function isTaskCompleted(event) {
    const today = new Date().toDateString();
    
    if (event.schedule === 'daily') {
        return event.completedToday && event.lastCompleted === today;
    } else {
        return event.completed;
    }
}

// Reset daily completions at start of new day
function resetDailyCompletions() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastDailyReset');
    
    if (lastReset !== today) {
        events.forEach(event => {
            if (event.schedule === 'daily') {
                event.completedToday = false;
            }
        });
        localStorage.setItem('lastDailyReset', today);
        saveEvents();
    }
}

// Render functions
function renderDailySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('daily-schedule');
      container.innerHTML = dailyEvents.map((event, index) => `
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
                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'inactive' : 'completed'}">
                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                </label>
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderWeeklyTasks() {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const container = document.getElementById('weekly-tasks');
    
    container.innerHTML = weekDays.map(day => {
        const dayEvents = events.filter(e => e.schedule === 'weekly' && e.day === day);
        return `
            <div class="task-card">
                <h3>
                    📅 ${capitalizeFirst(day)}
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>                <div class="task-list-container sortable-container">                    ${dayEvents.map((event, index) => `
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
        `;    }).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderMonthlyTasks() {
    const weeks = ['first', 'second', 'third', 'fourth'];
    const container = document.getElementById('monthly-tasks');
    
    container.innerHTML = weeks.map(week => {
        const weekEvents = events.filter(e => e.schedule === 'monthly' && e.week === week);
        return `
            <div class="task-card">
                <h3>
                    🗓️ ${capitalizeFirst(week)} Week
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>                <div class="task-list-container sortable-container">                    ${weekEvents.map((event, index) => `
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
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderManageEvents() {
    const container = document.getElementById('events-list');
    const sortedEvents = [...events].sort((a, b) => {
        if (a.schedule !== b.schedule) {
            const scheduleOrder = { daily: 1, weekly: 2, monthly: 3 };
            return scheduleOrder[a.schedule] - scheduleOrder[b.schedule];
        }
        return a.time.localeCompare(b.time);
    });
      container.innerHTML = sortedEvents.map((event, index) => `
        <div class="time-block sortable-item ${isTaskCompleted(event) ? 'completed' : ''}" data-event-id="${event.id}" data-index="${index}">
            <div class="time">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                ${formatTime(event.time)}
            </div>
            <div class="task">
                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                <strong>${event.title}</strong>
                ${isTaskCompleted(event) ? ' ✅' : ''}
                <br>
                <small class="event-details">
                    ${capitalizeFirst(event.schedule)}
                    ${event.day ? ` - ${capitalizeFirst(event.day)}` : ''}
                    ${event.week ? ` - ${capitalizeFirst(event.week)} Week` : ''}
                    ${event.lastCompleted ? ` - Last completed: ${new Date(event.lastCompleted).toLocaleDateString()}` : ''}
                </small>
                ${event.description ? `<br><small class="event-description">${event.description}</small>` : ''}
            </div>
            <div class="task-actions">
                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'incomplete' : 'completed'}">
                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                </label>
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderTodaySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('today-schedule');
    
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

function updateDashboard() {
    document.getElementById('total-tasks').textContent = events.length;
    renderTodaySchedule();
    updateProgressStats();
}

function renderAllViews() {
    renderDailySchedule();
    renderWeeklyTasks();
    renderMonthlyTasks();
    renderManageEvents();
}

// Data export/import functions
function exportData() {
    try {
        const dataToExport = {
            events: events,
            exportDate: new Date().toISOString(),
            version: '1.1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `schedulez-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed. Please try again.', 'error');
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                  if (importedData.events && Array.isArray(importedData.events)) {
                    if (confirm('This will replace all your current data. Are you sure?')) {
                        events = importedData.events;
                        saveEvents();
                        renderAllViews();
                        updateProgressStats();
                        showNotification('Data imported successfully!', 'success');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                showNotification('Import failed. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('This will reset all your data to the default schedule. This action cannot be undone. Are you sure?')) {
        localStorage.removeItem('homeEvents');
        localStorage.removeItem('lastDailyReset');
        events = [];
        initializeDefaultEvents();
        renderAllViews();
        updateProgressStats();
        showNotification('Schedule reset to defaults successfully!', 'success');
    }
}

// Search functionality
function searchEvents(query) {
    if (!query.trim()) {
        renderAllViews();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm)
    );
    
    renderSearchResults(filteredEvents);
}

function renderSearchResults(filteredEvents) {
    const container = document.getElementById('events-list');
    
    if (filteredEvents.length === 0) {
        container.innerHTML = '<p class="no-results">No events found matching your search.</p>';
        return;
    }
    
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (a.schedule !== b.schedule) {
            const scheduleOrder = { daily: 1, weekly: 2, monthly: 3 };
            return scheduleOrder[a.schedule] - scheduleOrder[b.schedule];
        }
        return a.time.localeCompare(b.time);
    });
    
    container.innerHTML = sortedEvents.map((event, index) => `
        <div class="time-block sortable-item ${isTaskCompleted(event) ? 'completed' : ''}" data-event-id="${event.id}" data-index="${index}">
            <div class="time">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                ${formatTime(event.time)}
            </div>
            <div class="task">
                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                <strong>${event.title}</strong>
                ${isTaskCompleted(event) ? ' ✅' : ''}
                <br>
                <small class="event-details">
                    ${capitalizeFirst(event.schedule)}
                    ${event.day ? ` - ${capitalizeFirst(event.day)}` : ''}
                    ${event.week ? ` - ${capitalizeFirst(event.week)} Week` : ''}
                    ${event.lastCompleted ? ` - Last completed: ${new Date(event.lastCompleted).toLocaleDateString()}` : ''}
                </small>
                ${event.description ? `<br><small class="event-description">${event.description}</small>` : ''}
            </div>
            <div class="task-actions">
                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'incomplete' : 'completed'}">
                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                </label>
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

// Utility functions
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// PWA Functions
function initializePWA() {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    }
    
    // Handle app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    // Check if app is already installed
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed.');
        hideInstallButton();
    });
    
    // Handle URL parameters for shortcuts
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'daily') {
        showPage('daily');
    } else if (urlParams.get('action') === 'add') {
        openEventModal();
    }
}

function showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById('install-btn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.className = 'btn btn-primary';
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.position = 'fixed';
        installBtn.style.top = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '1000';
        installBtn.onclick = installApp;
        document.body.appendChild(installBtn);
    }
}

function hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.remove();
    }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Mobile Navigation Functions
function toggleMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
    
    // Close on outside click
    if (sidebar.classList.contains('open')) {
        document.addEventListener('click', closeMobileNavOnOutsideClick);
    } else {
        document.removeEventListener('click', closeMobileNavOnOutsideClick);
    }
}

function closeMobileNavOnOutsideClick(e) {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.mobile-nav-toggle');
    
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
        document.removeEventListener('click', closeMobileNavOnOutsideClick);
    }
}

// Close mobile nav when nav item is clicked
function closeMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('open');
    document.removeEventListener('click', closeMobileNavOnOutsideClick);
}

// Enhanced showPage function with mobile nav close
function showPage(pageId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Add active class to corresponding link
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    const targetNav = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.style.animation = 'fadeIn 0.3s ease-in-out';
    }
    
    if (targetNav) {
        targetNav.classList.add('active');
    }
    
    // Close mobile navigation after selecting a page
    closeMobileNav();
    
    // Update content based on page
    if (pageId === 'dashboard') {
        updateDashboard();
    } else if (pageId === 'daily') {
        renderDailySchedule();
    } else if (pageId === 'weekly') {
        renderWeeklyTasks();
    } else if (pageId === 'monthly') {
        renderMonthlyTasks();
    } else if (pageId === 'manage') {
        renderManageEvents();
    }
}

// Event Listeners
function initializeEventListeners() {
    // Close modal when clicking outside
    document.getElementById('event-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEventModal();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openEventModal();
        }
    });
}

// Drag and Drop Functionality
let draggedEvent = null;
let draggedIndex = -1;
let dropTarget = null;

function initializeDragAndDrop() {
    // This will be called after rendering to add event listeners
    addDragAndDropListeners();
}

function addDragAndDropListeners() {
    // Add listeners to all draggable time blocks
    const timeBlocks = document.querySelectorAll('.time-block[data-event-id]');
    console.log('Found time blocks for drag/drop:', timeBlocks.length);
    
    timeBlocks.forEach((element, index) => {
        element.draggable = true;
        element.dataset.index = index;
        
        // Drag start
        element.addEventListener('dragstart', handleDragStart);
        
        // Drag over
        element.addEventListener('dragover', handleDragOver);
        
        // Drag enter
        element.addEventListener('dragenter', handleDragEnter);
        
        // Drag leave
        element.addEventListener('dragleave', handleDragLeave);
        
        // Drop
        element.addEventListener('drop', handleDrop);
        
        // Drag end
        element.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedEvent = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    
    // Store the event ID for reference
    e.dataTransfer.setData('text/plain', this.dataset.eventId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    this.style.opacity = '0.5';
    
    showNotification('Drag to reorder tasks. Times will auto-adjust!', 'info');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Determine if we should drop above or below this element
    const rect = this.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    
    // Remove all drag-over classes first
    document.querySelectorAll('.drag-over, .drag-over-after').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-after');
    });
    
    if (this !== draggedEvent) {
        if (mouseY < midY) {
            this.classList.add('drag-over');
        } else {
            this.classList.add('drag-over-after');
        }
    }
}

function handleDragEnter(e) {
    e.preventDefault();
}

function handleDragLeave(e) {
    // Only remove classes if we're leaving to go to a non-child element
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over', 'drag-over-after');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    if (this === draggedEvent) return;
    
    const draggedEventId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetEventId = parseInt(this.dataset.eventId);
    
    // Determine drop position
    const rect = this.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    const dropBefore = mouseY < midY;
    
    // Perform the reorder
    reorderEvents(draggedEventId, targetEventId, dropBefore);
    
    // Clean up visual indicators
    this.classList.remove('drag-over', 'drag-over-after');
}

function handleDragEnd(e) {
    // Clean up all drag-related classes
    document.querySelectorAll('.dragging, .drag-over, .drag-over-after').forEach(el => {
        el.classList.remove('dragging', 'drag-over', 'drag-over-after');
        el.style.opacity = '';
    });
    
    draggedEvent = null;
    draggedIndex = -1;
    dropTarget = null;
}

function reorderEvents(draggedEventId, targetEventId, dropBefore) {
    try {
        const draggedEvent = events.find(e => e.id === draggedEventId);
        const targetEvent = events.find(e => e.id === targetEventId);
        
        if (!draggedEvent || !targetEvent) {
            throw new Error('Events not found');
        }
        
        // Only allow reordering within the same schedule type
        if (draggedEvent.schedule !== targetEvent.schedule) {
            showNotification('Can only reorder within the same schedule type (daily, weekly, monthly)', 'warning');
            return;
        }
        
        // For weekly events, only allow reordering within the same day
        if (draggedEvent.schedule === 'weekly' && draggedEvent.day !== targetEvent.day) {
            showNotification('Can only reorder within the same day for weekly tasks', 'warning');
            return;
        }
        
        // For monthly events, only allow reordering within the same week
        if (draggedEvent.schedule === 'monthly' && draggedEvent.week !== targetEvent.week) {
            showNotification('Can only reorder within the same week for monthly tasks', 'warning');
            return;
        }
        
        // Get events of the same type and sort them
        let sameTypeEvents = events.filter(e => {
            if (e.schedule !== draggedEvent.schedule) return false;
            if (e.schedule === 'weekly' && e.day !== draggedEvent.day) return false;
            if (e.schedule === 'monthly' && e.week !== draggedEvent.week) return false;
            return true;
        }).sort((a, b) => a.time.localeCompare(b.time));
        
        // Remove dragged event from array
        sameTypeEvents = sameTypeEvents.filter(e => e.id !== draggedEventId);
        
        // Find insertion index
        const targetIndex = sameTypeEvents.findIndex(e => e.id === targetEventId);
        const insertIndex = dropBefore ? targetIndex : targetIndex + 1;
        
        // Insert dragged event at new position
        sameTypeEvents.splice(insertIndex, 0, draggedEvent);
        
        // Recalculate times based on new order
        recalculateTimes(sameTypeEvents, draggedEvent.schedule);
        
        // Update the events array
        events = events.filter(e => {
            if (e.schedule !== draggedEvent.schedule) return true;
            if (e.schedule === 'weekly' && e.day !== draggedEvent.day) return true;
            if (e.schedule === 'monthly' && e.week !== draggedEvent.week) return true;
            return false;
        });
        
        events.push(...sameTypeEvents);
        
        saveEvents();
        showNotification('Tasks reordered successfully! Times auto-adjusted.', 'success');
        
    } catch (error) {
        console.error('Reorder failed:', error);
        showNotification('Failed to reorder tasks. Please try again.', 'error');
    }
}

function recalculateTimes(eventList, scheduleType) {
    if (eventList.length === 0) return;
    
    // Define time ranges for different schedule types
    const timeRanges = {
        daily: {
            start: '05:00',
            intervalMinutes: 30, // 30 minutes between tasks
            maxEndTime: '22:15'
        },
        weekly: {
            start: '08:00',
            intervalMinutes: 60, // 1 hour between weekly tasks
            maxEndTime: '20:00'
        },
        monthly: {
            start: '10:00',
            intervalMinutes: 120, // 2 hours between monthly tasks
            maxEndTime: '18:00'
        }
    };
    
    const range = timeRanges[scheduleType];
    if (!range) return;
    
    let currentTime = timeToMinutes(range.start);
    const maxTime = timeToMinutes(range.maxEndTime);
    
    eventList.forEach((event, index) => {
        // Set the new time
        event.time = minutesToTime(currentTime);
        
        // Calculate next time slot
        currentTime += range.intervalMinutes;
        
        // If we exceed max time, wrap around or adjust
        if (currentTime > maxTime) {
            currentTime = timeToMinutes(range.start) + (index * 15); // Compress intervals
        }
    });
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Progress tracking and statistics
function updateProgressStats() {
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const weeklyTasks = events.filter(e => e.schedule === 'weekly');
    const monthlyTasks = events.filter(e => e.schedule === 'monthly');
    
    const dailyCompleted = dailyTasks.filter(e => isTaskCompleted(e)).length;
    const weeklyCompleted = weeklyTasks.filter(e => isTaskCompleted(e)).length;
    const monthlyCompleted = monthlyTasks.filter(e => isTaskCompleted(e)).length;
    
    const totalTasks = events.length;
    const totalCompleted = dailyCompleted + weeklyCompleted + monthlyCompleted;
    
    // Update progress stats if elements exist
    const dailyProgress = document.getElementById('daily-progress');
    const weeklyProgress = document.getElementById('weekly-progress');
    const monthlyProgress = document.getElementById('monthly-progress');
    const totalProgress = document.getElementById('total-progress');
    
    if (dailyProgress) {
        const dailyPercent = dailyTasks.length > 0 ? Math.round((dailyCompleted / dailyTasks.length) * 100) : 0;
        dailyProgress.innerHTML = `
            <div class="progress-row">
                <span class="progress-label">📅 Daily Tasks</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${dailyPercent}%"></div>
                </div>
                <span class="progress-percent">${dailyPercent}%</span>
            </div>
            <small>${dailyCompleted}/${dailyTasks.length} completed today</small>
        `;
    }
    
    if (weeklyProgress) {
        const weeklyPercent = weeklyTasks.length > 0 ? Math.round((weeklyCompleted / weeklyTasks.length) * 100) : 0;
        weeklyProgress.innerHTML = `
            <div class="progress-row">
                <span class="progress-label">📊 Weekly Tasks</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${weeklyPercent}%"></div>
                </div>
                <span class="progress-percent">${weeklyPercent}%</span>
            </div>
            <small>${weeklyCompleted}/${weeklyTasks.length} completed this week</small>
        `;
    }
    
    if (monthlyProgress) {
        const monthlyPercent = monthlyTasks.length > 0 ? Math.round((monthlyCompleted / monthlyTasks.length) * 100) : 0;
        monthlyProgress.innerHTML = `
            <div class="progress-row">
                <span class="progress-label">📈 Monthly Tasks</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${monthlyPercent}%"></div>
                </div>
                <span class="progress-percent">${monthlyPercent}%</span>
            </div>
            <small>${monthlyCompleted}/${monthlyTasks.length} completed this month</small>
        `;
    }
    
    if (totalProgress) {
        const totalPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
        totalProgress.innerHTML = `
            <div class="progress-row">
                <span class="progress-label">🎯 Overall Progress</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${totalPercent}%"></div>
                </div>
                <span class="progress-percent">${totalPercent}%</span>
            </div>
            <small>${totalCompleted}/${totalTasks} total tasks completed</small>
        `;
    }
    
    // Show achievement badges for milestones
    checkAchievements(dailyPercent, weeklyPercent, monthlyPercent, totalPercent);
}

function checkAchievements(dailyPercent, weeklyPercent, monthlyPercent, totalPercent) {
    const achievementContainer = document.getElementById('achievements');
    if (!achievementContainer) return;
    
    const achievements = [];
    
    if (dailyPercent === 100) achievements.push('🌟 Daily Hero!');
    if (weeklyPercent === 100) achievements.push('🏆 Weekly Champion!');
    if (monthlyPercent === 100) achievements.push('👑 Monthly Master!');
    if (totalPercent === 100) achievements.push('🎉 Perfectionist!');
    if (dailyPercent >= 80) achievements.push('⚡ Daily Dynamo!');
    if (weeklyPercent >= 80) achievements.push('🚀 Weekly Warrior!');
    if (totalPercent >= 90) achievements.push('💎 Excellence Expert!');
    
    achievementContainer.innerHTML = achievements.map(achievement => 
        `<span class="achievement-badge">${achievement}</span>`
    ).join('');
}

function getCompletionSummary() {
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

// Loading state functions
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
    }
}

// Enhanced data operations with loading states
function saveEvents() {
    try {
        showLoading(document.getElementById('events-list'));
        localStorage.setItem('homeEvents', JSON.stringify(events));
        updateDashboard();
        renderAllViews();
    } catch (error) {
        console.error('Failed to save events:', error);
        showNotification('Failed to save data. Storage may be full.', 'error');
    } finally {
        hideLoading(document.getElementById('events-list'));
    }
}

// Navigation functionality
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            // Show selected page
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// Event form functionality
function initializeEventForm() {
    document.getElementById('event-schedule').addEventListener('change', function() {
        const weeklyGroup = document.getElementById('weekly-day-group');
        const monthlyGroup = document.getElementById('monthly-week-group');
        
        if (this.value === 'weekly') {
            weeklyGroup.setAttribute('data-hidden', 'false');
            weeklyGroup.style.display = 'block';
            monthlyGroup.setAttribute('data-hidden', 'true');
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = true;
            document.getElementById('event-week').required = false;
        } else if (this.value === 'monthly') {
            weeklyGroup.setAttribute('data-hidden', 'true');
            weeklyGroup.style.display = 'none';
            monthlyGroup.setAttribute('data-hidden', 'false');
            monthlyGroup.style.display = 'block';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = true;
        } else {
            weeklyGroup.setAttribute('data-hidden', 'true');
            weeklyGroup.style.display = 'none';
            monthlyGroup.setAttribute('data-hidden', 'true');
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = false;
        }
    });    // Event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Validate form data
            const title = document.getElementById('event-title').value.trim();
            const time = document.getElementById('event-time').value;
            const category = document.getElementById('event-category').value;
            const schedule = document.getElementById('event-schedule').value;
            const day = document.getElementById('event-day').value;
            const week = document.getElementById('event-week').value;
            const description = document.getElementById('event-description').value.trim();
            
            // Basic validation
            if (!title) {
                throw new Error('Event title is required');
            }
            if (!time) {
                throw new Error('Event time is required');
            }
            if (!category) {
                throw new Error('Please select a category');
            }
            if (!schedule) {
                throw new Error('Please select a schedule type');
            }
            if (schedule === 'weekly' && !day) {
                throw new Error('Please select a day for weekly events');
            }
            if (schedule === 'monthly' && !week) {
                throw new Error('Please select a week for monthly events');
            }
            
            // Check for duplicate daily events at same time
            if (schedule === 'daily') {
                const existingEvent = events.find(e => 
                    e.schedule === 'daily' && 
                    e.time === time && 
                    e.id !== editingEventId
                );
                if (existingEvent) {
                    throw new Error(`A daily event already exists at ${formatTime(time)}: ${existingEvent.title}`);
                }
            }
            
            const formData = {
                id: editingEventId || Date.now(),
                title: title,
                time: time,
                category: category,
                schedule: schedule,
                day: day,
                week: week,
                description: description,
                completed: false,
                completedToday: false,
                lastCompleted: null
            };

            if (editingEventId) {
                // Update existing event
                const index = events.findIndex(e => e.id === editingEventId);
                if (index !== -1) {
                    // Preserve completion status when editing
                    formData.completed = events[index].completed;
                    formData.completedToday = events[index].completedToday;
                    formData.lastCompleted = events[index].lastCompleted;
                    events[index] = formData;
                }
            } else {
                // Add new event
                events.push(formData);
            }

            saveEvents();
            closeEventModal();
            resetForm();
            showNotification('Event saved successfully!', 'success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(error.message, 'error');
        }
    });
}

// Modal functions
function openEventModal(eventId = null) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (eventId) {
        // Edit mode
        const event = events.find(e => e.id === eventId);
        if (event) {
            editingEventId = eventId;
            modalTitle.textContent = 'Edit Event';
            
            // Populate form
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-category').value = event.category;
            document.getElementById('event-schedule').value = event.schedule;
            document.getElementById('event-day').value = event.day;
            document.getElementById('event-week').value = event.week;
            document.getElementById('event-description').value = event.description;
            
            // Trigger schedule change to show/hide fields
            document.getElementById('event-schedule').dispatchEvent(new Event('change'));
        }
    } else {
        // Add mode
        editingEventId = null;
        modalTitle.textContent = 'Add New Event';
        resetForm();
    }
    
    modal.classList.add('show');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('show');
    resetForm();
}

function resetForm() {
    document.getElementById('event-form').reset();
    const weeklyGroup = document.getElementById('weekly-day-group');
    const monthlyGroup = document.getElementById('monthly-week-group');
    weeklyGroup.setAttribute('data-hidden', 'true');
    weeklyGroup.style.display = 'none';
    monthlyGroup.setAttribute('data-hidden', 'true');
    monthlyGroup.style.display = 'none';
    editingEventId = null;
}

function deleteEvent(eventId) {
    try {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            events = events.filter(e => e.id !== eventId);
            saveEvents();
            showNotification('Event deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to delete event:', error);
        showNotification('Failed to delete event. Please try again.', 'error');
    }
}

// Task completion functions
function toggleTaskCompletion(eventId) {
    try {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        
        const today = new Date().toDateString();
        
        if (event.schedule === 'daily') {
            event.completedToday = !event.completedToday;
            event.lastCompleted = event.completedToday ? today : null;
            
            if (event.completedToday) {
                showNotification(`✅ Daily task completed: ${event.title}`, 'success');
            } else {
                showNotification(`↩️ Daily task unmarked: ${event.title}`, 'info');
            }
        } else {
            event.completed = !event.completed;
            event.lastCompleted = event.completed ? today : null;
            
            if (event.completed) {
                showNotification(`✅ ${capitalizeFirst(event.schedule)} task completed: ${event.title}`, 'success');
            } else {
                showNotification(`↩️ ${capitalizeFirst(event.schedule)} task unmarked: ${event.title}`, 'info');
            }
        }
        
        saveEvents();
        updateProgressStats();
        
    } catch (error) {
        console.error('Failed to toggle task completion:', error);
        showNotification('Failed to update task status. Please try again.', 'error');
    }
}

function isTaskCompleted(event) {
    const today = new Date().toDateString();
    
    if (event.schedule === 'daily') {
        return event.completedToday && event.lastCompleted === today;
    } else {
        return event.completed;
    }
}

// Reset daily completions at start of new day
function resetDailyCompletions() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastDailyReset');
    
    if (lastReset !== today) {
        events.forEach(event => {
            if (event.schedule === 'daily') {
                event.completedToday = false;
            }
        });
        localStorage.setItem('lastDailyReset', today);
        saveEvents();
    }
}

// Render functions
function renderDailySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('daily-schedule');
      container.innerHTML = dailyEvents.map((event, index) => `
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
                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'inactive' : 'completed'}">
                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                </label>
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderWeeklyTasks() {
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const container = document.getElementById('weekly-tasks');
    
    container.innerHTML = weekDays.map(day => {
        const dayEvents = events.filter(e => e.schedule === 'weekly' && e.day === day);
        return `
            <div class="task-card">
                <h3>
                    📅 ${capitalizeFirst(day)}
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>                <div class="task-list-container sortable-container">                    ${dayEvents.map((event, index) => `
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
        `;    }).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderMonthlyTasks() {
    const weeks = ['first', 'second', 'third', 'fourth'];
    const container = document.getElementById('monthly-tasks');
    
    container.innerHTML = weeks.map(week => {
        const weekEvents = events.filter(e => e.schedule === 'monthly' && e.week === week);
        return `
            <div class="task-card">
                <h3>
                    🗓️ ${capitalizeFirst(week)} Week
                    <button class="btn btn-primary btn-sm" onclick="openEventModal()" title="Add Event">+</button>
                </h3>                <div class="task-list-container sortable-container">                    ${weekEvents.map((event, index) => `
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
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderManageEvents() {
    const container = document.getElementById('events-list');
    const sortedEvents = [...events].sort((a, b) => {
        if (a.schedule !== b.schedule) {
            const scheduleOrder = { daily: 1, weekly: 2, monthly: 3 };
            return scheduleOrder[a.schedule] - scheduleOrder[b.schedule];
        }
        return a.time.localeCompare(b.time);
    });
      container.innerHTML = sortedEvents.map((event, index) => `
        <div class="time-block sortable-item ${isTaskCompleted(event) ? 'completed' : ''}" data-event-id="${event.id}" data-index="${index}">
            <div class="time">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                ${formatTime(event.time)}
            </div>
            <div class="task">
                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                <strong>${event.title}</strong>
                ${isTaskCompleted(event) ? ' ✅' : ''}
                <br>
                <small class="event-details">
                    ${capitalizeFirst(event.schedule)}
                    ${event.day ? ` - ${capitalizeFirst(event.day)}` : ''}
                    ${event.week ? ` - ${capitalizeFirst(event.week)} Week` : ''}
                    ${event.lastCompleted ? ` - Last completed: ${new Date(event.lastCompleted).toLocaleDateString()}` : ''}
                </small>
                ${event.description ? `<br><small class="event-description">${event.description}</small>` : ''}
            </div>
            <div class="task-actions">
                <label class="completion-checkbox" title="Mark as ${isTaskCompleted(event) ? 'incomplete' : 'completed'}">
                    <input type="checkbox" ${isTaskCompleted(event) ? 'checked' : ''} onchange="toggleTaskCompletion(${event.id})">
                    <span class="checkmark">${isTaskCompleted(event) ? '✅' : '☐'}</span>
                </label>
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop after rendering
    setTimeout(() => addDragAndDropListeners(), 0);
}

function renderTodaySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('today-schedule');
    
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

function updateDashboard() {
    document.getElementById('total-tasks').textContent = events.length;
    renderTodaySchedule();
    updateProgressStats();
}

function renderAllViews() {
    renderDailySchedule();
    renderWeeklyTasks();
    renderMonthlyTasks();
    renderManageEvents();
}

// Data export/import functions
function exportData() {
    try {
        const dataToExport = {
            events: events,
            exportDate: new Date().toISOString(),
            version: '1.1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `schedulez-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();