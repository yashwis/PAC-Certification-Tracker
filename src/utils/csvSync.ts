import { TestCase, DailyProgressRecord, ScopeByRoleRecord, ProviderCoverageStats } from '../types';
import { CALENDAR_DAYS } from '../data/initialTrackerData';

export function calculateProviderStats(testCases: TestCase[]): {
  other: ProviderCoverageStats;
  our: ProviderCoverageStats;
} {
  const totalPlanned = testCases.length; // 93

  // Other Account Providers
  const otherPassed = testCases.filter(c => c.otherAccountProviderStatus === 'Pass').length;
  const otherBlocked = testCases.filter(c => c.otherAccountProviderStatus === 'Blocked').length;
  const otherFailed = testCases.filter(c => c.otherAccountProviderStatus === 'Fail').length;
  const otherRetest = testCases.filter(c => c.otherAccountProviderStatus === 'Retest').length;
  const otherInProgress = testCases.filter(c => c.otherAccountProviderStatus === 'In Progress').length;
  const otherPending = testCases.filter(c => c.otherAccountProviderStatus === 'Pending').length;
  const otherExecuted = otherPassed + otherFailed + otherRetest;
  const otherCoveragePct = totalPlanned > 0 ? Math.round((otherPassed / totalPlanned) * 100) : 0;
  const otherPassRate = otherExecuted > 0 ? Math.round((otherPassed / otherExecuted) * 100) : 100;

  // Our Account Provider
  const ourPassed = testCases.filter(c => c.ourAccountProviderStatus === 'Pass').length;
  const ourBlocked = testCases.filter(c => c.ourAccountProviderStatus === 'Blocked').length;
  const ourFailed = testCases.filter(c => c.ourAccountProviderStatus === 'Fail').length;
  const ourRetest = testCases.filter(c => c.ourAccountProviderStatus === 'Retest').length;
  const ourInProgress = testCases.filter(c => c.ourAccountProviderStatus === 'In Progress').length;
  const ourPending = testCases.filter(c => c.ourAccountProviderStatus === 'Pending').length;
  const ourExecuted = ourPassed + ourFailed + ourRetest;
  const ourCoveragePct = totalPlanned > 0 ? Math.round((ourPassed / totalPlanned) * 100) : 0;
  const ourPassRate = ourExecuted > 0 ? Math.round((ourPassed / ourExecuted) * 100) : 100;

  return {
    other: {
      name: 'Other Account Providers',
      totalPlanned,
      passed: otherPassed,
      blocked: otherBlocked,
      pending: otherPending,
      failed: otherFailed,
      retest: otherRetest,
      inProgress: otherInProgress,
      executed: otherExecuted,
      coveragePct: otherCoveragePct,
      passRate: otherPassRate
    },
    our: {
      name: 'Our Account Provider',
      totalPlanned,
      passed: ourPassed,
      blocked: ourBlocked,
      pending: ourPending,
      failed: ourFailed,
      retest: ourRetest,
      inProgress: ourInProgress,
      executed: ourExecuted,
      coveragePct: ourCoveragePct,
      passRate: ourPassRate
    }
  };
}

export function calculateDailyProgress(testCases: TestCase[]): DailyProgressRecord[] {
  return CALENDAR_DAYS.map(d => {
    const dayCases = testCases.filter(c => c.scheduledDate === d.date);

    const otherPass = dayCases.filter(c => c.otherAccountProviderStatus === 'Pass').length;
    const otherBlocked = dayCases.filter(c => c.otherAccountProviderStatus === 'Blocked').length;
    const otherPending = dayCases.filter(c => c.otherAccountProviderStatus === 'Pending').length;

    const ourPass = dayCases.filter(c => c.ourAccountProviderStatus === 'Pass').length;
    const ourBlocked = dayCases.filter(c => c.ourAccountProviderStatus === 'Blocked').length;
    const ourPending = dayCases.filter(c => c.ourAccountProviderStatus === 'Pending').length;

    let dayStatus: DailyProgressRecord['dayStatus'] = 'Behind';
    if (d.planned === 0) {
      dayStatus = d.date.includes('05-Oct') ? 'Readiness' : 'Off';
    } else if (otherPass >= d.planned && otherBlocked === 0) {
      dayStatus = 'Completed';
    } else if (otherPass + otherBlocked >= d.planned) {
      dayStatus = 'On Track';
    } else {
      dayStatus = 'Behind';
    }

    return {
      date: d.date,
      day: d.day,
      weekday: d.weekday,
      phase: d.phase,
      planned: d.planned,
      otherPass,
      otherBlocked,
      otherPending,
      ourPass,
      ourBlocked,
      ourPending,
      dayStatus
    };
  });
}

