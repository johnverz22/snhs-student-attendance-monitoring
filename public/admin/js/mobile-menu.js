/**
 * Mobile Menu Module - Handles responsive sidebar navigation
 */

const MobileMenu = (() => {
  let sidebar = null;
  let overlay = null;
  let menuBtn = null;

  /**
   * Initialize mobile menu functionality
   */
  function init() {
    sidebar = document.getElementById('sidebar');
    overlay = document.getElementById('sidebarOverlay');
    menuBtn = document.getElementById('mobileMenuBtn');

    if (!sidebar || !overlay || !menuBtn) {
      console.warn('Mobile menu elements not found');
      return;
    }

    setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Toggle sidebar when menu button is clicked
    menuBtn.addEventListener('click', toggleSidebar);
    
    // Close sidebar when overlay is clicked
    overlay.addEventListener('click', closeSidebar);
    
    // Close sidebar when navigation links are clicked on mobile
    const navLinks = sidebar.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          closeSidebar();
        }
      });
    });

    // Close sidebar when escape key is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
        closeSidebar();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        closeSidebar();
      }
    });
  }

  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  /**
   * Open sidebar
   */
  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  /**
   * Close sidebar
   */
  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }

  /**
   * Check if sidebar is open
   */
  function isOpen() {
    return sidebar && !sidebar.classList.contains('-translate-x-full');
  }

  // Auto-initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    toggle: toggleSidebar,
    open: openSidebar,
    close: closeSidebar,
    isOpen
  };
})();