import type { Booking, Facility } from '@bakante/shared';
import { Building2, Clock, Plus, Trash2, Users } from 'lucide-react';

interface CalendarGridProps {
  facilities: Facility[];
  bookings: Booking[];
  selectedDate: string;
  onSelectSlot: (facilityId: string, startTime: string, endTime: string) => void;
  onDeleteBooking: (id: string) => void;
}

// Campus hours shown on the timeline: 07:00 to 21:00 (14 one-hour columns)
const HOURS = Array.from({ length: 14 }, (_, i) => 7 + i);
const DAY_START_MIN = 7 * 60;
const DAY_TOTAL_MIN = 14 * 60;

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function CalendarGrid({
  facilities,
  bookings,
  selectedDate,
  onSelectSlot,
  onDeleteBooking,
}: CalendarGridProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Real-Time Campus Availability — {selectedDate}
          </h2>
          <p className="text-xs text-slate-500">
            Click any open time slot to create a booking. Back-to-back slots are supported automatically.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="h-3 w-3 rounded bg-blue-600 inline-block" /> Confirmed Booking
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="h-3 w-3 rounded border border-slate-300 bg-white inline-block" /> Open Slot (Click to Book)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          {/* Header Row: Facility Info + 14 Hourly Columns */}
          <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-slate-100/70 text-xs font-semibold text-slate-600">
            <div className="px-4 py-2.5 border-r border-slate-200">ISATU Facility</div>
            <div className="grid grid-cols-14">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-r border-slate-200/80 py-2.5 text-center last:border-r-0"
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
          </div>

          {/* One Row per Facility */}
          {facilities.map((facility) => {
            const roomBookings = bookings.filter((b) => b.facilityId === facility.id);

            return (
              <div
                key={facility.id}
                className="grid grid-cols-[240px_1fr] border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
              >
                {/* Facility Info Column */}
                <div className="border-r border-slate-200 px-4 py-3 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {facility.name}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                      {facility.id}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {facility.building}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {facility.capacity}
                    </span>
                  </div>
                </div>

                {/* Timeline Grid + Positioned Booking Blocks */}
                <div className="relative h-18">
                  {/* Clickable Hourly Background Cells */}
                  <div className="grid grid-cols-14 h-full">
                    {HOURS.map((hour) => {
                      const startStr = formatHourLabel(hour);
                      const endStr = formatHourLabel(Math.min(hour + 2, 21));
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => onSelectSlot(facility.id, startStr, endStr)}
                          title={`Book ${facility.name} starting at ${startStr}`}
                          className="group border-r border-slate-100 last:border-r-0 h-full flex items-center justify-center hover:bg-blue-50/70 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Overlay Confirmed Bookings */}
                  {roomBookings.map((booking) => {
                    const leftPct =
                      ((booking.startMin - DAY_START_MIN) / DAY_TOTAL_MIN) * 100;
                    const widthPct =
                      ((booking.endMin - booking.startMin) / DAY_TOTAL_MIN) * 100;

                    return (
                      <div
                        key={booking.id}
                        style={{
                          left: `${Math.max(0, leftPct)}%`,
                          width: `${Math.max(2, widthPct)}%`,
                        }}
                        className="absolute top-1.5 bottom-1.5 rounded-md bg-blue-600 text-white px-2 py-1 shadow-sm border border-blue-700 flex flex-col justify-between overflow-hidden group"
                        title={`${booking.eventTitle} (${booking.startTime}–${booking.endTime}) — ${booking.office} (${booking.attendees} pax)`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-semibold leading-tight truncate">
                            {booking.eventTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteBooking(booking.id)}
                            title="Cancel booking"
                            className="opacity-0 group-hover:opacity-100 text-blue-100 hover:text-white transition-opacity shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-100 truncate">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          <span>
                            {booking.startTime}–{booking.endTime}
                          </span>
                          <span>·</span>
                          <span className="truncate">{booking.office}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
