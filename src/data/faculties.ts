import { Faculty, CampusEvent } from '../types/index.ts';

export const UNKLAB_FACULTIES: Faculty[] = [
  {
    id: 'fakultas-ekonomi',
    name: 'Fakultas Ekonomi dan Bisnis',
    shortName: 'Fakultas Ekonomi (UBS, TUFC)',
    color: '#D97706',
    bgSoft: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
  },
  {
    id: 'fakultas-ilmu-komputer',
    name: 'Fakultas Ilmu Komputer',
    shortName: 'Fakultas Ilmu Komputer (CSSA, UVICS, VOC)',
    color: '#0D9488',
    bgSoft: '#F0FDFA',
    borderColor: '#99F6E4',
    textColor: '#0F766E',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800 border-teal-200',
  },
  {
    id: 'fakultas-keperawatan',
    name: 'Fakultas Keperawatan',
    shortName: 'Fakultas Keperawatan (Nursing Choir)',
    color: '#E11D48',
    bgSoft: '#FFF1F2',
    borderColor: '#FECDD3',
    textColor: '#BE123C',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800 border-rose-200',
  },
  {
    id: 'fakultas-ilmu-pendidikan',
    name: 'Fakultas Ilmu Pendidikan',
    shortName: 'Fakultas Ilmu Pendidikan (FIP)',
    color: '#6366F1',
    bgSoft: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#4338CA',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800 border-indigo-200',
  },
  {
    id: 'fakultas-filsafat',
    name: 'Fakultas Filsafat',
    shortName: 'Fakultas Filsafat',
    color: '#8B5CF6',
    bgSoft: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800 border-purple-200',
  },
  {
    id: 'fakultas-pertanian',
    name: 'Fakultas Pertanian',
    shortName: 'Fakultas Pertanian',
    color: '#15803D',
    bgSoft: '#F0FDF4',
    borderColor: '#BBF7D0',
    textColor: '#166534',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
  },
  {
    id: 'fakultas-teknik',
    name: 'Fakultas Teknik',
    shortName: 'Fakultas Teknik',
    color: '#0284C7',
    bgSoft: '#F0F9FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800 border-sky-200',
  },
  {
    id: 'fakultas-kedokteran',
    name: 'Fakultas Kedokteran',
    shortName: 'Fakultas Kedokteran',
    color: '#DC2626',
    bgSoft: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#B91C1C',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800 border-red-200',
  },
  {
    id: 'universitas',
    name: 'Universitas & BEM UNKLAB',
    shortName: 'Universitas (Umum)',
    color: '#1B4D36',
    bgSoft: '#EDF6F1',
    borderColor: '#D5E5DC',
    textColor: '#1B4D36',
    badgeBg: 'bg-[#EDF6F1]',
    badgeText: 'text-[#1B4D36] border-[#D5E5DC]',
  },
];

/**
 * Determines which faculty an event belongs to based on facultyId,
 * organizer, title, tags, or choir affiliation.
 */
export function getEventFaculty(event: CampusEvent): Faculty {
  if (event.facultyId) {
    const found = UNKLAB_FACULTIES.find(f => f.id === event.facultyId);
    if (found) return found;
  }

  const str = `${event.title} ${event.organizerName} ${event.organizerId || ''} ${event.tags.join(' ')} ${event.description}`.toLowerCase();

  // 1. Computer Science (CSSA, UVICS, VOC Choir, FIK, Informatika, Sistem Informasi)
  if (
    str.includes('cssa') ||
    str.includes('uvics') ||
    str.includes('voc choir') ||
    str.includes('vocs') ||
    str.includes('komputer') ||
    str.includes('informatika') ||
    str.includes('sistem informasi') ||
    str.includes('cyber security') ||
    str.includes('tech talk') ||
    str.includes('coding')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-ilmu-komputer')!;
  }

  // 2. Economics (UBS, TUFC, FEB, Manajemen, Akuntansi)
  if (
    str.includes('ubs') ||
    str.includes('tufc') ||
    str.includes('ekonomi') ||
    str.includes('bisnis') ||
    str.includes('manajemen') ||
    str.includes('akuntansi') ||
    str.includes('genbi')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-ekonomi')!;
  }

  // 3. Nursing (Keperawatan, Ners, Nursing Choir)
  if (
    str.includes('nursing') ||
    str.includes('keperawatan') ||
    str.includes('ners')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-keperawatan')!;
  }

  // 4. Education (FIP, Pendidikan, Keguruan)
  if (
    str.includes('fip') ||
    str.includes('ilmu pendidikan') ||
    str.includes('keguruan') ||
    str.includes('pedagogi')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-ilmu-pendidikan')!;
  }

  // 5. Philosophy / Theology (Filsafat, Teologi)
  if (
    str.includes('filsafat') ||
    str.includes('teologi') ||
    str.includes('pastoral')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-filsafat')!;
  }

  // 6. Agriculture (Pertanian, Agribisnis)
  if (
    str.includes('pertanian') ||
    str.includes('agribisnis') ||
    str.includes('agroteknologi')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-pertanian')!;
  }

  // 7. Engineering (Teknik, Arsitektur, Sipil, Elektro)
  if (
    str.includes('teknik') ||
    str.includes('engineering') ||
    str.includes('elektro') ||
    str.includes('sipil')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-teknik')!;
  }

  // 8. Medicine (Kedokteran, Medis, Dokter)
  if (
    str.includes('kedokteran') ||
    str.includes('medis') ||
    str.includes('dokter')
  ) {
    return UNKLAB_FACULTIES.find(f => f.id === 'fakultas-kedokteran')!;
  }

  // Default: Universitas / BEM UNKLAB / Umum
  return UNKLAB_FACULTIES.find(f => f.id === 'universitas')!;
}

/**
 * Checks if an event is affiliated with a specific faculty
 */
export function isEventAffiliatedWithFaculty(event: CampusEvent, facultyId: string): boolean {
  if (facultyId === 'all') return true;
  const faculty = getEventFaculty(event);
  return faculty.id === facultyId;
}
