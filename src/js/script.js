// Global Variables
let events = [];
let editingEventId = null;
let deferredPrompt;
let isInitialized = false;
let renderQueued = false;

// Initialize with enhanced error handling
function initializeAppData() {
    try {
        if (!isLocalStorageAvailable()) {
            // Fallback to memory-only storage
            events = [];
            showNotification('Running in memory-only mode. Data will not persist.', 'warning');
            return;
        }
        
        const storedEvents = localStorage.getItem('homeEvents');
        if (storedEvents) {
            events = JSON.parse(storedEvents);
            console.log('✅ Loaded events from localStorage:', events.length);
            
            // Validate loaded data integrity
            validateLoadedData();
        } else {
            console.log('📝 No events found, initializing defaults...');
            initializeDefaultEvents();
        }
        
        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize app data:', error);
        showNotification('Failed to load saved data. Starting fresh.', 'error');
        initializeDefaultEvents();
        isInitialized = true;
    }
}

// Validate data integrity on load
function validateLoadedData() {
    try {
        let hasErrors = false;
        const validEvents = [];
        
        events.forEach((event, index) => {
            try {
                validateEventData(event);
                validEvents.push(event);
            } catch (error) {
                console.warn(`Invalid event at index ${index}:`, error.message, event);
                hasErrors = true;
            }
        });
        
        if (hasErrors) {
            events = validEvents;
            saveEvents();
            showNotification('Some invalid events were removed during data validation.', 'warning');
        }
    } catch (error) {
        console.error('Data validation failed:', error);
        // If validation completely fails, reinitialize
        initializeDefaultEvents();
    }
}

// Performance-optimized rendering
function renderAllViews() {
    if (!isInitialized) return;
    
    // Debounce rapid render calls
    if (renderQueued) return;
    renderQueued = true;
    
    requestAnimationFrame(() => {
        try {
            // Use error boundaries for each render function
            renderWithErrorBoundary(() => renderDailySchedule(), 'daily-schedule');
            renderWithErrorBoundary(() => renderWeeklyTasks(), 'weekly-tasks');
            renderWithErrorBoundary(() => renderMonthlyTasks(), 'monthly-tasks');
            renderWithErrorBoundary(() => renderManageEvents(), 'events-list');
            
            renderQueued = false;
        } catch (error) {
            console.error('Critical render failure:', error);
            showNotification('Display update failed. Please refresh the page.', 'error');
            renderQueued = false;
        }
    });
}

// Initialize app data on load
initializeAppData();

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
        { id:17, title: "Brief relaxation/wind down", time: "21:50", category: "personal", schedule: "daily", day: "", week: "", description: "" },
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

// Security Functions
function sanitizeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeHTML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Unique ID Generation
function generateUniqueId() {
    // Generate a UUID-like unique identifier
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    let uniqueId = `event_${timestamp}_${random}`;
    
    // Ensure no collision with existing events
    while (events.some(e => e.id === uniqueId)) {
        const newRandom = Math.random().toString(36).substr(2, 9);
        uniqueId = `event_${timestamp}_${newRandom}`;
    }
    
    return uniqueId;
}

// Data Validation Functions
function validateEventData(event) {
    const requiredFields = ['id', 'title', 'time', 'category', 'schedule'];
    const validCategories = ['personal', 'dogs', 'cleaning', 'kitchen', 'development', 'maintenance'];
    const validSchedules = ['daily', 'weekly', 'monthly'];
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const validWeeks = ['first', 'second', 'third', 'fourth'];
    
    // Check required fields
    for (const field of requiredFields) {
        if (!event.hasOwnProperty(field) || event[field] === null || event[field] === undefined) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Validate data types and values
    if (typeof event.title !== 'string' || event.title.trim().length === 0) {
        throw new Error('Title must be a non-empty string');
    }
    
    if (typeof event.time !== 'string' || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(event.time)) {
        throw new Error('Time must be in HH:MM format');
    }
    
    if (!validCategories.includes(event.category)) {
        throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
    }
    
    if (!validSchedules.includes(event.schedule)) {
        throw new Error(`Schedule must be one of: ${validSchedules.join(', ')}`);
    }
    
    // Schedule-specific validation
    if (event.schedule === 'weekly') {
        if (!event.day || !validDays.includes(event.day)) {
            throw new Error(`Weekly events must have a valid day: ${validDays.join(', ')}`);
        }
    }
    
    if (event.schedule === 'monthly') {
        if (!event.week || !validWeeks.includes(event.week)) {
            throw new Error(`Monthly events must have a valid week: ${validWeeks.join(', ')}`);
        }
    }
    
    // Optional field validation
    if (event.description && typeof event.description !== 'string') {
        throw new Error('Description must be a string');
    }
    
    return true;
}

function validateImportData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format: must be an object');
    }
    
    if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid data format: must contain events array');
    }
    
    if (data.events.length === 0) {
        throw new Error('No events found in import file');
    }
    
    // Validate each event
    const validatedEvents = [];
    const seenIds = new Set();
    
    for (let i = 0; i < data.events.length; i++) {
        const event = data.events[i];
        
        try {
            validateEventData(event);
            
            // Check for duplicate IDs
            if (seenIds.has(event.id)) {
                throw new Error(`Duplicate event ID found: ${event.id}`);
            }
            seenIds.add(event.id);
            
            // Sanitize string fields
            const sanitizedEvent = {
                ...event,
                title: escapeHTML(event.title.trim()),
                description: event.description ? escapeHTML(event.description.trim()) : '',
                category: escapeHTML(event.category.trim()),
                schedule: escapeHTML(event.schedule.trim()),
                day: event.day ? escapeHTML(event.day.trim()) : '',
                week: event.week ? escapeHTML(event.week.trim()) : ''
            };
            
            validatedEvents.push(sanitizedEvent);
            
        } catch (error) {
            throw new Error(`Event ${i + 1}: ${error.message}`);
        }
    }
    
    return validatedEvents;
}

