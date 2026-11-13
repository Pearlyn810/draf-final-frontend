import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';
import { User as UserIcon, LogOut, Sparkles, Shield, GraduationCap, Building2, Briefcase, Clock, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const { currentUser, logout, quickSwitchUser, setActiveTab } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'mahasiswa':
        return 'Mahasiswa';
      case 'dosen_staff':
        return 'Dosen / Staf';
      case 'organisasi':
        return 'Organisasi';
      case 'admin':
        return 'Administrator';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'mahasiswa':
        return <GraduationCap className="w-4 h-4 text-[#402155]" />;
      case 'dosen_staff':
        return <Briefcase className="w-4 h-4 text-[#402155]" />;
      case 'organisasi':
        return <Building2 className="w-4 h-4 text-[#402155]" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <header className="bg-white border-b border-[#E1ECE5] sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Campus Timezone */}
      <div className="bg-[#1B4D36] text-white text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">UNIVERSITAS KLABAT</span>
          <span className="text-emerald-300/60" aria-hidden="true">·</span>
          <span className="text-emerald-100/90 hidden sm:inline">Green Campus Portal</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-100 text-[11px] sm:text-xs">
          <Clock className="w-3.5 h-3.5 text-[#D4A338]" />
          <span>WITA: Selasa, 10 Nov 2026</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('dashboard')}
        >
          <img
            src="/assets/aistudio/LOGO_UNIVERSITAS_KLABAT_94c67fd3.png"
            alt="Logo Universitas Klabat"
            className="w-10 h-10 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#15261E]">
                UNKLAB HUB
              </span>
              <span className="text-[11px] text-[#527A68] hidden md:inline">
                · Green Campus
              </span>
            </div>
            <p className="text-[11px] text-[#52675C] font-normal hidden sm:block">
              One Platform, Every Campus Activity
            </p>
          </div>
        </div>

        {/* Quick Role Switcher & Auth Section */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E1ECE5] hover:bg-[#EDF6F1] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#EDF6F1] flex items-center justify-center font-bold text-[#1B4D36] text-xs border border-[#D5E5DC]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-[#15261E] truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#52675C] flex items-center gap-1">
                    {getRoleIcon(currentUser.role)}
                    <span>{getRoleLabel(currentUser.role)}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E1ECE5] py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs text-[#706A75]">Akun Aktif:</div>
                    <div className="text-sm font-semibold text-[#29242E]">{currentUser.name}</div>
                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                  </div>

                  {/* Switch Demo Role Section */}
                  <div className="px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Ganti Role Demo:
                  </div>
                  <div className="px-1 py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        quickSwitchUser('mahasiswa');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                        currentUser.role === 'mahasiswa' ? 'bg-[#F1EBF5] text-[#402155] font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-[#402155]" />
                      <div className="flex-1">
                        <div>Mahasiswa (Michael Karundeng)</div>
                        <div className="text-[10px] text-gray-500">12510025@student.unklab.ac.id</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchUser('dosen_staff');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                        currentUser.role === 'dosen_staff' ? 'bg-[#F1EBF5] text-[#402155] font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-[#402155]" />
                      <div className="flex-1">
                        <div>Dosen/Staff (Dr. Stenly Pungus)</div>
                        <div className="text-[10px] text-gray-500">dosen@unklab.ac.id</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchUser('organisasi');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                        currentUser.role === 'organisasi' ? 'bg-[#F1EBF5] text-[#402155] font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#402155]" />
                      <div className="flex-1">
                        <div>Organisasi (BEM UNKLAB)</div>
                        <div className="text-[10px] text-gray-500">bem@unklab.ac.id</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchUser('admin');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                        currentUser.role === 'admin' ? 'bg-[#F1EBF5] text-amber-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <div className="flex-1">
                        <div>Admin BAAK (Kalender & Approval)</div>
                        <div className="text-[10px] text-gray-500">admin@unklab.ac.id</div>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setActiveTab('profile');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Buka Profil & Preferensi</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D36] text-white text-xs font-medium rounded-lg hover:bg-[#143D2A] transition-all shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login UNKLAB</span>
            </button>
          )}

          {/* Assistant shortcut */}
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF6F1] hover:bg-[#1B4D36] hover:text-white text-[#1B4D36] text-xs font-medium transition-all cursor-pointer border border-[#D5E5DC]"
            title="Tanya AI Campus Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A338]" />
            <span className="hidden sm:inline">AI Tanya</span>
          </button>
        </div>
      </div>
    </header>
  );
};
