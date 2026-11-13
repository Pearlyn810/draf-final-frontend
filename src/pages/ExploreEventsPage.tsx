import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { EventCard } from '../components/common/EventCard.tsx';
import { UNKLAB_FACULTIES, isEventAffiliatedWithFaculty } from '../data/faculties.ts';
import { Search, Filter, LayoutGrid, List, RotateCcw, X, Building } from 'lucide-react';

export const ExploreEventsPage: React.FC = () => {
  const { events, categories } = useApp();

  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'upcoming'>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');

  // 1. Approved events only
  // 2. EXCLUDE spiritual/kerohanian events as requested:
  // "Kegiatan kerohanian juga jangan diletakkan dalam fitur jelajah"
  const nonSpiritualApprovedEvents = useMemo(() => {
    return events
      .filter(e => e.status === 'approved')
      .filter(e => {
        // Exclude religious/worship category
        if (e.categoryId === 'cat-religious') return false;
        if (e.worshipScheduleId) return false;
        const titleLower = e.title.toLowerCase();
        if (
          titleLower.includes('ibadah midweek') ||
          titleLower.includes('ibadah vesper') ||
          titleLower.includes('ibadah sabbath') ||
          titleLower.includes('ibadah sabat') ||
          titleLower.includes('worship bersama')
        ) {
          return false;
        }
        return true;
      });
  }, [events]);

  // Categories available in explore (excluding religious category)
  const availableCategories = useMemo(() => {
    return categories.filter(c => c.id !== 'cat-religious');
  }, [categories]);

  const filteredEvents = useMemo(() => {
    return nonSpiritualApprovedEvents.filter(event => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchDesc = event.description.toLowerCase().includes(q);
        const matchOrg = event.organizerName.toLowerCase().includes(q);
        const matchLoc = event.location.toLowerCase().includes(q);
        const matchTags = event.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchOrg && !matchLoc && !matchTags) return false;
      }

      // Time Filter (Simulated date Nov 10, 2026)
      const isDateActive = (targetDate: string) => {
        if (event.date === targetDate) return true;
        if (event.endDate && event.date <= targetDate && targetDate <= event.endDate) return true;
        return false;
      };

      if (timeFilter === 'today') {
        if (!isDateActive('2026-11-10')) return false;
      } else if (timeFilter === 'week') {
        const inWeek =
          (event.date >= '2026-11-09' && event.date <= '2026-11-15') ||
          (event.endDate && event.date <= '2026-11-15' && event.endDate >= '2026-11-09');
        if (!inWeek) return false;
      } else if (timeFilter === 'month') {
        const inMonth =
          event.date.startsWith('2026-11') ||
          (event.endDate && event.date <= '2026-11-30' && event.endDate >= '2026-11-01');
        if (!inMonth) return false;
      } else if (timeFilter === 'upcoming') {
        const isUpcomingOrActive =
          event.date >= '2026-11-10' ||
          (event.endDate && event.endDate >= '2026-11-10');
        if (!isUpcomingOrActive) return false;
      }

      // Faculty Filter (Replaces organizer filter as requested)
      if (selectedFaculty !== 'all') {
        if (!isEventAffiliatedWithFaculty(event, selectedFaculty)) return false;
      }

      // Category Filter
      if (selectedCat !== 'all' && event.categoryId !== selectedCat) {
        return false;
      }

      // Audience Filter
      if (selectedAudience !== 'all' && !event.targetAudience.includes(selectedAudience)) {
        return false;
      }

      return true;
    });
  }, [nonSpiritualApprovedEvents, search, timeFilter, selectedFaculty, selectedCat, selectedAudience]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (timeFilter !== 'all') count++;
    if (selectedFaculty !== 'all') count++;
    if (selectedCat !== 'all') count++;
    if (selectedAudience !== 'all') count++;
    return count;
  }, [search, timeFilter, selectedFaculty, selectedCat, selectedAudience]);

  const handleReset = () => {
    setSearch('');
    setTimeFilter('all');
    setSelectedFaculty('all');
    setSelectedCat('all');
    setSelectedAudience('all');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#15261E]">Jelajahi Kegiatan Kampus</h1>
          <p className="text-xs text-[#52675C]">
            Temukan aktivitas organisasi fakultas, pameran inovasi, seminar, dan penampilan choir UNKLAB.
          </p>
        </div>

        {/* View Mode & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#52675C]">
            <strong className="text-[#1B4D36] font-semibold">{filteredEvents.length}</strong> kegiatan ditemukan
          </span>

          <div className="flex items-center gap-0.5 bg-[#EDF6F1] p-1 rounded-lg border border-[#D5E5DC]">
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                viewStyle === 'grid' ? 'bg-[#1B4D36] text-white shadow-2xs' : 'text-[#52675C] hover:text-[#15261E]'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                viewStyle === 'list' ? 'bg-[#1B4D36] text-white shadow-2xs' : 'text-[#52675C] hover:text-[#15261E]'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Minimalist Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#E1ECE5] p-4 shadow-xs space-y-3.5">
        {/* Search Bar with instant clear */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul kegiatan, lokasi, topik, atau kata kunci..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-[#F7FAF8] border border-[#E1ECE5] rounded-lg focus:outline-hidden focus:border-[#1B4D36] focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Faculty Filter Quick Chips (Requested Feature) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#52675C]">
            <Building className="w-3 h-3 text-[#1B4D36]" />
            <span>Filter Fakultas:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedFaculty('all')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap border ${
                selectedFaculty === 'all'
                  ? 'bg-[#1B4D36] text-white border-[#1B4D36] font-medium'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              Semua Fakultas
            </button>
            {UNKLAB_FACULTIES.map(fac => {
              const isSelected = selectedFaculty === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFaculty(fac.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'text-white font-medium shadow-2xs'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? fac.color : undefined,
                    borderColor: isSelected ? fac.color : undefined,
                  }}
                >
                  {fac.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row: Time Range + Category + Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E1ECE5] text-xs">
          {/* Time Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#52675C] block mb-1">Rentang Waktu:</label>
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-[#E1ECE5] rounded-md bg-white text-xs text-[#15261E] focus:outline-hidden focus:border-[#1B4D36]"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini (10 Nov 2026)</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan November 2026</option>
              <option value="upcoming">Kegiatan Mendatang</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#52675C] block mb-1">Kategori:</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E1ECE5] rounded-md bg-white text-xs text-[#15261E] focus:outline-hidden focus:border-[#1B4D36]"
            >
              <option value="all">Semua Kategori</option>
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audience */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#52675C] block mb-1">Sasaran Peserta:</label>
            <select
              value={selectedAudience}
              onChange={e => setSelectedAudience(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E1ECE5] rounded-md bg-white text-xs text-[#15261E] focus:outline-hidden focus:border-[#1B4D36]"
            >
              <option value="all">Semua Civitas</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen_staff">Dosen & Staf</option>
              <option value="residents_all_dormitories">Penghuni Asrama</option>
              <option value="outsider_near">Outsider Dekat</option>
              <option value="outsider_far">Outsider Jauh</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between pt-1.5 border-t border-[#E1ECE5]">
            <span className="text-xs text-[#52675C] font-medium">
              {activeFiltersCount} filter aktif
            </span>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Events Results Grid / List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E1ECE5] p-10 text-center space-y-2.5">
          <Filter className="w-6 h-6 text-stone-300 mx-auto" />
          <h3 className="font-semibold text-[#15261E] text-sm">Tidak ada kegiatan ditemukan</h3>
          <p className="text-xs text-[#52675C] max-w-sm mx-auto">
            Coba sesuaikan pilihan fakultas, kategori, atau reset kata kunci pencarian.
          </p>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-[#1B4D36] text-white text-xs font-medium rounded-lg hover:bg-[#143D2A] cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div
          className={
            viewStyle === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'
              : 'space-y-2.5'
          }
        >
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} isCompact={viewStyle === 'list'} />
          ))}
        </div>
      )}
    </div>
  );
};
