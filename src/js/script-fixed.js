// Schedulez - Complete Home Task Management System
'use strict';

// Global variables
let events = [];
let editingEventId = null;
let isInitialized = false;
let renderQueued = false;
let deferredPrompt = null;

// Utility Functions
function isLocalStorageAvailable() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    showNotification('Local storage is not available. Data will not persist.', 'error');
    return false;
  }
}

function escapeHTML(text) {
  if (!text) {
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function generateUniqueId() {
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

// Core App Functions
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
      validateLoadedData();
    } else {
      initializeDefaultEvents();
    }
    isInitialized = true;
  } catch (error) {
    showNotification('Failed to load saved data. Starting fresh.', 'error');
    initializeDefaultEvents();
    isInitialized = true;
  }
}

function initializeDefaultEvents() {
  const defaultEvents = [
    // Daily Events
    { 
      id: 1, 
      title: 'Wake up, personal hygiene', 
      time: '05:00', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 2, 
      title: 'Let dogs out for morning relief & quick exercise', 
      time: '05:10', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 3, 
      title: 'Feed dogs breakfast', 
      time: '05:20', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 4, 
      title: 'Wipe kitchen counters, load/start dishwasher if needed', 
      time: '05:25', 
      category: 'cleaning', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 5, 
      title: 'Check weather/news, quick snack if desired', 
      time: '05:35', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 6, 
      title: 'Extra time for personal routine or TMS planning', 
      time: '05:45', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 7, 
      title: 'Get dressed, gather work items', 
      time: '06:00', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 8, 
      title: 'Quick potty break for dogs', 
      time: '06:20', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 9, 
      title: 'Leave for work (26-mile commute to Springfield + 5min coffee stop)', 
      time: '06:25', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 10, 
      title: 'Return home - let dogs out immediately, quick walk', 
      time: '18:00', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 11, 
      title: 'Feed dogs dinner', 
      time: '18:30', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 12, 
      title: 'Prepare and eat dinner', 
      time: '18:45', 
      category: 'kitchen', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 14, 
      title: 'Clean dinner dishes, wipe counters, prep kitchen for next day', 
      time: '20:00', 
      category: 'kitchen', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 16, 
      title: 'Final potty break for dogs', 
      time: '21:45', 
      category: 'dogs', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 17, 
      title: 'Brief relaxation/wind down', 
      time: '21:50', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 18, 
      title: 'Wind down routine, prepare for bed', 
      time: '22:00', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    },
    { 
      id: 19, 
      title: 'Bedtime', 
      time: '22:15', 
      category: 'personal', 
      schedule: 'daily', 
      day: '', 
      week: '', 
      description: '' 
    }
  ].map(event => ({
    ...event,
    completed: false,
    completedToday: false,
    lastCompleted: null
  }));
  
  events = defaultEvents;
  saveEvents();
}

// Navigation Functions
function getCurrentViewMode() {
  return window.innerWidth >= 1024 ? 'desktop' : 'mobile';
}

function navigateToPage(pageId, viewMode) {
  if (viewMode === 'auto') {
    viewMode = getCurrentViewMode();
  }
  
  updateActiveNavigation(pageId, viewMode);
  showResponsiveContent(pageId, viewMode);
  updatePageMetadata(pageId, viewMode);
  window.location.hash = pageId;
}

function updateActiveNavigation(pageId, viewMode) {
  // Remove active from all navigation links
  document.querySelectorAll('.bottom-nav-link, .desktop-nav-link, .mobile-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active to appropriate navigation based on view mode
  if (viewMode === 'mobile') {
    const mobileBottomLink = document.querySelector(`.bottom-nav-link[data-page="${pageId}"]`);
    const mobileDrawerLink = document.querySelector(`.mobile-nav-link[data-page="${pageId}"]`);
    if (mobileBottomLink) {
      mobileBottomLink.classList.add('active');
    }
    if (mobileDrawerLink) {
      mobileDrawerLink.classList.add('active');
    }
  } else {
    const desktopLink = document.querySelector(`.desktop-nav-link[data-page="${pageId}"]`);
    if (desktopLink) {
      desktopLink.classList.add('active');
    }
  }
}

function showResponsiveContent(pageId, viewMode) {
  // Hide all content containers
  const mobilePages = document.querySelectorAll('#mobile-content .page');
  const desktopPages = document.querySelectorAll('#desktop-content .page');
  mobilePages.forEach(page => page.classList.add('hidden'));
  desktopPages.forEach(page => page.classList.add('hidden'));
  
  // Show appropriate content container
  if (viewMode === 'mobile') {
    const mobilePage = document.getElementById(`mobile-${pageId}`);
    if (mobilePage) {
      mobilePage.classList.remove('hidden');
      renderMobileContent(pageId);
    }
  } else {
    const desktopPage = document.getElementById(`desktop-${pageId}`);
    if (desktopPage) {
      desktopPage.classList.remove('hidden');
      renderDesktopContent(pageId);
    }
  }
}

function renderMobileContent(pageId) {
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
    default:
      break;
  }
}