// Data Management Functions
function saveEvents() {
    try {
        const dataStr = JSON.stringify(events);
        
        // Check data size before saving
        const dataSize = new Blob([dataStr]).size;
        
        // Estimate localStorage usage (rough)
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        // Warn if approaching typical 5MB limit
        if (totalSize > 4 * 1024 * 1024) { // 4MB warning threshold
            console.warn('⚠️ LocalStorage approaching capacity:', (totalSize / 1024 / 1024).toFixed(2) + 'MB');
            showNotification('Warning: Storage space getting low. Consider exporting your data.', 'warning');
        }
        
        localStorage.setItem('homeEvents', dataStr);
        updateProgressStats();
        renderAllViews();
        
    } catch (error) {
        console.error('Failed to save events:', error);
        
        // Handle specific storage errors
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            showNotification('Storage quota exceeded! Please export your data and reset to continue.', 'error');
            // Attempt to free some space by removing old completion data
            cleanupOldCompletionData();
        } else if (error.name === 'SecurityError') {
            showNotification('Storage access denied. Please check browser privacy settings.', 'error');
        } else {
            showNotification('Failed to save data: ' + error.message, 'error');
        }
    }
}

// Storage Management Functions
function cleanupOldCompletionData() {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep only last 30 days
        
        let cleaned = false;
        events.forEach(event => {
            if (event.lastCompleted && new Date(event.lastCompleted) < cutoffDate) {
                event.lastCompleted = null;
                event.completedToday = false;
                cleaned = true;
            }
        });
        
        if (cleaned) {
            localStorage.setItem('homeEvents', JSON.stringify(events));
            showNotification('Cleaned up old completion data to free storage space.', 'info');
        }
    } catch (error) {
        console.error('Failed to cleanup old data:', error);
    }
}

function getStorageInfo() {
    try {
        let totalSize = 0;
        let eventDataSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const itemSize = localStorage[key].length + key.length;
                totalSize += itemSize;
                
                if (key === 'homeEvents') {
                    eventDataSize = itemSize;
                }
            }
        }
        
        return {
            totalSize: totalSize,
            eventDataSize: eventDataSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            eventDataSizeMB: (eventDataSize / 1024 / 1024).toFixed(2),
            percentUsed: Math.round((totalSize / (5 * 1024 * 1024)) * 100) // Assume 5MB limit
        };
    } catch (error) {
        console.error('Failed to get storage info:', error);
        return null;
    }
}

function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        console.error('LocalStorage not available:', error);
        showNotification('Local storage is not available. Data will not persist.', 'error');
        return false;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing app...');
    
    try {        // Initialize core functionality with error handling
        const initPromises = [
            initializeWithErrorHandling('Navigation', initializeNavigation),
            initializeWithErrorHandling('Event Form', initializeEventForm),
            initializeWithErrorHandling('Drag and Drop', initializeDragAndDrop),
            initializeWithErrorHandling('Search', initializeSearch),
            initializeWithErrorHandling('Mobile Navigation', initializeMobileNavigation),
            initializeWithErrorHandling('Data Management', initializeDataManagement),
            initializeWithErrorHandling('Progress Tracking', initializeProgressTracking),
            initializeWithErrorHandling('Focus Management', initializeFocusManagement)
        ];        // Execute initialization tasks
        Promise.allSettled(initPromises).then(results => {
            let failedInits = [];
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    failedInits.push(result.reason);
                }
            });
            
            if (failedInits.length > 0) {
                console.warn('Some initializations failed:', failedInits);
                showNotification(`Some features may not work properly. Refresh to retry.`, 'warning');
            }
            
            // Always try to render views and update stats
            renderAllViews();
            updateProgressStats();
            
            // Initialize analytics integration
            initializeAnalyticsIntegration();
            
            // Update dashboard with analytics integration
            setTimeout(() => {
                if (typeof updateDashboardWithAnalytics === 'function') {
                    updateDashboardWithAnalytics();
                } else {
                    updateDashboard();
                }
            }, 500);
            
            console.log('✅ App initialization completed');
        });
        
        // Initialize PWA with error handling
        initializePWA();
        
    } catch (error) {
        console.error('Critical initialization error:', error);
        showNotification('App initialization failed. Please refresh the page.', 'error');
    }
});

