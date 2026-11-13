import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CampusEvent } from '../types/index.ts';
import { EventCard } from '../components/common/EventCard.tsx';
import { formatIndonesianDate, getEventLiveStatus } from '../utils/dateTime.ts';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar as CalendarIcon,
  List,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day' | 'list';

export const CalendarPage: React.FC = () => {
  const { events, categories, setSelectedEvent } = useApp();

  // Simulated starting view in November 2026 (Semester I 2026/2027)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 0-indexed: 10 = November
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-10');
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<'all' | 'academic' | 'organization'>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Approved events only for public calendar
  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'approved');
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return approvedEvents.filter(event => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchOrg = event.organizerName.toLowerCase().includes(q);
        const matchLoc = event.location.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchLoc) return false;
      }

      // Category
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(event.categoryId)) return false;
      }

      // Source
      if (selectedSource === 'academic' && event.sourceType !== 'academic_calendar') return false;
      if (selectedSource === 'organization' && event.sourceType === 'academic_calendar') return false;

      return true;
    });
  }, [approvedEvents, searchQuery, selectedCategories, selectedSource]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(y => y - 1);
      } else {
        setCurrentMonth(m => m - 1);
      }
    } else if (viewMode === 'day') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(y => y + 1);
      } else {
        setCurrentMonth(m => m + 1);
      }
    } else if (viewMode === 'day') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10); // November
    setSelectedDate('2026-11-10');
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  // Month grid calculations
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNumber: dayNum, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill complete grid (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Events on selected day
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      if (e.endDate && e.endDate !== e.date) {
        return selectedDate >= e.date && selectedDate <= e.endDate;
      }
      return e.date === selectedDate;
    });
  }, [filteredEvents, selectedDate]);

  return (
    <div className="space-y-5 pb-12">
      {/* Calendar Header Bar */}
      <div className="bg-white rounded-xl border border-[#E1ECE5] p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#15261E]">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <span className="text-xs bg-[#EDF6F1] text-[#1B4D36] font-medium px-2 py-0.5 rounded border border-[#D5E5DC]">
                WITA
              </span>
            </div>
            <p className="text-xs text-[#52675C]">
              Kalender Akademik Resmi & Kegiatan Terverifikasi
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-[#E1ECE5] rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-stone-50 text-stone-700 transition-colors"
                title="Periode Sebelumnya"
                aria-label="Periode Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-semibold text-[#1B4D36] hover:bg-[#EDF6F1] transition-colors border-x border-[#E1ECE5]"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-stone-50 text-stone-700 transition-colors"
                title="Periode Berikutnya"
                aria-label="Periode Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#E1ECE5] rounded-lg overflow-hidden bg-[#F7FAF8] p-0.5">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-[#1B4D36] shadow-2xs font-semibold'
                    : 'text-[#52675C] hover:text-[#15261E]'
                }`}
              >
                Bulan
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-[#1B4D36] shadow-2xs font-semibold'
                    : 'text-[#52675C] hover:text-[#15261E]'
                }`}
              >
                Minggu
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white text-[#1B4D36] shadow-2xs font-semibold'
                    : 'text-[#52675C] hover:text-[#15261E]'
                }`}
              >
                Hari
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#1B4D36] shadow-2xs font-semibold'
                    : 'text-[#52675C] hover:text-[#15261E]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda / List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Source Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#E1ECE5]">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama event, penyelenggara, atau lokasi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7FAF8] border border-[#E1ECE5] rounded-lg focus:outline-hidden focus:border-[#1B4D36] focus:bg-white transition-all"
            />
          </div>

          {/* Source Filter Tabs */}
          <div className="flex items-center gap-1 self-start sm:self-auto text-xs">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                selectedSource === 'all'
                  ? 'bg-[#1B4D36] text-white border-[#1B4D36]'
                  : 'bg-white text-[#52675C] border-[#E1ECE5] hover:bg-[#EDF6F1]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedSource('academic')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                selectedSource === 'academic'
                  ? 'bg-[#1B4D36] text-white border-[#1B4D36]'
                  : 'bg-white text-[#52675C] border-[#E1ECE5] hover:bg-[#EDF6F1]'
              }`}
            >
              Akademik Resmi
            </button>
            <button
              onClick={() => setSelectedSource('organization')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                selectedSource === 'organization'
                  ? 'bg-[#1B4D36] text-white border-[#1B4D36]'
                  : 'bg-white text-[#52675C] border-[#E1ECE5] hover:bg-[#EDF6F1]'
              }`}
            >
              Organisasi
            </button>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#52675C] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#1B4D36]" />
            Kategori:
          </span>
          {categories.map(cat => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4D36] text-white border-[#1B4D36] font-medium'
                    : 'bg-white text-[#52675C] border-[#E1ECE5] hover:bg-[#EDF6F1]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[11px] text-rose-700 hover:underline font-medium ml-1 cursor-pointer"
            >
              Reset Kategori
            </button>
          )}
        </div>
      </div>

      {/* VIEW: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-[#E1ECE5] shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-[#E1ECE5] bg-[#F7FAF8] text-center py-2 text-xs font-semibold text-[#52675C]">
            <span className="text-rose-600">Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span className="text-[#1B4D36]">Sab (Sabbath)</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E1ECE5]">
            {monthDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter(e => {
                if (e.endDate && e.endDate !== e.date) {
                  return cell.dateStr >= e.date && cell.dateStr <= e.endDate;
                }
                return e.date === cell.dateStr;
              });

              const isToday = cell.dateStr === '2026-11-10';
              const isSelected = cell.dateStr === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 cursor-pointer transition-colors relative flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/50 text-stone-400'
                  } ${isSelected ? 'ring-2 ring-[#1B4D36] z-10' : 'hover:bg-[#F7FAF8]'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#1B4D36] text-white shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'text-[#15261E]'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                        {dayEvents.length} acara
                      </span>
                    )}
                  </div>

                  {/* Micro event pills inside day cell */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayEvents.slice(0, 3).map(ev => {
                      const isAcad = ev.sourceType === 'academic_calendar';
                      return (
                        <div
                          key={ev.id}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`text-[10px] sm:text-[11px] truncate px-1.5 py-0.5 rounded font-medium border transition-colors ${
                            isAcad
                              ? 'bg-[#1B4D36] text-white border-[#1B4D36]'
                              : 'bg-[#EDF6F1] text-[#1B4D36] border-[#D5E5DC] hover:bg-[#D5E5DC]'
                          }`}
                          title={`${ev.title} (${ev.startTime})`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[#1B4D36] font-semibold pl-1">
                        +{dayEvents.length - 3} lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-[#E9E4EC] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-[#29242E] text-base">
              Agenda Mingguan (Fokus Tanggal {formatIndonesianDate(selectedDate)})
            </h3>
            <span className="text-xs text-gray-500">Menampilkan 7 hari di sekitar tanggal terpilih</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const base = new Date(selectedDate);
              base.setDate(base.getDate() - base.getDay() + i);
              const dateStr = base.toISOString().split('T')[0];
              const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][i];
              const dayEvs = filteredEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-xl border ${
                    dateStr === selectedDate
                      ? 'border-[#402155] bg-purple-50/30'
                      : 'border-[#E9E4EC] bg-white'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">{dayName}</span>
                    <div className="text-base font-bold text-[#29242E]">{base.getDate()}</div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayEvs.length === 0 ? (
                      <span className="text-[11px] text-gray-400 block text-center py-2">Tidak ada acara</span>
                    ) : (
                      dayEvs.map(e => (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="p-2 bg-white rounded-lg border border-[#E9E4EC] hover:border-[#80639A] cursor-pointer text-xs"
                        >
                          <div className="font-semibold text-[#29242E] line-clamp-1">{e.title}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{e.startTime} WITA</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl border border-[#E1ECE5] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E1ECE5]">
            <div>
              <span className="text-[10px] font-semibold text-[#52675C] uppercase tracking-wider">Jadwal Harian</span>
              <h3 className="text-lg font-bold text-[#15261E]">{formatIndonesianDate(selectedDate)}</h3>
            </div>
            <span className="text-xs bg-[#EDF6F1] text-[#1B4D36] px-2.5 py-0.5 rounded font-medium border border-[#D5E5DC]">
              {selectedDayEvents.length} Kegiatan
            </span>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              <CalendarIcon className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
              <span>Tidak ada kegiatan kampus pada tanggal ini.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-3.5 rounded-lg border border-[#E1ECE5] hover:border-[#527A68] bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[11px] text-[#52675C]">
                      <span className="font-semibold text-[#1B4D36]">
                        {event.startTime} - {event.endTime} WITA
                      </span>
                      <span aria-hidden="true" className="text-[#A4B8AD]">·</span>
                      <span>{event.sourceType === 'academic_calendar' ? 'Akademik Resmi' : 'Organisasi'}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#15261E]">{event.title}</h4>
                    <p className="text-xs text-[#52675C] flex items-center gap-1.5">
                      <span>{event.organizerName}</span>
                      <span aria-hidden="true" className="text-[#A4B8AD]">·</span>
                      <span>{event.location}</span>
                    </p>
                  </div>
                  <button className="text-xs font-medium text-[#1B4D36] hover:underline self-start sm:self-auto">
                    Detail →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: LIST / AGENDA VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#52675C]">
              Daftar Semua Kegiatan ({filteredEvents.length})
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-[#E1ECE5] text-stone-500 text-xs">
              Tidak ada kegiatan yang sesuai dengan filter pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Day Agenda Drawer (Shown when month view is active) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-[#E1ECE5] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E1ECE5]">
            <div>
              <span className="text-[10px] font-semibold text-[#527A68] uppercase tracking-wider">
                Agenda Terpilih:
              </span>
              <h3 className="text-base font-bold text-[#15261E]">
                {formatIndonesianDate(selectedDate)}
              </h3>
            </div>
            <span className="text-xs text-[#52675C]">
              {selectedDayEvents.length} kegiatan berlangsung
            </span>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-xs">
              Tidak ada agenda terjadwal pada hari ini. Klik tanggal lain pada kalender untuk melihat agenda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
