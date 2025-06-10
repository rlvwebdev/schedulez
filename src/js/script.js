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
        updateProgressStats();
        renderAllViews();
    } catch (error) {
        console.error('Failed to save events:', error);
        showNotification('Failed to save data. Storage may be full.', 'error');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing app...');
    initializeNavigation();
    initializeEventForm();
    initializeDragAndDrop();
    initializeSearch();
    initializeMobileNavigation();
    initializeDataManagement();
    initializeProgressTracking();
    renderAllViews();
    updateProgressStats();
      // Initialize PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('src/js/sw.js')
            .then(reg => console.log('✅ SW registered:', reg))
            .catch(err => console.log('❌ SW registration failed:', err));
    }
    
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPromotion();
    });
});

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
            
            // Update URL hash
            window.location.hash = pageId;
        });
    });
    
    // Handle initial hash on page load
    if (window.location.hash) {
        const targetPage = window.location.hash.substring(1);
        const targetLink = document.querySelector(`[data-page="${targetPage}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
}

// Mobile Navigation
function initializeMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.querySelector('.nav');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-mobile-open');
            
            // Update aria-expanded
            const isOpen = navMenu.classList.contains('nav-mobile-open');
            this.setAttribute('aria-expanded', isOpen);
        });
        
        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-mobile-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// Event form functionality
function initializeEventForm() {
    const scheduleSelect = document.getElementById('event-schedule');
    const daySelect = document.getElementById('event-day');
    const weekSelect = document.getElementById('event-week');
    
    if (scheduleSelect) {
        scheduleSelect.addEventListener('change', function() {
            updateDayWeekFields();
        });
    }
    
    // Form submission
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEvent();
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-event');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            clearEventForm();
        });
    }
}

function updateDayWeekFields() {
    const schedule = document.getElementById('event-schedule').value;
    const dayGroup = document.getElementById('day-field-group');
    const weekGroup = document.getElementById('week-field-group');
    const daySelect = document.getElementById('event-day');
    const weekSelect = document.getElementById('event-week');
    
    // Reset fields
    daySelect.value = '';
    weekSelect.value = '';
    
    // Show/hide fields based on schedule
    if (schedule === 'weekly') {
        dayGroup.style.display = 'block';
        weekGroup.style.display = 'none';
        daySelect.required = true;
        weekSelect.required = false;
    } else if (schedule === 'monthly') {
        dayGroup.style.display = 'none';
        weekGroup.style.display = 'block';
        daySelect.required = false;
        weekSelect.required = true;
    } else {
        dayGroup.style.display = 'none';
        weekGroup.style.display = 'none';
        daySelect.required = false;
        weekSelect.required = false;
    }
}

function saveEvent() {
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
        eventData.id = Date.now();
        events.push(eventData);
        showNotification('Event added successfully!', 'success');
    }
    
    saveEvents();
    clearEventForm();
}

function editEvent(id) {
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

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        showNotification('Event deleted successfully!', 'success');
    }
}

function clearEventForm() {
    document.getElementById('event-form').reset();
    editingEventId = null;
    updateDayWeekFields();
    
    // Reset form title and button text
    document.querySelector('#add-event h3').textContent = 'Add New Event';
    document.querySelector('#event-form button[type="submit"]').textContent = 'Add Event';
}

// Task Completion System
function initializeProgressTracking() {
    // Reset daily tasks at midnight
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        resetDailyTasks();
        localStorage.setItem('lastDailyReset', today);
    }
}

function resetDailyTasks() {
    events.forEach(event => {
        if (event.schedule === 'daily') {
            event.completedToday = false;
        }
    });
    saveEvents();
}

function toggleTaskCompletion(id) {
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return;
    
    const task = events[eventIndex];
    const now = new Date();
    
    if (task.schedule === 'daily') {
        task.completedToday = !task.completedToday;
        if (task.completedToday) {
            task.lastCompleted = now.toISOString();
        }
    } else {
        task.completed = !task.completed;
        if (task.completed) {
            task.lastCompleted = now.toISOString();
        }
    }
    
    saveEvents();
    showNotification(
        `Task ${task.completed || task.completedToday ? 'completed' : 'uncompleted'}!`, 
        'success'
    );
}

function updateProgressStats() {
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

function updateProgressBar(id, completed, total) {
    const progressBar = document.getElementById(id);
    const progressFill = progressBar?.querySelector('.progress-fill');
    const progressText = progressBar?.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed}/${total} (${percentage}%)`;
        
        // Add completion classes for styling
        progressBar.classList.toggle('progress-complete', percentage === 100);
        progressBar.classList.toggle('progress-high', percentage >= 80 && percentage < 100);
    }
}