function renderDesktopContent(pageId) {
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
    default:
      break;
  }
}

function updatePageMetadata(pageId, viewMode) {
  const pageTitle = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace('-', ' ');
  document.title = `Schedulez - ${pageTitle}`;
}

// Mobile Navigation Functions
function toggleMobileNav() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const isOpen = sidebar.classList.contains('nav-mobile-open');
  
  if (isOpen) {
    sidebar.classList.remove('nav-mobile-open');
    backdrop.classList.remove('show');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('nav-mobile-open');
    backdrop.classList.add('show');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileDrawer() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  
  sidebar.classList.remove('nav-mobile-open');
  backdrop.classList.remove('show');
  toggleBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Event Management Functions
function saveEvents() {
  try {
    const dataStr = JSON.stringify(events);
    localStorage.setItem('homeEvents', dataStr);
    updateProgressStats();
    renderAllViews();
  } catch (error) {
    showNotification('Failed to save data: ' + error.message, 'error');
  }
}

function validateLoadedData() {
  try {
    let hasErrors = false;
    const validEvents = [];
    
    events.forEach((event, index) => {
      try {
        validateEventData(event);
        validEvents.push(event);
      } catch (error) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      events = validEvents;
      saveEvents();
      showNotification('Some invalid events were removed during data validation.', 'warning');
    }
  } catch (error) {
    initializeDefaultEvents();
  }
}

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

// Form Functions
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
    eventData.id = generateUniqueId();
    events.push(eventData);
    showNotification('Event added successfully!', 'success');
  }
  
  saveEvents();
  clearEventForm();
}

function clearEventForm() {
  document.getElementById('event-form').reset();
  editingEventId = null;
  updateDayWeekFields();
  
  // Reset form title and button text
  document.querySelector('#add-event h3').textContent = 'Add New Event';
  document.querySelector('#event-form button[type="submit"]').textContent = 'Add Event';
}

// Task Management Functions
function toggleTaskCompletion(id) {
  const eventIndex = events.findIndex(e => e.id === id);
  if (eventIndex === -1) {
    return;
  }
  
  const task = events[eventIndex];
  const now = new Date();
  let isNowCompleted = false;
  
  if (task.schedule === 'daily') {
    task.completedToday = !task.completedToday;
    isNowCompleted = task.completedToday;
    if (task.completedToday) {
      task.lastCompleted = now.toISOString();
    }
  } else {
    task.completed = !task.completed;
    isNowCompleted = task.completed;
    if (task.completed) {
      task.lastCompleted = now.toISOString();
    }
  }
  
  saveEvents();
  updateProgressStats();
  refreshCurrentView();
  
  showNotification(
    `Task ${isNowCompleted ? 'completed' : 'uncompleted'}!`,
    'success'
  );
}

function refreshCurrentView() {
  const activePage = document.querySelector('.page.active');
  if (!activePage) {
    return;
  }
  
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
    default:
      break;
  }
}

// Progress and Statistics Functions
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
  if (!achievementsContainer) {
    return;
  }
  
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

// Rendering Functions
function renderAllViews() {
  if (!isInitialized) {
    return;
  }
  
  // Debounce rapid render calls
  if (renderQueued) {
    return;
  }
  renderQueued = true;
  
  requestAnimationFrame(() => {
    try {
      renderDailySchedule();
      renderWeeklyTasks();
      renderMonthlyTasks();
      renderManageEvents();
      renderQueued = false;
    } catch (error) {
      showNotification('Display update failed. Please refresh the page.', 'error');
      renderQueued = false;
    }
  });
}

function isTaskCompleted(event) {
  const today = new Date().toDateString();
  if (event.schedule === 'daily') {
    return event.completedToday && event.lastCompleted === today;
  } else {
    return event.completed;
  }
}