// Helper function for initialization with error handling
function initializeWithErrorHandling(name, initFunction) {
    return new Promise((resolve, reject) => {
        try {
            const result = initFunction();
            console.log(`✅ ${name} initialized`);
            resolve(result);
        } catch (error) {
            console.error(`❌ ${name} initialization failed:`, error);
            reject(`${name}: ${error.message}`);
        }
    });
}

// Enhanced PWA initialization
function initializePWA() {
    try {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('✅ SW registered:', reg);
                    
                    // Listen for service worker updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New service worker available
                                    showNotification('App update available. Refresh to update.', 'info');
                                }
                            }
                        });
                    });
                })
                .catch(err => {
                    console.log('❌ SW registration failed:', err);
                    // Not critical, continue without SW
                });
        }
        
        // PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallPromotion();
        });
        
        // Handle app installation
        window.addEventListener('appinstalled', () => {
            showNotification('Schedulez installed successfully!', 'success');
            deferredPrompt = null;
        });
        
        // Handle navigation share if available
        if (navigator.share) {
            console.log('✅ Web Share API available');
        }
        
    } catch (error) {
        console.warn('PWA initialization failed:', error);
        // PWA features are optional, continue without them
    }
}

// State synchronization improvements
function synchronizeAppState() {
    try {
        // Validate current state
        if (!events || !Array.isArray(events)) {
            console.warn('Invalid events state, reinitializing...');
            initializeDefaultEvents();
            return;
        }
        
        // Check for state inconsistencies
        const stateIssues = [];
        
        // Validate each event
        events.forEach((event, index) => {
            if (!event.id || !event.title || !event.time) {
                stateIssues.push(`Event ${index}: Missing required fields`);
            }
        });
        
        // Check for duplicate IDs
        const seenIds = new Set();
        events.forEach((event, index) => {
            if (seenIds.has(event.id)) {
                stateIssues.push(`Event ${index}: Duplicate ID ${event.id}`);
            }
            seenIds.add(event.id);
        });
        
        // Handle state issues
        if (stateIssues.length > 0) {
            console.warn('State issues detected:', stateIssues);
            // Auto-fix common issues
            fixStateIssues();
        }
        
        // Sync completion states
        syncCompletionStates();
        
    } catch (error) {
        console.error('State synchronization failed:', error);
        showNotification('Data sync issues detected. Some features may not work correctly.', 'warning');
    }
}

// Fix common state issues
function fixStateIssues() {
    try {
        const validEvents = [];
        const seenIds = new Set();
        
        events.forEach(event => {
            // Skip events with missing required fields
            if (!event.id || !event.title || !event.time) {
                return;
            }
            
            // Fix duplicate IDs
            if (seenIds.has(event.id)) {
                event.id = generateUniqueId();
            }
            seenIds.add(event.id);
            
            // Ensure required fields exist
            event.completed = event.completed || false;
            event.completedToday = event.completedToday || false;
            event.lastCompleted = event.lastCompleted || null;
            
            validEvents.push(event);
        });
        
        events = validEvents;
        saveEvents();
        
        showNotification('Fixed data consistency issues.', 'info');
        
    } catch (error) {
        console.error('Failed to fix state issues:', error);
    }
}

// Sync completion states with current date
function syncCompletionStates() {
    try {
        const today = new Date().toDateString();
        const lastSyncDate = localStorage.getItem('lastCompletionSync');
        
        if (lastSyncDate !== today) {
            // Reset daily tasks for new day
            let resetCount = 0;
            events.forEach(event => {
                if (event.schedule === 'daily' && event.completedToday) {
                    // Only reset if last completed was not today
                    if (!event.lastCompleted || new Date(event.lastCompleted).toDateString() !== today) {
                        event.completedToday = false;
                        resetCount++;
                    }
                }
            });
            
            if (resetCount > 0) {
                localStorage.setItem('lastCompletionSync', today);
                saveEvents();
                console.log(`Reset ${resetCount} daily tasks for new day`);
            }
        }
        
    } catch (error) {
        console.error('Completion sync failed:', error);
    }
}

