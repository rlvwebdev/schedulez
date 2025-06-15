// Mobile-First Responsive Navigation Handler for Schedulez

class ResponsiveNavigationManager {
    constructor() {
        this.isMobile = window.innerWidth < 1024; // lg breakpoint
        this.currentPage = 'dashboard';
        this.mobileNavOpen = false;
        
        this.init();
    }

    init() {
        this.setupNavigationHandlers();
        this.setupResponsiveHandlers();
        this.setupModalHandlers();
        this.updateCurrentDate();
        
        // Prevent auto-opening modal on load
        this.closeEventModal();
    }

    setupNavigationHandlers() {
        // Mobile hamburger menu
        const mobileToggle = document.getElementById('mobile-nav-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileNav());
        }

        // Mobile navigation backdrop
        const backdrop = document.getElementById('mobile-nav-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeMobileNav());
        }

        // Mobile navigation links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page, 'mobile');
                this.closeMobileNav();
            });
        });

        // Bottom navigation links
        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page, 'mobile');
            });
        });

        // Desktop navigation links
        document.querySelectorAll('.desktop-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page, 'desktop');
            });
        });

        // Escape key to close mobile nav
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileNav();
                this.closeEventModal();
            }
        });
    }

    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth < 1024;
            
            if (wasMobile !== this.isMobile) {
                this.handleResponsiveChange();
            }
        });
    }

    setupModalHandlers() {
        // Event form submission
        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEventFormSubmission();
            });
        }

        // Schedule type change handler
        const scheduleSelect = document.getElementById('event-schedule');
        if (scheduleSelect) {
            scheduleSelect.addEventListener('change', () => {
                this.handleScheduleTypeChange();
            });
        }
    }

    toggleMobileNav() {
        this.mobileNavOpen = !this.mobileNavOpen;
        const nav = document.getElementById('mobile-nav');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        
        if (this.mobileNavOpen) {
            nav.classList.remove('-translate-x-full');
            nav.classList.add('translate-x-0');
            backdrop.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileNav();
        }
    }

    closeMobileNav() {
        this.mobileNavOpen = false;
        const nav = document.getElementById('mobile-nav');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        
        nav.classList.add('-translate-x-full');
        nav.classList.remove('translate-x-0');
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
    }

    navigateToPage(page, context = 'auto') {
        this.currentPage = page;
        
        // Update active states
        this.updateActiveNavigation(page, context);
        
        // Show appropriate content
        this.showPageContent(page, context);
        
        // Update page title and subtitle
        this.updatePageHeaders(page);
        
        // Load page-specific content
        this.loadPageContent(page);
    }

    updateActiveNavigation(page, context) {
        // Mobile navigation
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Bottom navigation
        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Desktop navigation
        document.querySelectorAll('.desktop-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
    }

    showPageContent(page, context) {
        if (context === 'auto') {
            context = this.isMobile ? 'mobile' : 'desktop';
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.add('hidden');
            pageEl.classList.remove('active');
        });

        // Show the appropriate page
        const pageSelector = context === 'mobile' ? `#mobile-${page}` : `#desktop-${page}`;
        const pageElement = document.querySelector(pageSelector);
        
        if (pageElement) {
            pageElement.classList.remove('hidden');
            pageElement.classList.add('active');
        } else {
            console.warn(`Page element not found: ${pageSelector}`);
            // Fallback to dashboard
            const fallbackSelector = context === 'mobile' ? '#mobile-dashboard' : '#desktop-dashboard';
            const fallbackElement = document.querySelector(fallbackSelector);
            if (fallbackElement) {
                fallbackElement.classList.remove('hidden');
                fallbackElement.classList.add('active');
            }
        }
    }

    updatePageHeaders(page) {
        const pageConfig = {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Welcome to your task management overview'
            },
            daily: {
                title: 'Daily Schedule',
                subtitle: 'Your complete daily routine'
            },
            weekly: {
                title: 'Weekly Tasks',
                subtitle: 'Organized by day of the week'
            },
            monthly: {
                title: 'Monthly Tasks',
                subtitle: 'Long-term maintenance and planning'
            },
            manage: {
                title: 'Manage Events',
                subtitle: 'Create, edit, and organize your schedule'
            },
            analytics: {
                title: 'Analytics',
                subtitle: 'Comprehensive insights into your productivity'
            },
            'yearly-goals': {
                title: 'Yearly Goals',
                subtitle: 'Set and track your long-term objectives'
            }
        };

        const config = pageConfig[page] || pageConfig.dashboard;
        
        // Update desktop headers
        const desktopTitle = document.getElementById('desktop-page-title');
        const desktopSubtitle = document.getElementById('desktop-page-subtitle');
        
        if (desktopTitle) desktopTitle.textContent = config.title;
        if (desktopSubtitle) desktopSubtitle.textContent = config.subtitle;
    }

    loadPageContent(page) {
        // Load content based on the page
        switch (page) {
            case 'dashboard':
                this.loadDashboardContent();
                break;
            case 'daily':
                this.loadDailyContent();
                break;
            case 'weekly':
                this.loadWeeklyContent();
                break;
            case 'monthly':
                this.loadMonthlyContent();
                break;
            case 'manage':
                this.loadManageContent();
                break;
            case 'analytics':
                this.loadAnalyticsContent();
                break;
            case 'yearly-goals':
                this.loadYearlyGoalsContent();
                break;
        }
    }

    loadDashboardContent() {
        // Load today's tasks and progress
        this.updateProgressStats();
        this.loadTodaysTasks();
    }

    loadDailyContent() {
        // Load daily schedule
        if (typeof renderDailySchedule === 'function') {
            renderDailySchedule();
        }
    }

    loadWeeklyContent() {
        // Load weekly tasks
        if (typeof renderWeeklyTasks === 'function') {
            renderWeeklyTasks();
        }
    }

    loadMonthlyContent() {
        // Load monthly tasks
        if (typeof renderMonthlyTasks === 'function') {
            renderMonthlyTasks();
        }
    }

    loadManageContent() {
        // Load manage events content
        if (typeof renderManageEvents === 'function') {
            renderManageEvents();
        }
    }

    loadAnalyticsContent() {
        // Load analytics content
        if (typeof renderAnalytics === 'function') {
            renderAnalytics();
        }
    }

    loadYearlyGoalsContent() {
        // Load yearly goals content
        if (typeof renderYearlyGoals === 'function') {
            renderYearlyGoals();
        }
    }

    updateProgressStats() {
        // Update progress statistics for both mobile and desktop
        const events = this.loadEvents();
        const stats = this.calculateStats(events);
        
        // Update mobile stats
        this.updateMobileStats(stats);
        
        // Update desktop stats
        this.updateDesktopStats(stats);
        
        // Update progress bars
        this.updateProgressBars(stats);
    }

    calculateStats(events) {
        const today = new Date().toISOString().split('T')[0];
        const dailyEvents = events.filter(e => e.schedule === 'daily');
        const weeklyEvents = events.filter(e => e.schedule === 'weekly');
        const monthlyEvents = events.filter(e => e.schedule === 'monthly');
        
        return {
            total: events.length,
            daily: {
                total: dailyEvents.length,
                completed: dailyEvents.filter(e => e.completed && e.completedDate === today).length
            },
            weekly: {
                total: weeklyEvents.length,
                completed: weeklyEvents.filter(e => e.completed).length
            },
            monthly: {
                total: monthlyEvents.length,
                completed: monthlyEvents.filter(e => e.completed).length
            }
        };
    }

    updateMobileStats(stats) {
        const totalTasksEl = document.getElementById('mobile-total-tasks');
        const completedTodayEl = document.getElementById('mobile-completed-today');
        const dailyProgressEl = document.getElementById('mobile-daily-progress');
        const weeklyProgressEl = document.getElementById('mobile-weekly-progress');
        
        if (totalTasksEl) totalTasksEl.textContent = stats.total;
        if (completedTodayEl) completedTodayEl.textContent = stats.daily.completed;
        
        const dailyPercent = stats.daily.total > 0 ? Math.round((stats.daily.completed / stats.daily.total) * 100) : 0;
        const weeklyPercent = stats.weekly.total > 0 ? Math.round((stats.weekly.completed / stats.weekly.total) * 100) : 0;
        
        if (dailyProgressEl) dailyProgressEl.textContent = `${dailyPercent}%`;
        if (weeklyProgressEl) weeklyProgressEl.textContent = `${weeklyPercent}%`;
        
        // Update mobile progress bars
        const dailyBarEl = document.getElementById('mobile-daily-progress-bar');
        const weeklyBarEl = document.getElementById('mobile-weekly-progress-bar');
        
        if (dailyBarEl) dailyBarEl.style.width = `${dailyPercent}%`;
        if (weeklyBarEl) weeklyBarEl.style.width = `${weeklyPercent}%`;
    }

    updateDesktopStats(stats) {
        const totalTasksEl = document.getElementById('desktop-total-tasks');
        const completedTodayEl = document.getElementById('desktop-completed-today');
        const weeklyProgressEl = document.getElementById('desktop-weekly-progress');
        const monthlyProgressEl = document.getElementById('desktop-monthly-progress');
        
        if (totalTasksEl) totalTasksEl.textContent = stats.total;
        if (completedTodayEl) completedTodayEl.textContent = stats.daily.completed;
        
        const weeklyPercent = stats.weekly.total > 0 ? Math.round((stats.weekly.completed / stats.weekly.total) * 100) : 0;
        const monthlyPercent = stats.monthly.total > 0 ? Math.round((stats.monthly.completed / stats.monthly.total) * 100) : 0;
        
        if (weeklyProgressEl) weeklyProgressEl.textContent = `${weeklyPercent}%`;
        if (monthlyProgressEl) monthlyProgressEl.textContent = `${monthlyPercent}%`;
    }

    updateProgressBars(stats) {
        const dailyPercent = stats.daily.total > 0 ? (stats.daily.completed / stats.daily.total) * 100 : 0;
        const weeklyPercent = stats.weekly.total > 0 ? (stats.weekly.completed / stats.weekly.total) * 100 : 0;
        const monthlyPercent = stats.monthly.total > 0 ? (stats.monthly.completed / stats.monthly.total) * 100 : 0;
        
        // Desktop progress bars
        const desktopDailyBar = document.getElementById('desktop-daily-progress-bar');
        const desktopWeeklyBar = document.getElementById('desktop-weekly-progress-bar');
        const desktopMonthlyBar = document.getElementById('desktop-monthly-progress-bar');
        
        const desktopDailyText = document.getElementById('desktop-daily-progress-text');
        const desktopWeeklyText = document.getElementById('desktop-weekly-progress-text');
        const desktopMonthlyText = document.getElementById('desktop-monthly-progress-text');
        
        if (desktopDailyBar) desktopDailyBar.style.width = `${dailyPercent}%`;
        if (desktopWeeklyBar) desktopWeeklyBar.style.width = `${weeklyPercent}%`;
        if (desktopMonthlyBar) desktopMonthlyBar.style.width = `${monthlyPercent}%`;
        
        if (desktopDailyText) desktopDailyText.textContent = `${stats.daily.completed}/${stats.daily.total} (${Math.round(dailyPercent)}%)`;
        if (desktopWeeklyText) desktopWeeklyText.textContent = `${stats.weekly.completed}/${stats.weekly.total} (${Math.round(weeklyPercent)}%)`;
        if (desktopMonthlyText) desktopMonthlyText.textContent = `${stats.monthly.completed}/${stats.monthly.total} (${Math.round(monthlyPercent)}%)`;
    }

    loadTodaysTasks() {
        const events = this.loadEvents();
        const todayEvents = events.filter(e => e.schedule === 'daily').slice(0, 5); // Show first 5 tasks
        
        // Mobile today's tasks
        const mobileContainer = document.getElementById('mobile-today-tasks');
        if (mobileContainer) {
            mobileContainer.innerHTML = this.renderTaskList(todayEvents, true);
        }
        
        // Desktop today's schedule
        const desktopContainer = document.getElementById('desktop-today-schedule');
        if (desktopContainer) {
            desktopContainer.innerHTML = this.renderTaskList(todayEvents, false);
        }
    }

    renderTaskList(tasks, compact = false) {
        if (tasks.length === 0) {
            return '<p class="text-slate-500 text-center py-4">No tasks for today</p>';
        }
        
        return tasks.map(task => {
            const isCompleted = task.completed && task.completedDate === new Date().toISOString().split('T')[0];
            const compactClass = compact ? 'py-2' : 'py-3';
            
            return `
                <div class="task-item ${compactClass} ${isCompleted ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} 
                           onchange="toggleTaskCompletion('${task.id}')">
                    <div class="task-time">${this.formatTime(task.time)}</div>
                    <div class="task-title ${isCompleted ? 'completed' : ''}">${this.escapeHTML(task.title)}</div>
                    <span class="task-category ${task.category}">${task.category}</span>
                </div>
            `;
        }).join('');
    }

    handleResponsiveChange() {
        // Handle responsive layout changes
        this.closeMobileNav();
        this.navigateToPage(this.currentPage);
    }

    openEventModal(eventId = null) {
        const modal = document.getElementById('event-modal');
        const title = document.getElementById('modal-title');
        
        if (modal) {
            modal.classList.remove('hidden');
            title.textContent = eventId ? 'Edit Event' : 'Add New Event';
            document.body.style.overflow = 'hidden';
            
            if (eventId) {
                this.loadEventIntoForm(eventId);
            } else {
                this.resetEventForm();
            }
        }
    }

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.resetEventForm();
        }
    }

    handleEventFormSubmission() {
        // Get form data
        const formData = new FormData(document.getElementById('event-form'));
        const eventData = Object.fromEntries(formData.entries());
        
        // Validate and save event
        if (this.validateEventData(eventData)) {
            this.saveEvent(eventData);
            this.closeEventModal();
            this.updateProgressStats();
            this.loadPageContent(this.currentPage);
        }
    }

    handleScheduleTypeChange() {
        const scheduleType = document.getElementById('event-schedule').value;
        const weeklyGroup = document.getElementById('weekly-day-group');
        const monthlyGroup = document.getElementById('monthly-week-group');
        
        if (weeklyGroup && monthlyGroup) {
            weeklyGroup.classList.toggle('hidden', scheduleType !== 'weekly');
            monthlyGroup.classList.toggle('hidden', scheduleType !== 'monthly');
        }
    }

    resetEventForm() {
        const form = document.getElementById('event-form');
        if (form) {
            form.reset();
            this.handleScheduleTypeChange();
        }
    }

    updateCurrentDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const today = new Date();
            dateEl.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Utility methods
    loadEvents() {
        try {
            return JSON.parse(localStorage.getItem('schedulez_events') || '[]');
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    }

    saveEvent(eventData) {
        const events = this.loadEvents();
        const newEvent = {
            id: Date.now().toString(),
            ...eventData,
            completed: false,
            completedDate: null
        };
        
        events.push(newEvent);
        localStorage.setItem('schedulez_events', JSON.stringify(events));
    }

    validateEventData(eventData) {
        return eventData.title && eventData.time && eventData.category && eventData.schedule;
    }

    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for compatibility
function openEventModal(eventId = null) {
    if (window.responsiveNav) {
        window.responsiveNav.openEventModal(eventId);
    }
}

function closeEventModal() {
    if (window.responsiveNav) {
        window.responsiveNav.closeEventModal();
    }
}

function toggleTaskCompletion(taskId) {
    const events = JSON.parse(localStorage.getItem('schedulez_events') || '[]');
    const event = events.find(e => e.id === taskId);
    
    if (event) {
        const today = new Date().toISOString().split('T')[0];
        
        if (event.completed && event.completedDate === today) {
            event.completed = false;
            event.completedDate = null;
        } else {
            event.completed = true;
            event.completedDate = today;
        }
        
        localStorage.setItem('schedulez_events', JSON.stringify(events));
        
        if (window.responsiveNav) {
            window.responsiveNav.updateProgressStats();
            window.responsiveNav.loadPageContent(window.responsiveNav.currentPage);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.responsiveNav = new ResponsiveNavigationManager();
});
