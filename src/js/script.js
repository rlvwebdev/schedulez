// Schedulez - Complete Home Task Management System
'use strict';

// Global variables
let events = [];
let editingEventId = null;
let isInitialized = false;
let renderQueued = false;
let deferredPrompt = null;

// Theme Management System
let currentTheme = 'auto'; // Default to auto

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
    case 'daily':
    case 'daily-schedule':
      renderDailySchedule('mobile-daily-schedule');
      break;
    case 'weekly':
    case 'weekly-tasks':
      renderWeeklyTasks('mobile-weekly-tasks');
      break;
    case 'monthly':
    case 'monthly-tasks':
      renderMonthlyTasks('mobile-monthly-tasks');
      break;
    case 'manage':
    case 'manage-events':
      // Mobile manage page is already a static settings page
      renderSettings('mobile');
      break;
    case 'analytics':
      renderAnalytics('mobile-analytics-content');
      break;
    case 'yearly-goals':
      renderYearlyGoals('mobile-yearly-goals-content');
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
    case 'daily':
    case 'daily-schedule':
      renderDailySchedule('daily-schedule');
      break;
    case 'weekly':
    case 'weekly-tasks':
      renderWeeklyTasks('weekly-tasks');
      break;
    case 'monthly':
    case 'monthly-tasks':
      renderMonthlyTasks('monthly-tasks');
      break;
    case 'manage':
    case 'manage-events':
      renderSettings('desktop');
      break;
    case 'analytics':
      renderAnalytics('desktop-analytics-content');
      break;
    case 'yearly-goals':
      renderYearlyGoals('desktop-yearly-goals-content');
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
  const sidebar = document.getElementById('mobile-nav');
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const isOpen = sidebar.classList.contains('translate-x-0');
  
  if (isOpen) {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    backdrop.classList.remove('hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileDrawer() {
  const sidebar = document.getElementById('mobile-nav');
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  
  if (sidebar) {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
  }
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

// Enhanced Mobile Menu Functionality
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  
  if (mobileNav && backdrop) {
    const isOpen = !mobileNav.classList.contains('-translate-x-full');
    
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
}

function openMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  
  if (mobileNav && backdrop) {
    backdrop.classList.remove('hidden');
    mobileNav.classList.remove('-translate-x-full');
    
    // Add animation classes
    backdrop.style.opacity = '0';
    mobileNav.style.transform = 'translateX(-100%)';
    
    requestAnimationFrame(() => {
      backdrop.style.transition = 'opacity 0.3s ease';
      backdrop.style.opacity = '1';
      
      mobileNav.style.transition = 'transform 0.3s ease';
      mobileNav.style.transform = 'translateX(0)';
    });
  }
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  
  if (mobileNav && backdrop) {
    backdrop.style.opacity = '0';
    mobileNav.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
      backdrop.classList.add('hidden');
      mobileNav.classList.add('-translate-x-full');
    }, 300);
  }
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
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = 'Add New Event';
  }
}

// Handle event form submission
function handleEventFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
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
      // Preserve completion status when editing
      eventData.completed = events[index].completed;
      eventData.completedToday = events[index].completedToday;
      eventData.lastCompleted = events[index].lastCompleted;
      eventData.id = editingEventId;
      events[index] = eventData;
      showNotification('Event updated successfully!', 'success');
    }
  } else {
    // Add new event
    eventData.id = generateUniqueId();
    events.push(eventData);
    showNotification('Event added successfully!', 'success');
  }
  
  saveEvents();
  closeEventModal();
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

// Dashboard Functions
function updateDashboard() {
  // Update total tasks count
  const totalTasksElement = document.getElementById('total-tasks');
  if (totalTasksElement) {
    totalTasksElement.textContent = events.length;
  }

  // Update dashboard stats
  updateDashboardStats();

  // Update today's schedule overview
  renderTodaySchedule();

  // Update progress statistics
  updateProgressStats();
}