function updateAchievements(dailyCompleted, dailyTotal, weeklyCompleted, weeklyTotal, monthlyCompleted, monthlyTotal) {
    const achievementsContainer = document.getElementById('achievements');
    if (!achievementsContainer) return;
    
    const achievements = [];
    
    // Daily achievements
    if (dailyCompleted === dailyTotal && dailyTotal > 0) {
        achievements.push({ name: 'Daily Hero', icon: '🌟', description: 'Completed all daily tasks!' });
    }
    if (dailyCompleted >= dailyTotal * 0.8 && dailyTotal > 0) {
        achievements.push({ name: 'Daily Champion', icon: '⭐', description: 'Completed 80%+ of daily tasks!' });
    }
    
    // Weekly achievements
    if (weeklyCompleted === weeklyTotal && weeklyTotal > 0) {
        achievements.push({ name: 'Weekly Master', icon: '🏆', description: 'Completed all weekly tasks!' });
    }
    if (weeklyCompleted >= weeklyTotal * 0.75 && weeklyTotal > 0) {
        achievements.push({ name: 'Weekly Warrior', icon: '⚡', description: 'Completed 75%+ of weekly tasks!' });
    }
    
    // Monthly achievements
    if (monthlyCompleted === monthlyTotal && monthlyTotal > 0) {
        achievements.push({ name: 'Monthly Legend', icon: '👑', description: 'Completed all monthly tasks!' });
    }
    
    // Render achievements
    achievementsContainer.innerHTML = achievements.length > 0 
        ? achievements.map(achievement => 
            `<div class="achievement-badge">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>`
        ).join('')
        : '<div class="no-achievements">Complete tasks to earn achievements! 🎯</div>';
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            if (query.length === 0) {
                searchResults.innerHTML = '<div class="search-placeholder">Start typing to search events...</div>';
                return;
            }
            
            if (query.length < 2) {
                searchResults.innerHTML = '<div class="search-placeholder">Type at least 2 characters to search...</div>';
                return;
            }
            
            performSearch(query);
        });
    }
}

