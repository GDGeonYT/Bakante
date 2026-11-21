import { useCallback, useEffect, useState } from 'react';
import type { Booking, BookingRequest, Facility } from '@bakante/shared';
import { BarChart3, BookOpen, CalendarDays, Plus, RotateCcw } from 'lucide-react';
import { api } from './api.ts';
import { BenchmarkDashboard } from './components/BenchmarkDashboard.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { CalendarGrid } from './components/CalendarGrid.tsx';
import { LogicExplainer } from './components/LogicExplainer.tsx';

type Tab = 'calendar' | 'benchmark' | 'logic';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftRequest, setDraftRequest] = useState<BookingRequest>({
    facilityId: 'AVR-01',
    date: '2026-11-23',
    startTime: '10:00',
    endTime: '12:00',
    requesterName: '',
    office: '',
    eventTitle: '',
    attendees: 40,
    requiredAmenities: ['Projector'],
  });

  const loadSchedule = useCallback(async (date: string) => {
    const [facs, bks] = await Promise.all([
      api.getFacilities(),
      api.getBookings(date),
    ]);
    setFacilities(facs);
    setBookings(bks);
  }, []);

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate, loadSchedule]);

  function openNewBookingModal(
    facilityId = facilities[0]?.id ?? 'AVR-01',
    startTime = '10:00',
    endTime = '12:00'
  ) {
    setDraftRequest({
      facilityId,
      date: selectedDate,
      startTime,
      endTime,
      requesterName: '',
      office: '',
      eventTitle: '',
      attendees: 40,
      requiredAmenities: ['Projector'],
    });
    setModalOpen(true);
  }

  async function handleDeleteBooking(id: string) {
    await api.deleteBooking(id);
    await loadSchedule(selectedDate);
  }

  async function handleResetDemo() {
    await api.resetDemo();
    await loadSchedule(selectedDate);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Bakante
              </h1>
              <p className="text-xs text-slate-500">
                ISATU Real-Time Facility &amp; Room Booking · Tech4ISATU Track 5
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Live Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Baseline &amp; Scorecard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logic')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'logic'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> How It Works
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
        {activeTab === 'calendar' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">
                  Schedule Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate('2026-11-23')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border cursor-pointer ${
                    selectedDate === '2026-11-23'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Day 1 (Nov 23)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate('2026-11-24')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border cursor-pointer ${
                    selectedDate === '2026-11-24'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Day 2 (Nov 24)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Demo Schedule
                </button>
                <button
                  type="button"
                  onClick={() => openNewBookingModal()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> New Booking
                </button>
              </div>
            </div>

            <CalendarGrid
              facilities={facilities}
              bookings={bookings}
              selectedDate={selectedDate}
              onSelectSlot={(facilityId, startTime, endTime) =>
                openNewBookingModal(facilityId, startTime, endTime)
              }
              onDeleteBooking={handleDeleteBooking}
            />
          </>
        )}

        {activeTab === 'benchmark' && <BenchmarkDashboard />}
        {activeTab === 'logic' && <LogicExplainer />}
      </main>

      <BookingModal
        isOpen={modalOpen}
        facilities={facilities}
        initialRequest={draftRequest}
        onClose={() => setModalOpen(false)}
        onBooked={() => loadSchedule(selectedDate)}
      />
    </div>
  );
}
