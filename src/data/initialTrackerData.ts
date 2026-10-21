import { TestCase, TestStatus } from '../types';

// The in-scope calendar milestone dates (05-Oct to 12-Oct; 13-Oct through 17-Oct excluded as out of scope)
export const CALENDAR_DAYS = [
  { date: '05-Oct-26', day: 'Day 1', weekday: 'Monday', phase: 'Coordination & readiness (no test cases)', planned: 0 },
  { date: '06-Oct-26', day: 'Day 2', weekday: 'Tuesday', phase: 'Week 1 – TAPP↔TAPP', planned: 22 },
  { date: '07-Oct-26', day: 'Day 3', weekday: 'Wednesday', phase: 'Week 1 – TAPP↔TAPP', planned: 21 },
  { date: '08-Oct-26', day: 'Day 4', weekday: 'Thursday', phase: 'Week 1 – TAPP↔TAPP', planned: 17 },
  { date: '09-Oct-26', day: 'Day 5', weekday: 'Friday', phase: 'Week 1 – TAPP↔TAPP', planned: 11 },
  { date: '10-Oct-26', day: 'Day 6', weekday: 'Saturday', phase: 'Week 1 – TAPP↔TAPP', planned: 7 },
  { date: '11-Oct-26', day: '—', weekday: 'Sunday', phase: 'Weekly off', planned: 0 },
  { date: '12-Oct-26', day: 'Day 1', weekday: 'Monday', phase: 'Week 2 – TAPP↔CCE', planned: 15 }
];

