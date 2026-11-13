import test from 'node:test';
import assert from 'node:assert/strict';
import { hasTimeOverlap, detectScheduleConflicts } from './scheduleConflict.ts';
import { checkDateAgainstLongWeekend } from './longWeekendCheck.ts';
import { calculateEventRecommendation, getRankedRecommendations } from './recommendationEngine.ts';
import { getEventLiveStatus } from './dateTime.ts';
import { CampusEvent, User } from '../types/index.ts';

test('hasTimeOverlap: detects true overlap', () => {
  const eventA = { date: '2026-11-12', startTime: '16:00', endTime: '17:30' };
  const eventB = { date: '2026-11-12', startTime: '17:00', endTime: '18:00' };
  assert.equal(hasTimeOverlap(eventA, eventB), true);
});

test('hasTimeOverlap: boundary touching events do NOT conflict', () => {
  const eventA = { date: '2026-11-12', startTime: '16:00', endTime: '17:00' };
  const eventB = { date: '2026-11-12', startTime: '17:00', endTime: '18:00' };
  assert.equal(hasTimeOverlap(eventA, eventB), false);
});

test('hasTimeOverlap: different dates do NOT conflict', () => {
  const eventA = { date: '2026-11-12', startTime: '16:00', endTime: '17:30' };
  const eventB = { date: '2026-11-13', startTime: '16:30', endTime: '17:30' };
  assert.equal(hasTimeOverlap(eventA, eventB), false);
});

test('detectScheduleConflicts: correctly flags conflicting pair', () => {
  const list = [
    { id: 'ev-1', date: '2026-11-12', startTime: '16:00', endTime: '17:30' },
    { id: 'ev-2', date: '2026-11-12', startTime: '17:00', endTime: '18:00' },
    { id: 'ev-3', date: '2026-11-12', startTime: '18:30', endTime: '19:30' },
  ];
  const res = detectScheduleConflicts(list);
  assert.equal(res.hasConflict, true);
  assert.deepEqual(res.conflictingEventIds.sort(), ['ev-1', 'ev-2']);
  assert.equal(res.conflictPairs.length, 1);
});

test('checkDateAgainstLongWeekend: flags official UNKLAB 2026 long weekends', () => {
  // Jan 17, 2026 falls within Jan 16-18
  const resJan = checkDateAgainstLongWeekend('2026-01-17');
  assert.equal(resJan.isLongWeekend, true);
  assert.match(resJan.statusText, /Isra Mikraj/);

  // April 4, 2026 falls within April 3-5
  const resApr = checkDateAgainstLongWeekend('2026-04-04');
  assert.equal(resApr.isLongWeekend, true);

  // Aug 15, 2026 falls within Aug 15-17
  const resAug = checkDateAgainstLongWeekend('2026-08-15');
  assert.equal(resAug.isLongWeekend, true);

  // Nov 14, 2026 is NOT a long weekend
  const resNov = checkDateAgainstLongWeekend('2026-11-14');
  assert.equal(resNov.isLongWeekend, false);
});

test('recommendationEngine: boosts matching events and excludes pending', () => {
  const dummyUser: User = {
    id: 'u-1',
    name: 'Test Student',
    email: 'test@unklab.ac.id',
    role: 'mahasiswa',
    faculty: 'Fakultas Ilmu Komputer',
    interests: ['teknologi', 'musik'],
    hobbies: ['coding'],
    preferredEventTypes: ['workshop', 'choir'],
    availableSlots: ['weekday-afternoon'],
    profileCompleted: true
  };

  const techEvent: CampusEvent = {
    id: 'tech-1',
    title: 'CSSA Workshop Coding & AI',
    categoryId: 'cat-seminar',
    eventType: 'workshop',
    organizerName: 'CSSA',
    description: 'Workshop coding teknologi terkini untuk mahasiswa',
    date: '2026-11-12',
    startTime: '16:00',
    endTime: '17:30',
    location: 'GK1',
    targetAudience: ['mahasiswa'],
    tags: ['teknologi', 'coding', 'workshop'],
    status: 'approved',
    sourceType: 'demo_seed',
    isDummy: true
  };

  const pendingEvent: CampusEvent = {
    ...techEvent,
    id: 'pending-1',
    status: 'pending'
  };

  const recTech = calculateEventRecommendation(techEvent, dummyUser);
  assert.ok(recTech.score >= 50, `Expected score >= 50, got ${recTech.score}`);
  assert.ok(recTech.reasons.some(r => r.includes('Teknologi')));

  const recPending = calculateEventRecommendation(pendingEvent, dummyUser);
  assert.equal(recPending.score, 0);

  const ranked = getRankedRecommendations([techEvent, pendingEvent], dummyUser);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].event.id, 'tech-1');
});

