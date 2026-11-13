export type UserRole = 'mahasiswa' | 'dosen_staff' | 'organisasi' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  faculty?: string;
  studyProgram?: string;
  organizationId?: string;
  interests?: string[];
  hobbies?: string[];
  preferredEventTypes?: string[];
  availableSlots?: string[];
  profileCompleted: boolean;
}

export type EventStatus = 'approved' | 'pending' | 'rejected' | 'cancelled';
export type EventSourceType = 'demo_seed' | 'academic_calendar' | 'organization_submission';

export interface CampusEvent {
  id: string;
  title: string;
  categoryId: string;
  eventType?: string;
  organizerId?: string;
  organizerName: string;
  description: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // For multi-day academic calendar items
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  locationScope?: string;
  targetAudience: string[];
  tags: string[];
  status: EventStatus;
  sourceType: EventSourceType;
  facultyId?: string; // Optional affiliation: 'fakultas-ekonomi', 'fakultas-ilmu-komputer', 'fakultas-keperawatan', etc.
  isDummy: boolean;
  recurrenceGroupId?: string;
  recurrenceLabel?: string;
  approvedBy?: string;
  reviewNote?: string;
  rejectionReason?: string;
  activityId?: string;
  activityName?: string;
  dormitoryIds?: string[];
  worshipScheduleId?: string;
  skipIfLongWeekend?: boolean;
  longWeekendCheckSource?: string;
  longWeekendCheckStatus?: string;
  isLongWeekendConflict?: boolean;
  posterUrl?: string;
  externalLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgSoft: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  colorToken: string;
}

export interface RoutineSchedule {
  frequency: string;
  dayOfWeek: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  location: string;
  scheduleStatus: string;
  isConfirmed: boolean;
  note: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  categoryId: string;
  routineSchedule: RoutineSchedule | null;
  scheduleNote: string;
  isDummy: boolean;
  sourceNote?: string;
}

export interface Choir {
  id: string;
  name: string;
  shortName: string;
  affiliation: string;
  categoryId: string;
  commonEventTypes: string[];
  schedulePattern: any;
  scheduleNote: string;
  isDummy: boolean;
}

export interface Dormitory {
  id: string;
  name: string;
  isReferenceData: boolean;
  sourceNote: string;
}

export interface DormitoryActivity {
  id: string;
  name: string;
  shortName: string;
  categoryId: string;
  schedulePattern: {
    frequency: string;
    daysOfWeek: string[];
    dayLabels: string[];
    patternStatus: string;
    isConfirmed: boolean;
    note: string;
  };
  applicableDormitoryIds: string[];
  isDummy: boolean;
}

export interface WorshipSchedule {
  id: string;
  name: string;
  categoryId: string;
  schedulePattern: {
    frequency: string;
    dayOfWeek: string;
    dayLabel: string;
  };
  targetAudience: string[];
  targetAudienceLabel: string;
  applicableDormitoryIds: string[];
  timeStatus: string;
  locationStatus: string;
  isDummy: boolean;
  skipIfLongWeekend?: boolean;
  longWeekendCheckSource?: string;
  longWeekendCheckStatus?: string;
  note: string;
}

export interface AudienceGroup {
  id: string;
  label: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface MyScheduleItem {
  id: string;
  userId: string;
  eventId: string;
  notes?: string;
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedEventIds?: string[];
  isThinking?: boolean;
}