export function generateInitialTestCases(): TestCase[] {
  const cases: TestCase[] = [];

  interface DayAllocation {
    date: string;
    dayLabel: string;
    phase: 'Week 1 – TAPP↔TAPP' | 'Week 2 – TAPP↔CCE';
    payerCount: number;
    payerOtherPass: number;
    payerOtherBlocked: number;
    payerOurPass: number;
    payeeCount: number;
    payeeOtherPass: number;
    payeeOtherBlocked: number;
    payeeOurPass: number;
  }

  // Exact in-scope allocations from the official tracker sheets:
  // Week 1 (TAPP↔TAPP): 78 cases (71 Payer PSP, 7 Payee PSP)
  // Week 2 (TAPP↔CCE, 12-Oct only): 15 cases (14 Payer PSP, 1 Payee PSP)
  // Total in-scope denominator = 93 cases
  // Other Account Providers: 85 Passed, 5 Blocked, 3 Pending
  // Our Account Provider: 23 Passed, 0 Blocked, 70 Pending
  const allocations: DayAllocation[] = [
    // Week 1 (TAPP↔TAPP): 78 cases
    {
      date: '06-Oct-26',
      dayLabel: 'Day 2 (Tue)',
      phase: 'Week 1 – TAPP↔TAPP',
      payerCount: 20,
      payerOtherPass: 18,
      payerOtherBlocked: 2,
      payerOurPass: 10,
      payeeCount: 2,
      payeeOtherPass: 2,
      payeeOtherBlocked: 0,
      payeeOurPass: 2
    },
    {
      date: '07-Oct-26',
      dayLabel: 'Day 3 (Wed)',
      phase: 'Week 1 – TAPP↔TAPP',
      payerCount: 19,
      payerOtherPass: 18,
      payerOtherBlocked: 1,
      payerOurPass: 7,
      payeeCount: 2,
      payeeOtherPass: 2,
      payeeOtherBlocked: 0,
      payeeOurPass: 1
    },
    {
      date: '08-Oct-26',
      dayLabel: 'Day 4 (Thu)',
      phase: 'Week 1 – TAPP↔TAPP',
      payerCount: 15,
      payerOtherPass: 14,
      payerOtherBlocked: 1,
      payerOurPass: 3,
      payeeCount: 2,
      payeeOtherPass: 1,
      payeeOtherBlocked: 1,
      payeeOurPass: 0
    },
    {
      date: '09-Oct-26',
      dayLabel: 'Day 5 (Fri)',
      phase: 'Week 1 – TAPP↔TAPP',
      payerCount: 10,
      payerOtherPass: 9,
      payerOtherBlocked: 0,
      payerOurPass: 0,
      payeeCount: 1,
      payeeOtherPass: 1,
      payeeOtherBlocked: 0,
      payeeOurPass: 0
    },
    {
      date: '10-Oct-26',
      dayLabel: 'Day 6 (Sat)',
      phase: 'Week 1 – TAPP↔TAPP',
      payerCount: 7,
      payerOtherPass: 7,
      payerOtherBlocked: 0,
      payerOurPass: 0,
      payeeCount: 0,
      payeeOtherPass: 0,
      payeeOtherBlocked: 0,
      payeeOurPass: 0
    },

    // Week 2 (TAPP↔CCE): 15 cases (12-Oct only)
    {
      date: '12-Oct-26',
      dayLabel: 'Day 1 (Mon)',
      phase: 'Week 2 – TAPP↔CCE',
      payerCount: 14,
      payerOtherPass: 13,
      payerOtherBlocked: 0,
      payerOurPass: 0,
      payeeCount: 1,
      payeeOtherPass: 0,
      payeeOtherBlocked: 0,
      payeeOurPass: 0
    }
  ];

  // Test IDs start from MT_32 per the actual Excel source sheet specification
  let testIndex = 32;

  for (const alloc of allocations) {
    // Payer PSP Cases
    for (let i = 0; i < alloc.payerCount; i++) {
      let otherStatus: TestStatus = 'Pending';
      let blockedReason: string | undefined = undefined;

      if (i < alloc.payerOtherPass) {
        otherStatus = 'Pass';
      } else if (i < alloc.payerOtherPass + alloc.payerOtherBlocked) {
        otherStatus = 'Blocked';
        blockedReason = 'Blocked per daily tracker sheet';
      } else {
        otherStatus = 'Pending';
      }

      let ourStatus: TestStatus = 'Pending';
      if (i < alloc.payerOurPass) {
        ourStatus = 'Pass';
      } else {
        ourStatus = 'Pending';
      }

      const testId = `MT_${testIndex}`;

      cases.push({
        id: testId,
        code: testId,
        title: testId,
        description: `${alloc.phase} · Payer PSP · ${alloc.date}`,
        role: 'Payer PSP',
        phase: alloc.phase,
        scheduledDate: alloc.date,
        dayLabel: alloc.dayLabel,
        otherAccountProviderStatus: otherStatus,
        ourAccountProviderStatus: ourStatus,
        blockedReason,
        lastUpdated: 'Oct 2026'
      });

      testIndex++;
    }

    // Payee PSP Cases
    for (let j = 0; j < alloc.payeeCount; j++) {
      let otherStatus: TestStatus = 'Pending';
      let blockedReason: string | undefined = undefined;

      if (j < alloc.payeeOtherPass) {
        otherStatus = 'Pass';
      } else if (j < alloc.payeeOtherPass + alloc.payeeOtherBlocked) {
        otherStatus = 'Blocked';
        blockedReason = 'Blocked per daily tracker sheet';
      } else {
        otherStatus = 'Pending';
      }

      let ourStatus: TestStatus = 'Pending';
      if (j < alloc.payeeOurPass) {
        ourStatus = 'Pass';
      } else {
        ourStatus = 'Pending';
      }

      const testId = `MT_${testIndex}`;

      cases.push({
        id: testId,
        code: testId,
        title: testId,
        description: `${alloc.phase} · Payee PSP · ${alloc.date}`,
        role: 'Payee PSP',
        phase: alloc.phase,
        scheduledDate: alloc.date,
        dayLabel: alloc.dayLabel,
        otherAccountProviderStatus: otherStatus,
        ourAccountProviderStatus: ourStatus,
        blockedReason,
        lastUpdated: 'Oct 2026'
      });

      testIndex++;
    }
  }

  return cases;
}
