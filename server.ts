import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialCategories,
  initialOrganizations,
  initialChoirs,
  initialDormitories,
  initialDormitoryActivities,
  initialWorshipSchedules,
  initialAudienceGroups,
  initialUsers,
  initialEvents,
} from './src/data/initialData.ts';
import {
  CampusEvent,
  User,
  Bookmark,
  MyScheduleItem,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory application store
let categories = [...initialCategories];
let organizations = [...initialOrganizations];
let choirs = [...initialChoirs];
let dormitories = [...initialDormitories];
let dormitoryActivities = [...initialDormitoryActivities];
let worshipSchedules = [...initialWorshipSchedules];
let audienceGroups = [...initialAudienceGroups];
let users: User[] = [...initialUsers];
let events: CampusEvent[] = [...initialEvents];
let bookmarks: Bookmark[] = [
  {
    id: 'bm-01',
    userId: 'user-mahasiswa-01',
    eventId: 'event-choir-tuc-anniversary',
    createdAt: '2026-11-10T08:00:00Z',
  },
  {
    id: 'bm-02',
    userId: 'user-mahasiswa-01',
    eventId: 'acad-2026-059',
    createdAt: '2026-11-10T08:30:00Z',
  },
];
let mySchedule: MyScheduleItem[] = [
  {
    id: 'ms-01',
    userId: 'user-mahasiswa-01',
    eventId: 'event-choir-vocs-service-in',
    notes: 'Pelayanan vokal kampus',
    addedAt: '2026-11-10T09:00:00Z',
  },
  {
    id: 'ms-02',
    userId: 'user-mahasiswa-01',
    eventId: 'event-worship-sabbath-20261114',
    notes: 'Ibadah Sabbath di Pioneer Chapel',
    addedAt: '2026-11-10T09:15:00Z',
  },
  {
    id: 'ms-03',
    userId: 'user-mahasiswa-01',
    eventId: 'event-dorm-study-time-20261116',
    notes: 'Belajar persiapan UAS',
    addedAt: '2026-11-10T09:30:00Z',
  },
];

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(categories);
});

// Organizations
app.get('/api/organizations', (_req: Request, res: Response) => {
  res.json(organizations);
});

// Choirs
app.get('/api/choirs', (_req: Request, res: Response) => {
  res.json(choirs);
});

// Dormitories
app.get('/api/dormitories', (_req: Request, res: Response) => {
  res.json(dormitories);
});

// Dormitory Activities
app.get('/api/dormitoryActivities', (_req: Request, res: Response) => {
  res.json(dormitoryActivities);
});

// Worship Schedules
app.get('/api/worshipSchedules', (_req: Request, res: Response) => {
  res.json(worshipSchedules);
});

// Audience Groups
app.get('/api/audienceGroups', (_req: Request, res: Response) => {
  res.json(audienceGroups);
});

// Events listing with filtering
app.get('/api/events', (req: Request, res: Response) => {
  const {
    status,
    categoryId,
    organizerId,
    targetAudience,
    search,
    dateFrom,
    dateTo,
    sourceType,
  } = req.query;

  let filtered = [...events];

  if (status) {
    filtered = filtered.filter(e => e.status === status);
  }

  if (categoryId) {
    const cats = Array.isArray(categoryId) ? categoryId : [categoryId as string];
    filtered = filtered.filter(e => cats.includes(e.categoryId));
  }

  if (organizerId) {
    filtered = filtered.filter(e => e.organizerId === organizerId);
  }

  if (sourceType) {
    filtered = filtered.filter(e => e.sourceType === sourceType);
  }

  if (targetAudience) {
    const aud = targetAudience as string;
    filtered = filtered.filter(e => e.targetAudience.includes(aud) || e.targetAudience.includes('all'));
  }

  if (dateFrom) {
    filtered = filtered.filter(e => e.date >= (dateFrom as string));
  }

  if (dateTo) {
    filtered = filtered.filter(e => e.date <= (dateTo as string));
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    filtered = filtered.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.organizerName.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Sort by date ascending
  filtered.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  res.json(filtered);
});

// Single event
app.get('/api/events/:id', (req: Request, res: Response) => {
  const ev = events.find(e => e.id === req.params.id);
  if (!ev) {
    return res.status(404).json({ error: 'Event tidak ditemukan' });
  }
  res.json(ev);
});

// Create event
app.post('/api/events', (req: Request, res: Response) => {
  const body = req.body;

  // Validation
  if (!body.title || !body.categoryId || !body.date || !body.startTime || !body.endTime || !body.location) {
    return res.status(400).json({ error: 'Mohon lengkapi semua field wajib' });
  }

  if (body.startTime >= body.endTime) {
    return res.status(400).json({ error: 'Waktu selesai harus lebih akhir dari waktu mulai' });
  }

  const isAcademic = body.sourceType === 'academic_calendar';
  const newStatus = isAcademic ? 'approved' : body.isAdminCreation ? 'approved' : 'pending';

  const newEvent: CampusEvent = {
    id: body.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: body.title.trim(),
    categoryId: body.categoryId,
    eventType: body.eventType || 'general',
    organizerId: body.organizerId || 'org-bem-unklab',
    organizerName: body.organizerName || 'Organisasi Kampus',
    description: body.description || '',
    date: body.date,
    endDate: body.endDate,
    startTime: body.startTime,
    endTime: body.endTime,
    location: body.location,
    locationScope: body.locationScope || 'inside_unklab',
    targetAudience: Array.isArray(body.targetAudience) && body.targetAudience.length > 0 ? body.targetAudience : ['mahasiswa'],
    tags: Array.isArray(body.tags) ? body.tags : ['kegiatan'],
    status: newStatus,
    sourceType: isAcademic ? 'academic_calendar' : 'organization_submission',
    isDummy: isAcademic ? false : true,
    posterUrl: body.posterUrl,
    externalLink: body.externalLink,
    reviewNote: body.reviewNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Update event (Approval / Edit)
app.patch('/api/events/:id', (req: Request, res: Response) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event tidak ditemukan' });
  }

  const existing = events[idx];
  const updates = req.body;

  // If status is being set to rejected, require reason if not already present
  if (updates.status === 'rejected' && !updates.rejectionReason && !existing.rejectionReason) {
    return res.status(400).json({ error: 'Alasan penolakan wajib diisi saat menolak kegiatan' });
  }

  const updated: CampusEvent = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  events[idx] = updated;
  res.json(updated);
});

// Delete event
app.delete('/api/events/:id', (req: Request, res: Response) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event tidak ditemukan' });
  }
  events.splice(idx, 1);
  res.json({ message: 'Event berhasil dihapus' });
});