// Memory leak prevention
function preventMemoryLeaks() {
    // Clean up old event listeners
    const oldElements = document.querySelectorAll('[data-cleanup-listeners]');
    oldElements.forEach(element => {
        element.removeEventListener('click', handleOldEventListener);
        element.removeAttribute('data-cleanup-listeners');
    });
    
    // Limit notification history
    const notifications = document.querySelectorAll('.notification');
    if (notifications.length > 10) {
        // Remove oldest notifications
        for (let i = 0; i < notifications.length - 10; i++) {
            notifications[i].remove();
        }
    }
}

// Periodically sync state and prevent memory leaks
setInterval(() => {
    synchronizeAppState();
    preventMemoryLeaks();
}, 60000); // Every minute

// Navigation functionality with enhanced header management
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
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Update page headers
            updatePageHeaders(pageId);
            
            // Call enhanced content switching
            showContent(pageId);
            
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
    } else {
        // Default to dashboard
        const dashboardLink = document.querySelector('[data-page="dashboard"]');
        if (dashboardLink) {
            dashboardLink.click();
        }
    }
}

// Mobile navigation is handled by the function at the end of the file

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
        }    } else {
        // Add new event
        eventData.id = generateUniqueId();
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
    let wasCompleted = false;
    let isNowCompleted = false;
    
    if (task.schedule === 'daily') {
        wasCompleted = task.completedToday;
        task.completedToday = !task.completedToday;
        isNowCompleted = task.completedToday;
        if (task.completedToday) {
            task.lastCompleted = now.toISOString();
        }
    } else {
        wasCompleted = task.completed;
        task.completed = !task.completed;
        isNowCompleted = task.completed;
        if (task.completed) {
            task.lastCompleted = now.toISOString();
        }
    }
    
    // Record analytics data for task completion
    recordTaskCompletion(id, isNowCompleted);
    
    saveEvents();
      // Update dashboard stats immediately
    if (typeof updateDashboardWithAnalytics === 'function') {
        updateDashboardWithAnalytics();
    } else if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    
    // Refresh the current view to show updated completion state
    updateProgressStats();
    refreshCurrentView();
    
    showNotification(
        `Task ${isNowCompleted ? 'completed' : 'uncompleted'}!`, 
        'success'
    );
}

