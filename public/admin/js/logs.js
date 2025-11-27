/**
 * Logs Module - Handles attendance logs display and search functionality
 */

let currentPage = 1;
let currentFilters = {};
let allLogs = [];
let filteredLogs = [];

/**
 * Format time from backend (already in Philippine time)
 * Backend stores time in Asia/Manila timezone, so we display as-is
 * without converting to local timezone
 */
function formatPhilippineTime(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
    
    // Extract components directly without timezone conversion
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Format date
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${monthNames[month]} ${day}, ${year}`;
    
    // Format time (12-hour format)
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const timeStr = `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    
    return { date: dateStr, time: timeStr };
  } catch (e) {
    console.error('Error formatting time:', isoString, e);
    return { date: 'Invalid Date', time: 'Invalid Time' };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user is authenticated
  if (!Auth.requireAuth()) return;
  
  // Set default date range (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
  document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
  
  // Load initial logs
  await loadLogs();
  
  // Setup event listeners
  setupEventListeners();
  
  // Clear search on page load
  document.getElementById('searchInput').value = '';
});

/**
 * Setup event listeners for search and filter
 */
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const filterBtn = document.getElementById('filterBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  
  // Real-time search
  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });
  
  // Filter button
  filterBtn.addEventListener('click', () => {
    currentPage = 1;
    loadLogs();
  });
  
  // Clear filters button
  clearFiltersBtn.addEventListener('click', () => {
    // Clear all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    // Reset to default date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    // Reload logs
    currentPage = 1;
    loadLogs();
  });
  
  // Pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayLogs();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredLogs.length / 20);
    if (currentPage < totalPages) {
      currentPage++;
      displayLogs();
    }
  });
  
  // Enter key on search input
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(e.target.value);
    }
  });
}

/**
 * Load attendance logs from server
 */
async function loadLogs() {
  const loader = document.getElementById('logsLoader');
  const table = document.getElementById('logsTable');
  const errorEl = document.getElementById('logsError');
  const noResults = document.getElementById('noResults');
  
  try {
    loader.classList.remove('hidden');
    table.classList.add('hidden');
    errorEl.classList.add('hidden');
    noResults.classList.add('hidden');
    
    // Get filter values
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        errorEl.querySelector('p').textContent = 'Start date cannot be after end date.';
        errorEl.classList.remove('hidden');
        loader.classList.add('hidden');
        return;
      }
    }
    
    const params = {
      limit: 100, // Get more records for client-side filtering
      page: 1
    };
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    currentFilters = params;
    
    console.log('Loading logs with params:', params);
    const response = await API.admin.getAttendanceLogs(params);
    console.log('Logs response:', response);
    
    if (response.success && response.data?.logs) {
      allLogs = response.data.logs;
      filteredLogs = [...allLogs];
      
      loader.classList.add('hidden');
      
      if (filteredLogs.length === 0) {
        noResults.classList.remove('hidden');
      } else {
        displayLogs();
        table.classList.remove('hidden');
      }
    } else {
      throw new Error(response.message || 'Failed to load logs');
    }
  } catch (error) {
    console.error('Failed to load logs:', error);
    loader.classList.add('hidden');
    errorEl.querySelector('p').textContent = 'Failed to load attendance logs. Please try again.';
    errorEl.classList.remove('hidden');
  }
}

/**
 * Perform real-time search on logs
 */
function performSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    filteredLogs = [...allLogs];
  } else {
    filteredLogs = allLogs.filter(log => {
      const studentName = (log.studentName || '').toLowerCase();
      const studentId = (log.studentId || '').toLowerCase();
      const gateName = (log.gateName || '').toLowerCase();
      
      // Safe date parsing
      let dateStr = '';
      try {
        const entryTime = new Date(log.entryTime);
        if (!isNaN(entryTime.getTime())) {
          dateStr = entryTime.toLocaleDateString().toLowerCase();
        }
      } catch (e) {
        // Ignore invalid dates
      }
      
      return studentName.includes(searchTerm) ||
             studentId.includes(searchTerm) ||
             dateStr.includes(searchTerm) ||
             gateName.includes(searchTerm);
    });
  }
  
  currentPage = 1;
  displayLogs();
}

/**
 * Display logs in table with pagination
 */
function displayLogs() {
  const tbody = document.getElementById('logsTableBody');
  const recordCount = document.getElementById('recordCount');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const noResults = document.getElementById('noResults');
  const table = document.getElementById('logsTable');
  
  const logsPerPage = 20;
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  if (filteredLogs.length === 0) {
    table.classList.add('hidden');
    noResults.classList.remove('hidden');
    return;
  }
  
  table.classList.remove('hidden');
  noResults.classList.add('hidden');
  
  // Update record count
  recordCount.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredLogs.length)} of ${filteredLogs.length} records`;
  
  // Update page info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  // Update pagination buttons
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  
  // Render table rows
  tbody.innerHTML = paginatedLogs.map(log => {
    // Format time using Philippine timezone (backend already stores in PH time)
    const { date: dateStr, time: timeStr } = formatPhilippineTime(log.entryTime);
    
    const statusClass = log.locationValid 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
    const statusText = log.locationValid ? 'Valid' : 'Invalid';
    
    let coords = 'N/A';
    try {
      if (log.latitude && log.longitude) {
        coords = `${parseFloat(log.latitude).toFixed(6)}, ${parseFloat(log.longitude).toFixed(6)}`;
      }
    } catch (e) {
      console.error('Error parsing coordinates:', log.latitude, log.longitude, e);
    }
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 text-sm text-gray-900">${escapeHtml(dateStr)}</td>
        <td class="px-4 py-3 text-sm text-gray-900">${timeStr}</td>
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${escapeHtml(log.studentName || 'N/A')}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(log.studentId || 'N/A')}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(log.gateName || 'N/A')}</td>
        <td class="px-4 py-3 text-sm">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="px-4 py-3 text-xs text-gray-500 font-mono">${coords}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
