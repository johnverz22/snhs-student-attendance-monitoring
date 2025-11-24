/**
 * Dashboard Module - Handles dashboard functionality
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user is authenticated
  if (!Auth.requireAuth()) return;
  
  // Display current date
  const currentDateEl = document.getElementById('currentDate');
  if (currentDateEl) {
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Load dashboard statistics
  await loadDashboardStats();
  
  // Load recent attendance
  await loadRecentAttendance();
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's attendance count
    const todayData = await API.admin.getDailyReport(today);
    let todayCount = 0;
    if (todayData.success && todayData.data?.statistics) {
      todayCount = todayData.data.statistics.uniqueStudents || 0;
    }
    document.getElementById('todayAttendance').textContent = todayCount;
    
    // Get this week's attendance count
    const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
    const weekData = await API.admin.getWeeklyReport(weekStart);
    let weekCount = 0;
    if (weekData.success && weekData.data?.statistics) {
      weekCount = weekData.data.statistics.uniqueStudents || 0;
    }
    document.getElementById('weekAttendance').textContent = weekCount;
    
    // Get this month's attendance count
    const month = new Date().toISOString().slice(0, 7);
    const monthData = await API.admin.getMonthlyReport(month);
    let monthCount = 0;
    if (monthData.success && monthData.data?.statistics) {
      monthCount = monthData.data.statistics.uniqueStudents || 0;
    }
    document.getElementById('monthAttendance').textContent = monthCount;
    
    // Get total students count (active students only)
    const studentsData = await API.admin.getStudents({ limit: 100, archived: 'false' });
    let totalStudents = 0;
    if (studentsData.success && studentsData.data?.pagination) {
      totalStudents = studentsData.data.pagination.total || 0;
    }
    document.getElementById('totalStudents').textContent = totalStudents;
    
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    // Set default values on error
    document.getElementById('todayAttendance').textContent = '0';
    document.getElementById('weekAttendance').textContent = '0';
    document.getElementById('monthAttendance').textContent = '0';
    document.getElementById('totalStudents').textContent = '0';
  }
}

/**
 * Load recent attendance records
 */
async function loadRecentAttendance() {
  const loader = document.getElementById('recentAttendanceLoader');
  const table = document.getElementById('recentAttendanceTable');
  const tbody = document.getElementById('recentAttendanceBody');
  const errorEl = document.getElementById('recentAttendanceError');
  
  try {
    loader.classList.remove('hidden');
    table.classList.add('hidden');
    errorEl.classList.add('hidden');
    
    const response = await API.admin.getAttendanceLogs({ limit: 10, page: 1 });
    
    if (response.success && response.data?.logs) {
      const logs = response.data.logs;
      
      if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No attendance records yet</td></tr>';
      } else {
        tbody.innerHTML = logs.map(log => {
          const entryTime = new Date(log.entryTime);
          const timeStr = entryTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          });
          const dateStr = entryTime.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          
          const statusClass = log.locationValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
          const statusText = log.locationValid ? 'Valid' : 'Invalid';
          
          return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-900">
                <div>${timeStr}</div>
                <div class="text-xs text-gray-500">${dateStr}</div>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-900">${escapeHtml(log.studentName)}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(log.studentId)}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(log.gateName || 'N/A')}</td>
              <td class="px-4 py-3 text-sm">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                  ${statusText}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }
      
      loader.classList.add('hidden');
      table.classList.remove('hidden');
    } else {
      throw new Error(response.message || 'Failed to load attendance logs');
    }
  } catch (error) {
    console.error('Failed to load recent attendance:', error);
    loader.classList.add('hidden');
    errorEl.querySelector('p').textContent = 'Failed to load recent attendance records. Please try refreshing the page.';
    errorEl.classList.remove('hidden');
  }
}

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
