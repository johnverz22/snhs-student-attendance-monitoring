/**
 * Quick script to test and show the fix for locationService.js
 */

// The BROKEN code (current):
function brokenUpdateQuery(configData) {
  const fields = [];
  const values = [];
  
  if (configData.school_name !== undefined) {
    fields.push('school_name = ?');
    values.push(configData.school_name);
  }
  
  if (configData.latitude !== undefined) {
    fields.push('latitude = ?');
    values.push(configData.latitude);
  }
  
  // Add updated_at timestamp
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  // PROBLEM: fields.length includes 'updated_at' which has no parameter!
  values.push(1); // id = 1
  const query = `UPDATE school_config SET ${fields.map((f, i) => f.replace('?', `$${i + 1}`)).join(', ')} WHERE id = $${fields.length + 1}`;
  
  console.log('BROKEN Query:', query);
  console.log('Values:', values);
  console.log('Problem: WHERE id = $' + (fields.length + 1), 'but we only have', values.length, 'values');
}

// The FIXED code:
function fixedUpdateQuery(configData) {
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
  
  // Add updated_at timestamp (no parameter)
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  
  // Add id parameter
  values.push(1); // id = 1
  const query = `UPDATE school_config SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
  
  console.log('FIXED Query:', query);
  console.log('Values:', values);
  console.log('Correct: WHERE id = $' + paramIndex, 'and we have', values.length, 'values');
}

// Test
console.log('=== BROKEN VERSION ===');
brokenUpdateQuery({ school_name: 'Test School', latitude: 40.7128 });

console.log('\n=== FIXED VERSION ===');
fixedUpdateQuery({ school_name: 'Test School', latitude: 40.7128 });
