/**
 * MOBILE CONTEXT MENU FUNCTIONALITY
 * ==================================
 * 
 * This module handles the mobile-only context menu for edit/delete actions.
 * Only active on vertical mobile devices (max-width: 768px in portrait mode).
 * 
 * Features:
 * - Touch-friendly three-dot menu trigger
 * - Smooth dropdown animation
 * - Click-outside-to-close functionality
 * - Keyboard navigation support
 * - Integration with existing edit/delete functions
 */

class MobileContextMenu {
    constructor() {
        this.trigger = null;
        this.dropdown = null;
        this.overlay = null;
        this.isOpen = false;
        this.init();
    }

    /**
     * Initialize the mobile context menu
     */
    init() {
        // Get DOM elements
        this.trigger = document.getElementById('contextMenuTrigger');
        this.dropdown = document.getElementById('contextMenuDropdown');
        this.overlay = document.getElementById('contextMenuOverlay');
        
        // Only initialize if elements exist and we're on mobile
        if (this.trigger && this.dropdown && this.overlay && this.isMobileDevice()) {
            this.bindEvents();
            this.updateMenuVisibility();
            console.log('📱 Mobile context menu initialized');
        }
    }

    /**
     * Check if device is mobile and in portrait mode
     */
    isMobileDevice() {
        return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Trigger button click
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Overlay click to close
        this.overlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Menu item clicks
        const editBtn = document.getElementById('mobileEditBtn');
        const deleteBtn = document.getElementById('mobileDeleteBtn');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.handleEditClick();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteClick();
            });
        }

        // Keyboard navigation
        this.bindKeyboardEvents();

        // Window resize to hide menu when orientation changes
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Close menu when clicking anywhere else on the page
        document.addEventListener('click', (e) => {
            if (!this.trigger.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    /**
     * Bind keyboard navigation events
     */
    bindKeyboardEvents() {
        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
                this.trigger.focus(); // Return focus to trigger
            }
        });

        // Arrow key navigation within menu
        this.dropdown.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            const menuItems = this.dropdown.querySelectorAll('.context-menu-item');
            const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex].focus();
                    break;
                
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
                    menuItems[prevIndex].focus();
                    break;
                
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (document.activeElement.classList.contains('context-menu-item')) {
                        document.activeElement.click();
                    }
                    break;
            }
        });
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Close menu if device orientation changed or no longer mobile
        if (!this.isMobileDevice()) {
            this.closeMenu();
        }
        
        // Update menu visibility based on current device state
        this.updateMenuVisibility();
    }

    /**
     * Update menu visibility based on device type and orientation
     */
    updateMenuVisibility() {
        const contextMenu = document.getElementById('mobileContextMenu');
        if (!contextMenu) return;

        if (this.isMobileDevice()) {
            contextMenu.style.display = 'block';
        } else {
            contextMenu.style.display = 'none';
            this.closeMenu(); // Close if open
        }
    }

    /**
     * Toggle menu open/closed state
     */
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open the context menu
     */
    openMenu() {
        // Only open if user is admin and authenticated
        if (!isAdminAuthenticated()) {
            console.log('🔒 Context menu requires admin authentication');
            return;
        }

        this.isOpen = true;
        
        // Show overlay
        this.overlay.classList.add('show');
        
        // Show dropdown with animation
        this.dropdown.classList.add('show');
        
        // Update ARIA attributes
        this.trigger.setAttribute('aria-expanded', 'true');
        
        // Focus first menu item for keyboard navigation
        const firstMenuItem = this.dropdown.querySelector('.context-menu-item');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100); // Small delay for animation
        }

        console.log('📱 Context menu opened');
    }

    /**
     * Close the context menu
     */
    closeMenu() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // Hide overlay
        this.overlay.classList.remove('show');
        
        // Hide dropdown
        this.dropdown.classList.remove('show');
        
        // Update ARIA attributes
        this.trigger.setAttribute('aria-expanded', 'false');

        console.log('📱 Context menu closed');
    }

    /**
     * Handle edit button click
     */
    handleEditClick() {
        this.closeMenu();
        
        editCurrentRecipe();
    }

    /**
     * Handle delete button click
     */
    handleDeleteClick() {
        this.closeMenu();
        
        deleteCurrentRecipe();
    }

    /**
     * Show the context menu (called from external functions if needed)
     */
    show() {
        if (this.isMobileDevice()) {
            this.updateMenuVisibility();
        }
    }

    /**
     * Hide the context menu (called from external functions if needed)
     */
    hide() {
        this.closeMenu();
    }
}

// Initialize the mobile context menu when DOM is loaded
let mobileContextMenu;

document.addEventListener('DOMContentLoaded', () => {
    mobileContextMenu = new MobileContextMenu();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileContextMenu;
}

/**
 * INTEGRATION FUNCTIONS
 * ====================
 * 
 * These functions integrate the mobile context menu with your existing recipe system.
 * Call these functions when recipes are loaded or when admin status changes.
 */

/**
 * Update mobile context menu visibility when admin status changes
 */
function updateMobileContextMenuForAdmin() {
    if (mobileContextMenu) {
        if (isAdminAuthenticated()) {
            mobileContextMenu.show();
        } else {
            mobileContextMenu.hide();
        }
    }
}

/**
 * Update mobile context menu when a new recipe is loaded
 */
function updateMobileContextMenuForRecipe() {
    if (mobileContextMenu) {
        // Close any open menu when switching recipes
        mobileContextMenu.closeMenu();
        
        // Update visibility based on current device and admin status
        if (isAdminAuthenticated() && mobileContextMenu.isMobileDevice()) {
            mobileContextMenu.show();
        }
    }
}

/**
 * USAGE EXAMPLES
 * ==============
 * 
 * Add these function calls to your existing code:
 * 
 * 1. When admin logs in:
 *    updateMobileContextMenuForAdmin();
 * 
 * 2. When loading a new recipe:
 *    updateMobileContextMenuForRecipe();
 * 
 * 3. When admin logs out:
 *    updateMobileContextMenuForAdmin();
 */