// Performance tracking middleware
// Tracks and logs response times for API endpoints

const performanceMetrics = {
  requests: [],
  maxHistorySize: 1000, // Keep last 1000 requests
};

/**
 * Middleware to track response time
 */
function trackResponseTime(req, res, next) {
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Wrap res.end to capture when response is sent
  const originalEnd = res.end;
  res.end = function(...args) {
    const hrTime = process.hrtime(startHrTime);
    const responseTime = Math.round(hrTime[0] * 1000 + hrTime[1] / 1000000); // Convert to ms

    // Record metric
    const metric = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime, // milliseconds
      userId: req.userId || 'anonymous', // if auth middleware sets this
    };

    performanceMetrics.requests.push(metric);

    // Keep history size manageable
    if (performanceMetrics.requests.length > performanceMetrics.maxHistorySize) {
      performanceMetrics.requests.shift();
    }

    // Log slow requests (> 500ms in development)
    const slowThreshold = process.env.NODE_ENV === 'production' ? 500 : 1000;
    if (responseTime > slowThreshold) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${responseTime}ms`);
    }

    // Add response time header for debugging
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Get performance statistics
 */
function getStats() {
  if (performanceMetrics.requests.length === 0) {
    return { error: 'No requests tracked yet' };
  }

  const times = performanceMetrics.requests.map(r => r.responseTime);
  const sorted = times.sort((a, b) => a - b);
  
  return {
    totalRequests: performanceMetrics.requests.length,
    avgResponseTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minResponseTime: Math.min(...times),
    maxResponseTime: Math.max(...times),
    medianResponseTime: sorted[Math.floor(sorted.length / 2)],
    p95ResponseTime: sorted[Math.floor(sorted.length * 0.95)],
    p99ResponseTime: sorted[Math.floor(sorted.length * 0.99)],
    requestsUnder300ms: times.filter(t => t < 300).length,
    requestsUnder500ms: times.filter(t => t < 500).length,
    successRate: ((performanceMetrics.requests.filter(r => r.statusCode < 400).length / performanceMetrics.requests.length) * 100).toFixed(2) + '%',
  };
}

/**
 * Get recent requests
 */
function getRecentRequests(limit = 50) {
  return performanceMetrics.requests.slice(-limit).reverse();
}

/**
 * Reset metrics
 */
function reset() {
  performanceMetrics.requests = [];
}

module.exports = {
  trackResponseTime,
  getStats,
  getRecentRequests,
  reset,
};
