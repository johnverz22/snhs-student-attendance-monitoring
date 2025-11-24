/**
 * Script to automatically fix remaining SQLite code in admin routes
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/admin.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all db.prepare().all() patterns
content = content.replace(/db\.prepare\(([\s\S]*?)\)\.all\((.*?)\)/g, (match, query, params) => {
  // Convert ? to $1, $2, etc.
  let paramIndex = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Convert params from ...params to params array
  const paramsArray = params.trim() ? `[${params}]` : '[]';
  
  return `await queryAll(${convertedQuery}, ${paramsArray})`;
});

// Replace all db.prepare().get() patterns
content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\((.*?)\)/g, (match, query, params) => {
  // Convert ? to $1, $2, etc.
  let paramIndex = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Convert params from ...params to params array
  const paramsArray = params.trim() ? `[${params}]` : '[]';
  
  return `await queryOne(${convertedQuery}, ${paramsArray})`;
});

// Replace all db.prepare().run() patterns
content = content.replace(/db\.prepare\(([\s\S]*?)\)\.run\((.*?)\)/g, (match, query, params) => {
  // Convert ? to $1, $2, etc.
  let paramIndex = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Convert params from ...params to params array
  const paramsArray = params.trim() ? `[${params}]` : '[]';
  
  return `await execute(${convertedQuery}, ${paramsArray})`;
});

// Remove const db = dbManager.getConnection() lines
content = content.replace(/\s*const db = dbManager\.getConnection\(\);?\n/g, '\n');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed admin routes!');
console.log('   - Converted db.prepare().all() to queryAll()');
console.log('   - Converted db.prepare().get() to queryOne()');
console.log('   - Converted db.prepare().run() to execute()');
console.log('   - Converted ? to $1, $2, etc.');
console.log('   - Removed db.getConnection() calls');
