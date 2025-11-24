/**
 * Database helper utilities for PostgreSQL
 * Provides compatibility layer for migrating from SQLite
 */

const dbManager = require('../models/database');

/**
 * Execute a query and return all rows
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
async function queryAll(query, params = []) {
  return await dbManager.query(query, params);
}

/**
 * Execute a query and return a single row
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
async function queryOne(query, params = []) {
  return await dbManager.queryOne(query, params);
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Result with rowCount and rows (for RETURNING clause)
 */
async function execute(query, params = []) {
  const pool = dbManager.getConnection();
  const result = await pool.query(query, params);
  return {
    rowCount: result.rowCount,
    rows: result.rows,
    // For compatibility with SQLite's lastInsertRowid
    lastInsertId: result.rows[0]?.id || null,
  };
}

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives a client
 * @returns {Promise<any>} Result of the transaction
 */
async function transaction(callback) {
  const client = await dbManager.getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Convert SQLite boolean (0/1) to PostgreSQL boolean (true/false)
 * @param {any} value - Value to convert
 * @returns {boolean} Boolean value
 */
function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  return value === 1 || value === '1' || value === true || value === 'true';
}

/**
 * Convert PostgreSQL boolean to SQLite-style integer (for compatibility)
 * @param {any} value - Value to convert
 * @returns {number} 0 or 1
 */
function fromBoolean(value) {
  return value ? 1 : 0;
}

module.exports = {
  queryAll,
  queryOne,
  execute,
  transaction,
  toBoolean,
  fromBoolean,
};
