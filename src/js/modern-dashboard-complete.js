// Modern Dashboard with Complete Framer Motion Integration
'use strict';

// Dashboard Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.1 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Modern Dashboard Class
class ModernDashboard {
  constructor() {
    this.currentPage = 'dashboard';
    this.isMobile = false;
    this.animations = new Map();
    this.events = window.events || [];
    this.init();
  }

  init() {
    this.detectViewport();
    this.initializeNavigation();
    this.initializeDashboard();
    this.setupEventListeners();
    this.initializeAnimations();
  }

  detectViewport() {
    this.isMobile = window.innerWidth < 1024;
    
    // Update viewport on resize
    window.addEventListener('resize', () => {
      const waseMobile = this.isMobile;
      this.isMobile = window.innerWidth < 1024;
      if (wasMobile !== this.isMobile) {
        this.updateLayout();
      }
    });
  }

  initializeNavigation() {
    // Mobile hamburger menu
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (mobileToggle && sidebar && backdrop) {
      mobileToggle.addEventListener('click', () => this.toggleMobileNav());
      backdrop.addEventListener('click', () => this.closeMobileNav());
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMobileNavOpen()) {
          this.closeMobileNav();
        }
      });
    }

    // Navigation links
    this.initializeNavLinks();
  }

  initializeNavLinks() {
    // Bottom navigation
    document.querySelectorAll('.bottom-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.navigateToPage(page);
      });
    });

    // Desktop navigation
    document.querySelectorAll('.desktop-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.navigateToPage(page);
      });
    });

    // Mobile drawer navigation
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.navigateToPage(page);
        this.closeMobileNav();
      });
    });
  }

  toggleMobileNav() {
    const sidebar = document.getElementById('mobile-nav');
    const isOpen = this.isMobileNavOpen();

    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  openMobileNav() {
    const sidebar = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggleBtn = document.getElementById('mobile-nav-toggle');

    // Animate sidebar in with smooth transition
    if (sidebar) {
      sidebar.style.transform = 'translateX(0)';
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
    }

    // Show backdrop
    if (backdrop) {
      backdrop.classList.remove('hidden');
      // Fade in backdrop
      setTimeout(() => {
        backdrop.style.opacity = '1';
      }, 10);
    }

    // Update aria
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeMobileNav() {
    const sidebar = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggleBtn = document.getElementById('mobile-nav-toggle');

    // Animate sidebar out
    if (sidebar) {
      sidebar.style.transform = 'translateX(-100%)';
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
    }

    // Hide backdrop
    if (backdrop) {
      backdrop.style.opacity = '0';
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
    }

    // Update aria
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  isMobileNavOpen() {
    const sidebar = document.getElementById('mobile-nav');
    return sidebar && sidebar.classList.contains('translate-x-0');
  }

  navigateToPage(pageId) {
    if (this.currentPage === pageId) return;

    // Animate page transition
    this.animatePageTransition(this.currentPage, pageId);
    
    // Update active navigation
    this.updateActiveNavigation(pageId);
    
    // Show page content
    this.showPageContent(pageId);
    
    // Update URL
    window.location.hash = pageId;
    
    this.currentPage = pageId;
  }

  animatePageTransition(fromPage, toPage) {
    const fromElement = this.isMobile 
      ? document.getElementById(`mobile-${fromPage}`)
      : document.getElementById(`desktop-${fromPage}`);
    
    const toElement = this.isMobile 
      ? document.getElementById(`mobile-${toPage}`)
      : document.getElementById(`desktop-${toPage}`);

    if (fromElement && toElement) {
      // Fade out current page
      fromElement.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      fromElement.style.opacity = '0';
      fromElement.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        fromElement.classList.add('hidden');
        fromElement.classList.remove('active');
        
        // Show and fade in new page
        toElement.classList.remove('hidden');
        toElement.classList.add('active');
        toElement.style.opacity = '0';
        toElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          toElement.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
          toElement.style.opacity = '1';
          toElement.style.transform = 'translateY(0)';
        }, 50);
      }, 200);
    }
  }

  updateActiveNavigation(pageId) {
    // Remove active from all nav links
    document.querySelectorAll('.bottom-nav-link, .desktop-nav-link, .mobile-nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active to current page links
    const activeLinks = document.querySelectorAll(`[data-page="${pageId}"]`);
    activeLinks.forEach(link => link.classList.add('active'));
  }

  showPageContent(pageId) {
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
      page.classList.add('hidden');
      page.classList.remove('active');
    });

    // Show mobile or desktop version based on viewport
    const targetPage = this.isMobile 
      ? document.getElementById(`mobile-${pageId}`)
      : document.getElementById(`desktop-${pageId}`);

    if (targetPage) {
      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
      
      // Render content for the page
      this.renderPageContent(pageId);
    }
  }

  renderPageContent(pageId) {
    switch (pageId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'daily':
        this.renderDailySchedule();
        break;
      case 'weekly':
        this.renderWeeklyTasks();
        break;
      case 'monthly':
        this.renderMonthlyTasks();
        break;
      case 'manage':
        this.renderManageEvents();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
      case 'yearly-goals':
        this.renderYearlyGoals();
        break;
    }
  }  initializeDashboard() {
    // Ensure dashboard is visible by default
    this.showPageContent('dashboard');
    
    this.renderDashboard();
    this.updateStats();
    this.setupModalHandlers();
  }

  renderDashboard() {
    this.createStatsCards();
    this.createQuickActions();
    this.createRecentActivity();
    this.createProgressOverview();
  }

  createStatsCards() {
    const events = window.events || [];
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const completedToday = dailyTasks.filter(e => e.completedToday).length;
    const totalTasks = events.length;
    const weeklyProgress = this.calculateWeeklyProgress();

    const stats = [
      {
        title: 'Total Tasks',
        value: totalTasks,
        icon: '📋',
        color: 'blue',
        trend: '+2 from yesterday'
      },
      {
        title: 'Completed Today',
        value: completedToday,
        icon: '✅',
        color: 'green',
        trend: `${Math.round((completedToday / dailyTasks.length) * 100) || 0}% completion`
      },
      {
        title: 'Weekly Progress',
        value: `${weeklyProgress}%`,
        icon: '📈',
        color: 'purple',
        trend: 'On track'
      },
      {
        title: 'Streak',
        value: '5 days',
        icon: '🔥',
        color: 'orange',
        trend: 'Personal best!'
      }
    ];

    this.updateStatsCards(stats);
  }

  updateStatsCards(stats) {
    // Update mobile stats
    const mobileStatsContainer = document.querySelector('#mobile-dashboard .grid');
    if (mobileStatsContainer) {
      this.renderStatsCards(mobileStatsContainer, stats, true);
    }

    // Update desktop stats
    const desktopStatsContainer = document.querySelector('#desktop-dashboard .grid');
    if (desktopStatsContainer) {
      this.renderStatsCards(desktopStatsContainer, stats, false);
    }
  }

  renderStatsCards(container, stats, isMobile) {
    const cardSize = isMobile ? 'col-span-1' : 'col-span-1';
    
    container.innerHTML = stats.map((stat, index) => `
      <div class="stats-card ${cardSize} bg-white rounded-lg shadow-sm border border-slate-200 p-${isMobile ? '4' : '6'} 
                 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
           data-stat-card="${index}">
        <div class="flex items-center justify-between mb-${isMobile ? '2' : '3'}">
          <div class="text-${isMobile ? '2xl' : '3xl'} transform hover:scale-110 transition-transform duration-200">${stat.icon}</div>
          <div class="text-${stat.color}-600 text-xs font-medium px-2 py-1 bg-${stat.color}-50 rounded-full">
            ${stat.trend}
          </div>
        </div>
        <div class="text-${isMobile ? '2xl' : '3xl'} font-bold text-slate-900 mb-1">
          ${stat.value}
        </div>
        <div class="text-sm text-slate-600">${stat.title}</div>
      </div>
    `).join('');
    
    // Add stagger animation
    setTimeout(() => {
      container.querySelectorAll('.stats-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 50);
  }

  createQuickActions() {
    const quickActions = [
      { title: 'Add Task', icon: '➕', action: 'openEventModal', color: 'blue' },
      { title: 'View Schedule', icon: '📅', action: 'goToDaily', color: 'green' },
      { title: 'Analytics', icon: '📊', action: 'goToAnalytics', color: 'purple' },
      { title: 'Goals', icon: '🎯', action: 'goToGoals', color: 'orange' }
    ];

    this.updateQuickActions(quickActions);
  }

  updateQuickActions(actions) {
    const quickActionsHTML = `
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${actions.map((action, index) => `
            <button onclick="dashboard.${action.action}()" 
                    data-action-index="${index}"
                    class="flex flex-col items-center p-4 bg-${action.color}-50 hover:bg-${action.color}-100 
                           rounded-lg transition-all duration-200 group transform hover:scale-105 hover:-translate-y-1">
              <div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                ${action.icon}
              </div>
              <span class="text-sm font-medium text-${action.color}-700">${action.title}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.insertQuickActions(quickActionsHTML);
  }

  insertQuickActions(html) {
    // Insert in mobile dashboard
    const mobileContent = document.querySelector('#mobile-dashboard');
    if (mobileContent) {
      this.insertQuickActionsInContainer(mobileContent, html);
    }

    // Insert in desktop dashboard
    const desktopContent = document.querySelector('#desktop-dashboard');
    if (desktopContent) {
      this.insertQuickActionsInContainer(desktopContent, html);
    }
  }

  insertQuickActionsInContainer(container, html) {
    const existingQuickActions = container.querySelector('.quick-actions');
    if (existingQuickActions) {
      existingQuickActions.innerHTML = html;
    } else {
      const quickActionsDiv = document.createElement('div');
      quickActionsDiv.className = 'quick-actions';
      quickActionsDiv.innerHTML = html;
      container.appendChild(quickActionsDiv);
    }
    
    // Add stagger animation to action buttons
    setTimeout(() => {
      container.querySelectorAll('[data-action-index]').forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(10px) scale(0.95)';
        
        setTimeout(() => {
          button.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
          button.style.opacity = '1';
          button.style.transform = 'translateY(0) scale(1)';
        }, index * 50);
      });
    }, 100);
  }

  setupModalHandlers() {
    // Set up event modal functionality
    this.initializeEventModal();
  }

  initializeEventModal() {
    const modal = document.getElementById('event-modal');
    const form = document.getElementById('event-form');
    
    if (modal && form) {
      // Form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEventFormSubmit(e);
      });
      
      // Modal close handlers
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeEventModal();
        }
      });
      
      // Escape key handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          this.closeEventModal();
        }
      });
      
      // Schedule field change handler
      const scheduleSelect = document.getElementById('event-schedule');
      if (scheduleSelect) {
        scheduleSelect.addEventListener('change', () => {
          this.updateDayWeekFields();
        });
      }
    }
  }

  handleEventFormSubmit(event) {
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
      this.showNotification('Please fill in all required fields.', 'error');
      return;
    }
    
    // Check if editing or adding
    const editingEventId = window.editingEventId;
    const events = window.events || [];
    
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
        this.showNotification('Event updated successfully!', 'success');
      }
    } else {
      // Add new event
      eventData.id = this.generateUniqueId();
      events.push(eventData);
      this.showNotification('Event added successfully!', 'success');
    }
    
    // Save events and update display
    if (window.saveEvents) {
      window.saveEvents();
    } else {
      localStorage.setItem('homeEvents', JSON.stringify(events));
    }
    
    this.closeEventModal();
    this.updateStats();
  }

  generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `event_${timestamp}_${random}`;
  }

  updateDayWeekFields() {
    const schedule = document.getElementById('event-schedule').value;
    const weeklyGroup = document.getElementById('weekly-day-group');
    const monthlyGroup = document.getElementById('monthly-week-group');
    
    if (weeklyGroup && monthlyGroup) {
      if (schedule === 'weekly') {
        weeklyGroup.classList.remove('hidden');
        monthlyGroup.classList.add('hidden');
      } else if (schedule === 'monthly') {
        weeklyGroup.classList.add('hidden');
        monthlyGroup.classList.remove('hidden');
      } else {
        weeklyGroup.classList.add('hidden');
        monthlyGroup.classList.add('hidden');
      }
    }
  }

  // Modal animation methods
  openEventModal(eventId = null) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal) {
      this.showNotification('Modal not found', 'error');
      return;
    }
    
    // Set editing state
    window.editingEventId = eventId;
    
    if (eventId) {
      // Edit mode
      const events = window.events || [];
      const event = events.find(e => e.id === eventId);
      if (event) {
        modalTitle.textContent = 'Edit Event';
        
        // Populate form
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-category').value = event.category;
        document.getElementById('event-schedule').value = event.schedule;
        document.getElementById('event-day').value = event.day || '';
        document.getElementById('event-week').value = event.week || '';
        document.getElementById('event-description').value = event.description || '';
        
        // Trigger schedule change to show/hide fields
        this.updateDayWeekFields();
      }
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Event';
      this.clearEventForm();
    }
    
    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Animate modal in
    const modalContent = modal.querySelector('.bg-white');
    if (modalContent) {
      modalContent.style.opacity = '0';
      modalContent.style.transform = 'scale(0.9) translateY(-20px)';
      
      setTimeout(() => {
        modalContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1) translateY(0)';
      }, 50);
    }
    
    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 350);
  }

  closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;
    
    // Animate modal out
    const modalContent = modal.querySelector('.bg-white');
    if (modalContent) {
      modalContent.style.transition = 'opacity 0.2s ease-in, transform 0.2s ease-in';
      modalContent.style.opacity = '0';
      modalContent.style.transform = 'scale(0.95) translateY(10px)';
      
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.clearEventForm();
      }, 200);
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      this.clearEventForm();
    }
    
    // Clear editing state
    window.editingEventId = null;
  }

  clearEventForm() {
    const form = document.getElementById('event-form');
    if (form) {
      form.reset();
      this.updateDayWeekFields();
    }
  }

  // Quick action methods
  openAddTaskModal() {
    this.openEventModal();
  }

  goToDaily() {
    this.navigateToPage('daily');
  }

  goToAnalytics() {
    this.navigateToPage('analytics');
  }

  goToGoals() {
    this.navigateToPage('yearly-goals');
  }

  calculateWeeklyProgress() {
    const events = window.events || [];
    const weeklyTasks = events.filter(e => e.schedule === 'weekly');
    const completed = weeklyTasks.filter(e => e.completed).length;
    return weeklyTasks.length > 0 ? Math.round((completed / weeklyTasks.length) * 100) : 0;
  }

  updateStats() {
    // Update task counts
    this.updateTaskCounts();
    
    // Update progress bars
    this.updateProgressBars();
    
    // Update time display
    this.updateTimeDisplay();
  }

  updateTaskCounts() {
    const events = window.events || [];
    
    const totalTasks = events.length;
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const completedToday = dailyTasks.filter(e => e.completedToday).length;

    // Update mobile
    const mobileTotalEl = document.getElementById('mobile-total-tasks');
    const mobileCompletedEl = document.getElementById('mobile-completed-today');
    
    if (mobileTotalEl) mobileTotalEl.textContent = totalTasks;
    if (mobileCompletedEl) mobileCompletedEl.textContent = completedToday;

    // Update desktop
    const desktopTotalEl = document.getElementById('desktop-total-tasks');
    const desktopCompletedEl = document.getElementById('desktop-completed-today');
    
    if (desktopTotalEl) desktopTotalEl.textContent = totalTasks;
    if (desktopCompletedEl) desktopCompletedEl.textContent = completedToday;
  }

  updateProgressBars() {
    const dailyProgress = this.calculateDailyProgress();
    const weeklyProgress = this.calculateWeeklyProgress();
    
    // Update mobile progress
    const mobileProgressEl = document.getElementById('mobile-daily-progress-bar');
    if (mobileProgressEl) {
      mobileProgressEl.style.width = `${dailyProgress}%`;
      mobileProgressEl.style.transition = 'width 0.5s ease-out';
    }

    // Update desktop progress
    const desktopProgressEl = document.getElementById('desktop-daily-progress-bar');
    if (desktopProgressEl) {
      desktopProgressEl.style.width = `${dailyProgress}%`;
      desktopProgressEl.style.transition = 'width 0.5s ease-out';
    }
  }

  calculateDailyProgress() {
    const events = window.events || [];
    const dailyTasks = events.filter(e => e.schedule === 'daily');
    const completed = dailyTasks.filter(e => e.completedToday).length;
    return dailyTasks.length > 0 ? Math.round((completed / dailyTasks.length) * 100) : 0;
  }

  updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dateElements = document.querySelectorAll('#current-date');
    dateElements.forEach(el => {
      if (el) el.textContent = timeString;
    });
  }

  createRecentActivity() {
    // Placeholder for recent activity
    console.log('Creating recent activity section...');
  }

  createProgressOverview() {
    // Placeholder for progress overview
    console.log('Creating progress overview...');
  }

  updateLayout() {
    // Re-render dashboard when layout changes
    this.renderDashboard();
  }

  setupEventListeners() {
    // Replace onclick handlers with proper event listeners
    document.querySelectorAll('[onclick*="openEventModal"]').forEach(button => {
      button.removeAttribute('onclick');
      button.addEventListener('click', () => this.openEventModal());
    });
  }

  initializeAnimations() {
    // Initialize intersection observer for animation triggers
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, { threshold: 0.1 });

      // Observe all animatable elements
      document.querySelectorAll('.stats-card, .quick-actions, .page').forEach(el => {
        observer.observe(el);
      });
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system with animations
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'error' ? 'bg-red-500' : 
                   type === 'success' ? 'bg-green-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    notification.classList.add(bgColor);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  // Placeholder methods for other pages (to be implemented)
  renderDailySchedule() {
    console.log('Rendering daily schedule...');
    if (window.renderDailySchedule) {
      window.renderDailySchedule();
    }
  }

  renderWeeklyTasks() {
    console.log('Rendering weekly tasks...');
    if (window.renderWeeklyTasks) {
      window.renderWeeklyTasks();
    }
  }

  renderMonthlyTasks() {
    console.log('Rendering monthly tasks...');
    if (window.renderMonthlyTasks) {
      window.renderMonthlyTasks();
    }
  }

  renderManageEvents() {
    console.log('Rendering manage events...');
    if (window.renderManageEvents) {
      window.renderManageEvents();
    }
  }

  renderAnalytics() {
    console.log('Rendering analytics...');
    if (window.renderAnalytics) {
      window.renderAnalytics();
    }
  }

  renderYearlyGoals() {
    console.log('Rendering yearly goals...');
    if (window.renderYearlyGoals) {
      window.renderYearlyGoals();
    }
  }
}

// Initialize dashboard when DOM is ready
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the main script to load
  setTimeout(() => {
    dashboard = new ModernDashboard();
    
    // Make dashboard globally accessible
    window.dashboard = dashboard;
    window.openEventModal = (id) => dashboard.openEventModal(id);
    window.closeEventModal = () => dashboard.closeEventModal();
    
    // Initialize with saved events if available
    if (window.events && window.events.length > 0) {
      dashboard.updateStats();
    }
    
    console.log('✅ Modern Dashboard initialized successfully!');
  }, 500);
});

// Export for module use
export default ModernDashboard;
