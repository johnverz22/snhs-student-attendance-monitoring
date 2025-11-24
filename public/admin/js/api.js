/**
 * API Module - Handles all server communication
 */

const API = (() => {
  const BASE_URL = window.location.origin;
  
  /**
   * Make an authenticated API request
   */
  async function request(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      // Handle unauthorized responses (but not for login endpoint)
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Unauthorized');
      }
      
      // For non-OK responses, return the data anyway (it contains error info)
      // The calling code will check response.success
      if (!response.ok) {
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  /**
   * GET request
   */
  async function get(endpoint) {
    return request(endpoint, { method: 'GET' });
  }
  
  /**
   * POST request
   */
  async function post(endpoint, data) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PUT request
   */
  async function put(endpoint, data) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * DELETE request
   */
  async function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  }
  
  // Authentication endpoints
  const auth = {
    login: (credentials) => post('/api/auth/admin/login', credentials)
  };
  
  // Admin endpoints
  const admin = {
    // Reports
    getDailyReport: (date) => get(`/api/admin/reports/daily?date=${date}`),
    getWeeklyReport: (startDate) => get(`/api/admin/reports/weekly?startDate=${startDate}`),
    getMonthlyReport: (month) => get(`/api/admin/reports/monthly?month=${month}`),
    getStudentReport: (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return get(`/api/admin/reports/student/${studentId}${queryString ? '?' + queryString : ''}`);
    },
    
    // Attendance logs
    getAttendanceLogs: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return get(`/api/admin/attendance/logs${queryString ? '?' + queryString : ''}`);
    },
    
    // Students
    getStudents: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return get(`/api/admin/students${queryString ? '?' + queryString : ''}`);
    },
    searchStudents: (query) => {
      if (!query || query.trim() === '') {
        // Return all students if no query
        return get('/api/admin/students?limit=1000');
      }
      return get(`/api/admin/students/search?query=${encodeURIComponent(query)}`);
    },
    updateStudent: (id, data) => put(`/api/admin/students/${id}`, data),
    archiveStudent: (id) => post(`/api/admin/students/${id}/archive`),
    unarchiveStudent: (id) => post(`/api/admin/students/${id}/unarchive`),
    
    // School configuration
    getSchoolConfig: () => get('/api/admin/school/config'),
    updateSchoolConfig: (config) => put('/api/admin/school/config', config),
    
    // QR codes
    getQRCodes: () => get('/api/admin/qr-codes'),
    createQRCode: (qrData) => post('/api/admin/qr-codes', qrData),
    deleteQRCode: (id) => del(`/api/admin/qr-codes/${id}`)
  };
  
  return {
    auth,
    admin,
    get,
    post,
    put,
    del
  };
})();