export function calculateScopeByRole(testCases: TestCase[]): ScopeByRoleRecord[] {
  const scopes: Array<{ role: 'Payer PSP' | 'Payee PSP'; phase: 'Week 1 – TAPP↔TAPP' | 'Week 2 – TAPP↔CCE'; planned: number }> = [
    { role: 'Payer PSP', phase: 'Week 1 – TAPP↔TAPP', planned: 71 },
    { role: 'Payer PSP', phase: 'Week 2 – TAPP↔CCE', planned: 14 },
    { role: 'Payee PSP', phase: 'Week 1 – TAPP↔TAPP', planned: 7 },
    { role: 'Payee PSP', phase: 'Week 2 – TAPP↔CCE', planned: 1 }
  ];

  return scopes.map(s => {
    const matched = testCases.filter(c => c.role === s.role && c.phase === s.phase);

    return {
      role: s.role,
      phase: s.phase,
      planned: s.planned,
      otherPass: matched.filter(c => c.otherAccountProviderStatus === 'Pass').length,
      otherBlocked: matched.filter(c => c.otherAccountProviderStatus === 'Blocked').length,
      otherPending: matched.filter(c => c.otherAccountProviderStatus === 'Pending').length,
      ourPass: matched.filter(c => c.ourAccountProviderStatus === 'Pass').length,
      ourBlocked: matched.filter(c => c.ourAccountProviderStatus === 'Blocked').length,
      ourPending: matched.filter(c => c.ourAccountProviderStatus === 'Pending').length
    };
  });
}

export function generateCsvExport(testCases: TestCase[]): string {
  const { other, our } = calculateProviderStats(testCases);
  const daily = calculateDailyProgress(testCases);
  const scope = calculateScopeByRole(testCases);

  const lines: string[] = [
    'BCRP Certification – PSP In-Scope Execution & Coverage Summary',
    '',
    `PROVIDER COVERAGE SUMMARY (In-Scope Denominator: ${testCases.length})`,
    'Provider,Total In-Scope Cases,Passed (Done),Blocked,Pending,Coverage %',
    `"Other Account Providers",${other.totalPlanned},${other.passed},${other.blocked},${other.pending},${other.coveragePct}%`,
    `"Our Account Provider",${our.totalPlanned},${our.passed},${our.blocked},${our.pending},${our.coveragePct}%`,
    '',
    'DAILY EXECUTION PROGRESS (IN-SCOPE: 05-Oct to 12-Oct)',
    'Date,Day,Weekday,Phase,Planned,Other AP Pass,Other AP Blocked,Other AP Pending,Our AP Pass,Our AP Blocked,Our AP Pending,Status',
  ];

  for (const d of daily) {
    lines.push(
      `${d.date},${d.day},${d.weekday},"${d.phase}",${d.planned},${d.otherPass},${d.otherBlocked},${d.otherPending},${d.ourPass},${d.ourBlocked},${d.ourPending},${d.dayStatus}`
    );
  }

  lines.push('');
  lines.push('IN-SCOPE BY PSP ROLE & PHASE');
  lines.push('PSP Role,Phase,Planned,Other AP Pass,Other AP Blocked,Our AP Pass,Our AP Blocked');
  for (const s of scope) {
    lines.push(
      `"${s.role}","${s.phase}",${s.planned},${s.otherPass},${s.otherBlocked},${s.ourPass},${s.ourBlocked}`
    );
  }

  lines.push('');
  lines.push(`DETAILED IN-SCOPE TEST CASES (${testCases.length} Cases)`);
  lines.push('ID,Code,Title,Role,Phase,Scheduled Date,Other Account Providers Status,Our Account Provider Status,Blocked Reason');
  for (const tc of testCases) {
    lines.push(
      `"${tc.id}","${tc.code}","${tc.title}","${tc.role}","${tc.phase}","${tc.scheduledDate}","${tc.otherAccountProviderStatus}","${tc.ourAccountProviderStatus}","${tc.blockedReason || ''}"`
    );
  }

  return lines.join('\n');
}

export function downloadCsvFile(content: string, filename = 'BCRP_Certification_InScope_Tracker.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
