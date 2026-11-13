import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Badge } from './Badge.tsx';
import { formatIndonesianDate, getEventLiveStatus } from '../../utils/dateTime.ts';
import { hasTimeOverlap } from '../../utils/scheduleConflict.ts';
import { checkDateAgainstLongWeekend } from '../../utils/longWeekendCheck.ts';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  Tag,
  AlertTriangle,
  CheckCircle,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  Info,
  ExternalLink,
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const {
    selectedEvent,
    setSelectedEvent,
    categories,
    toggleBookmark,
    isBookmarked,
    addToMySchedule,
    removeFromMySchedule,
    isInMySchedule,
    mySchedule,
    events,
  } = useApp();

  if (!selectedEvent) return null;

  const category = categories.find(c => c.id === selectedEvent.categoryId);
  const liveStatus = getEventLiveStatus(selectedEvent.date, selectedEvent.startTime, selectedEvent.endTime);
  const bookmarked = isBookmarked(selectedEvent.id);
  const inSchedule = isInMySchedule(selectedEvent.id);
  const isAcademic = selectedEvent.sourceType === 'academic_calendar';

  // Conflict detection against user's MySchedule
  const conflictingScheduledEvents = mySchedule
    .map(ms => events.find(e => e.id === ms.eventId))
    .filter((e): e is typeof selectedEvent => !!e && e.id !== selectedEvent.id)
    .filter(e => hasTimeOverlap(e, selectedEvent));

  // Long weekend check for Sabbath events
  const longWeekendInfo = checkDateAgainstLongWeekend(selectedEvent.date);
  const isSabbathEvent =
    selectedEvent.title.toLowerCase().includes('sabbath') ||
    selectedEvent.title.toLowerCase().includes('sabat') ||
    selectedEvent.worshipScheduleId === 'worship-sabbath';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E1ECE5] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E1ECE5] flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-[#1B4D36] bg-[#EDF6F1] px-2.5 py-0.5 rounded border border-[#D5E5DC]">
                {category?.name || 'Kegiatan'}
              </span>

              {isAcademic ? (
                <Badge variant="academic">Kalender Akademik Resmi</Badge>
              ) : (
                <Badge variant="organization">Event Organisasi Terverifikasi</Badge>
              )}

              {selectedEvent.isDummy && (
                <Badge variant="simulation">Data Simulasi</Badge>
              )}

              {liveStatus === 'ongoing' && (
                <Badge variant="live">Sedang Berlangsung</Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#29242E] leading-tight">
              {selectedEvent.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedEvent(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup detail modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Conflict Warning Box */}
          {conflictingScheduledEvents.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-amber-800">
                  Peringatan Benturan Jadwal (Conflict Warning)
                </div>
                <p className="text-xs mt-1">
                  Kegiatan ini bertabrakan waktu dengan jadwal yang sudah ada di My Schedule Anda:
                </p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 font-medium">
                  {conflictingScheduledEvents.map(ce => (
                    <li key={ce.id}>
                      {ce.title} ({ce.startTime} - {ce.endTime} WITA)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sabbath Long Weekend Verification Banner */}
          {isSabbathEvent && (
            <div
              className={`rounded-xl p-4 border flex items-start gap-3 text-xs ${
                longWeekendInfo.isLongWeekend
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              {longWeekendInfo.isLongWeekend ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold uppercase tracking-wider">
                  Verifikasi Kalender Akademik UNKLAB 2026:
                </div>
                <p className="mt-1">{longWeekendInfo.statusText}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Aturan kampus: Ibadah Sabbath ditiadakan saat mahasiswa pulang pada periode Long Weekend resmi.
                </p>
              </div>
            </div>
          )}

          {/* Key Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#FAF9FB] p-4 rounded-xl border border-[#E9E4EC]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F1EBF5] flex items-center justify-center text-[#402155]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[#706A75]">Tanggal Pelaksanaan</div>
                <div className="font-semibold text-[#29242E]">
                  {formatIndonesianDate(selectedEvent.date)}
                  {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date && ` s/d ${formatIndonesianDate(selectedEvent.endDate)}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F1EBF5] flex items-center justify-center text-[#402155]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[#706A75]">Waktu Pelaksanaan</div>
                <div className="font-semibold text-[#29242E]">
                  {selectedEvent.startTime} - {selectedEvent.endTime} WITA
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F1EBF5] flex items-center justify-center text-[#402155]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[#706A75]">Lokasi Kegiatan</div>
                <div className="font-semibold text-[#29242E]">{selectedEvent.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F1EBF5] flex items-center justify-center text-[#402155]">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[#706A75]">Penyelenggara</div>
                <div className="font-semibold text-[#29242E]">{selectedEvent.organizerName}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-[#29242E] mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#706A75]">
              <Info className="w-3.5 h-3.5" />
              Deskripsi Kegiatan
            </h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-[#E9E4EC]">
              {selectedEvent.description || 'Tidak ada deskripsi detail tambahan.'}
            </p>
          </div>

          {/* Target Audience & Tags */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#80639A]" />
              <span className="text-xs text-[#706A75]">Target Peserta:</span>
              <div className="flex flex-wrap gap-1">
                {selectedEvent.targetAudience.map(aud => (
                  <span
                    key={aud}
                    className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                  >
                    {aud.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#80639A]" />
                <span className="text-xs text-[#706A75]">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] bg-[#F1EBF5] text-[#402155] px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* External registration link if available */}
          {selectedEvent.externalLink && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
              <span className="text-xs text-[#402155] font-medium">Tautan Registrasi / Informasi Eksternal:</span>
              <a
                href={selectedEvent.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#402155] font-bold hover:underline"
              >
                <span>Buka Tautan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Admin Review Note if any */}
          {selectedEvent.reviewNote && (
            <div className="p-3 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-xs">
              <span className="font-semibold">Catatan Admin/Reviewer: </span>
              {selectedEvent.reviewNote}
            </div>
          )}

          {selectedEvent.rejectionReason && (
            <div className="p-3 bg-rose-50 text-rose-900 rounded-lg border border-rose-200 text-xs">
              <span className="font-semibold">Alasan Penolakan: </span>
              {selectedEvent.rejectionReason}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E1ECE5] bg-[#F7FAF8] flex items-center justify-between gap-3 sticky bottom-0">
          <button
            onClick={() => toggleBookmark(selectedEvent.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-[#EDF6F1] text-[#1B4D36] border-[#D5E5DC]'
                : 'bg-white text-stone-700 border-[#E1ECE5] hover:bg-stone-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current text-[#1B4D36]' : ''}`} />
            <span>{bookmarked ? 'Tersimpan' : 'Simpan Acara'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (inSchedule) {
                  removeFromMySchedule(selectedEvent.id);
                } else {
                  addToMySchedule(selectedEvent.id);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs ${
                inSchedule
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-[#1B4D36] text-white hover:bg-[#143D2A]'
              }`}
            >
              {inSchedule ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Di Jadwal Saya</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Tambahkan ke Jadwal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
