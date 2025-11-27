/**
 * Reports Module - Handles report generation and CSV download
 */

let studentSearchTimeout = null;

/**
 * Format time from backend (already in Philippine time)
 */
function formatPhilippineTime(isoString, includeSeconds = true) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    if (includeSeconds) {
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    }
    return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    return 'Invalid Time';
  }
}

function formatPhilippineDate(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monthNames[month]} ${day}, ${year}`;
  } catch (e) {
    return 'Invalid Date';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is authenticated
  if (!Auth.requireAuth()) return;
  
  // Set default dates
  setDefaultDates();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Set default dates for report inputs
 */
function setDefaultDates() {
  const today = new Date();
  
  // Daily report - today
  document.getElementById('dailyDate').value = today.toISOString().split('T')[0];
  
  // Weekly report - start of this week (Monday)
  const weekStart = getWeekStart(today);
  document.getElementById('weeklyStartDate').value = weekStart.toISOString().split('T')[0];
  
  // Monthly report - current month
  document.getElementById('monthlyDate').value = today.toISOString().slice(0, 7);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Daily report
  document.getElementById('viewDailyBtn').addEventListener('click', () => viewDailyReport());
  document.getElementById('downloadDailyBtn').addEventListener('click', () => downloadDailyReport());
  
  // Weekly report
  document.getElementById('viewWeeklyBtn').addEventListener('click', () => viewWeeklyReport());
  document.getElementById('downloadWeeklyBtn').addEventListener('click', () => downloadWeeklyReport());
  
  // Monthly report
  document.getElementById('viewMonthlyBtn').addEventListener('click', () => viewMonthlyReport());
  document.getElementById('downloadMonthlyBtn').addEventListener('click', () => downloadMonthlyReport());
  
  // Student report
  document.getElementById('studentSearch').addEventListener('input', handleStudentSearch);
  document.getElementById('viewStudentBtn').addEventListener('click', () => viewStudentReport());
  document.getElementById('downloadStudentBtn').addEventListener('click', () => downloadStudentReport());
  
  // Close report
  document.getElementById('closeReportBtn').addEventListener('click', closeReport);
}

/**
 * Handle student search with debouncing
 */
function handleStudentSearch(e) {
  const query = e.target.value.trim();
  
  clearTimeout(studentSearchTimeout);
  
  if (query.length < 2) {
    document.getElementById('studentSuggestions').innerHTML = '';
    disableStudentReportButtons();
    return;
  }
  
  studentSearchTimeout = setTimeout(async () => {
    try {
      const response = await API.admin.searchStudents(query);
      
      if (response.success && response.data.students) {
        displayStudentSuggestions(response.data.students);
      }
    } catch (error) {
      console.error('Student search failed:', error);
    }
  }, 300);
}

/**
 * Display student search suggestions
 */
function displayStudentSuggestions(students) {
  const suggestionsEl = document.getElementById('studentSuggestions');
  
  if (students.length === 0) {
    suggestionsEl.innerHTML = '<div class="suggestion-item">No students found</div>';
    return;
  }
  
  suggestionsEl.innerHTML = students.map(student => `
    <div class="suggestion-item" data-student-id="${student.id}">
      <strong>${escapeHtml(student.name)}</strong>
      <span class="suggestion-meta">${escapeHtml(student.studentId)}</span>
    </div>
  `).join('');
  
  // Add click handlers
  suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => selectStudent(item));
  });
}

/**
 * Select a student from suggestions
 */
function selectStudent(item) {
  const studentId = item.dataset.studentId;
  const studentName = item.querySelector('strong').textContent;
  
  document.getElementById('selectedStudentId').value = studentId;
  document.getElementById('studentSearch').value = studentName;
  document.getElementById('studentSuggestions').innerHTML = '';
  
  enableStudentReportButtons();
}

/**
 * Enable student report buttons
 */
function enableStudentReportButtons() {
  document.getElementById('viewStudentBtn').disabled = false;
  document.getElementById('downloadStudentBtn').disabled = false;
}

/**
 * Disable student report buttons
 */
function disableStudentReportButtons() {
  document.getElementById('viewStudentBtn').disabled = true;
  document.getElementById('downloadStudentBtn').disabled = true;
}

/**
 * View daily report
 */
async function viewDailyReport() {
  const date = document.getElementById('dailyDate').value;
  if (!date) {
    alert('Please select a date');
    return;
  }
  
  showReportLoader('Daily Report');
  
  try {
    const response = await API.admin.getDailyReport(date);
    
    if (response.success && response.data.entries) {
      displayReport('Daily Report', response.data.entries, date);
    } else {
      showReportError('Failed to generate daily report');
    }
  } catch (error) {
    showReportError(error.message || 'Failed to generate daily report');
  }
}

/**
 * Download daily report as CSV
 */
async function downloadDailyReport() {
  const date = document.getElementById('dailyDate').value;
  if (!date) {
    alert('Please select a date');
    return;
  }
  
  try {
    const response = await API.admin.getDailyReport(date);
    
    if (response.success && response.data.entries) {
      downloadCSV(response.data.entries, `daily_report_${date}.csv`);
    }
  } catch (error) {
    alert('Failed to download report: ' + error.message);
  }
}

/**
 * View weekly report
 */
async function viewWeeklyReport() {
  const startDate = document.getElementById('weeklyStartDate').value;
  if (!startDate) {
    alert('Please select a start date');
    return;
  }
  
  showReportLoader('Weekly Report');
  
  try {
    const response = await API.admin.getWeeklyReport(startDate);
    
    if (response.success && response.data.entries) {
      displayReport('Weekly Report', response.data.entries, startDate);
    } else {
      showReportError('Failed to generate weekly report');
    }
  } catch (error) {
    showReportError(error.message || 'Failed to generate weekly report');
  }
}

/**
 * Download weekly report as CSV
 */
async function downloadWeeklyReport() {
  const startDate = document.getElementById('weeklyStartDate').value;
  if (!startDate) {
    alert('Please select a start date');
    return;
  }
  
  try {
    const response = await API.admin.getWeeklyReport(startDate);
    
    if (response.success && response.data.entries) {
      downloadCSV(response.data.entries, `weekly_report_${startDate}.csv`);
    }
  } catch (error) {
    alert('Failed to download report: ' + error.message);
  }
}

/**
 * View monthly report
 */
async function viewMonthlyReport() {
  const month = document.getElementById('monthlyDate').value;
  if (!month) {
    alert('Please select a month');
    return;
  }
  
  showReportLoader('Monthly Report');
  
  try {
    const response = await API.admin.getMonthlyReport(month);
    
    if (response.success && response.data.entries) {
      displayReport('Monthly Report', response.data.entries, month);
    } else {
      showReportError('Failed to generate monthly report');
    }
  } catch (error) {
    showReportError(error.message || 'Failed to generate monthly report');
  }
}

/**
 * Download monthly report as CSV
 */
async function downloadMonthlyReport() {
  const month = document.getElementById('monthlyDate').value;
  if (!month) {
    alert('Please select a month');
    return;
  }
  
  try {
    const response = await API.admin.getMonthlyReport(month);
    
    if (response.success && response.data.entries) {
      downloadCSV(response.data.entries, `monthly_report_${month}.csv`);
    }
  } catch (error) {
    alert('Failed to download report: ' + error.message);
  }
}

/**
 * View student report
 */
async function viewStudentReport() {
  const studentId = document.getElementById('selectedStudentId').value;
  if (!studentId) {
    alert('Please select a student');
    return;
  }
  
  showReportLoader('Student Report');
  
  try {
    const response = await API.admin.getStudentReport(studentId);
    
    if (response.success && response.data.entries) {
      const studentName = document.getElementById('studentSearch').value;
      displayReport(`Student Report - ${studentName}`, response.data.entries);
    } else {
      showReportError('Failed to generate student report');
    }
  } catch (error) {
    showReportError(error.message || 'Failed to generate student report');
  }
}

/**
 * Download student report as CSV
 */
async function downloadStudentReport() {
  const studentId = document.getElementById('selectedStudentId').value;
  if (!studentId) {
    alert('Please select a student');
    return;
  }
  
  try {
    const response = await API.admin.getStudentReport(studentId);
    
    if (response.success && response.data.entries) {
      const studentName = document.getElementById('studentSearch').value.replace(/\s+/g, '_');
      downloadCSV(response.data.entries, `student_report_${studentName}.csv`);
    }
  } catch (error) {
    alert('Failed to download report: ' + error.message);
  }
}

/**
 * Display report in results section
 */
function displayReport(title, attendance, subtitle = '') {
  const reportResults = document.getElementById('reportResults');
  const reportTitle = document.getElementById('reportTitle');
  const reportContent = document.getElementById('reportContent');
  const reportLoader = document.getElementById('reportLoader');
  const reportError = document.getElementById('reportError');
  
  reportTitle.textContent = title;
  reportLoader.style.display = 'none';
  reportError.style.display = 'none';
  
  if (attendance.length === 0) {
    reportContent.innerHTML = '<p class="no-results">No attendance records found for this period.</p>';
  } else {
    const summary = `
      <div class="report-summary">
        <p><strong>Total Records:</strong> ${attendance.length}</p>
        ${subtitle ? `<p><strong>Period:</strong> ${subtitle}</p>` : ''}
      </div>
    `;
    
    const table = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Gate</th>
              <th>Location Status</th>
            </tr>
          </thead>
          <tbody>
            ${attendance.map(log => {
              let dateStr = 'Invalid Date';
              let timeStr = 'Invalid Time';
              
              // Format time using Philippine timezone (backend already stores in PH time)
              dateStr = formatPhilippineDate(log.entryTime);
              timeStr = formatPhilippineTime(log.entryTime, false);
              
              const statusClass = log.locationValid ? 'status-success' : 'status-error';
              const statusText = log.locationValid ? 'Valid' : 'Invalid';
              
              return `
                <tr>
                  <td>${escapeHtml(dateStr)}</td>
                  <td>${timeStr}</td>
                  <td>${escapeHtml(log.studentName || 'N/A')}</td>
                  <td>${escapeHtml(log.studentId || 'N/A')}</td>
                  <td>${escapeHtml(log.gateName || 'N/A')}</td>
                  <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    reportContent.innerHTML = summary + table;
  }
  
  reportResults.style.display = 'block';
  reportResults.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show report loader
 */
