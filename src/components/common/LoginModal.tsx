import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';
import { X, Lock, Mail, GraduationCap, Briefcase, Building2, Shield, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();

  const [email, setEmail] = useState('12510025@student.unklab.ac.id');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('mahasiswa');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate email domain
    const emailRegex = /^[^\s@]+@([a-zA-Z0-9.-]+\.)?unklab\.ac\.id$/i;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Email wajib menggunakan domain resmi kampus UNKLAB (@unklab.ac.id atau @student.unklab.ac.id)');
      return;
    }

    setIsLoading(true);
    const success = await login(email.trim(), password, role);
    setIsLoading(false);

    if (success) {
      onClose();
    }
  };

  const handleQuickSelect = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setRole(demoRole);
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E9E4EC] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/LOGO_UNIVERSITAS_KLABAT_94c67fd3.png"
              alt="UNKLAB"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h3 className="text-lg font-bold text-[#29242E]">Login UNKLAB HUB</h3>
              <p className="text-xs text-[#706A75]">Gunakan akun resmi civitas akademika</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Email Kampus UNKLAB:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nim@student.unklab.ac.id"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#402155]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Kata Sandi:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#402155]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Jenis Akun / Peran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('mahasiswa')}
                className={`p-2 text-xs rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  role === 'mahasiswa'
                    ? 'bg-[#F1EBF5] border-[#80639A] text-[#402155] font-bold'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Mahasiswa</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('dosen_staff')}
                className={`p-2 text-xs rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  role === 'dosen_staff'
                    ? 'bg-[#F1EBF5] border-[#80639A] text-[#402155] font-bold'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Dosen / Staf</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('organisasi')}
                className={`p-2 text-xs rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  role === 'organisasi'
                    ? 'bg-[#F1EBF5] border-[#80639A] text-[#402155] font-bold'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Organisasi</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-2 text-xs rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  role === 'admin'
                    ? 'bg-[#F1EBF5] border-amber-500 text-amber-800 font-bold'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin BAAK</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#402155] text-white text-xs font-bold rounded-lg hover:bg-[#56366F] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Quick Demo Accounts for Classroom / Grader Testing */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
            Akun Demo Siap Pakai:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickSelect('12510025@student.unklab.ac.id', 'mahasiswa')}
              className="p-1.5 bg-gray-50 hover:bg-[#F1EBF5] rounded border border-gray-200 text-left transition-colors"
            >
              <div className="font-semibold text-[#402155]">Mahasiswa</div>
              <div className="text-[10px] text-gray-500 truncate">12510025@student.unklab.ac.id</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('dosen@unklab.ac.id', 'dosen_staff')}
              className="p-1.5 bg-gray-50 hover:bg-[#F1EBF5] rounded border border-gray-200 text-left transition-colors"
            >
              <div className="font-semibold text-[#402155]">Dosen / Staff</div>
              <div className="text-[10px] text-gray-500 truncate">dosen@unklab.ac.id</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('bem@unklab.ac.id', 'organisasi')}
              className="p-1.5 bg-gray-50 hover:bg-[#F1EBF5] rounded border border-gray-200 text-left transition-colors"
            >
              <div className="font-semibold text-[#402155]">Organisasi BEM</div>
              <div className="text-[10px] text-gray-500 truncate">bem@unklab.ac.id</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('admin@unklab.ac.id', 'admin')}
              className="p-1.5 bg-gray-50 hover:bg-amber-50 rounded border border-gray-200 text-left transition-colors"
            >
              <div className="font-semibold text-amber-800">Admin BAAK</div>
              <div className="text-[10px] text-gray-500 truncate">admin@unklab.ac.id</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
