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
 * Get current timestamp in the configured timezone
 * Returns ISO 8601 format string that PostgreSQL can store
 * @returns {Promise<string>} Timestamp in configured timezone (ISO 8601)
 */
async function getCurrentTimestamp() {
  const timezone = await getConfiguredTimezone();
  const offsetHours = getTimezoneOffset(timezone);
  
  // Get current UTC time
  const now = new Date();
  
  // Add timezone offset
  const localTime = new Date(now.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Return ISO 8601 format for PostgreSQL
  return localTime.toISOString();
}

/**
 * Convert UTC timestamp from database to configured timezone
 * @param {string} utcTimestamp - UTC timestamp from database
 * @returns {Promise<string>} Timestamp in configured timezone
 */
async function convertToLocalTime(utcTimestamp) {
  if (!utcTimestamp) return null;
  
  const timezone = await getConfiguredTimezone();
  const offsetHours = getTimezoneOffset(timezone);
  
  // Parse the UTC timestamp
  const utcDate = new Date(utcTimestamp + 'Z'); // Add Z to indicate UTC
  
  // Add timezone offset
  const localDate = new Date(utcDate.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Return ISO 8601 format
  return localDate.toISOString();
}

/**
 * Convert local timestamp to UTC for database storage
 * @param {string} localTimestamp - Timestamp in configured timezone
 * @returns {Promise<string>} UTC timestamp for database
 */
async function convertToUTC(localTimestamp) {
  if (!localTimestamp) return null;
  
  const timezone = await getConfiguredTimezone();
  const offsetHours = getTimezoneOffset(timezone);
  
  // Parse the local timestamp (without timezone indicator)
  const localDate = new Date(localTimestamp);
  
  // Subtract timezone offset to get UTC
  const utcDate = new Date(localDate.getTime() - (offsetHours * 60 * 60 * 1000));
  
  // Return ISO 8601 format
  return utcDate.toISOString();
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
  convertToLocalTime,
  convertToUTC,
  formatTimestamp,
};
