// Utility Functions Module
// This module contains shared utility functions used across the application

// Format 24-hour time to 12-hour format with AM/PM
export function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Capitalize first letter of a string
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if a task is completed based on schedule type
export function isTaskCompleted(event) {
    const today = new Date().toDateString();
    
    if (event.schedule === 'daily') {
        return event.completedToday && event.lastCompleted === today;
    } else {
        return event.completed;
    }
}

// Generate unique ID for new events
export function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Sanitize HTML to prevent XSS
export function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escape HTML entities
export function escapeHTML(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Validate event data structure
export function validateEventData(event) {
    const required = ['id', 'title', 'time', 'category', 'schedule'];
    
    for (const field of required) {
        if (!event.hasOwnProperty(field) || event[field] === null || event[field] === undefined) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Validate schedule-specific requirements
    if (event.schedule === 'weekly' && !event.day) {
        throw new Error('Weekly events must specify a day');
    }
    
    if (event.schedule === 'monthly' && !event.week) {
        throw new Error('Monthly events must specify a week');
    }
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(event.time)) {
        throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }
    
    // Validate category
    const validCategories = ['personal', 'dogs', 'cleaning', 'kitchen', 'development', 'maintenance'];
    if (!validCategories.includes(event.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Validate schedule type
    const validSchedules = ['daily', 'weekly', 'monthly'];
    if (!validSchedules.includes(event.schedule)) {
        throw new Error(`Invalid schedule type. Must be one of: ${validSchedules.join(', ')}`);
    }
    
    return true;
}

// Validate imported data
export function validateImportData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
    }
    
    let eventsToValidate = data.events || data;
    
    if (!Array.isArray(eventsToValidate)) {
        throw new Error('Events must be an array');
    }
    
    const validatedEvents = [];
    
    eventsToValidate.forEach((event, index) => {
        try {
            validateEventData(event);
            
            // Ensure all required fields exist with defaults
            const validatedEvent = {
                id: event.id || generateUniqueId(),
                title: event.title,
                time: event.time,
                category: event.category,
                schedule: event.schedule,
                day: event.day || '',
                week: event.week || '',
                description: event.description || '',
                completed: event.completed || false,
                completedToday: event.completedToday || false,
                lastCompleted: event.lastCompleted || null
            };
            
            validatedEvents.push(validatedEvent);
        } catch (error) {
            console.warn(`Skipping invalid event at index ${index}:`, error.message);
        }
    });
    
    if (validatedEvents.length === 0) {
        throw new Error('No valid events found in import data');
    }
    
    return validatedEvents;
}

// Check if localStorage is available
export function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Get storage information
export function getStorageInfo() {
    if (!isLocalStorageAvailable()) {
        return { available: false, used: 0, remaining: 0 };
    }
    
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }
    
    // Rough estimate of 5MB limit for most browsers
    const estimatedLimit = 5 * 1024 * 1024;
    
    return {
        available: true,
        used: totalSize,
        remaining: estimatedLimit - totalSize,
        percentage: Math.round((totalSize / estimatedLimit) * 100)
    };
}

// Clean up old completion data to free space
export function cleanupOldCompletionData() {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Remove data older than 30 days
        
        events.forEach(event => {
            if (event.lastCompleted) {
                const completedDate = new Date(event.lastCompleted);
                if (completedDate < cutoffDate && event.schedule === 'daily') {
                    event.lastCompleted = null;
                    event.completedToday = false;
                }
            }
        });
        
        saveEvents();
        console.log('Cleaned up old completion data');
    } catch (error) {
        console.error('Failed to cleanup old data:', error);
    }
}

// Convert time string to minutes for calculations
export function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes back to time string
export function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Debounce function for performance optimization
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification to user
export function showNotification(message, type = 'info') {
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
