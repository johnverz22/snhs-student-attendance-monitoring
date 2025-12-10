/**
 * Timezone utility functions for handling date/time conversions
 */

/**
 * Get the configured timezone from school config
 * @returns {Promise<string>} Timezone string (e.g., 'Asia/Manila', 'UTC+8')
 */
async function getConfiguredTimezone() {
  const { queryOne } = require('../utils/dbHelpers');
    
  const config = await queryOne('SELECT timezone FROM school_config WHERE id = 1', []);
  return config?.timezone || 'UTC';
}

/**
 * Convert a timezone string to offset in hours
 * @param {string} timezone - Timezone string (e.g., 'UTC+8', 'Asia/Manila')
 * @returns {number} Offset in hours
 */
function getTimezoneOffset(timezone) {
  // Handle UTC+X or UTC-X format
  const utcMatch = timezone.match(/^UTC([+-]\d+)$/);
  if (utcMatch) {
    return parseInt(utcMatch[1]);
  }
  
  // For named timezones like 'Asia/Manila', we'll use a lookup table
  const timezoneOffsets = {
    'Asia/Manila': 8,
    'Asia/Singapore': 8,
    'Asia/Hong_Kong': 8,
    'Asia/Tokyo': 9,
    'America/New_York': -5,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'UTC': 0,
  };
  
  return timezoneOffsets[timezone] || 0;
}

/**
 * Get current timestamp in the configured timezone for database storage
 * Returns "naive" timestamp (no timezone info) in local timezone
 * @returns {Promise<string>} Timestamp in configured timezone for DB storage
 */
async function getCurrentTimestamp() {
  const timezone = await getConfiguredTimezone();
  const offsetHours = getTimezoneOffset(timezone);
  
  // Get current UTC time
  const now = new Date();
  
  // Calculate local time in configured timezone
  const localTime = new Date(now.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Return as "naive" timestamp (no Z suffix) for consistent storage
  return localTime.toISOString().replace('Z', '');
}

/**
 * Get current timestamp for logging (always UTC)
 * @returns {string} UTC timestamp for consistent logging
 */
function getCurrentLogTimestamp() {
  return new Date().toISOString();
}

/**
 * Convert database timestamp to display format in configured timezone
 * Database stores "naive" timestamps (already in local timezone)
 * @param {string} dbTimestamp - Timestamp from database (naive, in local timezone)
 * @returns {Promise<string>} Formatted timestamp for display
 */
async function convertToLocalTime(dbTimestamp) {
  if (!dbTimestamp) return null;
  
  // Database timestamp is already in configured timezone
  // Just parse it as-is (don't add Z to avoid UTC conversion)
  const localDate = new Date(dbTimestamp);
  
  // Return ISO 8601 format for consistency
  return localDate.toISOString();
}

/**
 * Convert client timestamp to database format
 * Client sends UTC timestamp, we store it as local time
 * @param {string} clientTimestamp - UTC timestamp from client
 * @returns {Promise<string>} Timestamp for database storage (in local timezone)
 */
async function convertToLocalStorage(clientTimestamp) {
  if (!clientTimestamp) return null;
  
  const timezone = await getConfiguredTimezone();
  const offsetHours = getTimezoneOffset(timezone);
  
  // Parse the UTC timestamp from client
  const utcDate = new Date(clientTimestamp);
  
  // Convert to local timezone for storage
  const localDate = new Date(utcDate.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Return without Z suffix (naive timestamp)
  return localDate.toISOString().replace('Z', '');
}

/**
 * Format timestamp for display
 * @param {string} timestamp - Timestamp to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp, includeSeconds = true) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (includeSeconds) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

module.exports = {
  getConfiguredTimezone,
  getTimezoneOffset,
  getCurrentTimestamp,
  getCurrentLogTimestamp,
  convertToLocalTime,
  convertToLocalStorage,
  formatTimestamp,
};
