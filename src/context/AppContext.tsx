import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CampusEvent,
  Category,
  Organization,
  Choir,
  Dormitory,
  WorshipSchedule,
  User,
  Bookmark,
  MyScheduleItem,
  UserRole,
} from '../types/index.ts';
import { detectScheduleConflicts, ConflictResult } from '../utils/scheduleConflict.ts';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Data
  events: CampusEvent[];
  categories: Category[];
  organizations: Organization[];
  choirs: Choir[];
  dormitories: Dormitory[];
  worshipSchedules: WorshipSchedule[];
  bookmarks: Bookmark[];
  mySchedule: MyScheduleItem[];
  
  // Actions
  refreshData: () => Promise<void>;
  createEvent: (data: Partial<CampusEvent>) => Promise<CampusEvent>;
  updateEvent: (id: string, updates: Partial<CampusEvent>) => Promise<CampusEvent>;
  deleteEvent: (id: string) => Promise<void>;
  
  toggleBookmark: (eventId: string) => Promise<void>;
  isBookmarked: (eventId: string) => boolean;
  
  addToMySchedule: (eventId: string, notes?: string) => Promise<void>;
  removeFromMySchedule: (eventId: string) => Promise<void>;
  isInMySchedule: (eventId: string) => boolean;
  myScheduleConflicts: ConflictResult;

  // Navigation & UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEvent: CampusEvent | null;
  setSelectedEvent: (event: CampusEvent | null) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('unklab_hub_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to student demo user
    return {
      id: 'user-mahasiswa-01',
      name: 'Michael Karundeng',
      email: '12510025@student.unklab.ac.id',
      role: 'mahasiswa',
      faculty: 'Fakultas Ilmu Komputer',
      studyProgram: 'Informatika',
      interests: ['teknologi', 'musik', 'kerohanian'],
      hobbies: ['coding', 'bermain musik', 'membaca'],
      preferredEventTypes: ['seminar', 'choir', 'ibadah'],
      availableSlots: ['weekday-afternoon', 'sabbath', 'minggu-pagi'],
      profileCompleted: true,
    };
  });

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [choirs, setChoirs] = useState<Choir[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [worshipSchedules, setWorshipSchedules] = useState<WorshipSchedule[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mySchedule, setMySchedule] = useState<MyScheduleItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const refreshData = async () => {
    try {
      const [evRes, catRes, orgRes, choirRes, dormRes, worRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/categories'),
        fetch('/api/organizations'),
        fetch('/api/choirs'),
        fetch('/api/dormitories'),
        fetch('/api/worshipSchedules'),
      ]);

      if (evRes.ok) setEvents(await evRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (orgRes.ok) setOrganizations(await orgRes.json());
      if (choirRes.ok) setChoirs(await choirRes.json());
      if (dormRes.ok) setDormitories(await dormRes.json());
      if (worRes.ok) setWorshipSchedules(await worRes.json());

      if (currentUser) {
        const [bmRes, msRes] = await Promise.all([
          fetch(`/api/bookmarks?userId=${currentUser.id}`),
          fetch(`/api/mySchedule?userId=${currentUser.id}`),
        ]);
        if (bmRes.ok) setBookmarks(await bmRes.json());
        if (msRes.ok) setMySchedule(await msRes.json());
      }
    } catch (e) {
      console.error('Error refreshing app data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('unklab_hub_user', JSON.stringify(currentUser));
      if (!currentUser.profileCompleted) {
        setShowOnboarding(true);
      }
    } else {
      localStorage.removeItem('unklab_hub_user');
    }
  }, [currentUser]);

  const login = async (email: string, password = 'password123', role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }
      setCurrentUser(data.user);
      showToast(`Selamat datang, ${data.user.name}!`);
      if (!data.user.profileCompleted) {
        setShowOnboarding(true);
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'Gagal login');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Anda telah keluar.');
    setActiveTab('dashboard');
  };

  const quickSwitchUser = async (role: UserRole) => {
    const roleAccounts: Record<UserRole, { email: string; role: UserRole }> = {
      mahasiswa: { email: '12510025@student.unklab.ac.id', role: 'mahasiswa' },
      dosen_staff: { email: 'dosen@unklab.ac.id', role: 'dosen_staff' },
      organisasi: { email: 'bem@unklab.ac.id', role: 'organisasi' },
      admin: { email: 'admin@unklab.ac.id', role: 'admin' },
    };
    const acc = roleAccounts[role];
    await login(acc.email, 'password123', acc.role);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...data }),
      });
      const json = await res.json();
      if (res.ok) {
        setCurrentUser(json.user);
        showToast('Profil dan preferensi berhasil diperbarui.');
      } else {
        showToast(json.error || 'Gagal menyimpan profil');
      }
    } catch {
      showToast('Gagal terhubung ke server');
    }
  };

  const createEvent = async (data: Partial<CampusEvent>): Promise<CampusEvent> => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        isAdminCreation: currentUser?.role === 'admin',
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Gagal mengajukan kegiatan');
    }
    await refreshData();
    showToast(
      currentUser?.role === 'admin'
        ? 'Kegiatan berhasil dipublikasikan!'
        : 'Pengajuan kegiatan berhasil dikirim (Status: PENDING)!'
    );
    return json;
  };

  const updateEvent = async (id: string, updates: Partial<CampusEvent>): Promise<CampusEvent> => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Gagal memperbarui status');
    }
    await refreshData();
    showToast('Data kegiatan berhasil diperbarui.');
    return json;
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await refreshData();
    showToast('Kegiatan berhasil dihapus.');
  };

  const toggleBookmark = async (eventId: string) => {
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu untuk menyimpan event.');
      return;
    }
    const existing = bookmarks.find(b => b.userId === currentUser.id && b.eventId === eventId);
    if (existing) {
      await fetch(`/api/bookmarks/${existing.id}?userId=${currentUser.id}`, { method: 'DELETE' });
      setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      showToast('Event dihapus dari simpanan.');
    } else {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, eventId }),
      });
      if (res.ok) {
        const item = await res.json();
        setBookmarks(prev => [...prev, item]);
        showToast('Event berhasil disimpan!');
      }
    }
  };

  const isBookmarked = (eventId: string) => {
    return bookmarks.some(b => b.userId === currentUser?.id && b.eventId === eventId);
  };

  const addToMySchedule = async (eventId: string, notes?: string) => {
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu.');
      return;
    }
    const res = await fetch('/api/mySchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, eventId, notes }),
    });
    if (res.ok) {
      const item = await res.json();
      setMySchedule(prev => [...prev, item]);
      showToast('Event ditambahkan ke My Schedule!');
    }
  };

  const removeFromMySchedule = async (eventId: string) => {
    if (!currentUser) return;
    await fetch(`/api/mySchedule/${eventId}?userId=${currentUser.id}`, { method: 'DELETE' });
    setMySchedule(prev => prev.filter(m => !(m.userId === currentUser.id && m.eventId === eventId)));
    showToast('Event dihapus dari My Schedule.');
  };

  const isInMySchedule = (eventId: string) => {
    return mySchedule.some(m => m.userId === currentUser?.id && m.eventId === eventId);
  };

  // Schedule conflict detection for MySchedule items
  const scheduledEvents = mySchedule
    .map(ms => events.find(e => e.id === ms.eventId))
    .filter((e): e is CampusEvent => !!e);

  const myScheduleConflicts = detectScheduleConflicts(scheduledEvents);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        quickSwitchUser,
        updateProfile,
        events,
        categories,
        organizations,
        choirs,
        dormitories,
        worshipSchedules,
        bookmarks,
        mySchedule,
        refreshData,
        createEvent,
        updateEvent,
        deleteEvent,
        toggleBookmark,
        isBookmarked,
        addToMySchedule,
        removeFromMySchedule,
        isInMySchedule,
        myScheduleConflicts,
        activeTab,
        setActiveTab,
        selectedEvent,
        setSelectedEvent,
        showOnboarding,
        setShowOnboarding,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
