// Modern Dashboard with Framer Motion Integration
// Import Framer Motion from CDN
import { motion, AnimatePresence } from 'https://esm.sh/framer-motion@11.0.0';

// Dashboard Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, y: -2 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Modern Dashboard Class
class ModernDashboard {
  constructor() {
    this.currentPage = 'dashboard';
    this.isMobile = false;
    this.animations = new Map();
    this.init();
  }

  init() {
    this.detectViewport();
    this.initializeNavigation();
    this.initializeDashboard();
    this.setupEventListeners();
  }

  detectViewport() {
    this.isMobile = window.innerWidth < 1024;
    
    // Update viewport on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
      this.updateLayout();
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
    const backdrop = document.getElementById('mobile-nav-backdrop');
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

    // Animate sidebar in
    if (sidebar) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
    }

    // Show backdrop
    if (backdrop) {
      backdrop.classList.remove('hidden');
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
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
    }

    // Hide backdrop
    if (backdrop) {
      backdrop.classList.add('hidden');
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

    // Update active navigation
    this.updateActiveNavigation(pageId);
    
    // Show page content
    this.showPageContent(pageId);
    
    // Update URL
    window.location.hash = pageId;
    
    this.currentPage = pageId;
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
  }

  initializeDashboard() {
    this.renderDashboard();
    this.updateStats();
  }

  renderDashboard() {
    this.createStatsCards();
    this.createQuickActions();
    this.createRecentActivity();
    this.createProgressOverview();
  }

  createStatsCards() {
    const dailyTasks = window.events ? window.events.filter(e => e.schedule === 'daily') : [];
    const completedToday = dailyTasks.filter(e => e.completedToday).length;
    const totalTasks = window.events ? window.events.length : 0;
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
                 hover:shadow-md transition-all duration-200 cursor-pointer"
           data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="flex items-center justify-between mb-${isMobile ? '2' : '3'}">
          <div class="text-${isMobile ? '2xl' : '3xl'}">${stat.icon}</div>
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
  }

  createQuickActions() {
    const quickActions = [
      { title: 'Add Task', icon: '➕', action: 'openAddTaskModal', color: 'blue' },
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
          ${actions.map(action => `
            <button onclick="dashboard.${action.action}()" 
                    class="flex flex-col items-center p-4 bg-${action.color}-50 hover:bg-${action.color}-100 
                           rounded-lg transition-colors duration-200 group">
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
      const existingQuickActions = mobileContent.querySelector('.quick-actions');
      if (existingQuickActions) {
        existingQuickActions.innerHTML = html;
      } else {
        const quickActionsDiv = document.createElement('div');
        quickActionsDiv.className = 'quick-actions';
        quickActionsDiv.innerHTML = html;
        mobileContent.appendChild(quickActionsDiv);
      }
    }

    // Insert in desktop dashboard
    const desktopContent = document.querySelector('#desktop-dashboard');
    if (desktopContent) {
      const existingQuickActions = desktopContent.querySelector('.quick-actions');
      if (existingQuickActions) {
        existingQuickActions.innerHTML = html;
      } else {
        const quickActionsDiv = document.createElement('div');
        quickActionsDiv.className = 'quick-actions';
        quickActionsDiv.innerHTML = html;
        desktopContent.appendChild(quickActionsDiv);
      }
    }
  }

  // Quick action methods
  openAddTaskModal() {
    this.navigateToPage('manage');
    this.showNotification('Navigate to Manage Events to add new tasks', 'info');
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
    if (!window.events) return 0;
    const weeklyTasks = window.events.filter(e => e.schedule === 'weekly');
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
    if (!window.events) return;
    
    const totalTasks = window.events.length;
    const dailyTasks = window.events.filter(e => e.schedule === 'daily');
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
    // Implementation for progress bars
    const dailyProgress = this.calculateDailyProgress();
    const weeklyProgress = this.calculateWeeklyProgress();
    
    // Update mobile progress
    const mobileProgressEl = document.getElementById('mobile-daily-progress-bar');
    if (mobileProgressEl) {
      mobileProgressEl.style.width = `${dailyProgress}%`;
    }

    // Update desktop progress
    const desktopProgressEl = document.getElementById('desktop-daily-progress-bar');
    if (desktopProgressEl) {
      desktopProgressEl.style.width = `${dailyProgress}%`;
    }
  }

  calculateDailyProgress() {
    if (!window.events) return 0;
    const dailyTasks = window.events.filter(e => e.schedule === 'daily');
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

  updateLayout() {
    // Re-render dashboard when layout changes
    this.renderDashboard();
  }

  setupEventListeners() {
    // Add event modal functionality
    const addEventButtons = document.querySelectorAll('[onclick="openEventModal()"]');
    addEventButtons.forEach(button => {
      button.onclick = () => this.openAddTaskModal();
    });
  }

  showNotification(message, type = 'info') {
    // Simple notification system
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

  // Placeholder methods for other pages
  renderDailySchedule() {
    console.log('Rendering daily schedule...');
  }

  renderWeeklyTasks() {
    console.log('Rendering weekly tasks...');
  }

  renderMonthlyTasks() {
    console.log('Rendering monthly tasks...');
  }

  renderManageEvents() {
    console.log('Rendering manage events...');
  }

  renderAnalytics() {
    console.log('Rendering analytics...');
  }

  renderYearlyGoals() {
    console.log('Rendering yearly goals...');
  }
}

// Initialize dashboard when DOM is ready
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
  dashboard = new ModernDashboard();
  
  // Make dashboard globally accessible
  window.dashboard = dashboard;
  
  // Initialize with saved events if available
  if (window.events && window.events.length > 0) {
    dashboard.updateStats();
  }
});

// Export for module use
export default ModernDashboard;