test('getEventLiveStatus: calculates ongoing, upcoming, past', () => {
  const curDate = '2026-11-10';
  const curTime = '16:30';

  // Event today 16:00 - 17:00 is ongoing
  assert.equal(getEventLiveStatus('2026-11-10', '16:00', '17:00', curDate, curTime), 'ongoing');

  // Event today 18:00 - 19:00 is upcoming
  assert.equal(getEventLiveStatus('2026-11-10', '18:00', '19:00', curDate, curTime), 'upcoming');

  // Event today 14:00 - 15:00 is past
  assert.equal(getEventLiveStatus('2026-11-10', '14:00', '15:00', curDate, curTime), 'past');

  // Event tomorrow is upcoming
  assert.equal(getEventLiveStatus('2026-11-11', '09:00', '10:00', curDate, curTime), 'upcoming');

  // Event yesterday is past
  assert.equal(getEventLiveStatus('2026-11-09', '09:00', '10:00', curDate, curTime), 'past');
});

test('facultyAffiliation: correctly classifies organizations & choirs into UNKLAB faculties', async () => {
  const { getEventFaculty, isEventAffiliatedWithFaculty } = await import('../data/faculties.ts');

  // 1. Economics (UBS, TUFC)
  const ubsEvent: any = { title: 'BEM UBS Business Plan', organizerName: 'BEM UBS', tags: ['bisnis'], description: 'UBS event' };
  assert.equal(getEventFaculty(ubsEvent).id, 'fakultas-ekonomi');
  assert.equal(isEventAffiliatedWithFaculty(ubsEvent, 'fakultas-ekonomi'), true);

  const tufcEvent: any = { title: 'TUFC Homecoming', organizerName: 'TUFC (The Unklab FEB Choir)', tags: ['choir'], description: 'FEB choir' };
  assert.equal(getEventFaculty(tufcEvent).id, 'fakultas-ekonomi');

  // 2. Computer Science (CSSA, UVICS, VOC Choir)
  const cssaEvent: any = { title: 'CSSA Coding Night', organizerName: 'CSSA', tags: ['komputer'], description: 'Coding event' };
  assert.equal(getEventFaculty(cssaEvent).id, 'fakultas-ilmu-komputer');

  const uvicsEvent: any = { title: 'UVICS Cloud Workshop', organizerName: 'UVICS', tags: ['ai'], description: 'UVICS event' };
  assert.equal(getEventFaculty(uvicsEvent).id, 'fakultas-ilmu-komputer');

  const vocEvent: any = { title: 'VOCS choir unklab Pelayanan', organizerName: 'VOCS choir unklab', tags: ['choir'], description: 'VOC choir' };
  assert.equal(getEventFaculty(vocEvent).id, 'fakultas-ilmu-komputer');

  // 3. Nursing (Keperawatan, Nursing Choir)
  const nursingEvent: any = { title: 'The Unklab Nursing Choir Anniversary', organizerName: 'The Unklab Nursing Choir', tags: ['keperawatan'], description: 'Nursing choir' };
  assert.equal(getEventFaculty(nursingEvent).id, 'fakultas-keperawatan');
});

