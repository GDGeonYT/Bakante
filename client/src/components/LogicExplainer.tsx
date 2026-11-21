import { useState } from 'react';
import { doTimesOverlap, minutesToTime, timeToMinutes } from '@bakante/shared';
import { ArrowRight, CheckCircle2, Lock, Search, Sparkles, XCircle } from 'lucide-react';

/**
 * Interactive explainer tab showing judges and team members exactly how
 * Bakante's 3-step algorithm prevents conflicts and errors.
 */
export function LogicExplainer() {
  const [startA, setStartA] = useState('09:00');
  const [endA, setEndA] = useState('11:00');
  const [startB, setStartB] = useState('11:00');
  const [endB, setEndB] = useState('13:00');

  const minA1 = timeToMinutes(startA) ?? 540;
  const minA2 = timeToMinutes(endA) ?? 660;
  const minB1 = timeToMinutes(startB) ?? 660;
  const minB2 = timeToMinutes(endB) ?? 780;
  const overlaps = doTimesOverlap(minA1, minA2, minB1, minB2);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          How Bakante&apos;s Core Logic Works (Pitch &amp; Study Guide)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Every booking passes through 3 fast, deterministic steps. No messy manual spreadsheet scanning, no visual mistakes, and no double-bookings.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Lock className="h-4 w-4" /> Step 1: Input Gatekeeper — O(1)
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Before touching the database, <code>validateBookingRequest()</code> rejects blank offices, room typos (e.g. <code>AVR 1</code>), inverted times (<code>14:00–12:00</code>), outside hours, and over-capacity events.
            </p>
            <div className="rounded bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
              Result: 0% Invalid Data Errors
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <Search className="h-4 w-4" /> Step 2: Binary Search — O(log n)
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Inside a SQLite <code>BEGIN IMMEDIATE</code> lock, bookings for that room+date are fetched sorted by <code>startMin</code>. Binary Search jumps straight to the time window and checks <code>startA &lt; endB && startB &lt; endA</code>.
            </p>
            <div className="rounded bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-900 border border-blue-200">
              Result: 0% Double-Bookings
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Sparkles className="h-4 w-4" /> Step 3: 100-Pt Smart Suggester
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              If a slot is taken, Bakante finds open gaps on the same room AND ranks conflict-free alternative rooms out of 100 points: <strong>45 pts</strong> tight capacity fit + <strong>35 pts</strong> equipment match + <strong>20 pts</strong> same building.
            </p>
            <div className="rounded bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900 border border-emerald-200">
              Result: 1-Click Conflict Resolution
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Overlap Formula Tester */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Interactive Overlap Rule Tester: <code>startA &lt; endB &amp;&amp; startB &lt; endA</code>
          </h3>
          <p className="text-xs text-slate-500">
            Try changing Booking B to <code>10:30–12:00</code> vs. <code>11:00–13:00</code> to see why back-to-back bookings succeed cleanly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-700">Booking A (Existing)</div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startA}
                onChange={(e) => setStartA(e.target.value)}
                className="rounded border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={endA}
                onChange={(e) => setEndA(e.target.value)}
                className="rounded border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <span className="text-xs font-mono text-slate-500">
                [{minA1}, {minA2})
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-700">Booking B (New Request)</div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startB}
                onChange={(e) => setStartB(e.target.value)}
                className="rounded border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={endB}
                onChange={(e) => setEndB(e.target.value)}
                className="rounded border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <span className="text-xs font-mono text-slate-500">
                [{minB1}, {minB2})
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-sm ${
            overlaps
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {overlaps ? (
              <XCircle className="h-5 w-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
            <div>
              <strong>{overlaps ? 'CONFLICT DETECTED' : 'NO CONFLICT (ALLOWED)'}</strong>
              <div className="text-xs mt-0.5 font-mono">
                ({minutesToTime(minA1)} &lt; {minutesToTime(minB2)} →{' '}
                {String(minA1 < minB2)}) AND ({minutesToTime(minB1)} &lt;{' '}
                {minutesToTime(minA2)} → {String(minB1 < minA2)})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
