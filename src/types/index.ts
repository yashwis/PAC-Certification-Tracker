export type TestStatus = 'Pass' | 'Fail' | 'Retest' | 'Blocked' | 'In Progress' | 'Pending';

export type PSPRole = 'Payer PSP' | 'Payee PSP';

export type CertificationPhase = 'Week 1 – TAPP↔TAPP' | 'Week 2 – TAPP↔CCE';

export type AccountProviderKey = 'otherAccountProviders' | 'ourAccountProvider';

export interface TestCase {
  id: string; // e.g. "BCRP-001"
  code: string; // e.g. "UC-TAPP-PAY-001"
  title: string;
  description: string;
  role: PSPRole;
  phase: CertificationPhase;
  scheduledDate: string; // e.g. "06-Oct-26"
  dayLabel: string; // e.g. "Day 2 (Tue)"
  otherAccountProviderStatus: TestStatus;
  ourAccountProviderStatus: TestStatus;
  blockedReason?: string;
  notes?: string;
  lastUpdated: string;
}

export interface ProviderCoverageStats {
  name: string;
  totalPlanned: number; // 143
  passed: number;
  blocked: number;
  pending: number;
  failed: number;
  retest: number;
  inProgress: number;
  executed: number;
  coveragePct: number;
  passRate: number;
}

export interface DailyProgressRecord {
  date: string;
  day: string;
  weekday: string;
  phase: string;
  planned: number;
  otherPass: number;
  otherBlocked: number;
  otherPending: number;
  ourPass: number;
  ourBlocked: number;
  ourPending: number;
  dayStatus: 'Readiness' | 'Behind' | 'Completed' | 'Off' | 'On Track';
}

export interface ScopeByRoleRecord {
  role: PSPRole;
  phase: CertificationPhase;
  planned: number;
  otherPass: number;
  otherBlocked: number;
  otherPending: number;
  ourPass: number;
  ourBlocked: number;
  ourPending: number;
}
