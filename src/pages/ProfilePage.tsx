import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Building,
  Heart,
  Compass,
  Clock,
  Sparkles,
  LogOut,
  Edit3,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, logout, setShowOnboarding, quickSwitchUser } = useApp();

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-[#F1EBF5] border-2 border-purple-200 text-[#402155] flex items-center justify-center text-3xl font-black shadow-xs shrink-0">
          {currentUser.name.charAt(0)}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-[#29242E]">{currentUser.name}</h1>
            <Badge variant="organization">
              {currentUser.role.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>

          <div className="text-xs text-[#706A75] flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{currentUser.email}</span>
          </div>

          {(currentUser.faculty || currentUser.studyProgram) && (
            <div className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                {currentUser.studyProgram} - {currentUser.faculty}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowOnboarding(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1EBF5] text-[#402155] text-xs font-bold rounded-lg hover:bg-purple-200 transition-colors cursor-pointer shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Ubah Preferensi</span>
        </button>
      </div>

      {/* Preferences Overview */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-[#29242E] pb-2 border-b border-gray-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D9B85F]" />
          <span>Preferensi Personalisasi Dashboard</span>
        </h2>

        {/* Minat */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#80639A]" />
            Bidang Minat:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.interests && currentUser.interests.length > 0 ? (
              currentUser.interests.map(i => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#F1EBF5] text-[#402155] rounded-full text-xs font-semibold capitalize border border-purple-200"
                >
                  {i}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Belum diatur</span>
            )}
          </div>
        </div>

        {/* Hobi */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#80639A]" />
            Hobi:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.hobbies && currentUser.hobbies.length > 0 ? (
              currentUser.hobbies.map(h => (
                <span
                  key={h}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize"
                >
                  {h}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Belum diatur</span>
            )}
          </div>
        </div>

        {/* Preferred event types */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#80639A]" />
            Jenis Kegiatan Pilihan:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.preferredEventTypes && currentUser.preferredEventTypes.length > 0 ? (
              currentUser.preferredEventTypes.map(t => (
                <span
                  key={t}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Belum diatur</span>
            )}
          </div>
        </div>

        {/* Available time slots */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#80639A]" />
            Waktu Luang Utama:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.availableSlots && currentUser.availableSlots.length > 0 ? (
              currentUser.availableSlots.map(s => (
                <span
                  key={s}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  {s.replace(/-/g, ' ')}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Belum diatur</span>
            )}
          </div>
        </div>
      </div>

      {/* Switcher & Logout */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Ganti Akun Demo Cepat (Untuk Pengujian):
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => quickSwitchUser('mahasiswa')}
            className={`p-2 text-xs rounded-lg border text-center transition-all ${
              currentUser.role === 'mahasiswa'
                ? 'bg-[#402155] text-white font-bold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            Mahasiswa
          </button>
          <button
            onClick={() => quickSwitchUser('dosen_staff')}
            className={`p-2 text-xs rounded-lg border text-center transition-all ${
              currentUser.role === 'dosen_staff'
                ? 'bg-[#402155] text-white font-bold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            Dosen/Staff
          </button>
          <button
            onClick={() => quickSwitchUser('organisasi')}
            className={`p-2 text-xs rounded-lg border text-center transition-all ${
              currentUser.role === 'organisasi'
                ? 'bg-[#402155] text-white font-bold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            Organisasi BEM
          </button>
          <button
            onClick={() => quickSwitchUser('admin')}
            className={`p-2 text-xs rounded-lg border text-center transition-all ${
              currentUser.role === 'admin'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-gray-50 hover:bg-amber-50 text-gray-700'
            }`}
          >
            Admin BAAK
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
