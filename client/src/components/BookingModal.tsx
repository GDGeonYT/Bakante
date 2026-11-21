import { useEffect, useState } from 'react';
import type { BookingEvaluation, BookingRequest, Facility } from '@bakante/shared';
import { AlertTriangle, CheckCircle2, Sparkles, X, XCircle } from 'lucide-react';
import { api } from '../api.ts';

interface BookingModalProps {
  isOpen: boolean;
  facilities: Facility[];
  initialRequest: BookingRequest;
  onClose: () => void;
  onBooked: () => void;
}

const ALL_AMENITIES = [
  'Projector',
  'Sound System',
  'Air Conditioning',
  'Lab PCs',
  'Video Conferencing',
  'Stage',
  'Whiteboard',
];

export function BookingModal({
  isOpen,
  facilities,
  initialRequest,
  onClose,
  onBooked,
}: BookingModalProps) {
  const [form, setForm] = useState<BookingRequest>(initialRequest);
  const [preview, setPreview] = useState<BookingEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialRequest);
  }, [initialRequest]);

  // Run live dry-run check whenever room, date, times, or attendees change
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    api.checkBooking(form).then((result) => {
      if (!cancelled) {
        setPreview(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, form]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await api.createBooking(form);
      setPreview(result);
      if (result.status === 'BOOKED') {
        onBooked();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleAmenity(item: string) {
    const current = form.requiredAmenities ?? [];
    const next = current.includes(item)
      ? current.filter((a) => a !== item)
      : [...current, item];
    setForm({ ...form, requiredAmenities: next });
  }

  const selectedFacility = facilities.find((f) => f.id === form.facilityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">New Facility Booking</h3>
            <p className="text-xs text-slate-500">
              Live conflict &amp; capacity checking runs automatically as you type.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ISATU Facility
              </label>
              <select
                value={form.facilityId}
                onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Cap: {f.capacity})
                  </option>
                ))}
              </select>
              {selectedFacility && (
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedFacility.building} · {selectedFacility.amenities.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Time Range & Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendees
              </label>
              <input
                type="number"
                min={1}
                value={form.attendees}
                onChange={(e) =>
                  setForm({ ...form, attendees: Number(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Requester Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requester Name
              </label>
              <input
                type="text"
                placeholder="e.g. Prof. Elena Santos"
                value={form.requesterName}
                onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Department
              </label>
              <input
                type="text"
                placeholder="e.g. College of Computer Studies"
                value={form.office}
                onChange={(e) => setForm({ ...form, office: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineering Capstone Defense"
              value={form.eventTitle}
              onChange={(e) => setForm({ ...form, eventTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Required Amenities */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Required Equipment (used to rank alternative rooms if busy)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((item) => {
                const active = (form.requiredAmenities ?? []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Algorithm Feedback Box */}
          {preview && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                preview.status === 'AVAILABLE' || preview.status === 'BOOKED'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : preview.status === 'CONFLICT'
                    ? 'border-amber-300 bg-amber-50 text-amber-950'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {preview.status === 'AVAILABLE' || preview.status === 'BOOKED' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : preview.status === 'CONFLICT' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="font-semibold">{preview.message}</div>
                  {preview.status !== 'VALIDATION_ERROR' && (
                    <div className="text-xs opacity-80">
                      Binary Search checked <strong>{preview.binarySearchSteps}</strong>{' '}
                      steps (vs. {preview.linearScanSteps} in a manual scan).
                    </div>
                  )}

                  {preview.validationErrors.length > 1 && (
                    <ul className="list-disc pl-5 text-xs space-y-0.5">
                      {preview.validationErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  )}

                  {/* Smart 1-Click Alternatives on Conflict */}
                  {preview.status === 'CONFLICT' && (
                    <div className="pt-2 space-y-3 border-t border-amber-200/80">
                      {preview.alternativeRooms.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                            <Sparkles className="h-3.5 w-3.5" /> Best-Fit Free Rooms at{' '}
                            {form.startTime}–{form.endTime} (Click to Switch)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {preview.alternativeRooms.map((alt) => (
                              <button
                                key={alt.facility.id}
                                type="button"
                                onClick={() =>
                                  setForm({ ...form, facilityId: alt.facility.id })
                                }
                                className="text-left rounded-lg border border-amber-300 bg-white px-3 py-2 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-slate-900">
                                    {alt.facility.name}
                                  </span>
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                                    {alt.totalScore}/100 pts
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Cap {alt.facility.capacity} · {alt.facility.building} (Fit{' '}
                                  {alt.capacityScore} + Gear {alt.amenityScore} + Bldg{' '}
                                  {alt.buildingScore})
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {preview.freeSlotsSameRoom.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-amber-900 mb-1.5">
                            Nearest Open Slots in {selectedFacility?.name}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {preview.freeSlotsSameRoom.map((slot) => (
                              <button
                                key={slot.startTime}
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                  })
                                }
                                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                              >
                                {slot.startTime} – {slot.endTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || preview?.status !== 'AVAILABLE'}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