// Auth / Users
app.get('/api/users', (_req: Request, res: Response) => {
  // Strip passwords
  const sanitized = users.map(({ password, ...rest }) => rest);
  res.json(sanitized);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi' });
  }

  // Validate domain @unklab.ac.id
  const emailRegex = /^[^\s@]+@([a-zA-Z0-9.-]+\.)?unklab\.ac\.id$/i;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: 'Email harus menggunakan domain resmi kampus UNKLAB (@unklab.ac.id atau @student.unklab.ac.id)',
    });
  }

  // Check matching user
  let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    // For demo purposes, if it's a valid unklab email, allow creating or logging in with selected role
    const assignedRole = role || 'mahasiswa';
    user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email: email.trim().toLowerCase(),
      password,
      role: assignedRole,
      faculty: 'Fakultas Ilmu Komputer',
      studyProgram: 'Informatika',
      interests: [],
      hobbies: [],
      preferredEventTypes: [],
      availableSlots: [],
      profileCompleted: false,
    };
    users.push(user);
  } else {
    // If user exists, enforce that selected role matches assigned account role
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Role akun tidak sesuai. Akun ${email} terdaftar sebagai '${user.role}', bukan '${role}'.`,
      });
    }
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update profile / onboarding preferences
app.post('/api/auth/profile', (req: Request, res: Response) => {
  const { userId, interests, hobbies, preferredEventTypes, availableSlots, faculty, studyProgram, name } = req.body;

  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  users[idx] = {
    ...users[idx],
    name: name || users[idx].name,
    interests: interests !== undefined ? interests : users[idx].interests,
    hobbies: hobbies !== undefined ? hobbies : users[idx].hobbies,
    preferredEventTypes: preferredEventTypes !== undefined ? preferredEventTypes : users[idx].preferredEventTypes,
    availableSlots: availableSlots !== undefined ? availableSlots : users[idx].availableSlots,
    faculty: faculty || users[idx].faculty,
    studyProgram: studyProgram || users[idx].studyProgram,
    profileCompleted: true,
  };

  const { password: _, ...userSafe } = users[idx];
  res.json({ user: userSafe });
});

// Bookmarks
app.get('/api/bookmarks', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json(bookmarks);
  }
  res.json(bookmarks.filter(b => b.userId === userId));
});

app.post('/api/bookmarks', (req: Request, res: Response) => {
  const { userId, eventId } = req.body;
  if (!userId || !eventId) {
    return res.status(400).json({ error: 'userId dan eventId wajib ada' });
  }

  const existing = bookmarks.find(b => b.userId === userId && b.eventId === eventId);
  if (existing) {
    return res.json(existing);
  }

  const newBookmark: Bookmark = {
    id: `bm-${Date.now()}`,
    userId,
    eventId,
    createdAt: new Date().toISOString(),
  };

  bookmarks.push(newBookmark);
  res.status(201).json(newBookmark);
});

app.delete('/api/bookmarks/:id', (req: Request, res: Response) => {
  const idx = bookmarks.findIndex(b => b.id === req.params.id || (b.eventId === req.params.id && b.userId === req.query.userId));
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
  }
  res.json({ message: 'Bookmark dihapus' });
});

// My Schedule
app.get('/api/mySchedule', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json(mySchedule);
  }
  res.json(mySchedule.filter(m => m.userId === userId));
});

app.post('/api/mySchedule', (req: Request, res: Response) => {
  const { userId, eventId, notes } = req.body;
  if (!userId || !eventId) {
    return res.status(400).json({ error: 'userId dan eventId wajib ada' });
  }

  const existing = mySchedule.find(m => m.userId === userId && m.eventId === eventId);
  if (existing) {
    return res.json(existing);
  }

  const newItem: MyScheduleItem = {
    id: `ms-${Date.now()}`,
    userId,
    eventId,
    notes,
    addedAt: new Date().toISOString(),
  };

  mySchedule.push(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/mySchedule/:id', (req: Request, res: Response) => {
  const idx = mySchedule.findIndex(m => m.id === req.params.id || (m.eventId === req.params.id && m.userId === req.query.userId));
  if (idx !== -1) {
    mySchedule.splice(idx, 1);
  }
  res.json({ message: 'Jadwal pribadi dihapus' });
});

// -------------------------------------------------------------
// AI CAMPUS ASSISTANT (Gemini gemini-3.8-flash on Server)
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { prompt, userRole, userInterests } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong' });
  }

  // Get only approved events and academic calendar
  const approvedEvents = events.filter(e => e.status === 'approved');

  // Build condensed context for Gemini
  const eventContext = approvedEvents.map(e => ({
    id: e.id,
    title: e.title,
    category: e.categoryId,
    date: e.date,
    endDate: e.endDate,
    time: `${e.startTime} - ${e.endTime}`,
    location: e.location,
    organizer: e.organizerName,
    description: e.description,
    isAcademic: e.sourceType === 'academic_calendar',
    tags: e.tags,
  }));

  const systemInstruction = `Kamu adalah UNKLAB Campus Assistant untuk sistem UNKLAB HUB di Universitas Klabat (Airmadidi, Manado).
Tugasmu adalah menjawab pertanyaan pengguna tentang kegiatan kampus, kalender akademik, ibadah asrama (Midweek, Vesper, Sabbath), organisasi, choir, seminar, dan acara lainnya.

ATURAN KETAT:
1. Jawab dalam Bahasa Indonesia yang ramah, sopan, dan jelas.
2. Gunakan HANYA informasi kegiatan kampus yang disediakan di konteks ini. Jangan mengarang kegiatan, tanggal, waktu, atau lokasi.
3. Zona waktu kampus adalah WITA (Asia/Makassar, UTC+8). Tanggal simulasi saat ini adalah Selasa, 10 November 2026.
4. Jika kegiatan yang diminta tidak ada dalam data, katakan secara jujur dan sopan bahwa informasi belum ditemukan atau belum tersedia.
5. Sebutkan ID kegiatan yang relevan di akhir jawaban dalam tag khusus: [REF_EVENTS: id1, id2] agar antarmuka dapat menampilkan kartu kegiatan tersebut.
6. Berikan informasi yang ringkas, terstruktur (gunakan bullet points jika menampilkan beberapa acara).
7. Jangan pernah mengklaim kamu dapat menyetujui pengajuan atau mengubah data sistem.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Smart fallback if API key is not configured
    const fallbackResponse = generateSmartFallbackAnswer(prompt, approvedEvents, userInterests);
    return res.json(fallbackResponse);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Pengguna (Role: ${userRole || 'mahasiswa'}): "${prompt}"\n\nKonteks Data Kegiatan UNKLAB HUB:\n${JSON.stringify(eventContext, null, 2)}`,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini.';

    // Extract referenced event IDs
    const refMatch = replyText.match(/\[REF_EVENTS:\s*([^\]]+)\]/);
    let referencedEventIds: string[] = [];
    let cleanText = replyText;

    if (refMatch) {
      referencedEventIds = refMatch[1]
        .split(',')
        .map(id => id.trim())
        .filter(id => approvedEvents.some(e => e.id === id));
      cleanText = replyText.replace(/\[REF_EVENTS:[^\]]+\]/, '').trim();
    } else {
      // Auto-detect mention of event titles
      const promptLower = prompt.toLowerCase();
      referencedEventIds = approvedEvents
        .filter(e => promptLower.includes(e.title.toLowerCase()) || cleanText.includes(e.title))
        .map(e => e.id)
        .slice(0, 3);
    }

    res.json({
      reply: cleanText,
      referencedEventIds,
    });
  } catch (err: any) {
    console.error('Gemini API call failed, using smart fallback:', err?.message || err);
    const fallback = generateSmartFallbackAnswer(prompt, approvedEvents, userInterests);
    res.json(fallback);
  }
});

function generateSmartFallbackAnswer(
  prompt: string,
  approvedEvents: CampusEvent[],
  userInterests?: string[]
): { reply: string; referencedEventIds: string[] } {
  const p = prompt.toLowerCase();

  if (p.includes('terdekat') || p.includes('minggu ini') || p.includes('hari ini') || p.includes('sekarang')) {
    const upcoming = approvedEvents
      .filter(e => e.date >= '2026-11-10')
      .slice(0, 4);

    const list = upcoming.map(e => `- **${e.title}** (${e.date}, ${e.startTime} - ${e.endTime} WITA di ${e.location})`).join('\n');
    return {
      reply: `Berikut adalah kegiatan terdekat di kampus UNKLAB:\n\n${list}\n\nAda yang ingin kamu ketahui lebih lanjut tentang acara di atas?`,
      referencedEventIds: upcoming.map(e => e.id),
    };
  }

  if (p.includes('choir') || p.includes('paduan suara') || p.includes('nyanyi')) {
    const choirEvents = approvedEvents.filter(e => e.categoryId === 'cat-choir' || e.tags.includes('choir'));
    const list = choirEvents.map(e => `- **${e.title}** oleh ${e.organizerName} pada tanggal ${e.date}`).join('\n');
    return {
      reply: `Berikut agenda kegiatan Choir UNKLAB yang terdaftar:\n\n${list}`,
      referencedEventIds: choirEvents.map(e => e.id),
    };
  }

  if (p.includes('sabbath') || p.includes('sabat') || p.includes('ibadah') || p.includes('vesper') || p.includes('midweek')) {
    const religiousEvents = approvedEvents.filter(e => e.categoryId === 'cat-religious').slice(0, 4);
    const list = religiousEvents.map(e => `- **${e.title}**: ${e.date} (${e.startTime} - ${e.endTime} WITA)`).join('\n');
    return {
      reply: `Jadwal ibadah rutin asrama dan kampus UNKLAB:\n- **Midweek**: Setiap Rabu (18:00 WITA)\n- **Vesper**: Setiap Jumat (18:00 WITA)\n- **Sabbath**: Setiap Sabtu (09:00 WITA, kecuali saat long weekend kalender akademik)\n\nJadwal terdekat:\n${list}`,
      referencedEventIds: religiousEvents.map(e => e.id),
    };
  }

  if (p.includes('organisasi') || p.includes('bem') || p.includes('cssa')) {
    const orgEvents = approvedEvents.filter(e => e.categoryId === 'cat-organization').slice(0, 4);
    const list = orgEvents.map(e => `- **${e.title}** (${e.organizerName}) - Setiap Kamis (${e.startTime} - ${e.endTime})`).join('\n');
    return {
      reply: `Sebagian besar organisasi kampus mengadakan meeting rutin pada hari Kamis sore. Berikut beberapa di antaranya:\n\n${list}`,
      referencedEventIds: orgEvents.map(e => e.id),
    };
  }

  if (p.includes('akademik') || p.includes('uas') || p.includes('uts') || p.includes('libur') || p.includes('skripsi')) {
    const acadEvents = approvedEvents.filter(e => e.sourceType === 'academic_calendar' && e.date >= '2026-11-01').slice(0, 5);
    const list = acadEvents.map(e => `- **${e.title}**: ${e.date}${e.endDate ? ' s/d ' + e.endDate : ''}`).join('\n');
    return {
      reply: `Agenda Kalender Akademik resmi UNKLAB untuk bulan November & Desember 2026:\n\n${list}`,
      referencedEventIds: acadEvents.map(e => e.id),
    };
  }

  // General search
  const matches = approvedEvents.filter(
    e => p.includes(e.title.toLowerCase()) || e.tags.some(t => p.includes(t)) || e.description.toLowerCase().includes(p)
  ).slice(0, 3);

  if (matches.length > 0) {
    const list = matches.map(e => `- **${e.title}**: ${e.date} (${e.startTime} - ${e.endTime} WITA)`).join('\n');
    return {
      reply: `Saya menemukan beberapa kegiatan terkait:\n\n${list}\n\nSilakan klik kartu kegiatan untuk melihat detail lengkapnya!`,
      referencedEventIds: matches.map(e => e.id),
    };
  }

  return {
    reply: `Informasi untuk "${prompt}" belum ditemukan di jadwal kegiatan UNKLAB HUB saat ini. Kamu dapat mencoba mencari berdasarkan kategori (Kalender Akademik, Organisasi, Choir, Asrama, atau Ibadah) melalui menu Kalender atau Jelajahi Acara.`,
    referencedEventIds: [],
  };
}

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[UNKLAB HUB] Server running at http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
