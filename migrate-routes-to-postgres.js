#!/usr/bin/env node
/**
 * Migrate all route files from SQLite to PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/routes/admin.js',
  'src/routes/parent.js',
  'src/services/notificationService.js',
  'src/services/reportService.js',
  'src/services/locationService.js',
  'src/utils/timezone.js'
];

function convertSQLiteToPostgres(content, filename) {
  console.log(`\n📝 Processing ${filename}...`);
  
  let changes = 0;
  
  // Add imports if not present
  if (!content.includes("require('../utils/dbHelpers')") && !content.includes("require('./utils/dbHelpers')")) {
    const requirePath = filename.includes('services') || filename.includes('utils') ? '../utils/dbHelpers' : '../utils/dbHelpers';
    if (content.includes("const dbManager = require")) {
      content = content.replace(
        /(const dbManager = require\(['"].*?['"]\);)/,
        `$1\nconst { queryOne, queryAll, execute, transaction } = require('${requirePath}');`
      );
      changes++;
      console.log('   ✓ Added dbHelpers import');
    }
  }
  
  // Remove db.getConnection() assignments
  const dbGetConnectionPattern = /const db = dbManager\.getConnection\(\);?\n?/g;
  const dbMatches = content.match(dbGetConnectionPattern);
  if (dbMatches) {
    content = content.replace(dbGetConnectionPattern, '');
    changes += dbMatches.length;
    console.log(`   ✓ Removed ${dbMatches.length} db.getConnection() calls`);
  }
  
  // Convert db.prepare(...).all(...params) to await queryAll(..., [...params])
  const allPattern = /db\.prepare\(\s*`([^`]+)`\s*\)\.all\(([^)]*)\)/g;
  let allMatches = 0;
  content = content.replace(allPattern, (match, query, params) => {
    allMatches++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await queryAll(\`${convertedQuery}\`, ${paramsArray})`;
  });
  if (allMatches > 0) {
    changes += allMatches;
    console.log(`   ✓ Converted ${allMatches} .all() calls`);
  }
  
  // Convert db.prepare(...).get(...params) to await queryOne(..., [...params])
  const getPattern = /db\.prepare\(\s*`([^`]+)`\s*\)\.get\(([^)]*)\)/g;
  let getMatches = 0;
  content = content.replace(getPattern, (match, query, params) => {
    getMatches++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await queryOne(\`${convertedQuery}\`, ${paramsArray})`;
  });
  if (getMatches > 0) {
    changes += getMatches;
    console.log(`   ✓ Converted ${getMatches} .get() calls`);
  }
  
  // Convert db.prepare(...).run(...params) to await execute(..., [...params])
  const runPattern = /db\.prepare\(\s*`([^`]+)`\s*\)\.run\(([^)]*)\)/g;
  let runMatches = 0;
  content = content.replace(runPattern, (match, query, params) => {
    runMatches++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await execute(\`${convertedQuery}\`, ${paramsArray})`;
  });
  if (runMatches > 0) {
    changes += runMatches;
    console.log(`   ✓ Converted ${runMatches} .run() calls`);
  }
  
  // Convert single-quoted queries
  const allPatternSingle = /db\.prepare\(\s*'([^']+)'\s*\)\.all\(([^)]*)\)/g;
  content = content.replace(allPatternSingle, (match, query, params) => {
    changes++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await queryAll('${convertedQuery}', ${paramsArray})`;
  });
  
  const getPatternSingle = /db\.prepare\(\s*'([^']+)'\s*\)\.get\(([^)]*)\)/g;
  content = content.replace(getPatternSingle, (match, query, params) => {
    changes++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await queryOne('${convertedQuery}', ${paramsArray})`;
  });
  
  const runPatternSingle = /db\.prepare\(\s*'([^']+)'\s*\)\.run\(([^)]*)\)/g;
  content = content.replace(runPatternSingle, (match, query, params) => {
    changes++;
    let paramIndex = 1;
    const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    const paramsArray = params.trim() ? `[${params}]` : '[]';
    return `await execute('${convertedQuery}', ${paramsArray})`;
  });
  
  // Convert db.prepare(query).all(...params) where query is a variable
  content = content.replace(/db\.prepare\(query\)\.all\(\.\.\.params\)/g, 'await queryAll(query, params)');
  content = content.replace(/db\.prepare\(countQuery\)\.get\(\.\.\.countParams\)/g, 'await queryOne(countQuery, countParams)');
  
  // Convert boolean comparisons
  content = content.replace(/is_archived = 0/g, 'is_archived = FALSE');
  content = content.replace(/is_archived = 1/g, 'is_archived = TRUE');
  content = content.replace(/is_active = 0/g, 'is_active = FALSE');
  content = content.replace(/is_active = 1/g, 'is_active = TRUE');
  
  console.log(`   📊 Total changes: ${changes}`);
  return content;
}

// Process each file
let totalChanges = 0;
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const newContent = convertSQLiteToPostgres(originalContent, file);
  
  if (originalContent !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`   ✅ Updated ${file}`);
    totalChanges++;
  } else {
    console.log(`   ℹ️  No changes needed for ${file}`);
  }
});

console.log(`\n✅ Migration complete! Updated ${totalChanges} files.`);
console.log('\n⚠️  IMPORTANT: Review the changes and test thoroughly!');
console.log('   Some complex queries may need manual adjustment.');
