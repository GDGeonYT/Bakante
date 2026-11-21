import { runDatasetReplayBenchmark, writeScorecardMarkdown } from './benchmark.ts';

const summary = runDatasetReplayBenchmark();
const scorecardPath = writeScorecardMarkdown(summary);

console.log('\n=== BAKANTE 20-REQUEST BASELINE REPLAY ===');
console.log(
  `Confirmed: ${summary.bookedCount}/10 | Conflicts Blocked: ${summary.conflictBlockedCount}/6 | Errors Caught: ${summary.errorCaughtCount}/4`
);
console.log(
  `Total System Time: ${summary.totalSystemTimeMs} ms (${summary.avgSystemTimeMs} ms/req)`
);
console.log(
  `Binary Search Steps: ${summary.totalBinarySearchSteps} vs. Linear Scan Steps: ${summary.totalLinearScanSteps}`
);
console.log(`All 20 Expectations Matched: ${summary.allMatchedExpectations ? 'YES' : 'NO'}\n`);

console.table(
  summary.scorecard.map((row) => ({
    Metric: row.metric,
    Baseline: row.baselineDisplay,
    Bakante: row.newSystemDisplay,
    Improvement: row.improvementDisplay,
  }))
);

console.log(`Updated scorecard saved to: ${scorecardPath}\n`);

if (!summary.allMatchedExpectations) {
  process.exit(1);
}
