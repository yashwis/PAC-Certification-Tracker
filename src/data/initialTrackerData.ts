import { TestCase, DailyProgressRecord, ScopeByRoleRecord, TestStatus } from '../types';

// The in-scope calendar milestone dates (05-Oct to 12-Oct; 13-Oct through 17-Oct removed as out of scope)
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

  const BCRP_SCENARIOS = [
    { title: 'Immediate P2P Direct Transfer (TAPP)', desc: 'Direct debtor account debit and instant creditor credit under 1.5s' },
    { title: 'QR Code Dynamic Settlement (EMVCo)', desc: 'Interoperable QR merchant payment with dynamic amount verification' },
    { title: 'Account Verification Request (API 200)', desc: 'Pre-flight verification of recipient CCI and account holder title' },
    { title: 'Reversal on Switch Timeout (Auto Reversal)', desc: 'Debtor refund trigger when BCRP central switch fails to acknowledge' },
    { title: 'Duplicate Transfer Idempotency Guard', desc: 'Idempotency key enforcement preventing double payment submission' },
    { title: 'Insufficient Funds Graceful Decline (AC01)', desc: 'Account balance check returning standard BCRP error code AC01' },
    { title: 'Payee PSP Temporary Unavailability (AGNT)', desc: 'Graceful retry queue dispatch when receiving participant gateway 503' },
    { title: 'Batch CCE Settlement File Submission', desc: 'End-of-cycle ISO 20022 pacs.008 payment clearing file to CCE' },
    { title: 'CCE Settlement Confirmation Processing', desc: 'Parsing incoming pacs.002 settlement confirmation notifications' },
    { title: 'High-Value Real-Time Interbank Clearing', desc: 'Transfers exceeding S/ 5,000 threshold with 2FA authorization token' },
    { title: 'Payee CCI Inactive Account Rejection', desc: 'Validation against Central Bank active registry returning code AM04' },
    { title: 'Digital Signature & HSM Key Rotation Check', desc: 'mTLS payload signature validation using BCRP test certificates' }
  ];

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

  // Exact in-scope allocations (Oct 5 to Oct 12) = 93 cases total:
  // Week 1: 78 cases (71 Payer, 7 Payee)
  // Week 2: 15 cases (14 Payer, 1 Payee on 12-Oct)
  // Other Account Providers: 85 Passed, 5 Blocked, 3 Pending = 93 total
  // Our Account Provider: 23 Passed, 0 Blocked, 70 Pending = 93 total
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

  const BLOCKED_REASONS = [
    'Legacy participant HSM key derivation mismatch on payload signing',
    'CCE clearing endpoint timeout after 3000ms threshold',
    'Participant routing table out of sync for BIN 4218XX',
    'Inconsistent idempotent callback sequence from Other Account Provider',
    'Participant mTLS certificate expired on gateway test node'
  ];

  let testIndex = 1;
  let blockedIdx = 0;

  for (const alloc of allocations) {
    // Payer PSP
    for (let i = 0; i < alloc.payerCount; i++) {
      let otherStatus: TestStatus = 'Pending';
      let blockedReason: string | undefined = undefined;

      if (i < alloc.payerOtherPass) {
        otherStatus = 'Pass';
      } else if (i < alloc.payerOtherPass + alloc.payerOtherBlocked) {
        otherStatus = 'Blocked';
        blockedReason = BLOCKED_REASONS[blockedIdx % BLOCKED_REASONS.length];
        blockedIdx++;
      } else {
        otherStatus = 'Pending';
      }

      let ourStatus: TestStatus = 'Pending';
      if (i < alloc.payerOurPass) {
        ourStatus = 'Pass';
      } else {
        ourStatus = 'Pending';
      }

      const scenario = BCRP_SCENARIOS[(testIndex - 1) % BCRP_SCENARIOS.length];
      const caseCode = `UC-${alloc.phase.includes('TAPP↔TAPP') ? 'TAPP' : 'CCE'}-PAY-${String(testIndex).padStart(3, '0')}`;

      cases.push({
        id: `BCRP-${String(testIndex).padStart(3, '0')}`,
        code: caseCode,
        title: `${scenario.title} #${String(testIndex).padStart(2, '0')}`,
        description: scenario.desc,
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

    // Payee PSP
    for (let j = 0; j < alloc.payeeCount; j++) {
      let otherStatus: TestStatus = 'Pending';
      let blockedReason: string | undefined = undefined;

      if (j < alloc.payeeOtherPass) {
        otherStatus = 'Pass';
      } else if (j < alloc.payeeOtherPass + alloc.payeeOtherBlocked) {
        otherStatus = 'Blocked';
        blockedReason = BLOCKED_REASONS[blockedIdx % BLOCKED_REASONS.length];
        blockedIdx++;
      } else {
        otherStatus = 'Pending';
      }

      let ourStatus: TestStatus = 'Pending';
      if (j < alloc.payeeOurPass) {
        ourStatus = 'Pass';
      } else {
        ourStatus = 'Pending';
      }

      const scenario = BCRP_SCENARIOS[(testIndex + 3) % BCRP_SCENARIOS.length];
      const caseCode = `UC-${alloc.phase.includes('TAPP↔TAPP') ? 'TAPP' : 'CCE'}-REC-${String(testIndex).padStart(3, '0')}`;

      cases.push({
        id: `BCRP-${String(testIndex).padStart(3, '0')}`,
        code: caseCode,
        title: `${scenario.title} (Payee) #${String(testIndex).padStart(2, '0')}`,
        description: scenario.desc,
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
