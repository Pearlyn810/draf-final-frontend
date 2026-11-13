import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { EventCard } from '../components/common/EventCard.tsx';
import { formatIndonesianDate } from '../utils/dateTime.ts';
import {
  BookmarkCheck,
  Bookmark,
  AlertTriangle,
  Calendar,
  Trash2,
  PlusCircle,
  Clock,
  MapPin,
} from 'lucide-react';

export const MySchedulePage: React.FC = () => {
  const {
    currentUser,
    events,
    bookmarks,
    mySchedule,
    removeFromMySchedule,
    toggleBookmark,
    setSelectedEvent,
    myScheduleConflicts,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'bookmarks'>('schedule');

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-12 text-center space-y-3">
        <BookmarkCheck className="w-10 h-10 text-gray-300 mx-auto" />
        <h3 className="text-base font-bold text-[#29242E]">Silakan Login Terlebih Dahulu</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Fitur Jadwal Saya dan Event Tersimpan memerlukan akun civitas akademika UNKLAB.
        </p>
      </div>
    );
  }

  // Get event objects
  const scheduledEvents = mySchedule
    .map(ms => {
      const ev = events.find(e => e.id === ms.eventId);
      return ev ? { event: ev, scheduleItem: ms } : null;
    })
    .filter((item): item is { event: (typeof events)[0]; scheduleItem: (typeof mySchedule)[0] } => item !== null);

  // Sort schedule by date & time
  scheduledEvents.sort((a, b) => a.event.date.localeCompare(b.event.date) || a.event.startTime.localeCompare(b.event.startTime));

  const bookmarkedEvents = bookmarks
    .map(b => events.find(e => e.id === b.eventId))
    .filter((e): e is (typeof events)[0] => e !== undefined);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#15261E]">Jadwal & Simpanan Saya</h1>
          <p className="text-xs text-[#52675C]">
            Kelola agenda kegiatan pribadi Anda dengan deteksi benturan waktu otomatis.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E1ECE5]">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeSubTab === 'schedule'
                ? 'bg-[#1B4D36] text-white shadow-2xs font-semibold'
                : 'text-[#52675C] hover:text-[#15261E] hover:bg-[#EDF6F1]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal ({scheduledEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeSubTab === 'bookmarks'
                ? 'bg-[#1B4D36] text-white shadow-2xs font-semibold'
                : 'text-[#52675C] hover:text-[#15261E] hover:bg-[#EDF6F1]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Tersimpan ({bookmarkedEvents.length})</span>
          </button>
        </div>
      </div>

      {/* CONFLICT WARNING BANNER */}
      {activeSubTab === 'schedule' && myScheduleConflicts.hasConflict && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-amber-900 shadow-xs flex items-start gap-4 animate-in fade-in">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-sm text-amber-900 uppercase tracking-wider">
              Peringatan Benturan Jadwal Terdeteksi ({myScheduleConflicts.conflictPairs.length} Benturan)
            </h3>
            <p className="text-xs text-amber-800">
              Beberapa kegiatan yang Anda tambahkan ke My Schedule memiliki waktu mulai dan selesai yang saling beririsan pada tanggal yang sama:
            </p>
            <div className="space-y-1.5 mt-2">
              {myScheduleConflicts.conflictPairs.map((pair, idx) => {
                const evA = events.find(e => e.id === pair.eventAId);
                const evB = events.find(e => e.id === pair.eventBId);
                if (!evA || !evB) return null;

                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-amber-950">{evA.title}</span> ({evA.startTime} - {evA.endTime})
                      <span className="text-gray-400 mx-2">bertubrukan dengan</span>
                      <span className="font-bold text-amber-950">{evB.title}</span> ({evB.startTime} - {evB.endTime})
                    </div>
                    <span className="text-[11px] text-gray-500 font-semibold">{formatIndonesianDate(pair.date)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              Catatan: Jadwal yang hanya bersentuhan tepat di batas waktu (contoh: 10:00-11:00 dan 11:00-12:00) tidak dianggap bentrok sesuai standar PRD.
            </p>
          </div>
        </div>
      )}

      {/* CONTENT: MY SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          {scheduledEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E9E4EC] p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-[#29242E] text-base">Belum Ada Agenda di My Schedule</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Buka Kalender atau Jelajahi Kegiatan, lalu klik tombol "+ Jadwal Saya" pada kartu kegiatan untuk menyusun agenda pribadi Anda.
              </p>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-4 py-2 bg-[#402155] text-white text-xs font-semibold rounded-lg hover:bg-[#56366F] cursor-pointer"
              >
                Buka Kalender Kampus
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledEvents.map(({ event, scheduleItem }) => {
                const hasConflict = myScheduleConflicts.conflictingEventIds.includes(event.id);

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                      hasConflict ? 'border-amber-400 ring-1 ring-amber-300 bg-amber-50/20' : 'border-[#E9E4EC]'
                    }`}
                  >
                    <div
                      className="space-y-1 flex-1 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#402155] bg-[#F1EBF5] px-2.5 py-0.5 rounded-full border border-purple-200">
                          {formatIndonesianDate(event.date)}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{event.startTime} - {event.endTime} WITA</span>
                        </span>
                        {hasConflict && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Jadwal Bentrok</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-[#29242E] hover:text-[#402155]">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{event.organizerName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </span>
                      </div>

                      {scheduleItem.notes && (
                        <p className="text-xs text-[#80639A] italic mt-1 bg-purple-50 p-2 rounded-md">
                          Catatan Anda: {scheduleItem.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="px-3 py-1.5 text-xs text-[#402155] font-semibold border border-[#E9E4EC] rounded-lg hover:bg-gray-50"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => removeFromMySchedule(event.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent transition-colors"
                        title="Hapus dari My Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: BOOKMARKS / TERSIMPAN */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarkedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E9E4EC] p-12 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-[#29242E] text-base">Belum Ada Event yang Disimpan</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Tandai kegiatan yang ingin Anda pantau dengan mengklik ikon Bookmark pada kartu kegiatan.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-[#402155] text-white text-xs font-semibold rounded-lg hover:bg-[#56366F] cursor-pointer"
              >
                Jelajahi Kegiatan Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
