import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { formatIndonesianDate } from '../utils/dateTime.ts';
import {
  FilePlus,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building,
  Info,
  ExternalLink,
} from 'lucide-react';

export const EventRequestPage: React.FC = () => {
  const { currentUser, categories, organizations, events, createEvent, setSelectedEvent } = useApp();

  const userRole = currentUser?.role;

  // Form states for Organization
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[1]?.id || 'cat-organization');
  const [date, setDate] = useState('2026-11-26');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('Ruang Kegiatan Mahasiswa');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>(['mahasiswa']);
  const [externalLink, setExternalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter organization's submissions
  const orgSubmissions = events.filter(
    e =>
      e.sourceType === 'organization_submission' ||
      (currentUser?.organizationId && e.organizerId === currentUser.organizationId) ||
      (currentUser?.name && e.organizerName.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  // Audience options
  const audienceOptions = [
    { id: 'mahasiswa', label: 'Mahasiswa' },
    { id: 'dosen_staff', label: 'Dosen / Staf' },
    { id: 'residents_all_dormitories', label: 'Seluruh Asrama' },
    { id: 'outsider_near', label: 'Outsider Dekat' },
  ];

  const toggleAudience = (id: string) => {
    setTargetAudience(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !location.trim() || !description.trim()) {
      setErrorMsg('Mohon lengkapi judul kegiatan, lokasi, dan deskripsi.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Waktu selesai harus lebih akhir dari waktu mulai.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        categoryId,
        date,
        startTime,
        endTime,
        location: location.trim(),
        description: description.trim(),
        targetAudience,
        externalLink: externalLink.trim() || undefined,
        organizerId: currentUser?.organizationId || 'org-bem-unklab',
        organizerName: currentUser?.name || 'Organisasi Kampus',
        sourceType: 'organization_submission',
        isDummy: true,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setExternalLink('');
      setShowPreview(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. IF DOSEN / STAFF: SHOW READ-ONLY MODE PER PRD
  if (userRole === 'dosen_staff') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-[#E9E4EC] p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Mode Read-Only (Dosen / Staf)
              </span>
              <h2 className="text-xl font-bold text-[#29242E]">
                Panduan Pengajuan Kegiatan Kampus
              </h2>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-3 leading-relaxed">
            <p>
              Sesuai dengan ketentuan operasional sistem <strong>UNKLAB HUB</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                <strong>Hak Pengajuan:</strong> Pengajuan kegiatan organisasi/komunitas mahasiswa hanya dapat diajukan secara resmi melalui akun <strong>Role Organisasi</strong> (BEM UNKLAB, BEM Fakultas, CSSA, Choir, Asrama, dll).
              </li>
              <li>
                <strong>Peran Dosen & Staf:</strong> Akun Dosen/Staf memiliki akses baca (read-only) terhadap pedoman ini, serta dapat memantau seluruh kalender akademik dan agenda kampus yang disetujui melalui menu <strong>Kalender</strong>.
              </li>
              <li>
                <strong>Kegiatan Akademik Resmi:</strong> Untuk penambahan atau pembaruan jadwal perkuliahan, ujian, dan kalender akademik, koordinasi dilakukan langsung oleh <strong>Biro Administrasi Akademik dan Kemahasiswaan (BAAK / Admin)</strong>.
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Butuh bantuan pengajuan organisasi?</span>
            <span className="font-semibold text-[#402155]">Hubungi BAAK UNKLAB (admin@unklab.ac.id)</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. FOR ORGANISASI & ADMIN
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#29242E]">
          {userRole === 'admin' ? 'Pengajuan & Pembuatan Kegiatan' : 'Pengajuan Kegiatan Organisasi'}
        </h1>
        <p className="text-xs text-[#706A75] mt-1">
          {userRole === 'admin'
            ? 'Sebagai Admin BAAK, kegiatan yang Anda buat dapat langsung disetujui (Approved) ke kalender publik.'
            : 'Formulir pengajuan agenda resmi organisasi. Setiap kegiatan akan berstatus PENDING hingga diverifikasi Admin BAAK.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E9E4EC] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <FilePlus className="w-5 h-5 text-[#402155]" />
            <h2 className="text-base font-bold text-[#29242E]">Formulir Pengajuan Baru</h2>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nama / Judul Kegiatan *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: CSSA Tech Talk: Cloud Computing & AI"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#402155]"
              />
            </div>

            {/* Category & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Kategori Kegiatan *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Organisasi Terdaftar'}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium"
                />
              </div>
            </div>

            {/* Date, Start Time, End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Tanggal Pelaksanaan *
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
                  Waktu Mulai (WITA) *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Waktu Selesai (WITA) *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Lokasi / Ruangan di Kampus *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Contoh: Auditorium GK1 Lantai 3 atau Pioneer Chapel"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#402155]"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Target Peserta Kegiatan:
              </label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map(aud => {
                  const selected = targetAudience.includes(aud.id);
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => toggleAudience(aud.id)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#402155] text-white border-[#402155] font-semibold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {aud.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Deskripsi dan Rincian Acara *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan, pembicara/pemimpin acara, dan informasi penting lainnya..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#402155]"
              />
            </div>

            {/* External Link */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Tautan Registrasi / Poster Luar (Opsional):
              </label>
              <input
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                placeholder="https://forms.gle/contoh"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
            </div>

            {/* Submit & Preview Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-[#402155] hover:underline font-semibold"
              >
                {showPreview ? 'Sembunyikan Pratinjau' : 'Lihat Pratinjau Data'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#402155] text-white text-xs font-bold rounded-lg hover:bg-[#56366F] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Mengirim...'
                  : userRole === 'admin'
                  ? 'Publikasikan Langsung'
                  : 'Kirim Pengajuan (Pending)'}
              </button>
            </div>
          </form>

          {/* Interactive Preview Box */}
          {showPreview && (
            <div className="mt-4 p-4 bg-[#FAF9FB] rounded-xl border border-purple-200 text-xs space-y-2">
              <div className="font-bold text-[#402155] uppercase tracking-wider">
                Pratinjau Data Pengajuan:
              </div>
              <div><strong>Judul:</strong> {title || '(Belum diisi)'}</div>
              <div><strong>Tanggal:</strong> {formatIndonesianDate(date)} ({startTime} - {endTime} WITA)</div>
              <div><strong>Lokasi:</strong> {location || '(Belum diisi)'}</div>
              <div><strong>Penyelenggara:</strong> {currentUser?.name}</div>
              <div><strong>Status Awal:</strong> {userRole === 'admin' ? 'APPROVED' : 'PENDING (Menunggu Validasi Admin)'}</div>
            </div>
          )}
        </div>

        {/* Submissions List Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E9E4EC] p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#29242E] flex items-center justify-between">
              <span>Riwayat Pengajuan Anda</span>
              <span className="text-xs text-gray-500 font-normal">
                {orgSubmissions.length} tercatat
              </span>
            </h2>

            {orgSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                Belum ada pengajuan kegiatan dari organisasi Anda.
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {orgSubmissions.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvent(item)}
                    className="p-3.5 bg-white rounded-xl border border-[#E9E4EC] hover:border-[#80639A] transition-all cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-[#29242E] truncate flex-1">
                        {item.title}
                      </h4>
                      {item.status === 'approved' && (
                        <Badge variant="approved" size="sm">Disetujui</Badge>
                      )}
                      {item.status === 'pending' && (
                        <Badge variant="pending" size="sm">Pending</Badge>
                      )}
                      {item.status === 'rejected' && (
                        <Badge variant="rejected" size="sm">Ditolak</Badge>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center gap-3">
                      <span>{formatIndonesianDate(item.date)}</span>
                      <span>•</span>
                      <span>{item.startTime} WITA</span>
                    </div>

                    {item.rejectionReason && (
                      <div className="p-2 bg-rose-50 rounded text-[11px] text-rose-800 border border-rose-200">
                        <strong>Catatan Admin:</strong> {item.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