function performSearch(query) {
    const results = events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
    );
    
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No events found matching your search.</div>';
        return;
    }
    
    // Group results by schedule type
    const groupedResults = {
        daily: results.filter(e => e.schedule === 'daily'),
        weekly: results.filter(e => e.schedule === 'weekly'),
        monthly: results.filter(e => e.schedule === 'monthly')
    };
    
    let html = '';
    
    Object.entries(groupedResults).forEach(([scheduleType, events]) => {
        if (events.length > 0) {
            html += `<div class="search-group">
                <h4 class="search-group-title">${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Events</h4>
                <div class="search-group-events">`;
            
            events.forEach(event => {
                const isCompleted = event.schedule === 'daily' ? event.completedToday : event.completed;
                html += `
                    <div class="event-item ${isCompleted ? 'completed' : ''}" data-id="${event.id}" draggable="true">
                        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
                        <div class="event-checkbox-container">
                            <input type="checkbox" 
                                   class="event-checkbox" 
                                   ${isCompleted ? 'checked' : ''} 
                                   onchange="toggleTaskCompletion(${event.id})"
                                   aria-label="Mark task as complete">
                        </div>
                        <div class="event-content">
                            <div class="event-header">
                                <h4 class="event-title">${event.title}</h4>
                                <div class="event-meta">
                                    <span class="event-time">${event.time}</span>
                                    <span class="event-category category-${event.category}">${event.category}</span>
                                </div>
                            </div>
                            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                            ${event.lastCompleted ? `<p class="event-last-completed">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</p>` : ''}
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

// Data Management
function initializeDataManagement() {
    // Export data
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import data - directly call the function, no hidden input needed
    const importBtn = document.getElementById('import-data');
    if (importBtn) {
        importBtn.addEventListener('click', importData);
    }
    
    // Reset data
    const resetBtn = document.getElementById('reset-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetData);
    }
}

function exportData() {
    try {
        const dataToExport = {
            events: events,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedulez-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export data.', 'error');
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
                const data = JSON.parse(e.target.result);
                
                if (data.events && Array.isArray(data.events)) {
                    if (confirm('This will replace all your current data. Are you sure?')) {
                        events = data.events;
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
                showNotification('Failed to import data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This will delete all your events and restore defaults.')) {
        events = [];
        localStorage.removeItem('homeEvents');
        initializeDefaultEvents();
        renderAllViews();
        updateProgressStats();
        showNotification('Data reset successfully!', 'success');
    }
}

function resetToDefaults() {
    resetData();
}

// Drag and Drop functionality
function initializeDragAndDrop() {
    let draggedElement = null;
    let draggedEventId = null;
    
    document.addEventListener('dragstart', function(e) {
        const eventItem = e.target.closest('.event-item');
        if (!eventItem || !e.target.classList.contains('drag-handle')) return;
        
        draggedElement = eventItem;
        draggedEventId = parseInt(eventItem.dataset.id);
        
        eventItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', eventItem.outerHTML);
    });
    
    document.addEventListener('dragend', function(e) {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
            draggedEventId = null;
        }
        
        // Remove all drag indicators
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
        
        const eventItem = e.target.closest('.event-item');
        if (!eventItem || !draggedElement || eventItem === draggedElement) return;
        
        const container = eventItem.parentElement;
        const draggedContainer = draggedElement.parentElement;
        
        // Only allow reordering within the same schedule type
        if (container.dataset.schedule !== draggedContainer.dataset.schedule) return;
        
        e.dataTransfer.dropEffect = 'move';
        
        // Remove previous indicators
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        
        // Add drag indicator
        const rect = eventItem.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (e.clientY < midpoint) {
            eventItem.classList.add('drag-over');
        } else {
            eventItem.classList.add('drag-over');
        }
    });
    
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        
        const targetItem = e.target.closest('.event-item');
        if (!targetItem || !draggedElement || targetItem === draggedElement) return;
        
        const targetEventId = parseInt(targetItem.dataset.id);
        const draggedEvent = events.find(e => e.id === draggedEventId);
        const targetEvent = events.find(e => e.id === targetEventId);
        
        if (!draggedEvent || !targetEvent) return;
        
        // Only allow reordering within same schedule type and constraints
        if (draggedEvent.schedule !== targetEvent.schedule) return;
        
        if (draggedEvent.schedule === 'weekly' && draggedEvent.day !== targetEvent.day) return;
        if (draggedEvent.schedule === 'monthly' && draggedEvent.week !== targetEvent.week) return;
        
        // Reorder events
        reorderEvents(draggedEventId, targetEventId);
        
        // Remove drag indicators
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
}

function reorderEvents(draggedId, targetId) {
    const draggedIndex = events.findIndex(e => e.id === draggedId);
    const targetIndex = events.findIndex(e => e.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged event from array
    const [draggedEvent] = events.splice(draggedIndex, 1);
    
    // Insert at new position
    const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    events.splice(newTargetIndex, 0, draggedEvent);
    
    // Recalculate times based on position
    recalculateEventTimes(draggedEvent.schedule, draggedEvent.day, draggedEvent.week);
    
    saveEvents();
    showNotification('Event reordered successfully!', 'success');
}

function recalculateEventTimes(schedule, day = '', week = '') {
    const filteredEvents = events.filter(e => {
        if (e.schedule !== schedule) return false;
        if (schedule === 'weekly' && e.day !== day) return false;
        if (schedule === 'monthly' && e.week !== week) return false;
        return true;
    });
    
    // Sort by current time to maintain order
    filteredEvents.sort((a, b) => a.time.localeCompare(b.time));
    
    // Time intervals for each schedule type
    const intervals = {
        daily: 30, // 30 minutes
        weekly: 60, // 1 hour
        monthly: 120 // 2 hours
    };
    
    const startTimes = {
        daily: '05:00',
        weekly: '19:30',
        monthly: '10:00'
    };
    
    let currentTime = startTimes[schedule];
    const interval = intervals[schedule];
    
    filteredEvents.forEach((event, index) => {
        if (index === 0) {
            // Keep first event at start time or its current time if earlier
            currentTime = event.time < currentTime ? event.time : currentTime;
        } else {
            // Calculate next time
            const [hours, minutes] = currentTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + interval;
            const newHours = Math.floor(totalMinutes / 60) % 24;
            const newMinutes = totalMinutes % 60;
            currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        }
        
        event.time = currentTime;
    });
}

// Render functions
function renderAllViews() {
    renderDailySchedule();
    renderWeeklyTasks();
    renderMonthlyTasks();
    updateDashboard();
}

function renderDailySchedule() {
    const container = document.getElementById('daily-schedule');
    if (!container) return;
    
    const dailyEvents = events
        .filter(e => e.schedule === 'daily')
        .sort((a, b) => a.time.localeCompare(b.time));
    
    if (dailyEvents.length === 0) {
        container.innerHTML = '<div class="no-events">No daily events scheduled.</div>';
        return;
    }
    
    container.innerHTML = dailyEvents.map(event => `
        <div class="event-item ${event.completedToday ? 'completed' : ''}" data-id="${event.id}" draggable="true">
            <div class="drag-handle" title="Drag to reorder">⋮⋮</div>            <div class="event-checkbox-container">
                <input type="checkbox" 
                       class="event-checkbox" 
                       ${event.completedToday ? 'checked' : ''} 
                       onchange="toggleTaskCompletion(${event.id})"
                       aria-label="Mark task as complete">
            </div>
            <div class="event-content">
                <div class="event-header">
                    <h4 class="event-title">${event.title}</h4>
                    <div class="event-meta">
                        <span class="event-time">${event.time}</span>
                        <span class="event-category category-${event.category}">${event.category}</span>
                    </div>
                </div>
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                ${event.lastCompleted ? `<p class="event-last-completed">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</p>` : ''}
            </div>
            <div class="event-actions">
                <button onclick="editEvent(${event.id})" class="btn-edit" title="Edit event" aria-label="Edit event">✏️</button>
                <button onclick="deleteEvent(${event.id})" class="btn-delete" title="Delete event" aria-label="Delete event">🗑️</button>
            </div>
        </div>
    `).join('');
    
    container.dataset.schedule = 'daily';
}

function renderWeeklyTasks() {
    const container = document.getElementById('weekly-tasks');
    if (!container) return;
    
    const weeklyEvents = events.filter(e => e.schedule === 'weekly');
    
    if (weeklyEvents.length === 0) {
        container.innerHTML = '<div class="no-events">No weekly events scheduled.</div>';
        return;
    }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let html = '';
    
    days.forEach(day => {
        const dayEvents = weeklyEvents
            .filter(e => e.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        if (dayEvents.length > 0) {
            html += `
                <div class="day-section">
                    <h4 class="day-title">${day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    <div class="events-container" data-schedule="weekly" data-day="${day}">`;
            
            dayEvents.forEach(event => {
                html += `
                    <div class="event-item ${event.completed ? 'completed' : ''}" data-id="${event.id}" draggable="true">
                        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
                        <div class="event-checkbox-container">
                            <input type="checkbox" 
                                   class="event-checkbox" 
                                   ${event.completed ? 'checked' : ''} 
                                   onchange="toggleTaskCompletion(${event.id})"
                                   aria-label="Mark task as complete">
                        </div>
                        <div class="event-content">
                            <div class="event-header">
                                <h4 class="event-title">${event.title}</h4>
                                <div class="event-meta">
                                    <span class="event-time">${event.time}</span>
                                    <span class="event-category category-${event.category}">${event.category}</span>
                                </div>
                            </div>
                            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                            ${event.lastCompleted ? `<p class="event-last-completed">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</p>` : ''}
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
    
    container.innerHTML = html || '<div class="no-events">No weekly events scheduled.</div>';
}

function renderMonthlyTasks() {
    const container = document.getElementById('monthly-tasks');
    if (!container) return;
    
    const monthlyEvents = events.filter(e => e.schedule === 'monthly');
    
    if (monthlyEvents.length === 0) {
        container.innerHTML = '<div class="no-events">No monthly events scheduled.</div>';
        return;
    }
    
    const weeks = ['first', 'second', 'third', 'fourth'];
    let html = '';
    
    weeks.forEach(week => {
        const weekEvents = monthlyEvents
            .filter(e => e.week === week)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        if (weekEvents.length > 0) {
            html += `
                <div class="week-section">
                    <h4 class="week-title">${week.charAt(0).toUpperCase() + week.slice(1)} Week</h4>
                    <div class="events-container" data-schedule="monthly" data-week="${week}">`;
            
            weekEvents.forEach(event => {
                html += `
                    <div class="event-item ${event.completed ? 'completed' : ''}" data-id="${event.id}" draggable="true">
                        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
                        <div class="event-checkbox-container">
                            <input type="checkbox" 
                                   class="event-checkbox" 
                                   ${event.completed ? 'checked' : ''} 
                                   onchange="toggleTaskCompletion(${event.id})"
                                   aria-label="Mark task as complete">
                        </div>
                        <div class="event-content">
                            <div class="event-header">
                                <h4 class="event-title">${event.title}</h4>
                                <div class="event-meta">
                                    <span class="event-time">${event.time}</span>
                                    <span class="event-category category-${event.category}">${event.category}</span>
                                </div>
                            </div>
                            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                            ${event.lastCompleted ? `<p class="event-last-completed">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</p>` : ''}
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
    
    container.innerHTML = html || '<div class="no-events">No monthly events scheduled.</div>';
}

// Update dashboard with statistics
function updateDashboard() {
    const totalEvents = events.length;
    const dailyEvents = events.filter(e => e.schedule === 'daily');
    const weeklyEvents = events.filter(e => e.schedule === 'weekly');
    const monthlyEvents = events.filter(e => e.schedule === 'monthly');
    
    const dailyCompleted = dailyEvents.filter(e => e.completedToday).length;
    const weeklyCompleted = weeklyEvents.filter(e => e.completed).length;
    const monthlyCompleted = monthlyEvents.filter(e => e.completed).length;
    
    // Update dashboard card statistics
    const statsElements = {
        'total-events': totalEvents,
        'daily-completed-count': dailyCompleted,
        'weekly-completed-count': weeklyCompleted,
        'monthly-completed-count': monthlyCompleted
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'notification-close';
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// PWA functionality
function showInstallPromotion() {
    showNotification('Install Schedulez for a better experience!', 'info');
}

window.addEventListener('appinstalled', () => {
    showNotification('Schedulez installed successfully!', 'success');
    deferredPrompt = null;
});

// Modal functions
function openEventModal(eventId = null) {
    const modal = document.getElementById('event-modal');
    const form = document.getElementById('event-form');
    const title = document.getElementById('modal-title');
    
    if (eventId) {
        // Edit mode
        const event = events.find(e => e.id === eventId);
        if (event) {
            editingEventId = eventId;
            
            // Populate form
            document.getElementById('event-title').value = event.title || '';
            document.getElementById('event-time').value = event.time || '';
            document.getElementById('event-category').value = event.category || '';
            document.getElementById('event-schedule').value = event.schedule || '';
            document.getElementById('event-day').value = event.day || '';
            document.getElementById('event-week').value = event.week || '';
            document.getElementById('event-description').value = event.description || '';
            
            title.textContent = 'Edit Event';
            updateDayWeekFields();
        }
    } else {
        // Add mode
        editingEventId = null;
        form.reset();
        title.textContent = 'Add New Event';
    }
    
    modal.style.display = 'block';
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
    editingEventId = null;
    
    // Reset form
    document.getElementById('event-form').reset();
}

// Mobile navigation functions
function toggleMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar.classList.contains('mobile-open');
    
    if (isOpen) {
        sidebar.classList.remove('mobile-open');
    } else {
        sidebar.classList.add('mobile-open');
    }
}

function initializeMobileNavigation() {
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.querySelector('.mobile-nav-toggle');
        
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
    
    // Close mobile nav when nav item is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        });
    });
}

// Debug helpers
window.debugSchedulez = {
    events: () => console.table(events),
    resetDaily: () => resetDailyTasks(),
    updateStats: () => updateProgressStats(),
    exportEvents: () => console.log(JSON.stringify(events, null, 2))
};

console.log('✅ Schedulez loaded successfully!');
