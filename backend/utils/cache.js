// Simple in-memory cache implementation (for development/small deployments)
// For production scale, use Redis instead

let cache = {};
let cacheExpiry = {};

const CACHE_DURATIONS = {
  products: 5 * 60 * 1000,      // 5 minutes
  users: 10 * 60 * 1000,        // 10 minutes
  analytics: 30 * 60 * 1000,    // 30 minutes
};

/**
 * Get value from cache
 * @param {string} key 
 * @returns {any} cached value or null
 */
function get(key) {
  if (cache[key] === undefined) return null;
  
  // Check if expired
  if (cacheExpiry[key] && Date.now() > cacheExpiry[key]) {
    delete cache[key];
    delete cacheExpiry[key];
    return null;
  }
  
  return cache[key];
}

/**
 * Set value in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} duration - duration in ms (optional, uses default based on pattern)
 */
function set(key, value, duration) {
  // Determine duration based on key prefix
  let ttl = duration;
  if (!ttl) {
    const prefix = key.split(':')[0];
    ttl = CACHE_DURATIONS[prefix] || 5 * 60 * 1000; // default 5 min
  }
  
  cache[key] = value;
  cacheExpiry[key] = Date.now() + ttl;
}

/**
 * Delete a cache entry
 * @param {string} key 
 */
function del(key) {
  delete cache[key];
  delete cacheExpiry[key];
}

/**
 * Invalidate all cache keys matching a pattern
 * @param {string} pattern - pattern like "products:*"
 */
function invalidate(pattern) {
  const regex = new RegExp(pattern.replace('*', '.*'));
  Object.keys(cache).forEach(key => {
    if (regex.test(key)) {
      del(key);
    }
  });
}

/**
 * Clear all cache
 */
function clear() {
  cache = {};
  cacheExpiry = {};
}

/**
 * Get cache statistics
 */
function stats() {
  return {
    keys: Object.keys(cache).length,
    memory: JSON.stringify(cache).length,
  };
}

module.exports = {
  get,
  set,
  del,
  invalidate,
  clear,
  stats,
};
