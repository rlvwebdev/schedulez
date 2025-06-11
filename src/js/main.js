// Main Application Module
// This module imports and orchestrates all other modules

// Import all modules
import { renderDailySchedule, renderTodaySchedule, resetDailyTasks, initializeDailyProgressTracking } from './daily.js';
import { renderWeeklyTasks, getWeeklyCompletionSummary, resetWeeklyTasks, getTasksForDay } from './weekly.js';
import { renderMonthlyTasks, getMonthlyCompletionSummary, resetMonthlyTasks, getTasksForWeek, getCurrentWeekOfMonth, getCurrentWeekTasks } from './monthly.js';
import { renderManageEvents, saveEvent, editEvent, deleteEvent, clearEventForm, performSearch, renderSearchResults } from './manage.js';
import { updateDashboard, updateDashboardStats, getCompletionSummary, updateProgressStats, updateProgressBar, updateAchievements } from './dashboard.js';
import { 
    formatTime, 
    capitalizeFirst, 
    isTaskCompleted, 
    generateUniqueId, 
    sanitizeHTML, 
    escapeHTML, 
    validateEventData, 
    validateImportData, 
    isLocalStorageAvailable, 
    getStorageInfo, 
    cleanupOldCompletionData,
    timeToMinutes,
    minutesToTime,
    debounce,
    showNotification 
} from './utils.js';

// Global Variables
let events = [];
let editingEventId = null;
let deferredPrompt;
let isInitialized = false;
let renderQueued = false;

// Make functions globally available for HTML onclick handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.saveEvent = saveEvent;
window.exportData = exportData;
window.importData = importData;
window.resetToDefaults = resetToDefaults;
window.searchEvents = performSearch;
window.updateDayWeekFields = updateDayWeekFields;

// Make utility functions globally available
window.formatTime = formatTime;
window.capitalizeFirst = capitalizeFirst;
window.isTaskCompleted = isTaskCompleted;
window.escapeHTML = escapeHTML;
window.showNotification = showNotification;

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

// Error boundary for rendering
function renderWithErrorBoundary(renderFunction, containerId, fallbackContent = 'Content unavailable') {
    try {
        renderFunction();
    } catch (error) {
        console.error(`Render error in ${containerId}:`, error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="render-error" role="alert">
                <p>${fallbackContent}</p>
                <button onclick="location.reload()" class="btn btn-secondary">Refresh Page</button>
            </div>`;
        }
        showNotification(`Failed to load ${containerId}. Please refresh.`, 'error');
    }
}

// Initialize app data
function initializeAppData() {
    try {
        if (!isLocalStorageAvailable()) {
            events = [];
            showNotification('Running in memory-only mode. Data will not persist.', 'warning');
            return;
        }
        
        const storedEvents = localStorage.getItem('homeEvents');
        if (storedEvents) {
            events = JSON.parse(storedEvents);
            console.log('✅ Loaded events from localStorage:', events.length);
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

// Validate loaded data
function validateLoadedData() {
    const validEvents = [];
    
    events.forEach(event => {
        try {
            validateEventData(event);
            validEvents.push(event);
        } catch (error) {
            console.warn('Removing invalid event:', event, error.message);
        }
    });
    
    if (validEvents.length !== events.length) {
        events = validEvents;
        saveEvents();
        showNotification(`Cleaned up ${events.length - validEvents.length} invalid events.`, 'info');
    }
}

// Save events to localStorage
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
            cleanupOldCompletionData();
        } else if (error.name === 'SecurityError') {
            showNotification('Storage access denied. Please check browser privacy settings.', 'error');
        } else {
            showNotification('Failed to save data: ' + error.message, 'error');
        }
    }
}

// Toggle task completion
function toggleTaskCompletion(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    const today = new Date().toDateString();
    
    if (event.schedule === 'daily') {
        event.completedToday = !event.completedToday;
        event.lastCompleted = event.completedToday ? today : null;
    } else {
        event.completed = !event.completed;
        event.lastCompleted = event.completed ? today : null;
    }
    
    saveEvents();
    showNotification(
        `${event.title} marked as ${event.schedule === 'daily' ? event.completedToday : event.completed ? 'completed' : 'incomplete'}!`, 
        'success'
    );
}

// Export all modules and main functions
export {
    // Main functions
    renderAllViews,
    initializeAppData,
    saveEvents,
    toggleTaskCompletion,
    
    // Module re-exports
    renderDailySchedule,
    renderWeeklyTasks,
    renderMonthlyTasks,
    renderManageEvents,
    renderTodaySchedule,
    updateDashboard,
    updateProgressStats,
    
    // Utility re-exports
    formatTime,
    capitalizeFirst,
    isTaskCompleted,
    generateUniqueId,
    escapeHTML,
    showNotification,
    
    // Global variables
    events,
    editingEventId,
    isInitialized
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Schedulez...');
    
    try {
        // Initialize app data
        initializeAppData();
        
        // Initialize all modules
        initializeDailyProgressTracking();
        
        // Initial render
        renderAllViews();
        updateDashboard();
        
        console.log('✅ Schedulez initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Failed to initialize application. Please refresh the page.', 'error');
    }
});
