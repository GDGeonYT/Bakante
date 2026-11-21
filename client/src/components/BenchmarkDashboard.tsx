import { useEffect, useState } from 'react';
import type { BenchmarkSummary, ManualBaselineResults } from '@bakante/shared';
import { Award, CheckCircle2, Play, Save, ShieldAlert, XCircle } from 'lucide-react';
import { api } from '../api.ts';

export function BenchmarkDashboard() {
  const [manual, setManual] = useState<ManualBaselineResults | null>(null);
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const baseline = await api.getBaseline();
    setManual(baseline.manualResults);
    const replay = await api.runBenchmarkReplay();
    setSummary(replay);
  }

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manual) return;
    const saved = await api.saveManualBaseline({
      ...manual,
      isPlaceholder: false,
      recordedAt: new Date().toISOString().slice(0, 10),
    });
    setManual(saved);
    const replay = await api.runBenchmarkReplay();
    setSummary(replay);
    setSaveMessage('Manual baseline saved and Scorecard recalculated!');
    setTimeout(() => setSaveMessage(null), 3500);
  }

  async function handleRunReplay() {
    setIsRunning(true);
    try {
      const replay = await api.runBenchmarkReplay();
      setSummary(replay);
    } finally {
      setIsRunning(false);
    }
  }

  if (!manual || !summary) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading baseline dataset and benchmark scorecard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Baseline vs. Bakante Replay &amp; Metrics Scorecard
          </h2>
          <p className="text-sm text-slate-500">
            Replays the exact 20-request ISATU dataset (10 valid, 6 conflict traps, 4 error traps) against an isolated SQLite database.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRunReplay}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running Replay...' : 'Run 20-Request Replay'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Total Bakante Time</div>
          <div className="mt-1 text-2xl font-bold text-blue-700">
            {summary.totalSystemTimeMs.toFixed(2)} ms
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {summary.avgSystemTimeMs.toFixed(2)} ms avg per request
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Valid Bookings Saved</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {summary.bookedCount} / 10
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Includes back-to-back slots
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Conflicts Blocked</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {summary.conflictBlockedCount} / 6
          </div>
          <div className="text-xs text-slate-500 mt-0.5">0% double-bookings allowed</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Invalid Data Caught</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">
            {summary.errorCaughtCount} / 4
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {summary.totalBinarySearchSteps} Binary Search steps vs.{' '}
            {summary.totalLinearScanSteps} linear
          </div>
        </div>
      </div>

      {/* Official Section 9.4 Scorecard Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Official Hackathon Metrics Scorecard (Section 9.4 — 3 Parameters)
            </h3>
          </div>
          {manual.isPlaceholder && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Using reference manual estimate — enter live QA stopwatch values below
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Metric</th>
                <th className="px-5 py-3">Baseline (Manual Spreadsheet)</th>
                <th className="px-5 py-3">New System (Bakante)</th>
                <th className="px-5 py-3">% Improvement</th>
                <th className="px-5 py-3">Test Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.scorecard.map((row) => (
                <tr key={row.metric}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {row.metric}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{row.baselineDisplay}</td>
                  <td className="px-5 py-3.5 font-medium text-emerald-700">
                    {row.newSystemDisplay}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {row.improvementDisplay}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{row.testMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editable Manual Baseline Form (For QA Analyst Stopwatch Results) */}
      <form
        onSubmit={handleSaveManual}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Enter QA Analyst Manual Baseline Measurements
            </h3>
            <p className="text-xs text-slate-500">
              Follow <code>baseline/manual_test_protocol.md</code> with{' '}
              <code>baseline/manual_log_template.csv</code>, then save your real stopwatch results here.
            </p>
          </div>
          {saveMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {saveMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recorded By
            </label>
            <input
              type="text"
              value={manual.recordedBy}
              onChange={(e) => setManual({ ...manual, recordedBy: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manual Total Time (seconds)
            </label>
            <input
              type="number"
              min={1}
              step="0.1"
              value={manual.totalTimeSeconds}
              onChange={(e) =>
                setManual({ ...manual, totalTimeSeconds: Number(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Conflicts Missed (out of 6)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={manual.conflictsMissedCount}
              onChange={(e) =>
                setManual({
                  ...manual,
                  conflictsMissedCount: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Errors Admitted (out of 20)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={manual.errorsAdmittedCount}
              onChange={(e) =>
                setManual({
                  ...manual,
                  errorsAdmittedCount: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Save Manual Results &amp; Update Scorecard
          </button>
        </div>
      </form>

      {/* 20-Request Audit Log */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-900">
            20-Request Dataset Replay Audit Log
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Room / Date / Time</th>
                <th className="px-4 py-2.5">Event</th>
                <th className="px-4 py-2.5">Outcome</th>
                <th className="px-4 py-2.5">Steps</th>
                <th className="px-4 py-2.5">System Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.items.map((item) => (
                <tr key={item.requestId} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">
                    {item.requestId}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    <span className="font-semibold text-slate-800">{item.facilityId}</span>{' '}
                    · {item.date} · {item.timeRange}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {item.eventTitle}
                  </td>
                  <td className="px-4 py-2.5">
                    {item.actualOutcome === 'BOOKED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> BOOKED
                      </span>
                    )}
                    {item.actualOutcome === 'CONFLICT' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                        <ShieldAlert className="h-3 w-3" /> CONFLICT
                      </span>
                    )}
                    {item.actualOutcome === 'VALIDATION_ERROR' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-800">
                        <XCircle className="h-3 w-3" /> ERROR CAUGHT
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">
                    {item.binarySearchSteps} / {item.linearScanSteps}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {item.summary}
                    {item.suggestedRoomId && (
                      <span className="ml-1.5 text-blue-700 font-semibold">
                        (Suggested: {item.suggestedRoomId})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
