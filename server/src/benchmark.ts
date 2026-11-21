import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  buildMetricsScorecard,
  type BenchmarkSummary,
  type DatasetItem,
  type ManualBaselineResults,
  type ReplayItemResult,
} from '@bakante/shared';
import { BakanteDatabase } from './db.ts';
import { BASELINE_DIR, DOCS_DIR } from './paths.ts';

export function loadDataset(): DatasetItem[] {
  const filePath = path.join(BASELINE_DIR, 'dataset.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DatasetItem[];
}

export function loadManualResults(): ManualBaselineResults {
  const filePath = path.join(BASELINE_DIR, 'manual_results.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ManualBaselineResults;
}

export function saveManualResults(updated: ManualBaselineResults): ManualBaselineResults {
  const filePath = path.join(BASELINE_DIR, 'manual_results.json');
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  return updated;
}

/**
 * Replays the exact 20-request dataset on a clean in-memory SQLite database.
 * Measures exact processing time, checks 0% double-bookings and 0% invalid errors,
 * and computes the official Section 9.4 Scorecard against manual baseline timings.
 */
export function runDatasetReplayBenchmark(
  customManual?: ManualBaselineResults
): BenchmarkSummary {
  const dataset = loadDataset();
  const manual = customManual ?? loadManualResults();

  // Isolated in-memory SQLite DB so the benchmark does not overwrite your live demo schedule
  const replayDb = new BakanteDatabase(':memory:');
  const items: ReplayItemResult[] = [];

  let bookedCount = 0;
  let conflictBlockedCount = 0;
  let errorCaughtCount = 0;
  let totalBinarySearchSteps = 0;
  let totalLinearScanSteps = 0;

  const overallStart = performance.now();

  for (const req of dataset) {
    const itemStart = performance.now();
    const evaluation = replayDb.createBookingAtomic(req);
    const itemDurationMs = Number((performance.now() - itemStart).toFixed(3));

    totalBinarySearchSteps += evaluation.binarySearchSteps;
    totalLinearScanSteps += evaluation.linearScanSteps;

    const actualOutcome =
      evaluation.status === 'BOOKED'
        ? 'BOOKED'
        : evaluation.status === 'CONFLICT'
          ? 'CONFLICT'
          : 'VALIDATION_ERROR';

    if (actualOutcome === 'BOOKED') bookedCount += 1;
    if (actualOutcome === 'CONFLICT') conflictBlockedCount += 1;
    if (actualOutcome === 'VALIDATION_ERROR') errorCaughtCount += 1;

    items.push({
      requestId: req.requestId,
      facilityId: req.facilityId || '(blank)',
      date: req.date,
      timeRange: `${req.startTime}–${req.endTime}`,
      eventTitle: req.eventTitle,
      expectedOutcome: req.expectedOutcome,
      actualOutcome,
      matchedExpectation: actualOutcome === req.expectedOutcome,
      durationMs: itemDurationMs,
      binarySearchSteps: evaluation.binarySearchSteps,
      linearScanSteps: evaluation.linearScanSteps,
      summary: evaluation.message,
      suggestedRoomId: evaluation.alternativeRooms[0]?.facility.id,
    });
  }

  const totalSystemTimeMs = Number((performance.now() - overallStart).toFixed(3));
  replayDb.close();

  // Since Bakante blocks every conflict and error, admitted conflicts/errors are 0
  // (unless an unexpected mismatch occurred).
  const systemConflictsAdmitted = items.filter(
    (item) => item.expectedOutcome === 'CONFLICT' && item.actualOutcome === 'BOOKED'
  ).length;
  const systemErrorsAdmitted = items.filter(
    (item) =>
      item.expectedOutcome === 'VALIDATION_ERROR' && item.actualOutcome === 'BOOKED'
  ).length;

  const scorecard = buildMetricsScorecard({
    manual,
    systemTotalMs: totalSystemTimeMs,
    systemConflictsAdmitted,
    systemErrorsAdmitted,
    totalRequests: dataset.length,
  });

  return {
    ranAt: new Date().toISOString(),
    totalRequests: dataset.length,
    bookedCount,
    conflictBlockedCount,
    errorCaughtCount,
    totalSystemTimeMs,
    avgSystemTimeMs: Number((totalSystemTimeMs / dataset.length).toFixed(3)),
    totalBinarySearchSteps,
    totalLinearScanSteps,
    allMatchedExpectations: items.every((item) => item.matchedExpectation),
    manualBaseline: manual,
    scorecard,
    items,
  };
}

/**
 * Formats and writes the Section 9.4 Metrics Scorecard to docs/scorecard.md.
 */
export function writeScorecardMarkdown(summary: BenchmarkSummary): string {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const targetPath = path.join(DOCS_DIR, 'scorecard.md');

  const lines = [
    '# Bakante — Official Metrics Scorecard (Section 9.4)',
    '',
    `- **Track**: Track 5 — University Operations: Facility & Room Booking`,
    `- **Dataset**: 20 ISATU booking requests (\`baseline/dataset.csv\`)`,
    `- **Manual Baseline Recorded By**: ${summary.manualBaseline.recordedBy} (${summary.manualBaseline.isPlaceholder ? 'Placeholder — replace with live QA timing' : 'Verified Stopwatch Run'})`,
    `- **Last Benchmark Run**: ${summary.ranAt}`,
    '',
    '| Metric | Baseline (Manual) | New System (Bakante) | % Improvement | Test Method |',
    '|---|---|---|---|---|',
    ...summary.scorecard.map(
      (row) =>
        `| ${row.metric} | ${row.baselineDisplay} | ${row.newSystemDisplay} | **${row.improvementDisplay}** | ${row.testMethod} |`
    ),
    '',
    '## Dataset Replay Summary',
    `- Valid Bookings Confirmed: **${summary.bookedCount} / 10**`,
    `- Double-Booking Conflicts Blocked: **${summary.conflictBlockedCount} / 6**`,
    `- Invalid Data Errors Caught: **${summary.errorCaughtCount} / 4**`,
    `- All 20 Expectations Matched: **${summary.allMatchedExpectations ? 'YES (100%)' : 'NO'}**`,
    `- Total Binary Search Comparisons vs. Linear Scan: **${summary.totalBinarySearchSteps} steps** vs. **${summary.totalLinearScanSteps} steps**`,
    '',
  ];

  const markdown = lines.join('\n');
  fs.writeFileSync(targetPath, markdown, 'utf-8');
  return targetPath;
}