function showReportLoader(title) {
  const reportResults = document.getElementById('reportResults');
  const reportTitle = document.getElementById('reportTitle');
  const reportLoader = document.getElementById('reportLoader');
  const reportContent = document.getElementById('reportContent');
  const reportError = document.getElementById('reportError');
  
  reportTitle.textContent = title;
  reportLoader.style.display = 'block';
  reportContent.innerHTML = '';
  reportError.style.display = 'none';
  reportResults.style.display = 'block';
  reportResults.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show report error
 */
function showReportError(message) {
  const reportLoader = document.getElementById('reportLoader');
  const reportError = document.getElementById('reportError');
  const reportContent = document.getElementById('reportContent');
  
  reportLoader.style.display = 'none';
  reportContent.innerHTML = '';
  reportError.textContent = message;
  reportError.style.display = 'block';
}

/**
 * Close report results
 */
function closeReport() {
  document.getElementById('reportResults').style.display = 'none';
}

/**
 * Download data as CSV
 */
function downloadCSV(data, filename) {
  if (data.length === 0) {
    alert('No data to download');
    return;
  }
  
  // CSV headers
  const headers = ['Date', 'Time', 'Student Name', 'Student ID', 'Gate', 'Location Status', 'Latitude', 'Longitude'];
  
  // CSV rows
  const rows = data.map(log => {
    let dateStr = 'Invalid Date';
    let timeStr = 'Invalid Time';
    
    // Format time using Philippine timezone (backend already stores in PH time)
    dateStr = formatPhilippineDate(log.entryTime);
    timeStr = formatPhilippineTime(log.entryTime, true);
    
    const statusText = log.locationValid ? 'Valid' : 'Invalid';
    
    return [
      dateStr,
      timeStr,
      log.studentName || 'N/A',
      log.studentId || 'N/A',
      log.gateName || 'N/A',
      statusText,
      log.latitude || 'N/A',
      log.longitude || 'N/A'
    ].map(field => `"${field}"`).join(',');
  });
  
  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get the start of the week (Monday)
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
