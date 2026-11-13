import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CampusEvent } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { formatIndonesianDate } from '../utils/dateTime.ts';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  GraduationCap,
  Clock,
  Trash2,
} from 'lucide-react';

export const AcademicCalendarAdminPage: React.FC = () => {
  const { currentUser, events, createEvent, deleteEvent, setSelectedEvent, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 'sem2' | 'summer' | 'sem1'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New academic item form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-[#29242E] text-base">Akses Khusus Admin BAAK</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Hanya Administrator BAAK yang memiliki kewenangan mengelola agenda Kalender Akademik Resmi Universitas Klabat.
        </p>
      </div>
    );
  }

  // Academic calendar items only
  const academicEvents = events.filter(e => e.sourceType === 'academic_calendar');

  const filteredAcademic = academicEvents.filter(item => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (semesterFilter === 'sem2') {
      return item.date >= '2026-01-01' && item.date <= '2026-05-31';
    } else if (semesterFilter === 'summer') {
      return item.date >= '2026-06-01' && item.date <= '2026-07-31';
    } else if (semesterFilter === 'sem1') {
      return item.date >= '2026-08-01' && item.date <= '2026-12-31';
    }

    return true;
  });

  const handleCreateAcademicItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        categoryId: 'cat-academic-calendar',
        sourceType: 'academic_calendar',
        date,
        endDate: endDate ? endDate : undefined,
        startTime: '08:00',
        endTime: '17:00',
        location: 'Universitas Klabat',
        organizerName: 'BAAK UNKLAB',
        organizerId: 'baak-unklab',
        description: description.trim() || 'Agenda resmi Kalender Akademik UNKLAB 2026.',
        targetAudience: ['mahasiswa', 'dosen_staff'],
        tags: ['akademik', 'resmi-unklab'],
        status: 'approved',
        isDummy: false,
      });

      showToast('Agenda Kalender Akademik berhasil ditambahkan!');
      setTitle('');
      setDescription('');
      setEndDate('');
      setShowAddModal(false);
    } catch {
      showToast('Gagal menambahkan agenda kalender akademik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, evTitle: string) => {
    if (window.confirm(`Hapus agenda akademik "${evTitle}"?`)) {
      await deleteEvent(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#29242E]">Kelola Kalender Akademik 2026</h1>
            <Badge variant="academic">Admin BAAK</Badge>
          </div>
          <p className="text-xs text-[#706A75] mt-1">
            Data resmi diintegrasikan dari dokumen Kalender Akademik UNKLAB 2026 (Semester II 2025/2026, Semester Padat 2026, dan Semester I 2026/2027).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#402155] text-white text-xs font-bold rounded-lg hover:bg-[#56366F] shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Agenda Akademik</span>
        </button>
      </div>

      {/* Filter and Stats Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari agenda ujian, wisuda, pendaftaran, pekan doa..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setSemesterFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              semesterFilter === 'all'
                ? 'bg-[#402155] text-white border-[#402155]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            Semua ({academicEvents.length})
          </button>
          <button
            onClick={() => setSemesterFilter('sem2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              semesterFilter === 'sem2'
                ? 'bg-[#402155] text-white border-[#402155]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            Sem II 25/26
          </button>
          <button
            onClick={() => setSemesterFilter('summer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              semesterFilter === 'summer'
                ? 'bg-[#402155] text-white border-[#402155]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            Summer 2026
          </button>
          <button
            onClick={() => setSemesterFilter('sem1')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              semesterFilter === 'sem1'
                ? 'bg-[#402155] text-white border-[#402155]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            Sem I 26/27
          </button>
        </div>
      </div>

      {/* Table of Academic Items */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FB] border-b border-[#E9E4EC] text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tanggal / Periode</th>
                <th className="py-3 px-4">Agenda Kegiatan Akademik</th>
                <th className="py-3 px-4">Keterangan / Lokasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E4EC]">
              {filteredAcademic.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#402155] whitespace-nowrap">
                    <div>{formatIndonesianDate(item.date)}</div>
                    {item.endDate && item.endDate !== item.date && (
                      <div className="text-[10px] text-gray-500 font-normal">
                        s/d {formatIndonesianDate(item.endDate)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#29242E]">{item.title}</div>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{item.location}</div>
                    <div className="text-[10px] text-gray-400">{item.organizerName}</div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEvent(item)}
                      className="px-2.5 py-1 text-xs text-[#402155] font-semibold hover:underline"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ACADEMIC ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#402155]" />
              <h3 className="font-bold text-base text-[#29242E]">Tambah Agenda Kalender Akademik 2026</h3>
            </div>

            <form onSubmit={handleCreateAcademicItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nama Agenda Akademik *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Ujian Tengah Semester (UTS) II"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Keterangan / Detail Agenda
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Keterangan resmi, prosedur, atau batas waktu..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#402155] text-white text-xs font-bold rounded-lg hover:bg-[#56366F] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan ke Kalender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