// Refresh the current active view
function refreshCurrentView() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    
    const pageId = activePage.id;
    
    switch (pageId) {
        case 'dashboard':
            renderTodaySchedule();
            updateDashboard();
            break;
        case 'daily-schedule':
            renderDailySchedule();
            break;
        case 'weekly-tasks':
            renderWeeklyTasks();
            break;
        case 'monthly-tasks':
            renderMonthlyTasks();
            break;
        case 'manage-events':
            renderManageEvents();
            break;
    }
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
    // New structure with separate fill and text elements
    const progressFill = document.getElementById(`${id}-fill`);
    const progressText = document.getElementById(`${id}-text`);
    
    if (progressFill && progressText) {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed}/${total} (${percentage}%)`;
        
        // Add completion classes for styling
        const progressBar = progressFill.closest('.progress-bar');
        if (progressBar) {
            progressBar.classList.toggle('progress-complete', percentage === 100);
            progressBar.classList.toggle('progress-high', percentage >= 80 && percentage < 100);
        }
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

// Event Card Dropdown Functions
function toggleEventDropdown(dropdownElement) {
    // Close all other dropdowns first
    closeAllDropdowns();
    
    // Toggle this dropdown
    dropdownElement.classList.toggle('open');
    
    // Add event listener to close when clicking outside
    if (dropdownElement.classList.contains('open')) {
        setTimeout(() => {
            document.addEventListener('click', closeDropdownOnOutsideClick);
        }, 0);
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.event-card-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
    });
    document.removeEventListener('click', closeDropdownOnOutsideClick);
}

function closeDropdownOnOutsideClick(event) {
    const dropdown = event.target.closest('.event-card-dropdown');
    if (!dropdown) {
        closeAllDropdowns();
    }
}

// Make dropdown functions globally available
window.toggleEventDropdown = toggleEventDropdown;
window.closeAllDropdowns = closeAllDropdowns;

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

function isTaskCompleted(event) {
    const today = new Date().toDateString();
    
    if (event.schedule === 'daily') {
        return event.completedToday && event.lastCompleted === today;
    } else {
        return event.completed;
    }
}

// Render functions
function renderDailySchedule() {
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
                <div class="event-card-dropdown" onclick="toggleEventDropdown(this)">
                    <button class="event-card-dropdown-trigger">
                        <span>⚙️</span>
                        <span class="event-card-dropdown-icon">▼</span>
                    </button>
                    <div class="event-card-dropdown-menu">
                        <button class="event-card-dropdown-item" onclick="editEvent(${event.id}); closeAllDropdowns();">
                            <span>✏️</span> Edit
                        </button>
                        <button class="event-card-dropdown-item danger" onclick="deleteEvent(${event.id}); closeAllDropdowns();">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
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

function renderWeeklyTasks() {
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
                                <div class="event-card-dropdown" onclick="toggleEventDropdown(this)">
                                    <button class="event-card-dropdown-trigger">
                                        <span>⚙️</span>
                                        <span class="event-card-dropdown-icon">▼</span>
                                    </button>
                                    <div class="event-card-dropdown-menu">
                                        <button class="event-card-dropdown-item" onclick="editEvent(${event.id}); closeAllDropdowns();">
                                            <span>✏️</span> Edit
                                        </button>
                                        <button class="event-card-dropdown-item danger" onclick="deleteEvent(${event.id}); closeAllDropdowns();">
                                            <span>🗑️</span> Delete
                                        </button>
                                    </div>
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

function renderMonthlyTasks() {
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
                                <div class="event-card-dropdown" onclick="toggleEventDropdown(this)">
                                    <button class="event-card-dropdown-trigger">
                                        <span>⚙️</span>
                                        <span class="event-card-dropdown-icon">▼</span>
                                    </button>
                                    <div class="event-card-dropdown-menu">
                                        <button class="event-card-dropdown-item" onclick="editEvent(${event.id}); closeAllDropdowns();">
                                            <span>✏️</span> Edit
                                        </button>
                                        <button class="event-card-dropdown-item danger" onclick="deleteEvent(${event.id}); closeAllDropdowns();">
                                            <span>🗑️</span> Delete
                                        </button>
                                    </div>
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

function renderTodaySchedule() {
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

function updateDashboard() {
    // Update total tasks count
    const totalTasksElement = document.getElementById('total-tasks');
    if (totalTasksElement) {
        totalTasksElement.textContent = events.length;
    }
    
    // Update today's schedule overview
    renderTodaySchedule();
    
    // Update progress statistics
    updateProgressStats();
}

// Manage Events Rendering
function renderManageEvents() {
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
            <div class="event-card category-${event.category} ${isCompleted ? 'completed' : ''}" 
                 data-id="${event.id}" 
                 draggable="true"
                 role="listitem"
                 aria-label="Event: ${escapeHTML(event.title)} scheduled for ${escapeHTML(event.schedule)}"
                 aria-describedby="event-manage-desc-${event.id}"
                 tabindex="0">
                <div class="event-card-header category-${event.category}">
                    <div class="event-card-drag-handle" 
                         title="Drag to reorder" 
                         aria-label="Drag handle for ${escapeHTML(event.title)}"
                         role="button"
                         tabindex="0"
                         onkeydown="handleDragKeydown(event, ${event.id})">⋮⋮</div>
                    <div class="event-card-title-time">
                        <h3 class="event-card-title">${escapeHTML(event.title)}</h3>
                        <div class="event-card-time">${formatTime(event.time)}</div>
                    </div>
                    <div class="event-card-dropdown" onclick="toggleEventDropdown(this)">
                        <button class="event-card-dropdown-trigger">
                            <span>⚙️</span>
                            <span class="event-card-dropdown-icon">▼</span>
                        </button>
                        <div class="event-card-dropdown-menu">
                            <button class="event-card-dropdown-item" onclick="editEvent(${event.id}); closeAllDropdowns();">
                                <span>✏️</span> Edit
                            </button>
                            <button class="event-card-dropdown-item danger" onclick="deleteEvent(${event.id}); closeAllDropdowns();">
                                <span>🗑️</span> Delete
                            </button>
                        </div>
                    </div>
                    <div class="event-card-completion">
                        <input type="checkbox" 
                               class="event-card-checkbox" 
                               id="manage-checkbox-${event.id}"
                               ${isCompleted ? 'checked' : ''} 
                               onchange="toggleTaskCompletion(${event.id})"
                               aria-label="Mark ${escapeHTML(event.title)} as ${isCompleted ? 'incomplete' : 'complete'}">
                    </div>
                </div>
                ${event.description || event.lastCompleted ? `
                    <div class="event-card-body">
                        ${event.description ? `<div class="event-card-description" id="event-manage-desc-${event.id}">${escapeHTML(event.description)}</div>` : ''}
                        ${event.lastCompleted ? `<div class="event-card-description">Last completed: ${new Date(event.lastCompleted).toLocaleString()}</div>` : ''}
                        <div class="event-card-tags">
                            <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                            <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                            ${event.day ? `<span class="event-card-tag tag-${event.day}">${capitalizeFirst(event.day)}</span>` : ''}
                            ${event.week ? `<span class="event-card-tag tag-${event.week}">${capitalizeFirst(event.week)} Week</span>` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="event-card-body">
                        <div class="event-card-tags">
                            <span class="event-card-tag tag-${event.category}">${capitalizeFirst(event.category)}</span>
                            <span class="event-card-tag tag-${event.schedule}">${capitalizeFirst(event.schedule)}</span>
                            ${event.day ? `<span class="event-card-tag tag-${event.day}">${capitalizeFirst(event.day)}</span>` : ''}
                            ${event.week ? `<span class="event-card-tag tag-${event.week}">${capitalizeFirst(event.week)} Week</span>` : ''}
                        </div>
                    </div>
                `}
            </div>
        `;
    }).join('');
    
    container.dataset.schedule = 'manage';
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
        
        const reader = new FileReader();        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate the imported data
                const validatedEvents = validateImportData(data);
                
                if (confirm(`This will replace all your current data with ${validatedEvents.length} events. Are you sure?`)) {
                    events = validatedEvents;
                    saveEvents();
                    renderAllViews();
                    updateProgressStats();
                    showNotification(`Data imported successfully! ${validatedEvents.length} events loaded.`, 'success');
                }
            } catch (error) {
                console.error('Import failed:', error);
                showNotification(`Import failed: ${error.message}`, 'error');
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

// Keyboard Navigation for Drag and Drop
function handleDragKeydown(event, eventId) {
    const key = event.key;
    
    if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        initiateDragMode(eventId);
    }
}

