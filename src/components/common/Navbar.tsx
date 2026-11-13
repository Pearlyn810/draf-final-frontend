import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Home,
  Calendar,
  Compass,
  BookmarkCheck,
  Bot,
  FilePlus,
  CheckSquare,
  BookOpen,
  User,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, events } = useApp();

  const userRole = currentUser?.role;

  // Count pending events for Admin badge
  const pendingCount = events.filter(e => e.status === 'pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: Home,
      visible: true,
    },
    {
      id: 'calendar',
      label: 'Kalender Terpusat',
      icon: Calendar,
      visible: true,
    },
    {
      id: 'explore',
      label: 'Jelajahi Acara',
      icon: Compass,
      visible: true,
    },
    {
      id: 'my-schedule',
      label: 'Jadwal Saya',
      icon: BookmarkCheck,
      visible: true,
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Bot,
      visible: true,
    },
    {
      id: 'event-request',
      label: userRole === 'organisasi' ? 'Ajukan Event' : 'Event Request',
      icon: FilePlus,
      // Visible for Organisasi, Dosen/Staff, and Admin (hidden for Mahasiswa)
      visible: userRole === 'organisasi' || userRole === 'dosen_staff' || userRole === 'admin',
    },
    {
      id: 'admin-approval',
      label: 'Validasi Event',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
      visible: userRole === 'admin',
    },
    {
      id: 'academic-calendar-admin',
      label: 'Kelola Kalender',
      icon: BookOpen,
      visible: userRole === 'admin',
    },
    {
      id: 'profile',
      label: 'Profil Saya',
      icon: User,
      visible: !!currentUser,
    },
  ];

  return (
    <nav className="bg-white border-b border-[#E1ECE5] overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-1.5 py-1.5">
          {navItems
            .filter(item => item.visible)
            .map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#1B4D36] text-white shadow-xs'
                      : 'text-[#52675C] hover:text-[#1B4D36] hover:bg-[#EDF6F1]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-200' : 'text-[#688D7B]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-amber-400 text-[#1B4D36]' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </nav>
  );
};
