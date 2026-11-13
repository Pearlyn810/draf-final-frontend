export interface TimeInterval {
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

/**
 * Checks if two events on the same date have overlapping times.
 * Rule per PRD Section 4.6:
 * startA < endB AND startB < endA
 * Touching boundaries (e.g. 10:00-11:00 and 11:00-12:00) do NOT overlap.
 */
export function hasTimeOverlap(
  eventA: TimeInterval,
  eventB: TimeInterval
): boolean {
  if (eventA.date !== eventB.date) {
    return false;
  }

  const startA = timeToMinutes(eventA.startTime);
  const endA = timeToMinutes(eventA.endTime);
  const startB = timeToMinutes(eventB.startTime);
  const endB = timeToMinutes(eventB.endTime);

  if (startA >= endA || startB >= endB) {
    return false;
  }

  return startA < endB && startB < endA;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingEventIds: string[];
  conflictPairs: Array<{ eventAId: string; eventBId: string; date: string }>;
}

export function detectScheduleConflicts(
  events: Array<{ id: string; date: string; startTime: string; endTime: string }>
): ConflictResult {
  const conflictingEventIds = new Set<string>();
  const conflictPairs: Array<{ eventAId: string; eventBId: string; date: string }> = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (hasTimeOverlap(a, b)) {
        conflictingEventIds.add(a.id);
        conflictingEventIds.add(b.id);
        conflictPairs.push({
          eventAId: a.id,
          eventBId: b.id,
          date: a.date,
        });
      }
    }
  }

  return {
    hasConflict: conflictingEventIds.size > 0,
    conflictingEventIds: Array.from(conflictingEventIds),
    conflictPairs,
  };
}