function initiateDragMode(eventId) {
    const eventElement = document.querySelector(`[data-id="${eventId}"]`);
    if (!eventElement) return;
    
    eventElement.classList.add('keyboard-drag-mode');
    showNotification('Drag mode activated. Use arrow keys to move, Enter to drop, Escape to cancel.', 'info');
    
    // Add keyboard listeners for drag mode
    const handleDragNavigation = (e) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                moveEventUp(eventId);
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveEventDown(eventId);
                break;
            case 'Enter':
                e.preventDefault();
                completeDragOperation(eventId);
                break;
            case 'Escape':
                e.preventDefault();
                cancelDragOperation(eventId);
                break;
        }
    };
    
    document.addEventListener('keydown', handleDragNavigation);
    eventElement.dataset.dragHandler = 'active';
    
    // Store cleanup function
    eventElement._cleanupDrag = () => {
        document.removeEventListener('keydown', handleDragNavigation);
        eventElement.classList.remove('keyboard-drag-mode');
        delete eventElement.dataset.dragHandler;
        delete eventElement._cleanupDrag;
    };
}

function moveEventUp(eventId) {
    const currentElement = document.querySelector(`[data-id="${eventId}"]`);
    const previousElement = currentElement.previousElementSibling;
    
    if (previousElement && previousElement.dataset.id) {
        // Swap positions visually
        currentElement.parentNode.insertBefore(currentElement, previousElement);
        showNotification('Moved up. Press Enter to confirm or Escape to cancel.', 'info');
    }
}

function moveEventDown(eventId) {
    const currentElement = document.querySelector(`[data-id="${eventId}"]`);
    const nextElement = currentElement.nextElementSibling;
    
    if (nextElement && nextElement.dataset.id) {
        // Swap positions visually
        currentElement.parentNode.insertBefore(nextElement, currentElement);
        showNotification('Moved down. Press Enter to confirm or Escape to cancel.', 'info');
    }
}

function completeDragOperation(eventId) {
    const eventElement = document.querySelector(`[data-id="${eventId}"]`);
    if (!eventElement) return;
    
    // Get new position
    const allEvents = Array.from(eventElement.parentNode.children);
    const newIndex = allEvents.indexOf(eventElement);
    
    // Update data model
    const event = events.find(e => e.id === parseInt(eventId));
    if (event) {
        // Recalculate times based on new position
        const schedule = event.schedule;
        const day = event.day;
        const week = event.week;
        
        recalculateEventTimes(schedule, day, week);
        saveEvents();
        renderAllViews();
        
        showNotification('Event moved successfully!', 'success');
    }
    
    // Cleanup
    if (eventElement._cleanupDrag) {
        eventElement._cleanupDrag();
    }
}

function cancelDragOperation(eventId) {
    const eventElement = document.querySelector(`[data-id="${eventId}"]`);
    if (!eventElement) return;
    
    // Cleanup and re-render to restore original order
    if (eventElement._cleanupDrag) {
        eventElement._cleanupDrag();
    }
    
    renderAllViews();
    showNotification('Drag operation cancelled.', 'info');
}