function updateDashboardStats() {
  const dailyTasks = events.filter(e => e.schedule === 'daily');
  const weeklyTasks = events.filter(e => e.schedule === 'weekly');
  const monthlyTasks = events.filter(e => e.schedule === 'monthly');
  
  const dailyCompleted = dailyTasks.filter(e => e.completedToday).length;
  const weeklyCompleted = weeklyTasks.filter(e => e.completed).length;
  const monthlyCompleted = monthlyTasks.filter(e => e.completed).length;
  
  // Update mobile stats
  const mobileDailyCompletedElement = document.getElementById('mobile-daily-completed');
  const mobileWeeklyCompletedElement = document.getElementById('mobile-weekly-completed');
  const mobileMonthlyCompletedElement = document.getElementById('mobile-monthly-completed');
  
  if (mobileDailyCompletedElement) {
    mobileDailyCompletedElement.textContent = dailyCompleted;
  }
  if (mobileWeeklyCompletedElement) {
    mobileWeeklyCompletedElement.textContent = weeklyCompleted;
  }
  if (mobileMonthlyCompletedElement) {
    mobileMonthlyCompletedElement.textContent = monthlyCompleted;
  }
  
  // Update desktop stats
  const totalEventsElement = document.getElementById('total-events');
  const dailyCompletedElement = document.getElementById('daily-completed-count');
  const weeklyCompletedElement = document.getElementById('weekly-completed-count');
  const monthlyCompletedElement = document.getElementById('monthly-completed-count');
  
  if (totalEventsElement) {
    totalEventsElement.textContent = events.length;
  }
  if (dailyCompletedElement) {
    dailyCompletedElement.textContent = `${dailyCompleted}/${dailyTasks.length}`;
  }
  if (weeklyCompletedElement) {
    weeklyCompletedElement.textContent = `${weeklyCompleted}/${weeklyTasks.length}`;
  }
  if (monthlyCompletedElement) {
    monthlyCompletedElement.textContent = `${monthlyCompleted}/${monthlyTasks.length}`;
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

// Update progress bar width using data-width attribute
function updateProgressBarWidth(element, percentage) {
  if (element) {
    element.setAttribute('data-width', percentage.toString());
    // Also update CSS custom property for browsers that support it
    element.style.setProperty('--progress-width', percentage + '%');
    // Fallback for older browsers
    element.style.width = percentage + '%';
  }
}

// Enhanced progress bar update function
function updateProgressBarDataWidth(id, completed, total) {
  const progressFill = document.getElementById(`${id}-bar`);
  const progressText = document.getElementById(`${id}-text`) || document.getElementById(`${id}`);
  
  if (progressFill) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    updateProgressBarWidth(progressFill, percentage);
    
    // Update text if element exists
    if (progressText) {
      progressText.textContent = `${completed}/${total} (${percentage}%)`;
    }
    
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

function renderDailySchedule(containerId = 'daily-schedule') {
  const dailyEvents = events.filter(e => e.schedule === 'daily').sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  
  if (dailyEvents.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <h3 class="text-lg font-medium mb-2">No daily tasks yet</h3>
        <p class="mb-4">Create your first daily task to get started!</p>
        <button onclick="openEventModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Add Daily Task
        </button>
      </div>
    `;
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

function renderWeeklyTasks(containerId = 'weekly-tasks') {
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  
  const weeklyEvents = events.filter(e => e.schedule === 'weekly');
  if (weeklyEvents.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <h3 class="text-lg font-medium mb-2">No weekly tasks yet</h3>
        <p class="mb-4">Create weekly tasks to organize your schedule!</p>
        <button onclick="openEventModal()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Add Weekly Task
        </button>
      </div>
    `;
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

function renderMonthlyTasks(containerId = 'monthly-tasks') {
  const weeks = ['first', 'second', 'third', 'fourth'];
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  
  const monthlyEvents = events.filter(e => e.schedule === 'monthly');
  if (monthlyEvents.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <h3 class="text-lg font-medium mb-2">No monthly tasks yet</h3>
        <p class="mb-4">Create monthly tasks for long-term planning!</p>
        <button onclick="openEventModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
          Add Monthly Task
        </button>
      </div>
    `;
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
  
  // Update dashboard stats
  updateDashboardStats();

  // Update today's schedule overview
  renderTodaySchedule();

  // Update progress statistics
  updateProgressStats();
}

// Render Analytics page
function renderAnalytics(containerId = null) {
  const container = containerId ? 
    document.getElementById(containerId) : 
    (document.getElementById('mobile-analytics-content') || document.getElementById('desktop-analytics-content'));
  if (!container) {
    return;
  }
  
  const dailyTasks = events.filter(e => e.schedule === 'daily');
  const weeklyTasks = events.filter(e => e.schedule === 'weekly');
  const monthlyTasks = events.filter(e => e.schedule === 'monthly');
  
  const dailyCompleted = dailyTasks.filter(e => e.completedToday).length;
  const weeklyCompleted = weeklyTasks.filter(e => e.completed).length;
  const monthlyCompleted = monthlyTasks.filter(e => e.completed).length;
  
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Task Completion</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Daily Tasks</span>
              <span>${dailyCompleted}/${dailyTasks.length}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${dailyTasks.length > 0 ? (dailyCompleted / dailyTasks.length) * 100 : 0}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Weekly Tasks</span>
              <span>${weeklyCompleted}/${weeklyTasks.length}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${weeklyTasks.length > 0 ? (weeklyCompleted / weeklyTasks.length) * 100 : 0}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Monthly Tasks</span>
              <span>${monthlyCompleted}/${monthlyTasks.length}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${monthlyTasks.length > 0 ? (monthlyCompleted / monthlyTasks.length) * 100 : 0}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Task Distribution</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-slate-600">Daily Tasks</span>
            <span class="font-medium text-slate-800">${dailyTasks.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Weekly Tasks</span>
            <span class="font-medium text-slate-800">${weeklyTasks.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">Monthly Tasks</span>
            <span class="font-medium text-slate-800">${monthlyTasks.length}</span>
          </div>
          <hr class="border-slate-200">
          <div class="flex justify-between font-semibold">
            <span class="text-slate-800">Total Tasks</span>
            <span class="text-slate-800">${events.length}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Yearly Goals page
function renderYearlyGoals(containerId = null) {
  const container = containerId ? 
    document.getElementById(containerId) : 
    (document.getElementById('mobile-yearly-goals-content') || document.getElementById('desktop-yearly-goals-content'));
  if (!container) {
    return;
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Yearly Goals</h3>
      <div class="text-center text-slate-500 py-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-lg mb-2">Set Your Yearly Goals</p>
        <p class="text-sm">Define long-term objectives and track your progress throughout the year.</p>
        <button class="mt-4 btn btn-primary" onclick="showNotification('Goals feature coming soon!', 'info')">
          Add Goal
        </button>
      </div>
    </div>
  `;
}

// Event Management Functions
function renderManageEvents(containerId = 'events-list') {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  
  if (events.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <h3 class="text-lg font-medium mb-2">No events yet</h3>
        <p class="mb-4">Create your first event to get started!</p>
        <button onclick="openEventModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Add Event
        </button>
      </div>
    `;
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
  
  container.innerHTML = sortedEvents.map(event => {
    const isCompleted = event.schedule === 'daily' ? event.completedToday : event.completed;
    
    return `
      <div class="event-item ${isCompleted ? 'completed' : ''}" data-id="${event.id}">
        <div class="event-checkbox-container">
          <input type="checkbox" 
                 class="event-checkbox" 
                 ${isCompleted ? 'checked' : ''} 
                 onchange="toggleTaskCompletion(${event.id})">
        </div>
        <div class="event-content">
          <div class="event-header">
            <h4 class="event-title">${escapeHTML(event.title)}</h4>
            <div class="event-meta">
              <span class="event-time">${escapeHTML(event.time)}</span>
              <span class="event-category category-${escapeHTML(event.category)}">${escapeHTML(event.category)}</span>
              <span class="event-schedule">${escapeHTML(event.schedule)}</span>
              ${event.day ? `<span class="event-day">${escapeHTML(event.day)}</span>` : ''}
              ${event.week ? `<span class="event-week">${escapeHTML(event.week)}</span>` : ''}
            </div>
          </div>
          ${event.description ? `<p class="event-description">${escapeHTML(event.description)}</p>` : ''}
        </div>
        <div class="event-actions">
          <button onclick="editEvent(${event.id})" class="btn-edit" title="Edit event">✏️</button>
          <button onclick="deleteEvent(${event.id})" class="btn-delete" title="Delete event">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Functions
function openEventModal(eventId = null) {
  const modal = document.getElementById('event-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  if (modal && backdrop) {
    editingEventId = eventId;
    
    if (eventId) {
      populateEventForm(eventId);
      document.getElementById('modal-title').textContent = 'Edit Event';
    } else {
      clearEventForm();
      document.getElementById('modal-title').textContent = 'Add New Event';
    }
    
    // Show modal with animation
    backdrop.classList.remove('hidden');
    backdrop.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(-20px) scale(0.95)';
    
    requestAnimationFrame(() => {
      backdrop.style.transition = 'opacity 0.3s ease';
      backdrop.style.opacity = '1';
      
      modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      modal.style.opacity = '1';
      modal.style.transform = 'translateY(0) scale(1)';
    });
  }
}

function closeEventModal() {
  const modal = document.getElementById('event-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  if (modal && backdrop) {
    backdrop.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(-20px) scale(0.95)';
    
    setTimeout(() => {
      backdrop.classList.add('hidden');
      editingEventId = null;
    }, 300);
  }
}

// Add task modal functions for the additional modal
function openAddTaskModal() {
  const modal = document.getElementById('add-task-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeAddTaskModal() {
  const modal = document.getElementById('add-task-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Reset form
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
}

// Data Export/Import Functions
function exportData() {
  const data = {
    events: events,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `schedulez-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Data exported successfully', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.events && Array.isArray(data.events)) {
        events = data.events.filter(event => event.id && event.title);
        saveEventsToStorage();
        loadDashboardContent();
        showNotification(`Imported ${events.length} events`, 'success');
      } else {
        showNotification('Invalid file format', 'error');
      }
    } catch (error) {
      showNotification('Error reading file', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function toggleNotifications(type, enabled) {
  const settings = JSON.parse(localStorage.getItem('schedulez-notifications') || '{}');
  settings[type] = enabled;
  localStorage.setItem('schedulez-notifications', JSON.stringify(settings));
  showNotification(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`, 'info');
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

// Theme Management Functions
function initializeTheme() {
  // Load saved theme preference
  const savedTheme = localStorage.getItem('schedulez-theme') || 'auto';
  setTheme(savedTheme);
  
  // Add event listeners for theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      const theme = this.getAttribute('data-theme');
      setTheme(theme);
    });
  });
}

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('schedulez-theme', theme);
  
  // Update theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('active');
    }
  });
  
  // Apply theme to document
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    // Auto theme - remove attribute to use CSS media query
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Trigger theme change event for any components that need to update
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  
  showNotification(`Theme changed to ${theme}`, 'success');
}

function getEffectiveTheme() {
  if (currentTheme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return currentTheme;
}

// Settings Management Functions
function resetDailyTasks() {
  if (confirm('Reset all daily tasks as incomplete?')) {
    events.forEach(event => {
      if (event.schedule === 'daily') {
        event.completedToday = false;
      }
    });
    saveEvents();
    updateDashboardStats();
    showNotification('Daily tasks reset', 'success');
  }
}

function confirmClearAllData() {
  const confirmation = prompt('Type "DELETE" to clear all data:');
  if (confirmation === 'DELETE') {    events = [];
    localStorage.clear();
    initializeDefaultEvents();
    loadDashboardContent();
    showNotification('All data cleared', 'success');
  }
}

// Make functions globally available
window.setTheme = setTheme;
window.resetDailyTasks = resetDailyTasks;
window.confirmClearAllData = confirmClearAllData;
window.exportData = exportData;
window.importData = importData;
window.toggleNotifications = toggleNotifications;

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
  const sidebar = document.getElementById('mobile-nav');
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
        sidebar.classList.contains('translate-x-0') && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      closeMobileDrawer();
    }
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('translate-x-0')) {
      closeMobileDrawer();
    }
  });
  
  // Handle resize events - close mobile nav if screen becomes large
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024 && sidebar && sidebar.classList.contains('translate-x-0')) {
      closeMobileDrawer();
    }
  });
}

// Utility Functions
function ensureDashboardVisible() {
  // Ensure dashboard is visible on initial load
  const currentViewMode = getCurrentViewMode();
  navigateToPage('dashboard', currentViewMode);
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

// Dashboard Content Loading
function loadDashboardContent() {
  try {
    updateDashboard();
    renderTodaySchedule();
    updateProgressStats();
  } catch (error) {
    showNotification('Dashboard loading failed: ' + error.message, 'error');
  }
}

// Main DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize app data first
    initializeAppData();
    
    // Initialize theme system
    initializeTheme();
    
    // Initialize the main app
    initializeApp();
    
    // Initialize navigation event listeners
    initializeNavigation();
    
    // Initialize mobile navigation
    initializeMobileNavigation();
    
    // Load dashboard content
    loadDashboardContent();
    
    // Ensure dashboard is visible by default
    ensureDashboardVisible();
    
    showNotification('✅ Schedulez loaded successfully!', 'success');
  } catch (error) {
    showNotification('Critical initialization error. Please refresh the page.', 'error');
  }
});

