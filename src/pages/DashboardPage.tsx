import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { EventCard } from '../components/common/EventCard.tsx';
import { getRankedRecommendations } from '../utils/recommendationEngine.ts';
import { formatIndonesianDate } from '../utils/dateTime.ts';
import { UNKLAB_FACULTIES, isEventAffiliatedWithFaculty } from '../data/faculties.ts';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Search,
  CheckSquare,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Filter,
  GraduationCap,
  Clock,
  Building,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser, events, setActiveTab, setShowOnboarding } = useApp();

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'approved');
  }, [events]);

  const role = currentUser?.role || 'mahasiswa';
  const isDosenStaff = role === 'dosen_staff';

  // 1. For general students / organizations:
  // EXCLUDE all academic calendar events from Beranda (they are mandatory & can't be chosen/collide)
  const nonAcademicEvents = useMemo(() => {
    return approvedEvents.filter(e => e.sourceType !== 'academic_calendar');
  }, [approvedEvents]);

  // Recommendations for students (strictly non-academic events)
  const recommendations = useMemo(() => {
    return getRankedRecommendations(nonAcademicEvents, currentUser, 4);
  }, [nonAcademicEvents, currentUser]);

  // Filtered student events on Dashboard
  const filteredStudentEvents = useMemo(() => {
    return nonAcademicEvents.filter(event => {
      // Time filter (simulated date Nov 10, 2026)
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
      } else {
        // all upcoming from 2026-11-10
        const isUpcoming =
          event.date >= '2026-11-10' ||
          (event.endDate && event.endDate >= '2026-11-10');
        if (!isUpcoming) return false;
      }

      // Faculty Filter
      if (selectedFaculty !== 'all') {
        if (!isEventAffiliatedWithFaculty(event, selectedFaculty)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchLoc = event.location.toLowerCase().includes(q);
        const matchOrg = event.organizerName.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchOrg) return false;
      }

      return true;
    });
  }, [nonAcademicEvents, timeFilter, selectedFaculty, searchQuery]);

  // 2. For Dosen / Staff:
  // "cukup tampilkan informasi mengenai jadwal kalender akademik dan event yang berkaitan dengan fakultas mereka"
  const dosenAcademicEvents = useMemo(() => {
    return approvedEvents
      .filter(e => e.sourceType === 'academic_calendar')
      .filter(e => {
        // Upcoming or active around simulated date Nov 10, 2026
        return (
          e.date >= '2026-11-01' ||
          (e.endDate && e.endDate >= '2026-11-10')
        );
      });
  }, [approvedEvents]);

  const userFacultyId = useMemo(() => {
    if (!currentUser?.faculty) return 'fakultas-ilmu-komputer';
    const fLower = currentUser.faculty.toLowerCase();
    if (fLower.includes('komputer')) return 'fakultas-ilmu-komputer';
    if (fLower.includes('ekonomi') || fLower.includes('bisnis')) return 'fakultas-ekonomi';
    if (fLower.includes('keperawatan')) return 'fakultas-keperawatan';
    if (fLower.includes('pendidikan')) return 'fakultas-ilmu-pendidikan';
    if (fLower.includes('filsafat')) return 'fakultas-filsafat';
    if (fLower.includes('pertanian')) return 'fakultas-pertanian';
    if (fLower.includes('teknik')) return 'fakultas-teknik';
    if (fLower.includes('kedokteran')) return 'fakultas-kedokteran';
    return 'fakultas-ilmu-komputer';
  }, [currentUser]);

  const dosenFacultyEvents = useMemo(() => {
    return approvedEvents
      .filter(e => e.sourceType !== 'academic_calendar')
      .filter(e => isEventAffiliatedWithFaculty(e, userFacultyId));
  }, [approvedEvents, userFacultyId]);

  const pendingEvents = events.filter(e => e.status === 'pending');
  const userOrgEvents = currentUser?.organizationId
    ? events.filter(e => e.organizerId === currentUser.organizationId)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner with Green Campus Photograph Backdrop */}
      <section className="relative rounded-2xl overflow-hidden shadow-xs border border-[#E1ECE5]">
        {/* Background Image: UNKLAB Campus Green Lawn & Building */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/aistudio/image_9d59b804.png"
            alt="Universitas Klabat Green Campus"
            className="w-full h-full object-cover object-center"
          />
          {/* Natural Forest Green Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#143D2A]/95 via-[#1B4D36]/85 to-[#1B4D36]/75" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 text-white max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Green Campus Universitas Klabat</span>
            <span aria-hidden="true" className="text-emerald-300/50">·</span>
            <span>{formatIndonesianDate('2026-11-10')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat Datang di UNKLAB HUB{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed line-clamp-2">
            {isDosenStaff
              ? `Portal Terpadu Dosen/Staf: Agenda resmi kalender akademik BAAK dan kegiatan ${currentUser?.faculty || 'Fakultas'}.`
              : 'Pusat aktivitas terpadu kegiatan organisasi, seminar teknologi, penampilan choir, dan persekutuan kampus.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('calendar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#1B4D36] text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Kalender Terpusat</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg border border-emerald-500/40 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Jelajahi Acara</span>
            </button>

            {role === 'organisasi' && (
              <button
                onClick={() => setActiveTab('event-request')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A338] hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <span>+ Ajukan Event</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin-approval')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A338] hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Validasi ({pendingEvents.length})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* DOSEN / STAFF SPECIFIC DASHBOARD VIEW                          */}
      {/* "cukup tampilkan informasi mengenai jadwal kalender akademik  */}
      {/* dan event yang berkaitan dengan fakultas mereka"              */}
      {/* ============================================================== */}
      {isDosenStaff ? (
        <div className="space-y-6">
          {/* Dosen Scope Banner */}
          <div className="p-4 bg-white rounded-xl border border-[#E1ECE5] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EDF6F1] text-[#1B4D36] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#15261E]">
                  Panel Dosen / Staf · {currentUser?.faculty || 'Fakultas Ilmu Komputer'}
                </h3>
                <p className="text-xs text-stone-500">
                  Menampilkan jadwal resmi akademik universitas dan agenda khusus lingkup fakultas Anda.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-[#1B4D36] font-semibold hover:underline cursor-pointer hidden sm:block"
            >
              Lihat Kalender Lengkap →
            </button>
          </div>

          {/* Section 1: Official Academic Calendar Deadlines & Schedule */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#15261E]">
                <Clock className="w-4 h-4 text-[#1B4D36]" />
                <span>Jadwal Kalender Akademik Resmi ({dosenAcademicEvents.length} Agenda Penting)</span>
              </div>
              <span className="text-[11px] text-stone-500">Biro BAAK UNKLAB 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {dosenAcademicEvents.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* Section 2: Events Affiliated with Dosen's Faculty */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#15261E]">
                <Building className="w-4 h-4 text-teal-700" />
                <span>Agenda Khusus {currentUser?.faculty || 'Fakultas Ilmu Komputer'}</span>
              </div>
              <span className="text-[11px] text-stone-500">
                {dosenFacultyEvents.length} kegiatan fakultas
              </span>
            </div>

            {dosenFacultyEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {dosenFacultyEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E1ECE5] text-xs text-stone-500">
                Belum ada agenda rapat atau kegiatan khusus fakultas dalam periode ini.
              </div>
            )}
          </section>
        </div>
      ) : (
        /* ============================================================== */
        /* MAHASISWA & ORGANISASI DASHBOARD VIEW                          */
        /* (Kalender akademik DIKECUALIKAN dari beranda sesuai instruksi) */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Admin Fast Widget (If role === 'admin') */}
          {role === 'admin' && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('admin-approval')}
                className="bg-white p-4 rounded-xl border border-amber-200 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Validasi Event Pending</div>
                  <div className="text-2xl font-bold text-amber-700 mt-0.5">{pendingEvents.length}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('academic-calendar-admin')}
                className="bg-white p-4 rounded-xl border border-[#E1ECE5] hover:border-[#1B4D36] cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Kalender Akademik 2026</div>
                  <div className="text-2xl font-bold text-[#1B4D36] mt-0.5">
                    {events.filter(e => e.sourceType === 'academic_calendar').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#EDF6F1] text-[#1B4D36] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('calendar')}
                className="bg-white p-4 rounded-xl border border-[#E1ECE5] hover:border-[#1B4D36] cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Total Event Publik</div>
                  <div className="text-2xl font-bold text-emerald-800 mt-0.5">{approvedEvents.length}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </section>
          )}

          {/* Organization Fast Status (If role === 'organisasi') */}
          {role === 'organisasi' && (
            <section className="bg-white p-4 rounded-xl border border-[#E1ECE5] flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-[#15261E]">Status Proposal {currentUser?.name}:</span>
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pending: {userOrgEvents.filter(e => e.status === 'pending').length}
                </span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Disetujui: {userOrgEvents.filter(e => e.status === 'approved').length}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('event-request')}
                className="text-xs text-[#1B4D36] font-semibold hover:underline"
              >
                Lihat Riwayat →
              </button>
            </section>
          )}

          {/* Quick Filter Toolbar on Beranda (Fast Discovery) */}
          <section className="bg-white rounded-xl border border-[#E1ECE5] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15261E]">
                <Filter className="w-3.5 h-3.5 text-[#1B4D36]" />
                <span>Filter Kegiatan Organisasi & Fakultas</span>
                <span className="text-[11px] font-normal text-stone-500">
                  ({filteredStudentEvents.length} kegiatan)
                </span>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari judul kegiatan, lokasi, organisasi..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7FAF8] border border-[#E1ECE5] rounded-lg focus:outline-hidden focus:border-[#1B4D36] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Time Period Filter & Faculty Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E1ECE5] text-xs">
              {/* Time Segmented */}
              <div className="flex items-center gap-1 bg-[#F7FAF8] p-1 rounded-lg border border-[#E1ECE5]">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    timeFilter === 'all'
                      ? 'bg-[#1B4D36] text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    timeFilter === 'today'
                      ? 'bg-[#1B4D36] text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    timeFilter === 'week'
                      ? 'bg-[#1B4D36] text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Minggu Ini
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    timeFilter === 'month'
                      ? 'bg-[#1B4D36] text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Bulan Ini (Nov)
                </button>
              </div>

              {/* Faculty Dropdown */}
              <div className="flex items-center gap-1">
                <select
                  value={selectedFaculty}
                  onChange={e => setSelectedFaculty(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#E1ECE5] rounded-lg bg-white text-xs text-stone-800 focus:outline-hidden focus:border-[#1B4D36]"
                >
                  <option value="all">Semua Fakultas & Unit</option>
                  {UNKLAB_FACULTIES.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Personalized Recommendations (Exclusively Non-Academic Student Events) */}
          {role === 'mahasiswa' && recommendations.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#15261E]">
                  <Sparkles className="w-4 h-4 text-[#D4A338]" />
                  <span>Rekomendasi Kegiatan Untuk Anda</span>
                </div>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-xs text-[#1B4D36] hover:underline cursor-pointer"
                >
                  Ubah Minat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {recommendations.map(rec => (
                  <EventCard
                    key={rec.event.id}
                    event={rec.event}
                    recommendationReason={rec.reasons[0]}
                    isCompact
                  />
                ))}
              </div>
            </section>
          )}

          {/* Non-Academic Agenda Grid (Vibrant, Minimalist, Organized) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#15261E]">
                Agenda Kegiatan Kampus & Organisasi ({filteredStudentEvents.length})
              </h2>

              <button
                onClick={() => setActiveTab('explore')}
                className="inline-flex items-center gap-1 text-xs text-[#1B4D36] font-medium hover:underline cursor-pointer"
              >
                <span>Jelajahi Semua Acara</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {filteredStudentEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredStudentEvents.slice(0, 9).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E1ECE5] text-xs text-stone-500">
                Tidak ada kegiatan organisasi atau fakultas yang sesuai dengan filter yang dipilih.
              </div>
            )}
          </section>

          {/* Campus Facility & Life Showcase */}
          <section className="bg-white rounded-xl border border-[#E1ECE5] overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
            <div className="md:col-span-5 h-44 md:h-auto relative">
              <img
                src="/assets/aistudio/image_f168fbcf.png"
                alt="Gedung Kampus Universitas Klabat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-7 p-5 space-y-2.5 flex flex-col justify-center">
              <div className="text-[11px] font-semibold text-[#1B4D36] tracking-wide uppercase">
                Jadwal Rutin Ibadah & Asrama UNKLAB
              </div>
              <h3 className="text-base font-bold text-[#15261E]">
                Pola Pembinaan Rohani & Kehidupan Kampus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#52675C]">
                <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#E1ECE5]">
                  <span className="font-semibold text-[#1B4D36] block">Rabu · 18:00</span>
                  <span>Midweek seluruh asrama & outsider dekat</span>
                </div>
                <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#E1ECE5]">
                  <span className="font-semibold text-[#1B4D36] block">Jumat · 18:00</span>
                  <span>Vesper pembuka Sabat di Pioneer Chapel</span>
                </div>
                <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#E1ECE5]">
                  <span className="font-semibold text-[#1B4D36] block">Sabtu · 09:00</span>
                  <span>Ibadah Sabbath (Libur saat Long Weekend)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
