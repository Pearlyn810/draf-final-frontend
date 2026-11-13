import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CampusEvent } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { formatIndonesianDate } from '../utils/dateTime.ts';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Building,
  Filter,
} from 'lucide-react';

export const AdminApprovalPage: React.FC = () => {
  const { currentUser, events, updateEvent, setSelectedEvent, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-[#29242E] text-base">Akses Terbatas untuk Admin BAAK</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Halaman Approval Queue hanya dapat diakses oleh akun dengan Role Administrator.
        </p>
      </div>
    );
  }

  // Filter organization events
  const orgSubmissions = events.filter(e => e.sourceType === 'organization_submission');
  const displayedEvents = orgSubmissions.filter(e => e.status === activeFilter);

  const pendingCount = orgSubmissions.filter(e => e.status === 'pending').length;
  const approvedCount = orgSubmissions.filter(e => e.status === 'approved').length;
  const rejectedCount = orgSubmissions.filter(e => e.status === 'rejected').length;

  const handleApprove = async (event: CampusEvent) => {
    setProcessingId(event.id);
    try {
      await updateEvent(event.id, {
        status: 'approved',
        approvedBy: currentUser.name,
        reviewNote: 'Disetujui oleh Administrator BAAK UNKLAB pada 10 November 2026',
      });
      showToast(`Kegiatan "${event.title}" berhasil disetujui dan kini tampil di kalender publik.`);
    } catch {
      showToast('Gagal menyetujui kegiatan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingEventId || !rejectReason.trim()) return;

    setProcessingId(rejectingEventId);
    try {
      await updateEvent(rejectingEventId, {
        status: 'rejected',
        rejectionReason: rejectReason.trim(),
      });
      showToast('Pengajuan kegiatan telah ditolak dan alasan penolakan disimpan.');
      setRejectingEventId(null);
      setRejectReason('');
    } catch {
      showToast('Gagal menolak kegiatan');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#29242E]">Approval Queue (Validasi Event)</h1>
            <Badge variant="academic">Admin BAAK</Badge>
          </div>
          <p className="text-xs text-[#706A75] mt-1">
            Pusat evaluasi kelayakan kegiatan organisasi kampus sebelum dipublikasikan ke kalender umum civitas akademika.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E9E4EC]">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Menunggu ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Disetujui ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Ditolak ({rejectedCount})</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      {displayedEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E9E4EC] p-12 text-center space-y-2">
          <CheckSquare className="w-8 h-8 text-gray-300 mx-auto" />
          <h3 className="font-bold text-sm text-[#29242E]">
            Tidak ada pengajuan dengan status {activeFilter.toUpperCase()}
          </h3>
          <p className="text-xs text-gray-500">
            Seluruh antrean pengajuan organisasi kampus untuk filter ini sudah diproses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedEvents.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-[#E9E4EC] p-5 shadow-xs space-y-4 hover:border-gray-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#402155] bg-[#F1EBF5] px-2.5 py-0.5 rounded-full border border-purple-200">
                      ID: {event.id}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {event.organizerName}
                    </span>
                    {event.status === 'pending' && <Badge variant="pending">Pending Review</Badge>}
                    {event.status === 'approved' && <Badge variant="approved">Approved</Badge>}
                    {event.status === 'rejected' && <Badge variant="rejected">Rejected</Badge>}
                  </div>

                  <h3 className="text-base font-bold text-[#29242E]">{event.title}</h3>
                </div>

                {/* Logistics Badges */}
                <div className="text-xs text-gray-600 space-y-1 sm:text-right shrink-0">
                  <div className="flex items-center sm:justify-end gap-1.5 font-medium text-[#29242E]">
                    <Calendar className="w-3.5 h-3.5 text-[#80639A]" />
                    <span>{formatIndonesianDate(event.date)}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#80639A]" />
                    <span>{event.startTime} - {event.endTime} WITA</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#80639A]" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#FAF9FB] p-3.5 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-500 block mb-0.5">Deskripsi Pengajuan:</span>
                {event.description}
              </div>

              {/* Target & External */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span>Sasaran:</span>
                  {event.targetAudience.map(t => (
                    <span key={t} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>

                {event.rejectionReason && (
                  <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                    <strong>Alasan Ditolak:</strong> {event.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="text-xs text-[#402155] font-semibold hover:underline"
                >
                  Buka Pratinjau Lengkap
                </button>

                <div className="flex items-center gap-2">
                  {event.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setRejectingEventId(event.id);
                          setRejectReason('');
                        }}
                        disabled={processingId === event.id}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      >
                        Tolak (Reject)
                      </button>

                      <button
                        onClick={() => handleApprove(event)}
                        disabled={processingId === event.id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        {processingId === event.id ? 'Memproses...' : 'Setujui (Approve)'}
                      </button>
                    </>
                  )}

                  {event.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(event)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200"
                    >
                      Batal Tolak & Setujui
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {rejectingEventId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Tolak Pengajuan Kegiatan</span>
            </div>

            <p className="text-xs text-gray-600">
              Sesuai ketentuan PRD, alasan penolakan wajib dituliskan agar organisasi pengaju mengetahui perbaikan yang diperlukan:
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Contoh: Jadwal bentrok dengan kegiatan ibadah kampus; atau ruangan GK1 lantai 3 telah terpesan untuk seminar fakultas."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingEventId(null)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  Simpan Penolakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
