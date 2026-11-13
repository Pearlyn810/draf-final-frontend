import React from 'react';
import { CampusEvent } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { formatIndonesianDate, getEventLiveStatus } from '../../utils/dateTime.ts';
import { getEventFaculty } from '../../data/faculties.ts';
import {
  Calendar as CalendarIcon,
  MapPin,
  Bookmark,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  recommendationReason?: string;
  isCompact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  recommendationReason,
  isCompact = false,
}) => {
  const {
    setSelectedEvent,
    toggleBookmark,
    isBookmarked,
    addToMySchedule,
    removeFromMySchedule,
    isInMySchedule,
    categories,
  } = useApp();

  const category = categories.find(c => c.id === event.categoryId);
  const liveStatus = getEventLiveStatus(event.date, event.startTime, event.endTime);
  const bookmarked = isBookmarked(event.id);
  const inSchedule = isInMySchedule(event.id);
  const faculty = getEventFaculty(event);

  return (
    <div
      onClick={() => setSelectedEvent(event)}
      className={`group bg-white rounded-xl border border-[#E1ECE5] hover:border-stone-400 transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between overflow-hidden relative ${
        isCompact ? 'p-3.5' : 'p-4 sm:p-5'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: faculty.color,
      }}
    >
      <div>
        {/* Top Kicker Row with Colorful Faculty & Category Indicators */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium truncate">
            {/* Colorful Faculty Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${faculty.badgeBg} ${faculty.badgeText}`}
            >
              {faculty.name.replace('Fakultas ', '')}
            </span>

            <span aria-hidden="true" className="text-stone-300">·</span>

            {/* Category */}
            <span className="text-stone-600 truncate text-[11px]">
              {category?.name || 'Kegiatan'}
            </span>

            {/* Live Indicator if currently happening */}
            {liveStatus === 'ongoing' && (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live
                </span>
              </>
            )}
          </div>

          {/* Quick Bookmark Action */}
          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={() => toggleBookmark(event.id)}
              className={`p-1.5 rounded-md transition-colors ${
                bookmarked
                  ? 'text-[#1B4D36] bg-[#EDF6F1]'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
              }`}
              title={bookmarked ? 'Hapus Simpanan' : 'Simpan Acara'}
              aria-label={bookmarked ? `Hapus simpanan ${event.title}` : `Simpan ${event.title}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title with Colorful Hover Accent */}
        <h3
          className={`font-semibold text-[#15261E] group-hover:text-stone-900 transition-colors leading-snug ${
            isCompact ? 'text-xs mb-1 line-clamp-2' : 'text-sm sm:text-base mb-1.5'
          }`}
        >
          {event.title}
        </h3>

        {/* Recommendation Reason Callout */}
        {recommendationReason && (
          <div className="mb-2 flex items-center gap-1 text-[11px] text-[#1B4D36] bg-[#EDF6F1]/90 px-2 py-0.5 rounded border border-[#D5E5DC]">
            <Sparkles className="w-3 h-3 text-[#D4A338] shrink-0" />
            <span className="truncate">{recommendationReason}</span>
          </div>
        )}

        {/* Description line */}
        {!isCompact && event.description && (
          <p className="text-xs text-stone-500 line-clamp-1 mb-2.5">
            {event.description}
          </p>
        )}
      </div>

      {/* Meta Footer Row */}
      <div className="pt-2.5 border-t border-[#E1ECE5] text-xs text-stone-500">
        <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-stone-700">
            <CalendarIcon className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="font-medium">{formatIndonesianDate(event.date)}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{event.startTime} WITA</span>
          </div>

          <div className="flex items-center gap-1 text-stone-500 truncate max-w-[130px]">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Organizer & Schedule Action Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium text-stone-600 truncate max-w-[150px]">
            {event.organizerName}
          </span>

          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={() => {
                if (inSchedule) {
                  removeFromMySchedule(event.id);
                } else {
                  addToMySchedule(event.id);
                }
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                inSchedule
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200'
              }`}
            >
              {inSchedule ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Jadwal Saya</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 text-stone-500" />
                  <span>+ Jadwal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
