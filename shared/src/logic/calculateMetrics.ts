import type { ManualBaselineResults, ScorecardRow } from '../types.ts';

/**
 * Official Tech4ISATU Hackathon Section 9.1 Formula:
 *   % Improvement = |Baseline - New| / Baseline * 100
 *
 * Returns null when Baseline is 0 (guideline rule: report qualitative gain instead).
 */
export function calculateImprovementPercent(
  baselineValue: number,
  newValue: number
): number | null {
  if (baselineValue <= 0) {
    return null;
  }
  const percent = (Math.abs(baselineValue - newValue) / baselineValue) * 100;
  return Number(percent.toFixed(2));
}

/**
 * Builds the official 3-row Section 9.4 Metrics Scorecard:
 *   1. Processing Time
 *   2. Duplicate / Conflict Rate
 *   3. Error Rate
 */
export function buildMetricsScorecard(params: {
  manual: ManualBaselineResults;
  systemTotalMs: number;
  systemConflictsAdmitted: number;
  systemErrorsAdmitted: number;
  totalRequests: number;
}): ScorecardRow[] {
  const {
    manual,
    systemTotalMs,
    systemConflictsAdmitted,
    systemErrorsAdmitted,
    totalRequests,
  } = params;

  const systemTotalSeconds = systemTotalMs / 1000;
  const timeImprovement = calculateImprovementPercent(
    manual.totalTimeSeconds,
    systemTotalSeconds
  );

  const manualConflictRate = (manual.conflictsMissedCount / totalRequests) * 100;
  const systemConflictRate = (systemConflictsAdmitted / totalRequests) * 100;
  const conflictImprovement = calculateImprovementPercent(
    manualConflictRate,
    systemConflictRate
  );

  const manualErrorRate = (manual.errorsAdmittedCount / totalRequests) * 100;
  const systemErrorRate = (systemErrorsAdmitted / totalRequests) * 100;
  const errorImprovement = calculateImprovementPercent(
    manualErrorRate,
    systemErrorRate
  );

  return [
    {
      metric: 'Processing Time (20 requests)',
      baselineDisplay: `${manual.totalTimeSeconds.toFixed(1)} sec (${(manual.totalTimeSeconds / totalRequests).toFixed(1)} s/req)`,
      newSystemDisplay: `${systemTotalSeconds.toFixed(4)} sec (${(systemTotalMs / totalRequests).toFixed(2)} ms/req)`,
      improvementDisplay:
        timeImprovement !== null
          ? `${timeImprovement.toFixed(2)}% faster`
          : 'N/A',
      improvementPercent: timeImprovement,
      testMethod: 'Timed manual spreadsheet entry vs. live 20-request system replay',
    },
    {
      metric: 'Duplicate / Conflict Rate',
      baselineDisplay: `${manualConflictRate.toFixed(1)}% (${manual.conflictsMissedCount}/${totalRequests} missed)`,
      newSystemDisplay: `${systemConflictRate.toFixed(1)}% (${systemConflictsAdmitted}/${totalRequests} missed)`,
      improvementDisplay:
        conflictImprovement !== null
          ? `${conflictImprovement.toFixed(1)}% reduction`
          : '0 -> 0 (already optimal)',
      improvementPercent: conflictImprovement,
      testMethod: 'Count of overlapping bookings admitted across 6 conflict traps',
    },
    {
      metric: 'Error Rate (invalid data)',
      baselineDisplay: `${manualErrorRate.toFixed(1)}% (${manual.errorsAdmittedCount}/${totalRequests} admitted)`,
      newSystemDisplay: `${systemErrorRate.toFixed(1)}% (${systemErrorsAdmitted}/${totalRequests} admitted)`,
      improvementDisplay:
        errorImprovement !== null
          ? `${errorImprovement.toFixed(1)}% reduction`
          : '0 -> 0 (already optimal)',
      improvementPercent: errorImprovement,
      testMethod: 'Count of missing fields, typos, bad times, or over-capacity entries admitted',
    },
  ];
}
