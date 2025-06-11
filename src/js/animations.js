// Framer Motion Animation Controller
// This module handles all animations and transitions using Framer Motion

// Animation system with CSS-based animations for smooth performance
// This provides fallback animations without external dependencies

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
});

// Initialize all animations
function initializeAnimations() {
    initPageTransitions();
    initCardAnimations();
    initProgressBarAnimations();
    initFloatingActionButton();
    initTaskCompletionAnimations();
    initModalAnimations();
}

// Page transition animations
function initPageTransitions() {
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => {
        // Initial state for non-active pages
        if (!page.classList.contains('active')) {
            page.style.opacity = '0';
            page.style.transform = 'translateY(20px)';
            page.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }
    });
      // Listen for page changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const page = mutation.target;
                if (page.classList.contains('page')) {
                    animatePageTransition(page);
                }
            }
        });
    });
    
    pages.forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
}

// Animate page transitions
function animatePageTransition(page) {
    if (page.classList.contains('active')) {
        // Page becoming active
        page.style.opacity = '0';
        page.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            page.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            page.style.opacity = '1';
            page.style.transform = 'translateY(0)';
        });
    } else {
        // Page becoming inactive
        page.style.transition = 'opacity 0.2s ease-in, transform 0.2s ease-in';
        page.style.opacity = '0';
        page.style.transform = 'translateY(-10px)';
    }
}

// Card hover and interaction animations
function initCardAnimations() {
    // Stat cards hover animation
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        card.addEventListener('click', function() {
            // Click animation
            this.style.transform = 'translateY(-1px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }, 100);
        });
    });
    
    // Event cards animation on render
    const eventCardsObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList.contains('event-card')) {
                        animateEventCardIn(node);
                    }
                });
            }
        });
    });
    
    // Observe containers for new event cards
    ['daily-schedule', 'weekly-tasks', 'monthly-tasks', 'events-list'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            eventCardsObserver.observe(container, { childList: true, subtree: true });
        }
    });
}

// Animate event card entrance
function animateEventCardIn(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px) scale(0.95)';
    card.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    
    requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
}

// Progress bar animations
function initProgressBarAnimations() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        // Add transition for smooth width changes
        bar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Watch for progress updates
    const progressObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const progressFill = mutation.target;
                if (progressFill.classList.contains('progress-fill')) {
                    animateProgressUpdate(progressFill);
                }
            }
        });
    });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar, { attributes: true });
    });
}

// Animate progress bar updates
function animateProgressUpdate(progressFill) {
    // Add a subtle pulse effect when progress changes
    const progressBar = progressFill.closest('.progress-bar');
    if (progressBar) {
        progressBar.style.transform = 'scale(1.02)';
        progressBar.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
            progressBar.style.transform = 'scale(1)';
        }, 200);
    }
}

// Floating Action Button animations
function initFloatingActionButton() {
    const fab = document.querySelector('.fab');
    if (!fab) return;
    
    // Initial animation
    fab.style.transform = 'scale(0) rotate(-180deg)';
    fab.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    setTimeout(() => {
        fab.style.transform = 'scale(1) rotate(0deg)';
    }, 500);
    
    // Hover animations
    fab.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(90deg)';
    });
    
    fab.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
    
    // Click animation
    fab.addEventListener('click', function() {
        this.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'scale(1.1) rotate(90deg)';
        }, 150);
    });
}

// Task completion animations
function initTaskCompletionAnimations() {
    // Listen for checkbox changes
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.classList.contains('event-card-checkbox')) {
            animateTaskCompletion(e.target);
        }
    });
}

// Animate task completion
function animateTaskCompletion(checkbox) {
    const eventCard = checkbox.closest('.event-card');
    if (!eventCard) return;
    
    const isCompleted = checkbox.checked;
    
    if (isCompleted) {
        // Completion animation
        eventCard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        eventCard.style.transform = 'scale(1.05)';
        
        // Add completion effect
        const completionBurst = document.createElement('div');
        completionBurst.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: none;
            z-index: 10;
        `;
        
        eventCard.style.position = 'relative';
        eventCard.appendChild(completionBurst);
        
        // Animate burst
        requestAnimationFrame(() => {
            completionBurst.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
            completionBurst.style.transform = 'translate(-50%, -50%) scale(3)';
            completionBurst.style.opacity = '0';
        });
        
        setTimeout(() => {
            eventCard.style.transform = 'scale(1)';
            completionBurst.remove();
        }, 300);
        
    } else {
        // Uncompletion animation
        eventCard.style.transition = 'transform 0.2s ease-out';
        eventCard.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            eventCard.style.transform = 'scale(1)';
        }, 200);
    }
}

// Modal animations
function initModalAnimations() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;
    
    // Watch for modal state changes
    const modalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const display = modal.style.display;
                if (display === 'block') {
                    animateModalIn(modal);
                } else if (display === 'none') {
                    animateModalOut(modal);
                }
            }
        });
    });
    
    modalObserver.observe(modal, { attributes: true });
}

// Animate modal entrance
function animateModalIn(modal) {
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;
    
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.7) translateY(-50px)';
    modalContent.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease-out';
    
    requestAnimationFrame(() => {
        modal.style.transition = 'opacity 0.3s ease-out';
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1) translateY(0)';
    });
}

// Animate modal exit
function animateModalOut(modal) {
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;
    
    modal.style.transition = 'opacity 0.2s ease-in';
    modalContent.style.transition = 'transform 0.2s ease-in';
    
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9) translateY(20px)';
}

// Achievement notification animation
function animateAchievement(achievement) {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 1000;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${achievement.icon}</span>
            <div>
                <div style="font-weight: bold; margin-bottom: 4px;">${achievement.title}</div>
                <div style="font-size: 14px; opacity: 0.9;">${achievement.description}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000);
}

// Utility function to check if reduced motion is preferred
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Disable animations if user prefers reduced motion
if (prefersReducedMotion()) {
    // Override animation functions to be instant
    window.addEventListener('load', function() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    });
}

// Make animation functions globally available
window.animateAchievement = animateAchievement;
window.animateTaskCompletion = animateTaskCompletion;

console.log('✨ Animation system initialized');
