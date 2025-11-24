/**
 * Settings Module - Handles school configuration and QR code management
 */

let originalConfig = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is authenticated
  if (!Auth.requireAuth()) return;
  
  // Load school configuration
  loadSchoolConfig();
  
  // Load QR codes
  loadQRCodes();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // School config form
  const configForm = document.getElementById('schoolConfigForm');
  configForm.addEventListener('submit', handleConfigSubmit);
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetConfigForm);
  
  // Add QR code button
  document.getElementById('addQRBtn').addEventListener('click', handleAddQRCode);
}

/**
 * Load school configuration
 */
async function loadSchoolConfig() {
  const loader = document.getElementById('settingsLoader');
  const form = document.getElementById('schoolConfigForm');
  const errorEl = document.getElementById('settingsLoadError');
  
  try {
    loader.classList.remove('hidden');
    form.classList.add('hidden');
    errorEl.classList.add('hidden');
    
    const response = await API.admin.getSchoolConfig();
    
    if (response.success && response.data) {
      const config = response.data;
      originalConfig = { ...config };
      
      // Populate form
      document.getElementById('schoolName').value = config.schoolName || '';
      document.getElementById('latitude').value = config.latitude || '';
      document.getElementById('longitude').value = config.longitude || '';
      document.getElementById('radiusMeters').value = config.radiusMeters || '';
      document.getElementById('timezone').value = config.timezone || 'UTC';
      
      loader.classList.add('hidden');
      form.classList.remove('hidden');
    } else {
      throw new Error('Failed to load configuration');
    }
  } catch (error) {
    console.error('Failed to load school config:', error);
    loader.classList.add('hidden');
    errorEl.querySelector('p').textContent = 'Failed to load school configuration. Please refresh the page.';
    errorEl.classList.remove('hidden');
  }
}

/**
 * Handle config form submission
 */