// Enhanced Focus Management
function initializeFocusManagement() {
    // Trap focus in modals
    document.addEventListener('keydown', function(e) {
        const modal = document.querySelector('.modal.show, #event-modal.show');
        if (modal && e.key === 'Tab') {
            trapFocus(e, modal);
        }
    });
    
    // Announce dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                announceContentChange(mutation.target);
            }
        });
    });
    
    // Observe containers that change content
    const containers = ['daily-schedule', 'weekly-tasks', 'monthly-tasks', 'events-list'];
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element, { childList: true, subtree: true });
        }
    });
}

function trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
}

function announceContentChange(container) {
    const announcement = container.querySelector('[aria-live]');
    if (announcement) {
        // Create temporary announcement
        const temp = document.createElement('div');
        temp.setAttribute('aria-live', 'polite');
        temp.setAttribute('aria-atomic', 'true');
        temp.className = 'sr-only';
        temp.textContent = 'Content updated';
        
        document.body.appendChild(temp);
        setTimeout(() => temp.remove(), 1000);
    }
}

// Enhanced Error Boundaries for Rendering
function renderWithErrorBoundary(renderFunction, containerId, fallbackContent = 'Content unavailable') {
    try {
        renderFunction();
    } catch (error) {
        console.error(`Render error in ${containerId}:`, error);
        
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-boundary" role="alert" aria-live="assertive">
                    <p class="error-message">Unable to display content</p>
                    <button onclick="location.reload()" class="btn-retry">Refresh Page</button>
                </div>
            `;
        }
        
        showNotification(`Failed to display ${containerId}. Please refresh the page.`, 'error');
    }
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
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const isOpen = sidebar.classList.contains('nav-mobile-open');
    
    if (isOpen) {
        sidebar.classList.remove('nav-mobile-open');
        backdrop.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scroll
    } else {
        sidebar.classList.add('nav-mobile-open');
        backdrop.classList.add('show');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

function closeMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    
    sidebar.classList.remove('nav-mobile-open');
    backdrop.classList.remove('show');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function initializeMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileNav);
    }
    
    // Close mobile nav when clicking backdrop
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileNav);
    }
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        const toggleBtn = document.getElementById('mobile-nav-toggle');
        
        if (sidebar && toggleBtn && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target) &&
            sidebar.classList.contains('nav-mobile-open')) {
            closeMobileNav();
        }
    });
    
    // Close mobile nav when nav item is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            // Small delay to ensure page transition starts
            setTimeout(closeMobileNav, 100);
        });
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('nav-mobile-open')) {
                    closeMobileNav();
        }
    });
    
    // Handle resize events - close mobile nav if screen becomes large
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && sidebar.classList.contains('nav-mobile-open')) {
            closeMobileNav();
        }
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

// Analytics and Yearly Goals Integration
// Import analytics and yearly goals modules when they're loaded

// Analytics page rendering
function renderAnalyticsPage() {
    const container = document.getElementById('analytics-content');
    if (!container) {
        // Try to find the analytics page container
        const analyticsPage = document.getElementById('analytics');
        if (analyticsPage) {
            const contentDiv = analyticsPage.querySelector('#analytics-content') || analyticsPage;
            if (typeof renderAnalytics === 'function') {
                contentDiv.innerHTML = '';
                renderAnalytics();
            } else {
                contentDiv.innerHTML = '<div class="loading-message">📊 Loading analytics...</div>';
            }
        }
        return;
    }
    
    // Initialize analytics if available
    if (typeof renderAnalytics === 'function') {
        renderAnalytics();
    } else {
        console.warn('Analytics module not loaded');
        container.innerHTML = '<div class="loading-message">📊 Loading analytics...</div>';
    }
}

// Yearly goals page rendering
function renderYearlyGoalsPage() {
    const container = document.getElementById('yearly-goals-content');
    if (!container) {
        // Try to find the yearly goals page container
        const goalsPage = document.getElementById('yearly-goals');
        if (goalsPage) {
            const contentDiv = goalsPage.querySelector('#yearly-goals-content') || goalsPage;
            if (typeof renderYearlyGoals === 'function') {
                contentDiv.innerHTML = '';
                renderYearlyGoals();
            } else {
                contentDiv.innerHTML = '<div class="loading-message">🎯 Loading yearly goals...</div>';
            }
        }
        return;
    }
    
    // Initialize yearly goals if available
    if (typeof renderYearlyGoals === 'function') {
        renderYearlyGoals();
    } else {
        console.warn('Yearly goals module not loaded');
        container.innerHTML = '<div class="loading-message">🎯 Loading yearly goals...</div>';
    }
}

// Navigation handlers for analytics features
function navigateToAnalytics() {
    showContent('analytics');
    renderAnalyticsPage();
    updateActiveNav('analytics');
}

function navigateToYearlyGoals() {
    showContent('yearly-goals');
    renderYearlyGoalsPage();
    updateActiveNav('yearly-goals');
}

// Enhanced content switching to support new pages
function showContent(contentType) {
    // Hide all content sections
    const sections = ['dashboard', 'daily', 'weekly', 'monthly', 'manage', 'analytics', 'yearly-goals'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show selected content
    const selectedElement = document.getElementById(contentType);
    if (selectedElement) {
        selectedElement.style.display = 'block';
    }
    
    // Handle special cases for new pages
    switch (contentType) {
        case 'analytics':
            renderAnalyticsPage();
            break;
        case 'yearly-goals':
            renderYearlyGoalsPage();
            break;
        case 'dashboard':
            // Update dashboard with analytics integration if available
            if (typeof updateDashboardWithAnalytics === 'function') {
                updateDashboardWithAnalytics();
            } else {
                updateDashboard();
            }
            break;
        default:
            // Use existing render functions for other pages
            if (contentType === 'daily') renderDailySchedule();
            if (contentType === 'weekly') renderWeeklyTasks();
            if (contentType === 'monthly') renderMonthlyTasks();
            if (contentType === 'manage') renderManageEvents();
    }
}

// Make showContent globally available
window.showContent = showContent;

// Enhanced Drag and Drop functionality
function reorderEvents(draggedId, targetId) {
    const draggedIndex = events.findIndex(e => e.id === draggedId);
    const targetIndex = events.findIndex(e => e.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Move dragged event to new position
    const [movedEvent] = events.splice(draggedIndex, 1);
    events.splice(targetIndex, 0, movedEvent);
    
    // Update IDs and indices
    events.forEach((event, index) => {
        event.id = `event_${index}_${Date.now().toString(36)}`;
    });
    
    saveEvents();
    renderAllViews();
}

// Recalculate event times based on new position
function recalculateEventTimes(schedule, day, week) {
    // Placeholder for advanced scheduling logic
    // For now, just log the change
    console.log(`Recalculating times for ${schedule} event on ${day} of ${week}`);
}

// Initialize analytics integration
function initializeAnalyticsIntegration() {
    createAnalyticsContainer();
    
    // Load analytics modules if available
    Promise.all([
        import('./analytics.js').catch(() => null),
        import('./yearly-goals.js').catch(() => null),
        import('./dashboard.js').catch(() => null)
    ]).then(([analyticsModule, goalsModule, dashboardModule]) => {
        if (analyticsModule) {
            // Make analytics functions globally available
            window.renderAnalytics = analyticsModule.renderAnalytics;
            window.initializeAnalytics = analyticsModule.initializeAnalytics;
            window.recordTaskCompletion = analyticsModule.recordTaskCompletion;
            window.exportAnalyticsData = analyticsModule.exportAnalyticsData;
            
            // Initialize analytics
            if (analyticsModule.initializeAnalytics) {
                analyticsModule.initializeAnalytics();
            }
        }
        
        if (goalsModule) {
            // Make yearly goals functions globally available
            window.renderYearlyGoals = goalsModule.renderYearlyGoals;
            window.initializeYearlyGoals = goalsModule.initializeYearlyGoals;
            window.openGoalModal = goalsModule.openGoalModal;
            window.saveGoal = goalsModule.saveGoal;
            window.exportGoalsData = goalsModule.exportGoalsData;
            
            // Initialize yearly goals
            if (goalsModule.initializeYearlyGoals) {
                goalsModule.initializeYearlyGoals();
            }
        }
        
        if (dashboardModule) {
            // Make enhanced dashboard functions globally available
            window.updateDashboardWithAnalytics = dashboardModule.updateDashboardWithAnalytics;
            window.updateDashboardStats = dashboardModule.updateDashboardStats;
            window.getCompletionSummary = dashboardModule.getCompletionSummary;
        }
    });
}

// Create analytics container if it doesn't exist
function createAnalyticsContainer() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Add analytics content container if it doesn't exist
    if (!document.getElementById('analytics-content')) {
        const analyticsDiv = document.createElement('div');
        analyticsDiv.id = 'analytics-content';
        analyticsDiv.style.display = 'none';
        mainContent.appendChild(analyticsDiv);
    }
    
    // Add yearly goals content container if it doesn't exist
    if (!document.getElementById('yearly-goals-content')) {
        const goalsDiv = document.createElement('div');
        goalsDiv.id = 'yearly-goals-content';
        goalsDiv.style.display = 'none';
        mainContent.appendChild(goalsDiv);
    }
}