function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderDailySchedule() {
  const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById('daily-schedule');
  if (!container) {
    return;
  }
  
  container.innerHTML = dailyEvents.map((event, index) => `
    <div class="event-item" data-id="${event.id}" draggable="true">
      <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
      <div class="event-content">
        <div class="event-time">${formatTime12Hour(event.time)}</div>
        <div class="event-title">${escapeHTML(event.title)}</div>
        <div class="event-category">${capitalize(event.category)}</div>
      </div>
      <div class="event-actions">
        <button class="btn-complete ${event.completedToday ? 'completed' : ''}" 
                onclick="toggleTaskCompletion(${event.id})"
                title="${event.completedToday ? 'Mark as incomplete' : 'Mark as complete'}">
          ${event.completedToday ? '✓' : '○'}
        </button>
        <div class="event-card-dropdown">
          <button class="dropdown-toggle" onclick="toggleDropdown(this.parentElement)">⋯</button>
          <div class="dropdown-menu">
            <button onclick="editEvent(${event.id})">Edit</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderWeeklyTasks() {
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const container = document.getElementById('weekly-tasks');
  if (!container) {
    return;
  }
  
  container.innerHTML = weekDays.map(day => {
    const dayEvents = events.filter(e => e.schedule === 'weekly' && e.day === day);
    return `
      <div class="day-section">
        <h3>${capitalize(day)}</h3>
        <div class="events-list" data-schedule="weekly" data-day="${day}">
          ${dayEvents.map(event => `
            <div class="event-item" data-id="${event.id}" draggable="true">
              <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
              <div class="event-content">
                <div class="event-time">${formatTime12Hour(event.time)}</div>
                <div class="event-title">${escapeHTML(event.title)}</div>
                <div class="event-category">${capitalize(event.category)}</div>
              </div>
              <div class="event-actions">
                <button class="btn-complete ${event.completed ? 'completed' : ''}" 
                        onclick="toggleTaskCompletion(${event.id})"
                        title="${event.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                  ${event.completed ? '✓' : '○'}
                </button>
                <div class="event-card-dropdown">
                  <button class="dropdown-toggle" onclick="toggleDropdown(this.parentElement)">⋯</button>
                  <div class="dropdown-menu">
                    <button onclick="editEvent(${event.id})">Edit</button>
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderMonthlyTasks() {
  const weeks = ['first', 'second', 'third', 'fourth'];
  const container = document.getElementById('monthly-tasks');
  if (!container) {
    return;
  }
  
  container.innerHTML = weeks.map(week => {
    const weekEvents = events.filter(e => e.schedule === 'monthly' && e.week === week);
    return `
      <div class="week-section">
        <h3>${capitalize(week)} Week</h3>
        <div class="events-list" data-schedule="monthly" data-week="${week}">
          ${weekEvents.map(event => `
            <div class="event-item" data-id="${event.id}" draggable="true">
              <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
              <div class="event-content">
                <div class="event-time">${formatTime12Hour(event.time)}</div>
                <div class="event-title">${escapeHTML(event.title)}</div>
                <div class="event-category">${capitalize(event.category)}</div>
              </div>
              <div class="event-actions">
                <button class="btn-complete ${event.completed ? 'completed' : ''}" 
                        onclick="toggleTaskCompletion(${event.id})"
                        title="${event.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                  ${event.completed ? '✓' : '○'}
                </button>
                <div class="event-card-dropdown">
                  <button class="dropdown-toggle" onclick="toggleDropdown(this.parentElement)">⋯</button>
                  <div class="dropdown-menu">
                    <button onclick="editEvent(${event.id})">Edit</button>
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderTodaySchedule() {
  const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById('today-schedule');
  if (!container) {
    return;
  }
  
  // Get current time for highlighting
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  container.innerHTML = dailyEvents.slice(0, 8).map(event => {
    const isActive = event.time <= currentTime;
    const completed = isTaskCompleted(event);
    return `
      <div class="schedule-item ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}">
        <div class="schedule-time">${formatTime12Hour(event.time)}</div>
        <div class="schedule-title">${escapeHTML(event.title)}</div>
        <button class="btn-complete ${completed ? 'completed' : ''}" 
                onclick="toggleTaskCompletion(${event.id})"
                title="${completed ? 'Mark as incomplete' : 'Mark as complete'}">
          ${completed ? '✓' : '○'}
        </button>
      </div>
    `;
  }).join('');
  
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

function updateDashboard() {
  const container = document.getElementById('events-list');
  if (!container) {
    return;
  }
  
  if (events.length === 0) {
    container.innerHTML = '<div class="no-events" role="status" aria-live="polite">No events configured. Start by adding your first event!</div>';
    return;
  }
  
  // Update total tasks count
  const totalTasksElement = document.getElementById('total-tasks');
  if (totalTasksElement) {
    totalTasksElement.textContent = events.length;
  }
  
  // Update progress statistics
  updateProgressStats();
}

function renderManageEvents() {
  const container = document.getElementById('events-list');
  if (!container) {
    return;
  }
  
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
      <div class="event-item" data-id="${event.id}" role="listitem" aria-label="Event ${index + 1} of ${sortedEvents.length}">
        <div class="event-content">
          <div class="event-time">${formatTime12Hour(event.time)}</div>
          <div class="event-title">${escapeHTML(event.title)}</div>
          <div class="event-meta">
            <span class="event-category">${capitalize(event.category)}</span>
            <span class="event-schedule">${capitalize(event.schedule)}</span>
            ${event.day ? `<span class="event-day">${capitalize(event.day)}</span>` : ''}
            ${event.week ? `<span class="event-week">${capitalize(event.week)} Week</span>` : ''}
          </div>
          ${event.description ? `<div class="event-description">${escapeHTML(event.description)}</div>` : ''}
        </div>
        <div class="event-actions">
          <button class="btn-complete ${isCompleted ? 'completed' : ''}" 
                  onclick="toggleTaskCompletion(${event.id})"
                  title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}"
                  aria-label="${isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}">
            ${isCompleted ? '✓' : '○'}
          </button>
          <div class="event-card-dropdown">
            <button class="dropdown-toggle" onclick="toggleDropdown(this.parentElement)" aria-label="More options">⋯</button>
            <div class="dropdown-menu">
              <button onclick="editEvent(${event.id})">Edit</button>
              <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.dataset.schedule = 'manage';
}

// Event Handlers
function editEvent(id) {
  const event = events.find(e => e.id === id);
  if (!event) {
    return;
  }
  
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

function toggleDropdown(dropdownElement) {
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

// Notification System
function showNotification(message, type) {
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

// Initialization Functions
function initializeEventForm() {
  const scheduleSelect = document.getElementById('event-schedule');
  
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

function initializeNavigation() {
  // Mobile bottom navigation
  document.querySelectorAll('.bottom-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      navigateToPage(pageId, 'mobile');
    });
  });
  
  // Desktop sidebar navigation
  document.querySelectorAll('.desktop-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      navigateToPage(pageId, 'desktop');
    });
  });
  
  // Mobile drawer navigation
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      navigateToPage(pageId, 'mobile');
      closeMobileDrawer();
    });
  });
  
  // Handle initial page load
  const initialPage = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
  navigateToPage(initialPage, getCurrentViewMode());
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
    backdrop.addEventListener('click', closeMobileDrawer);
  }
  
  // Close mobile nav when clicking outside
  document.addEventListener('click', function(e) {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    if (sidebar && toggleBtn &&
        sidebar.classList.contains('nav-mobile-open') && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      closeMobileDrawer();
    }
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('nav-mobile-open')) {
      closeMobileDrawer();
    }
  });
  
  // Handle resize events - close mobile nav if screen becomes large
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && sidebar.classList.contains('nav-mobile-open')) {
      closeMobileDrawer();
    }
  });
}

// Main initialization function
function initializeApp() {
  try {
    // Initialize core functionality with error handling
    const initPromises = [
      initializeWithErrorHandling('Navigation', initializeNavigation),
      initializeWithErrorHandling('Event Form', initializeEventForm),
      initializeWithErrorHandling('Mobile Navigation', initializeMobileNavigation)
    ];
    
    // Execute initialization tasks
    Promise.allSettled(initPromises).then(results => {
      const failedInits = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedInits.push(result.reason);
        }
      });
      
      if (failedInits.length > 0) {
        showNotification('Some features may not work properly. Refresh to retry.', 'warning');
      }
      
      // Always try to render views and update stats
      renderAllViews();
      updateProgressStats();
    });
  } catch (error) {
    showNotification('App initialization failed. Please refresh the page.', 'error');
  }
}

function initializeWithErrorHandling(name, initFunction) {
  return new Promise((resolve, reject) => {
    try {
      const result = initFunction();
      resolve(result);
    } catch (error) {
      reject(`${name}: ${error.message}`);
    }
  });
}

// DOM ready event
document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeAppData();
    initializeApp();
  } catch (error) {
    showNotification('Critical initialization error. Please refresh the page.', 'error');
  }
});

// Global helper functions for debugging
window.schedulezDebug = {
  events: () => events,
  resetDaily: () => resetDailyTasks(),
  updateStats: () => updateProgressStats(),
  exportEvents: () => JSON.stringify(events, null, 2)
};

console.log('✅ Schedulez loaded successfully!');
