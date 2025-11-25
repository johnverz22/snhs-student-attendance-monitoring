// FIXED VERSION - Replace lines 111-177 in src/services/locationService.js

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
