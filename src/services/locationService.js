const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');

/**
 * LocationService handles GPS coordinate validation and school boundary checking
 */
class LocationService {
  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    // Earth's radius in meters
    const R = 6371000;

    // Convert degrees to radians
    const φ1 = this.toRadians(lat1);
    const φ2 = this.toRadians(lat2);
    const Δφ = this.toRadians(lat2 - lat1);
    const Δλ = this.toRadians(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate if GPS coordinates are within school boundaries
   * @param {number} latitude - Student's latitude
   * @param {number} longitude - Student's longitude
   * @returns {Object} Validation result with isValid, distance, and school config
   */
  async validateLocation(latitude, longitude) {
    try {
      // Get school configuration
      const schoolConfig = await this.getSchoolConfig();

      if (!schoolConfig) {
        throw new Error('School configuration not found');
      }

      // Calculate distance from school center
      const distance = this.calculateDistance(
        latitude,
        longitude,
        schoolConfig.latitude,
        schoolConfig.longitude
      );

      // Check if within allowed radius
      const isValid = distance <= schoolConfig.radius_meters;

      // Log validation attempt
      this.logValidation(latitude, longitude, distance, isValid);

      return {
        isValid,
        distance: Math.round(distance),
        maxAllowedDistance: schoolConfig.radius_meters,
        schoolLocation: {
          latitude: schoolConfig.latitude,
          longitude: schoolConfig.longitude,
        },
      };
    } catch (error) {
      console.error('Location validation error:', error);
      throw error;
    }
  }

  /**
   * Get school configuration from database
   * @returns {Object} School configuration
   */
  async getSchoolConfig() {
    try {
            const config = await queryOne('SELECT * FROM school_config WHERE id = 1', []);
      return config;
    } catch (error) {
      console.error('Error fetching school config:', error);
      throw new Error('Failed to fetch school configuration');
    }
  }

  /**
   * Update school configuration
   * @param {Object} configData - New configuration data
   * @returns {Object} Updated configuration
   */
  async updateSchoolConfig(configData) {
    try {
            
      // Validate input
      if (configData.latitude !== undefined && (configData.latitude < -90 || configData.latitude > 90)) {
        throw new Error('Latitude must be between -90 and 90');
      }
      
      if (configData.longitude !== undefined && (configData.longitude < -180 || configData.longitude > 180)) {
        throw new Error('Longitude must be between -180 and 180');
      }
      
      if (configData.radius_meters !== undefined && configData.radius_meters <= 0) {
        throw new Error('Radius must be greater than 0');
      }

      // Build update query dynamically with PostgreSQL placeholders
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      if (configData.school_name !== undefined) {
        updateFields.push(`school_name = $${paramIndex++}`);
        values.push(configData.school_name);
      }
      
      if (configData.latitude !== undefined) {
        updateFields.push(`latitude = $${paramIndex++}`);
        values.push(configData.latitude);
      }
      
      if (configData.longitude !== undefined) {
        updateFields.push(`longitude = $${paramIndex++}`);
        values.push(configData.longitude);
      }
      
      if (configData.radius_meters !== undefined) {
        updateFields.push(`radius_meters = $${paramIndex++}`);
        values.push(configData.radius_meters);
      }
      
      if (configData.timezone !== undefined) {
        updateFields.push(`timezone = $${paramIndex++}`);
        values.push(configData.timezone);
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at timestamp (no parameter needed)
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add id parameter for WHERE clause
      values.push(1); // id = 1
      const query = `UPDATE school_config SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
      
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      await execute(query, values);

      // Return updated configuration
      return await this.getSchoolConfig();
    } catch (error) {
      console.error('Error updating school config:', error);
      throw error;
    }
  }

  /**
   * Log location validation attempt
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} distance
   * @param {boolean} isValid
   */
  logValidation(latitude, longitude, distance, isValid) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Location validation: lat=${latitude}, lon=${longitude}, distance=${Math.round(distance)}m, valid=${isValid}`);
  }
}

module.exports = new LocationService();
