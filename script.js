// Global Variables
let events = JSON.parse(localStorage.getItem('homeEvents')) || [];
let editingEventId = null;
let deferredPrompt;

// Initialize default events if none exist
if (events.length === 0) {
    initializeDefaultEvents();
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
    ];

    events = defaultEvents;
    saveEvents();
}

// Data Management Functions
function saveEvents() {
    localStorage.setItem('homeEvents', JSON.stringify(events));
    updateDashboard();
    renderAllViews();
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
            weeklyGroup.style.display = 'block';
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = true;
            document.getElementById('event-week').required = false;
        } else if (this.value === 'monthly') {
            weeklyGroup.style.display = 'none';
            monthlyGroup.style.display = 'block';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = true;
        } else {
            weeklyGroup.style.display = 'none';
            monthlyGroup.style.display = 'none';
            document.getElementById('event-day').required = false;
            document.getElementById('event-week').required = false;
        }
    });

    // Event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: editingEventId || Date.now(),
            title: document.getElementById('event-title').value,
            time: document.getElementById('event-time').value,
            category: document.getElementById('event-category').value,
            schedule: document.getElementById('event-schedule').value,
            day: document.getElementById('event-day').value,
            week: document.getElementById('event-week').value,
            description: document.getElementById('event-description').value
        };

        if (editingEventId) {
            // Update existing event
            const index = events.findIndex(e => e.id === editingEventId);
            if (index !== -1) {
                events[index] = formData;
            }
        } else {
            // Add new event
            events.push(formData);
        }

        saveEvents();
        closeEventModal();
        resetForm();
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
    document.getElementById('weekly-day-group').style.display = 'none';
    document.getElementById('monthly-week-group').style.display = 'none';
    editingEventId = null;
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== eventId);
        saveEvents();
    }
}

// Render functions
function renderDailySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('daily-schedule');
    
    container.innerHTML = dailyEvents.map(event => `
        <div class="time-block">
            <div class="time">${formatTime(event.time)}</div>
            <div class="task">
                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                ${event.title}
                ${event.description ? `<br><small style="color: #666;">${event.description}</small>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
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
                </h3>
                <ul class="task-list">
                    ${dayEvents.map(event => `
                        <li>
                            <div>
                                <strong>${formatTime(event.time)}</strong> - ${event.title}
                                ${event.description ? `<br><small style="color: #666;">${event.description}</small>` : ''}
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
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
                </h3>
                <ul class="task-list">
                    ${weekEvents.map(event => `
                        <li>
                            <div>
                                <strong>${formatTime(event.time)}</strong> - ${event.title}
                                ${event.description ? `<br><small style="color: #666;">${event.description}</small>` : ''}
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
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
    
    container.innerHTML = sortedEvents.map(event => `
        <div class="time-block">
            <div class="time">${formatTime(event.time)}</div>
            <div class="task">
                <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                <strong>${event.title}</strong>
                <br>
                <small style="color: #666;">
                    ${capitalizeFirst(event.schedule)}
                    ${event.day ? ` - ${capitalizeFirst(event.day)}` : ''}
                    ${event.week ? ` - ${capitalizeFirst(event.week)} Week` : ''}
                </small>
                ${event.description ? `<br><small style="color: #666;">${event.description}</small>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn btn-warning btn-sm" onclick="openEventModal(${event.id})" title="Edit">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function renderTodaySchedule() {
    const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
    const container = document.getElementById('today-schedule');
    
    // Get current time for highlighting
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    container.innerHTML = dailyEvents.slice(0, 8).map(event => {
        const isActive = event.time <= currentTime;
        return `
            <div class="time-block" style="${isActive ? 'background: #f0f8ff; border-left: 3px solid #667eea;' : ''}">
                <div class="time">${formatTime(event.time)}</div>
                <div class="task">
                    <span class="task-type ${event.category}">${capitalizeFirst(event.category)}</span>
                    ${event.title}
                </div>
            </div>
        `;
    }).join('');
}

function updateDashboard() {
    document.getElementById('total-tasks').textContent = events.length;
    renderTodaySchedule();
}

function renderAllViews() {
    renderDailySchedule();
    renderWeeklyTasks();
    renderMonthlyTasks();
    renderManageEvents();
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

function showPage(pageId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Add active class to corresponding link
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // Show selected page
    document.getElementById(pageId).classList.add('active');
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

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeEventForm();
    initializeEventListeners();
    initializePWA();
    renderAllViews();
    updateDashboard();
    
    console.log('Home Management System initialized successfully!');
});
