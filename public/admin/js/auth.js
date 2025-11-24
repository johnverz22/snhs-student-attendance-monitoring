/**
 * Authentication Module - Handles admin authentication and token management
 */

const Auth = (() => {
  const TOKEN_KEY = 'adminToken';
  
  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  
  /**
   * Get stored token
   */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  /**
   * Store authentication token
   */
  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  /**
   * Remove authentication token
   */
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }
  
  /**
   * Handle login
   */
  async function login(username, password) {
    try {
      const response = await API.auth.login({ username, password });
      
      if (response.success && response.data.accessToken) {
        setToken(response.data.accessToken);
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }
  
  /**
   * Handle logout
   */
  function logout() {
    clearToken();
    window.location.href = '/admin/login.html';
  }
  
  /**
   * Protect page - redirect to login if not authenticated
   */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = '/admin/login.html';
      return false;
    }
    return true;
  }
  
  /**
   * Redirect to dashboard if already authenticated
   */
  function redirectIfAuthenticated() {
    if (isAuthenticated()) {
      window.location.href = '/admin/dashboard.html';
      return true;
    }
    return false;
  }
  
  return {
    isAuthenticated,
    getToken,
    login,
    logout,
    requireAuth,
    redirectIfAuthenticated
  };
})();

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Redirect if already authenticated
    Auth.redirectIfAuthenticated();
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('errorMessage');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      
      // Show loading state
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
      errorMessage.classList.add('hidden');
      
      try {
        const result = await Auth.login(username, password);
        
        if (result.success) {
          // Show success message briefly before redirect
          errorMessage.classList.remove('bg-red-50', 'border-red-500');
          errorMessage.classList.add('bg-green-50', 'border-green-500');
          errorMessage.querySelector('svg').classList.remove('text-red-500');
          errorMessage.querySelector('svg').classList.add('text-green-500');
          errorMessage.querySelector('p').classList.remove('text-red-700');
          errorMessage.querySelector('p').classList.add('text-green-700');
          errorMessage.querySelector('p').textContent = 'Login successful! Redirecting...';
          errorMessage.classList.remove('hidden');
          
          // Redirect after a brief delay
          setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
          }, 500);
        } else {
          // Show error message
          errorMessage.classList.remove('bg-green-50', 'border-green-500');
          errorMessage.classList.add('bg-red-50', 'border-red-500');
          errorMessage.querySelector('svg').classList.remove('text-green-500');
          errorMessage.querySelector('svg').classList.add('text-red-500');
          errorMessage.querySelector('p').classList.remove('text-green-700');
          errorMessage.querySelector('p').classList.add('text-red-700');
          errorMessage.querySelector('p').textContent = result.message;
          errorMessage.classList.remove('hidden');
          
          // Re-enable form
          submitBtn.disabled = false;
          btnText.classList.remove('hidden');
          btnLoader.classList.add('hidden');
        }
      } catch (error) {
        // Show error message
        errorMessage.classList.remove('bg-green-50', 'border-green-500');
        errorMessage.classList.add('bg-red-50', 'border-red-500');
        errorMessage.querySelector('svg').classList.remove('text-green-500');
        errorMessage.querySelector('svg').classList.add('text-red-500');
        errorMessage.querySelector('p').classList.remove('text-green-700');
        errorMessage.querySelector('p').classList.add('text-red-700');
        errorMessage.querySelector('p').textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
        
        // Re-enable form
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
      }
    });
  }
  
  // Handle logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    // Require authentication for protected pages
    Auth.requireAuth();
    
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
      }
    });
  }
});
