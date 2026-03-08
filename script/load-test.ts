const BASE_URL = process.env.APP_URL || "http://localhost:5000";
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 200;

interface TestResult {
  endpoint: string;
  statusCode: number;
  durationMs: number;
  error?: string;
}

async function makeRequest(endpoint: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return {
      endpoint,
      statusCode: response.status,
      durationMs: Date.now() - start,
    };
  } catch (error: any) {
    return {
      endpoint,
      statusCode: 0,
      durationMs: Date.now() - start,
      error: error.message,
    };
  }
}

async function runBatch(endpoints: string[], concurrency: number, total: number): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let completed = 0;

  for (let i = 0; i < total; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, total - i) }, (_, j) => {
      const endpoint = endpoints[(i + j) % endpoints.length];
      return makeRequest(endpoint);
    });
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    completed += batchResults.length;
    process.stdout.write(`\r  Progress: ${completed}/${total} requests completed`);
  }
  console.log();
  return results;
}

function analyzeResults(results: TestResult[]): void {
  const durations = results.map(r => r.durationMs).sort((a, b) => a - b);
  const successCount = results.filter(r => r.statusCode >= 200 && r.statusCode < 400).length;
  const errorCount = results.filter(r => r.statusCode >= 400 || r.statusCode === 0).length;
  const rateLimited = results.filter(r => r.statusCode === 429).length;

  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];
  const maxLatency = durations[durations.length - 1];

  console.log(`  Total requests:    ${results.length}`);
  console.log(`  Successful (2xx):  ${successCount}`);
  console.log(`  Errors (4xx/5xx):  ${errorCount}`);
  console.log(`  Rate limited:      ${rateLimited}`);
  console.log(`  Avg latency:       ${avg.toFixed(0)}ms`);
  console.log(`  P50 latency:       ${p50}ms`);
  console.log(`  P95 latency:       ${p95}ms`);
  console.log(`  P99 latency:       ${p99}ms`);
  console.log(`  Max latency:       ${maxLatency}ms`);

  const statusCounts: Record<number, number> = {};
  for (const r of results) {
    statusCounts[r.statusCode] = (statusCounts[r.statusCode] || 0) + 1;
  }
  console.log(`  Status breakdown:  ${JSON.stringify(statusCounts)}`);
}

async function main() {
  console.log(`\n=== Mindshare AI Load Test ===`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENT_REQUESTS}, Total: ${TOTAL_REQUESTS}\n`);

  const publicEndpoints = ["/api/plans", "/api/engines"];

  console.log("--- Phase 1: Public endpoints (warm-up) ---");
  const warmup = await runBatch(publicEndpoints, 10, 20);
  analyzeResults(warmup);

  console.log("\n--- Phase 2: Sustained load ---");
  const sustained = await runBatch(publicEndpoints, CONCURRENT_REQUESTS, TOTAL_REQUESTS);
  analyzeResults(sustained);

  console.log("\n--- Phase 3: Spike test (2x concurrency) ---");
  const spike = await runBatch(publicEndpoints, CONCURRENT_REQUESTS * 2, TOTAL_REQUESTS);
  analyzeResults(spike);

  const allResults = [...warmup, ...sustained, ...spike];
  const totalErrors = allResults.filter(r => r.statusCode >= 500).length;
  const totalRateLimited = allResults.filter(r => r.statusCode === 429).length;

  console.log("\n=== Summary ===");
  console.log(`Total requests sent: ${allResults.length}`);
  console.log(`Server errors (5xx): ${totalErrors}`);
  console.log(`Rate limited (429):  ${totalRateLimited}`);
  if (totalErrors === 0) {
    console.log("Result: PASS - No server errors under load");
  } else {
    console.log(`Result: WARN - ${totalErrors} server errors detected`);
  }
  if (totalRateLimited > 0) {
    console.log(`Note: Rate limiting is working correctly (${totalRateLimited} requests throttled)`);
  }
}

main().catch(console.error);