async function handleConfigSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const successEl = document.getElementById('settingsSuccess');
  const errorEl = document.getElementById('settingsError');
  
  // Get form data
  const config = {
    schoolName: document.getElementById('schoolName').value,
    latitude: parseFloat(document.getElementById('latitude').value),
    longitude: parseFloat(document.getElementById('longitude').value),
    radiusMeters: parseInt(document.getElementById('radiusMeters').value),
    timezone: document.getElementById('timezone').value
  };
  
  // Validate
  if (isNaN(config.latitude) || isNaN(config.longitude)) {
    errorEl.querySelector('p').textContent = 'Please enter valid latitude and longitude values';
    errorEl.classList.remove('hidden');
    return;
  }
  
  if (isNaN(config.radiusMeters) || config.radiusMeters < 10 || config.radiusMeters > 5000) {
    errorEl.querySelector('p').textContent = 'Radius must be between 10 and 5000 meters';
    errorEl.classList.remove('hidden');
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  successEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  
  try {
    const response = await API.admin.updateSchoolConfig(config);
    
    if (response.success) {
      originalConfig = { ...config };
      successEl.classList.remove('hidden');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successEl.classList.add('hidden');
      }, 3000);
    } else {
      throw new Error(response.message || 'Failed to save settings');
    }
  } catch (error) {
    console.error('Failed to save config:', error);
    errorEl.querySelector('p').textContent = error.message || 'Failed to save settings. Please try again.';
    errorEl.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

/**
 * Reset config form to original values
 */
function resetConfigForm() {
  if (originalConfig) {
    document.getElementById('schoolName').value = originalConfig.schoolName || '';
    document.getElementById('latitude').value = originalConfig.latitude || '';
    document.getElementById('longitude').value = originalConfig.longitude || '';
    document.getElementById('radiusMeters').value = originalConfig.radiusMeters || '';
    document.getElementById('timezone').value = originalConfig.timezone || 'UTC';
    
    document.getElementById('settingsSuccess').classList.add('hidden');
    document.getElementById('settingsError').classList.add('hidden');
  }
}

/**
 * Generate QR code image as data URL
 */
function generateQRCode(text, size = 200) {
  // Create a temporary container for QR code generation
  const tempDiv = document.createElement('div');
  tempDiv.style.display = 'none';
  document.body.appendChild(tempDiv);
  
  try {
    // Use QR Code library via CDN
    if (typeof QRCode !== 'undefined') {
      const qr = new QRCode(tempDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      
      // Get the generated canvas or image
      const canvas = tempDiv.querySelector('canvas');
      const img = tempDiv.querySelector('img');
      
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        document.body.removeChild(tempDiv);
        return dataUrl;
      } else if (img) {
        const dataUrl = img.src;
        document.body.removeChild(tempDiv);
        return dataUrl;
      }
    }
  } catch (error) {
    console.error('QR code generation error:', error);
  }
  
  // Fallback: Use a simple canvas-based placeholder
  document.body.removeChild(tempDiv);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}

/**
 * Download QR code as PNG
 */
function downloadQRCode(code, gateName) {
  // Generate high-resolution QR code for printing (512x512)
  const qrDataUrl = generateQRCode(code, 512);
  
  // Create download link
  const link = document.createElement('a');
  link.href = qrDataUrl;
  link.download = `QR_${gateName.replace(/\s+/g, '_')}_${code}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date safely
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    // Handle SQLite datetime format (YYYY-MM-DD HH:MM:SS)
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Load QR codes
 */
async function loadQRCodes() {
  const loader = document.getElementById('qrCodesLoader');
  const tbody = document.getElementById('qrCodesBody');
  
  try {
    loader.classList.remove('hidden');
    
    const response = await API.admin.getQRCodes();
    
    if (response.success && response.data) {
      const qrCodes = response.data;
      
      if (qrCodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">No QR codes configured</td></tr>';
      } else {
        tbody.innerHTML = qrCodes.map(qr => {
          // Use camelCase property from backend
          const createdDate = formatDate(qr.createdAt);
          const qrDataUrl = generateQRCode(qr.code);
          
          return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm">
                <div class="flex items-center space-x-2">
                  <img src="${qrDataUrl}" alt="QR Code" class="w-12 h-12 border border-gray-200 rounded cursor-pointer" onclick="showQRCodeModal('${escapeHtml(qr.code)}', '${escapeHtml(qr.gateName)}')">
                  <code class="bg-gray-100 px-2 py-1 rounded">${escapeHtml(qr.code)}</code>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">${escapeHtml(qr.gateName)}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${createdDate}</td>
              <td class="px-4 py-3 text-sm">
                <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium transition mr-2" onclick="downloadQRCode('${escapeHtml(qr.code)}', '${escapeHtml(qr.gateName)}')">
                  Download
                </button>
                <button class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium transition" onclick="deleteQRCode(${qr.id}, '${escapeHtml(qr.gateName)}')">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    } else {
      throw new Error('Failed to load QR codes');
    }
  } catch (error) {
    console.error('Failed to load QR codes:', error);
    tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-red-600">Failed to load QR codes</td></tr>';
  } finally {
    loader.classList.add('hidden');
  }
}

/**
 * Show QR code in modal for better viewing
 */
function showQRCodeModal(code, gateName) {
  const qrDataUrl = generateQRCode(code, 300);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">${escapeHtml(gateName)}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="text-center">
        <img src="${qrDataUrl}" alt="QR Code" class="mx-auto border-2 border-gray-200 rounded-lg mb-4" style="width: 300px; height: 300px;">
        <code class="bg-gray-100 px-3 py-2 rounded text-sm">${escapeHtml(code)}</code>
        <div class="mt-4 flex space-x-2 justify-center">
          <button onclick="downloadQRCode('${escapeHtml(code)}', '${escapeHtml(gateName)}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Download QR Code
          </button>
          <button onclick="window.print()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Print
          </button>
          <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Make functions available globally
window.downloadQRCode = downloadQRCode;
window.showQRCodeModal = showQRCodeModal;

/**
 * Handle add QR code
 */
async function handleAddQRCode() {
  const qrCodeInput = document.getElementById('qrCode');
  const gateNameInput = document.getElementById('gateName');
  const successEl = document.getElementById('qrSuccess');
  const errorEl = document.getElementById('qrError');
  
  const qrCode = qrCodeInput.value.trim();
  const gateName = gateNameInput.value.trim();
  
  // Validate
  if (!qrCode || !gateName) {
    errorEl.querySelector('p').textContent = 'Please enter both QR code and gate name';
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 3000);
    return;
  }
  
  successEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  
  try {
    const response = await API.admin.createQRCode({
      code: qrCode,
      gateName: gateName
    });
    
    if (response.success) {
      successEl.querySelector('p').textContent = 'QR code added successfully!';
      successEl.classList.remove('hidden');
      
      // Clear inputs
      qrCodeInput.value = '';
      gateNameInput.value = '';
      
      // Reload QR codes list
      await loadQRCodes();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successEl.classList.add('hidden');
      }, 3000);
    } else {
      throw new Error(response.message || 'Failed to add QR code');
    }
  } catch (error) {
    console.error('Failed to add QR code:', error);
    errorEl.querySelector('p').textContent = error.message || 'Failed to add QR code. Please try again.';
    errorEl.classList.remove('hidden');
  }
}

/**
 * Delete QR code
 */
async function deleteQRCode(id, gateName) {
  if (!confirm(`Are you sure you want to delete the QR code for "${gateName}"?`)) {
    return;
  }
  
  const errorEl = document.getElementById('qrError');
  const successEl = document.getElementById('qrSuccess');
  
  try {
    const response = await API.admin.deleteQRCode(id);
    
    if (response.success) {
      successEl.querySelector('p').textContent = 'QR code deleted successfully!';
      successEl.classList.remove('hidden');
      
      // Reload QR codes list
      await loadQRCodes();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successEl.classList.add('hidden');
      }, 3000);
    } else {
      throw new Error(response.message || 'Failed to delete QR code');
    }
  } catch (error) {
    console.error('Failed to delete QR code:', error);
    errorEl.querySelector('p').textContent = error.message || 'Failed to delete QR code. Please try again.';
    errorEl.classList.remove('hidden');
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.deleteQRCode = deleteQRCode;
