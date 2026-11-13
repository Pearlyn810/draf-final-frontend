/**
 * Date and Time utilities for UNKLAB HUB.
 * Timezone: Asia/Makassar (WITA, UTC+8).
 */

export const SIMULATED_CURRENT_TIME = '2026-11-10T16:00:00+08:00'; // Tuesday Nov 10, 2026 16:00 WITA

export function getCurrentDateStr(): string {
  return '2026-11-10';
}

export function getCurrentTimeStr(): string {
  return '16:00';
}

export type EventLiveStatus = 'ongoing' | 'upcoming' | 'past';

export function getEventLiveStatus(
  date: string,
  startTime: string,
  endTime: string,
  currentDate = getCurrentDateStr(),
  currentTime = getCurrentTimeStr()
): EventLiveStatus {
  if (date < currentDate) {
    return 'past';
  }
  if (date > currentDate) {
    return 'upcoming';
  }

  // Same date: check time
  if (currentTime < startTime) {
    return 'upcoming';
  } else if (currentTime >= startTime && currentTime <= endTime) {
    return 'ongoing';
  } else {
    return 'past';
  }
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = dayNames[dateObj.getDay()];
  const monthName = monthNames[dateObj.getMonth()];

  return `${dayName}, ${parseInt(day, 10)} ${monthName} ${year}`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${monthNames[mIndex] || month}`;
}
