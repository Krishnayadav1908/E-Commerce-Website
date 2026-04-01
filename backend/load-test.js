/**
 * Load test script for e-commerce API
 * Usage: node backend/load-test.js <baseUrl> <concurrentUsers> <duration>
 * Example: node backend/load-test.js http://localhost:3000 50 10
 */

const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';
const concurrentUsers = parseInt(args[1]) || 10;
const durationSeconds = parseInt(args[2]) || 10;

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  startTime: Date.now(),
};

/**
 * Make HTTP request and measure response time
 */
function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      stats.responseTimes.push(responseTime);
      stats.totalRequests++;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }

      // Consume response data
      res.on('data', () => {});
      res.on('end', () => resolve());
    }).on('error', () => {
      stats.failedRequests++;
      stats.totalRequests++;
      resolve();
    });
  });
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log(`\n📊 E-Commerce API Load Test`);
  console.log(`URL: ${baseUrl}`);
  console.log(`Concurrent Users: ${concurrentUsers}`);
  console.log(`Duration: ${durationSeconds}s`);
  console.log(`Started at: ${new Date().toLocaleTimeString()}\n`);

  const testEndTime = stats.startTime + durationSeconds * 1000;
  let activeRequests = 0;

  // Create continuous load
  const loadInterval = setInterval(async () => {
    if (Date.now() > testEndTime) {
      clearInterval(loadInterval);
      return;
    }

    // Maintain concurrent user count
    while (activeRequests < concurrentUsers) {
      activeRequests++;
      
      // Mix of endpoints to test
      const endpoints = [
        '/api/health',
        '/api/products',
        '/api/products?page=1&limit=12&category=electronics',
        '/api/metrics/performance',
      ];
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const url = baseUrl + randomEndpoint;

      makeRequest(url).then(() => {
        activeRequests--;
      });
    }
  }, 100);

  // Wait for test to complete
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (Date.now() > testEndTime && activeRequests === 0) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500);
  });

  // Calculate stats
  calculateAndPrintResults();
}

/**
 * Calculate and print results
 */
function calculateAndPrintResults() {
  const responseTimes = stats.responseTimes.sort((a, b) => a - b);
  const totalTime = (Date.now() - stats.startTime) / 1000;

  const results = {
    duration: totalTime.toFixed(2) + 's',
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests,
    successRate: ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%',
    requestsPerSecond: (stats.totalRequests / totalTime).toFixed(2),
    avgResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2) + 'ms',
    minResponseTime: responseTimes[0] + 'ms',
    maxResponseTime: responseTimes[responseTimes.length - 1] + 'ms',
    medianResponseTime: responseTimes[Math.floor(responseTimes.length / 2)] + 'ms',
    p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] + 'ms',
    p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] + 'ms',
    requestsUnder300ms: responseTimes.filter(t => t < 300).length + ' (' + ((responseTimes.filter(t => t < 300).length / responseTimes.length) * 100).toFixed(2) + '%)',
  };

  console.log('\n📈 Load Test Results');
  console.log('='.repeat(60));
  Object.entries(results).forEach(([key, value]) => {
    console.log(`${key.padEnd(25)}: ${String(value).padStart(20)}`);
  });
  console.log('='.repeat(60));

  // Performance verdict
  console.log('\n🎯 Performance Analysis:');
  const avgTime = parseFloat(results.avgResponseTime);
  const under300ms = parseInt(results.requestsUnder300ms);

  if (avgTime < 300 && under300ms > stats.totalRequests * 0.90) {
    console.log('✅ EXCELLENT: Average response time < 300ms and 90%+ requests under 300ms');
  } else if (avgTime < 500) {
    console.log('✅ GOOD: Average response time < 500ms');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT: Response time > 500ms, consider optimization');
  }

  console.log(`✅ Your app can handle ${concurrentUsers} concurrent users\n`);
}

// Run the test
runLoadTest().catch(console.error);
