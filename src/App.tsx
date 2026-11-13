import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { EventDetailModal } from './components/common/EventDetailModal.tsx';
import { OnboardingModal } from './components/common/OnboardingModal.tsx';
import { LoginModal } from './components/common/LoginModal.tsx';
import { Toast } from './components/common/Toast.tsx';

// Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';
import { ExploreEventsPage } from './pages/ExploreEventsPage.tsx';
import { MySchedulePage } from './pages/MySchedulePage.tsx';
import { AssistantPage } from './pages/AssistantPage.tsx';
import { EventRequestPage } from './pages/EventRequestPage.tsx';
import { AdminApprovalPage } from './pages/AdminApprovalPage.tsx';
import { AcademicCalendarAdminPage } from './pages/AcademicCalendarAdminPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col font-sans text-[#15261E]">
      {/* Header and Navbar */}
      <Header onOpenLogin={() => setIsLoginOpen(true)} />
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'explore' && <ExploreEventsPage />}
        {activeTab === 'my-schedule' && <MySchedulePage />}
        {activeTab === 'assistant' && <AssistantPage />}
        {activeTab === 'event-request' && <EventRequestPage />}
        {activeTab === 'admin-approval' && <AdminApprovalPage />}
        {activeTab === 'academic-calendar-admin' && <AcademicCalendarAdminPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Campus Footer */}
      <footer className="bg-white border-t border-[#E1ECE5] py-5 text-xs text-[#52675C] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/LOGO_UNIVERSITAS_KLABAT_94c67fd3.png"
              alt="UNKLAB"
              className="w-8 h-8 object-contain"
            />
            <div>
              <div className="font-semibold text-[#1B4D36]">UNIVERSITAS KLABAT (UNKLAB)</div>
              <div className="text-[11px] text-[#52675C]">Jl. Arnold Mononutu, Airmadidi, Minahasa Utara, Sulawesi Utara 95371</div>
            </div>
          </div>

          <div className="text-[11px] space-y-0.5">
            <div>UNKLAB HUB · Green Campus Portal © 2026</div>
            <div className="text-stone-400">Kalender Akademik Resmi & Kegiatan Terverifikasi UNKLAB</div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <EventDetailModal />
      <OnboardingModal />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
