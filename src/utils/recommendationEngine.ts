import { CampusEvent, User } from '../types/index.ts';

export interface EventRecommendation {
  event: CampusEvent;
  score: number;
  reasons: string[];
}

/**
 * Calculates a recommendation score for an event based on user profile.
 * PRD Section 3.3:
 * 1. Match category & tags with user interests
 * 2. Match description/tags with user hobbies
 * 3. Match preferredEventTypes with eventType or category
 * 4. Target audience relevance (faculty/study program or general mahasiswa)
 * 5. Available time slots matching
 * 6. Filters out non-approved or cancelled events
 */
export function calculateEventRecommendation(
  event: CampusEvent,
  user: User | null
): EventRecommendation {
  if (event.status !== 'approved') {
    return { event, score: 0, reasons: [] };
  }

  if (!user) {
    return {
      event,
      score: 10,
      reasons: ['Kegiatan terdekat yang disetujui di kampus UNKLAB']
    };
  }

  let score = 0;
  const reasons: string[] = [];

  const userInterests = (user.interests || []).map(i => i.toLowerCase());
  const userHobbies = (user.hobbies || []).map(h => h.toLowerCase());
  const userPreferredTypes = (user.preferredEventTypes || []).map(p => p.toLowerCase());
  const userSlots = (user.availableSlots || []).map(s => s.toLowerCase());

  const eventTags = (event.tags || []).map(t => t.toLowerCase());
  const eventTitleLower = event.title.toLowerCase();
  const eventDescLower = event.description.toLowerCase();
  const eventTypeLower = (event.eventType || '').toLowerCase();
  const categoryIdLower = event.categoryId.toLowerCase();

  // 1. Interest matching (+30 pts per match)
  for (const interest of userInterests) {
    if (
      eventTags.includes(interest) ||
      eventTitleLower.includes(interest) ||
      eventDescLower.includes(interest) ||
      categoryIdLower.includes(interest)
    ) {
      score += 30;
      reasons.push(`Sesuai dengan minat kamu (${capitalize(interest)})`);
      break;
    }
  }

  // 2. Hobby matching (+25 pts per match)
  for (const hobby of userHobbies) {
    if (
      eventTags.some(t => t.includes(hobby) || hobby.includes(t)) ||
      eventTitleLower.includes(hobby) ||
      eventDescLower.includes(hobby)
    ) {
      score += 25;
      reasons.push(`Cocok dengan hobi kamu (${capitalize(hobby)})`);
      break;
    }
  }

  // 3. Preferred event type matching (+20 pts)
  for (const pref of userPreferredTypes) {
    if (
      eventTypeLower.includes(pref) ||
      categoryIdLower.includes(pref) ||
      eventTags.includes(pref)
    ) {
      score += 20;
      reasons.push(`Format kegiatan yang kamu sukai (${capitalize(pref)})`);
      break;
    }
  }

  // 4. Target audience matching (+15 pts)
  const userRole = user.role;
  if (event.targetAudience.includes(userRole)) {
    score += 15;
  }
  if (user.faculty && (eventDescLower.includes(user.faculty.toLowerCase()) || eventTags.includes(user.faculty.toLowerCase()))) {
    score += 20;
    reasons.push(`Relevan dengan ${user.faculty}`);
  }

  // 5. Time slot preference matching (+15 pts)
  const eventDateObj = new Date(event.date);
  const dayIndex = eventDateObj.getDay(); // 0 is Sunday, 4 is Thursday, 6 is Saturday
  const startHour = parseInt(event.startTime.split(':')[0], 10) || 0;

  for (const slot of userSlots) {
    if (slot.includes('weekend') && (dayIndex === 0 || dayIndex === 6)) {
      score += 15;
      reasons.push('Berlangsung pada waktu akhir pekan pilihanmu');
      break;
    } else if (slot.includes('sabbath') && dayIndex === 6) {
      score += 15;
      reasons.push('Bertepatan dengan hari Sabbath');
      break;
    } else if (slot.includes('afternoon') && startHour >= 15) {
      score += 15;
      reasons.push('Cocok dengan waktu luang sore hari');
      break;
    } else if (slot.includes('morning') && startHour < 12) {
      score += 15;
      reasons.push('Sesuai dengan waktu pagi hari');
      break;
    }
  }

  if (reasons.length === 0) {
    reasons.push('Kegiatan kampus rekomendasi umum');
  }

  return { event, score, reasons };
}

export function getRankedRecommendations(
  events: CampusEvent[],
  user: User | null,
  limit = 6
): EventRecommendation[] {
  const scored = events
    .filter(e => e.status === 'approved')
    .map(event => calculateEventRecommendation(event, user));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Closer upcoming date gets priority
    return a.event.date.localeCompare(b.event.date);
  });

  return scored.slice(0, limit);
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
