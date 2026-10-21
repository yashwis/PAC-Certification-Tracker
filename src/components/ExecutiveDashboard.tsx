import React, { useState, useMemo } from 'react';
import { useTestTracker } from '../context/TestTrackerContext';
import { StatusBadge } from './StatusBadge';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    testCases,
    providerStats,
    updateStatus
  } = useTestTracker();

  const { other, our } = providerStats;
  const totalInScope = testCases.length; // 93

  // Section 3: Selectable Status Filter
  type StatusFilterOption = 'all' | 'other-passed' | 'our-passed' | 'both-done' | 'other-blocked' | 'our-pending';
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterPhase, setFilterPhase] = useState('All');

  // Pagination state for test cases table
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered test cases based on Section 3 selectable status and search
  const filteredCases = useMemo(() => {
    return testCases.filter(c => {
      // Role & Phase
      if (filterRole !== 'All' && c.role !== filterRole) return false;
      if (filterPhase !== 'All' && c.phase !== filterPhase) return false;

      // Status selector
      if (selectedStatusFilter === 'other-passed') {
        if (c.otherAccountProviderStatus !== 'Pass') return false;
      } else if (selectedStatusFilter === 'our-passed') {
        if (c.ourAccountProviderStatus !== 'Pass') return false;
      } else if (selectedStatusFilter === 'both-done') {
        if (!(c.otherAccountProviderStatus === 'Pass' && c.ourAccountProviderStatus === 'Pass')) return false;
      } else if (selectedStatusFilter === 'other-blocked') {
        if (c.otherAccountProviderStatus !== 'Blocked') return false;
      } else if (selectedStatusFilter === 'our-pending') {
        if (c.ourAccountProviderStatus !== 'Pending') return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesReason = c.blockedReason ? c.blockedReason.toLowerCase().includes(q) : false;
        return matchesCode || matchesTitle || matchesDesc || matchesReason;
      }

      return true;
    });
  }, [testCases, selectedStatusFilter, filterRole, filterPhase, searchQuery]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (filter: StatusFilterOption) => {
    setSelectedStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: string) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handlePhaseChange = (phase: string) => {
    setFilterPhase(phase);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedStatusFilter('all');
    setSearchQuery('');
    setFilterRole('All');
    setFilterPhase('All');
    setCurrentPage(1);
  };

  // Paginated slice
  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredCases.length / pageSize);
  const paginatedCases = useMemo(() => {
    if (pageSize === 0) return filteredCases;
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  // Counts for the selectable tabs
  const filterCounts = useMemo(() => {
    return {
      all: testCases.length,
      otherPassed: testCases.filter(c => c.otherAccountProviderStatus === 'Pass').length,
      ourPassed: testCases.filter(c => c.ourAccountProviderStatus === 'Pass').length,
      bothDone: testCases.filter(c => c.otherAccountProviderStatus === 'Pass' && c.ourAccountProviderStatus === 'Pass').length,
      otherBlocked: testCases.filter(c => c.otherAccountProviderStatus === 'Blocked').length,
      ourPending: testCases.filter(c => c.ourAccountProviderStatus === 'Pending').length
    };
  }, [testCases]);

  // Phase calculation
  const week1Cases = testCases.filter(c => c.phase === 'Week 1 – TAPP↔TAPP');
  const week2Cases = testCases.filter(c => c.phase === 'Week 2 – TAPP↔CCE');

  const week1OtherPass = week1Cases.filter(c => c.otherAccountProviderStatus === 'Pass').length;
  const week1OtherBlocked = week1Cases.filter(c => c.otherAccountProviderStatus === 'Blocked').length;
  const week1OtherPending = week1Cases.filter(c => c.otherAccountProviderStatus === 'Pending').length;
  const week1OurPass = week1Cases.filter(c => c.ourAccountProviderStatus === 'Pass').length;
  const week1OurPending = week1Cases.filter(c => c.ourAccountProviderStatus === 'Pending').length;

  const week2OtherPass = week2Cases.filter(c => c.otherAccountProviderStatus === 'Pass').length;
  const week2OtherPending = week2Cases.filter(c => c.otherAccountProviderStatus === 'Pending').length;
  const week2OurPass = week2Cases.filter(c => c.ourAccountProviderStatus === 'Pass').length;
  const week2OurPending = week2Cases.filter(c => c.ourAccountProviderStatus === 'Pending').length;

  // Percentage calculations
  const otherPassPct = totalInScope > 0 ? ((other.passed / totalInScope) * 100).toFixed(1) : '0.0';
  const otherBlockedPct = totalInScope > 0 ? ((other.blocked / totalInScope) * 100).toFixed(1) : '0.0';
  const otherPendingPct = totalInScope > 0 ? ((other.pending / totalInScope) * 100).toFixed(1) : '0.0';

  const ourPassPct = totalInScope > 0 ? ((our.passed / totalInScope) * 100).toFixed(1) : '0.0';
  const ourPendingPct = totalInScope > 0 ? ((our.pending / totalInScope) * 100).toFixed(1) : '0.0';

  const hasActiveFilters =
    selectedStatusFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    filterRole !== 'All' ||
    filterPhase !== 'All';

  return (
    <div className="space-y-6 max-w-full">
      {/* =========================================================================
          SECTION 1: HIGH-LEVEL METRICS FOR OVERVIEW
          ========================================================================= */}
      <section id="sec-overview" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-0.5">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              01. Overview Metrics
            </h2>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Niubiz PAC Certification In-Scope Coverage
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded self-start sm:self-auto">
            In-Scope: 05-Oct to 12-Oct (Oct 13–17 excluded)
          </div>
        </div>

        {/* 3 Balanced Metric Boxes with Identical Heights & Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: In-Scope Denominator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs h-full">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span className="uppercase tracking-wider font-mono text-[11px]">Total Scope (Denominator)</span>
                <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Layers className="w-4 h-4 shrink-0" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                  {totalInScope}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Test Cases In-Scope
                </span>
              </div>
              {/* Micro-bar indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-slate-900 dark:bg-slate-300 h-full w-full" />
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Week 1 (TAPP↔TAPP):</span>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  78 cases (83.9%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Week 2 (TAPP↔CCE):</span>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  15 cases (16.1%)
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Other Account Providers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs h-full">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span className="uppercase tracking-wider font-mono text-[11px]">Other Account Providers</span>
                <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                  {otherPassPct}% Passed
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                  {other.passed}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {totalInScope} Passed
                </span>
              </div>
              {/* Micro-bar indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
                <div style={{ width: `${otherPassPct}%` }} className="bg-emerald-600 h-full" />
                <div style={{ width: `${otherBlockedPct}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${otherPendingPct}%` }} className="bg-slate-300 dark:bg-slate-700 h-full" />
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                <span>Blocked:</span>
                <span className="bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 font-bold">
                  {other.blocked} Cases ({otherBlockedPct}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Pending Execution:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {other.pending} Cases ({otherPendingPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Our Account Provider */}
          <div className="bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800/90 rounded-lg p-5 flex flex-col justify-between shadow-xs h-full">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-300 mb-2">
                <span className="uppercase tracking-wider font-mono text-[11px]">Our Account Provider</span>
                <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                  {ourPassPct}% Passed
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {our.passed}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {totalInScope} Passed
                </span>
              </div>
              {/* Micro-bar indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
                <div style={{ width: `${ourPassPct}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${ourPendingPct}%` }} className="bg-slate-300 dark:bg-slate-700 h-full" />
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                <span>Blocked:</span>
                <span className="bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-bold">
                  0 Cases (0.0%)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Pending Execution:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {our.pending} Cases ({ourPendingPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STATUS VIEW CHART
          ========================================================================= */}
      <section id="sec-chart" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            02. Status View Chart
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Status Distribution Across In-Scope Test Cases ({totalInScope} Total)
            </h3>
            {/* Visual Legend */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono shrink-0">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 shrink-0" />
                <span>Passed</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0" />
                <span>Blocked</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-700 shrink-0" />
                <span>Pending</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Distribution Bars Box */}
        <div className="space-y-5 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-lg border border-slate-200/80 dark:border-slate-800">
          {/* Other Account Providers Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Other Account Providers
              </span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{other.passed} Passed ({otherPassPct}%)</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{other.blocked} Blocked ({otherBlockedPct}%)</span>
                <span>·</span>
                <span className="text-slate-500">{other.pending} Pending ({otherPendingPct}%)</span>
              </span>
            </div>
            {/* Visual Bar with zero internal text overflow */}
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex">
              <div
                style={{ width: `${(other.passed / totalInScope) * 100}%` }}
                className="bg-emerald-600 h-full transition-all duration-300"
                title={`Other AP: ${other.passed} Passed (${otherPassPct}%)`}
              />
              <div
                style={{ width: `${(other.blocked / totalInScope) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Other AP: ${other.blocked} Blocked (${otherBlockedPct}%)`}
              />
              <div
                style={{ width: `${(other.pending / totalInScope) * 100}%` }}
                className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-300"
                title={`Other AP: ${other.pending} Pending (${otherPendingPct}%)`}
              />
            </div>
          </div>

          {/* Our Account Provider Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-bold text-sky-800 dark:text-sky-300">
                Our Account Provider
              </span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{our.passed} Passed ({ourPassPct}%)</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0 Blocked (0.0%)</span>
                <span>·</span>
                <span className="text-slate-500">{our.pending} Pending ({ourPendingPct}%)</span>
              </span>
            </div>
            {/* Visual Bar with zero internal text overflow */}
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex">
              <div
                style={{ width: `${(our.passed / totalInScope) * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Our AP: ${our.passed} Passed (${ourPassPct}%)`}
              />
              <div
                style={{ width: `${(our.pending / totalInScope) * 100}%` }}
                className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-300"
                title={`Our AP: ${our.pending} Pending (${ourPendingPct}%)`}
              />
            </div>
          </div>
        </div>

        {/* Structured Side-by-Side Status Comparison Table Box */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Account Provider</th>
                <th className="px-4 py-3 text-right font-mono">Passed</th>
                <th className="px-4 py-3 text-right font-mono">Blocked</th>
                <th className="px-4 py-3 text-right font-mono">Pending</th>
                <th className="px-4 py-3 text-right font-mono">Total In-Scope</th>
                <th className="px-4 py-3 text-right font-mono">Coverage Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-sans font-semibold text-slate-900 dark:text-white">
                  Other Account Providers
                </td>
                <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                  {other.passed} ({otherPassPct}%)
                </td>
                <td className="px-4 py-3 text-right text-amber-600 font-bold">
                  {other.blocked} ({otherBlockedPct}%)
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {other.pending} ({otherPendingPct}%)
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                  {totalInScope}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                  {otherPassPct}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 bg-sky-50/30 dark:bg-sky-950/20">
                <td className="px-4 py-3 font-sans font-semibold text-sky-800 dark:text-sky-300">
                  Our Account Provider
                </td>
                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                  {our.passed} ({ourPassPct}%)
                </td>
                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                  0 (0.0%)
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {our.pending} ({ourPendingPct}%)
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                  {totalInScope}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {ourPassPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Phase Breakdown Grid: Week 1 vs Week 2 in balanced boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Week 1 Box */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Week 1 – TAPP↔TAPP
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    78 Cases
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  06-Oct to 10-Oct
                </span>
              </div>

              {/* Perfectly Aligned Tabular Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[320px]">
                  <thead>
                    <tr className="text-slate-500 font-mono text-[11px] border-b border-slate-200/50 dark:border-slate-700/50">
                      <th className="pb-1.5 text-left font-medium">Provider</th>
                      <th className="pb-1.5 text-right font-medium text-emerald-700 dark:text-emerald-400">Pass</th>
                      <th className="pb-1.5 text-right font-medium text-amber-700 dark:text-amber-400">Blocked</th>
                      <th className="pb-1.5 text-right font-medium text-slate-500">Pending</th>
                      <th className="pb-1.5 text-right font-medium text-slate-700 dark:text-slate-300">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-700/40 font-mono tabular-nums">
                    <tr>
                      <td className="py-2.5 text-left font-sans font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        Other Account Providers
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {week1OtherPass}
                      </td>
                      <td className="py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                        {week1OtherBlocked}
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {week1OtherPending}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {((week1OtherPass / 78) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-sky-50/40 dark:bg-sky-950/20">
                      <td className="py-2.5 text-left font-sans font-semibold text-sky-800 dark:text-sky-300 whitespace-nowrap">
                        Our Account Provider
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {week1OurPass}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        0
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {week1OurPending}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {((week1OurPass / 78) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Week 2 Box */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Week 2 – TAPP↔CCE
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    15 Cases
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  12-Oct (Day 1)
                </span>
              </div>

              {/* Perfectly Aligned Tabular Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[320px]">
                  <thead>
                    <tr className="text-slate-500 font-mono text-[11px] border-b border-slate-200/50 dark:border-slate-700/50">
                      <th className="pb-1.5 text-left font-medium">Provider</th>
                      <th className="pb-1.5 text-right font-medium text-emerald-700 dark:text-emerald-400">Pass</th>
                      <th className="pb-1.5 text-right font-medium text-amber-700 dark:text-amber-400">Blocked</th>
                      <th className="pb-1.5 text-right font-medium text-slate-500">Pending</th>
                      <th className="pb-1.5 text-right font-medium text-slate-700 dark:text-slate-300">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-700/40 font-mono tabular-nums">
                    <tr>
                      <td className="py-2.5 text-left font-sans font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        Other Account Providers
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {week2OtherPass}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-400">
                        0
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {week2OtherPending}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {((week2OtherPass / 15) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-sky-50/40 dark:bg-sky-950/20">
                      <td className="py-2.5 text-left font-sans font-semibold text-sky-800 dark:text-sky-300 whitespace-nowrap">
                        Our Account Provider
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-400">
                        {week2OurPass}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        0
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {week2OurPending}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-500">
                        {((week2OurPass / 15) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SELECTABLE OPTION TO VIEW THE TEST CASES BY STATUS
          ========================================================================= */}
      <section id="sec-cases" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            03. Drill Down by Status
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select Status Option to View In-Scope Test Cases
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Displaying {filteredCases.length} of {totalInScope} Cases
            </span>
          </div>
        </div>

        {/* The Primary Selectable Filter Buttons Box */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold border-slate-300 dark:border-slate-600 shadow-xs ring-1 ring-slate-400/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              <span>All In-Scope</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[11px] font-mono">
                {filterCounts.all}
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('other-passed')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'other-passed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold border-slate-300 dark:border-slate-600 shadow-xs ring-1 ring-slate-400/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
              <span>Passed in Other APs</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[11px] font-mono">
                {filterCounts.otherPassed}
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('our-passed')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'our-passed'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs ring-1 ring-emerald-500/30'
                  : 'border-transparent text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Passed in Our AP (Success Sheet)</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'our-passed' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                {filterCounts.ourPassed}
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('both-done')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'both-done'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold border-slate-300 dark:border-slate-600 shadow-xs ring-1 ring-slate-400/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              <span>Passed in Both</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[11px] font-mono">
                {filterCounts.bothDone}
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('other-blocked')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'other-blocked'
                  ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-xs ring-1 ring-amber-400/30'
                  : 'border-transparent text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Blocked in Other APs</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                selectedStatusFilter === 'other-blocked' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {filterCounts.otherBlocked}
              </span>
            </button>

            <button
              onClick={() => handleFilterChange('our-pending')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedStatusFilter === 'our-pending'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold border-slate-300 dark:border-slate-600 shadow-xs ring-1 ring-slate-400/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Pending in Our AP</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[11px] font-mono">
                {filterCounts.ourPending}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary filters toolbar Box */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search test cases by code or description..."
                className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500">Role:</span>
              <select
                value={filterRole}
                onChange={e => handleRoleChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="All">All Roles ({totalInScope})</option>
                <option value="Payer PSP">Payer PSP (85)</option>
                <option value="Payee PSP">Payee PSP (8)</option>
              </select>
            </div>

            {/* Phase dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500">Phase:</span>
              <select
                value={filterPhase}
                onChange={e => handlePhaseChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="All">All In-Scope Phases</option>
                <option value="Week 1 – TAPP↔TAPP">Week 1 (78 cases)</option>
                <option value="Week 2 – TAPP↔CCE">Week 2 (15 cases)</option>
              </select>
            </div>
          </div>

          {/* Reset Filters button if any filter active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Selected Status Table Box (Bounded, zero horizontal overflow, clean container) */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[820px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-28 whitespace-nowrap">Code</th>
                  <th className="px-4 py-3 min-w-[280px]">Test Case Title & Description</th>
                  <th className="px-3 py-3 w-24 text-center whitespace-nowrap">Role</th>
                  <th className="px-3 py-3 w-28 text-center whitespace-nowrap">Phase</th>
                  <th className="px-4 py-3 w-40 text-center whitespace-nowrap bg-slate-100/60 dark:bg-slate-800/60">
                    Other Account Providers
                  </th>
                  <th className="px-4 py-3 w-40 text-center whitespace-nowrap bg-sky-50/60 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300">
                    Our Account Provider
                  </th>
                  <th className="px-4 py-3 w-32 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-sm">No test cases match the active filter criteria.</span>
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map(tc => (
                    <tr key={tc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap align-top">
                        {tc.code}
                      </td>

                      {/* Title & Description */}
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {tc.description}
                        </div>
                        {tc.blockedReason && (
                          <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Blockage Root Cause:</strong> {tc.blockedReason}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-3 py-3 text-center whitespace-nowrap align-top">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {tc.role}
                        </span>
                      </td>

                      {/* Phase */}
                      <td className="px-3 py-3 text-center whitespace-nowrap align-top text-slate-500 dark:text-slate-400 text-[11px]">
                        {tc.phase.includes('TAPP↔TAPP') ? 'Week 1 (TAPP)' : 'Week 2 (CCE)'}
                      </td>

                      {/* Other Account Providers */}
                      <td className="px-4 py-3 text-center whitespace-nowrap bg-slate-100/30 dark:bg-slate-800/20 align-top">
                        <div className="flex justify-center">
                          <StatusBadge status={tc.otherAccountProviderStatus} size="sm" />
                        </div>
                      </td>

                      {/* Our Account Provider */}
                      <td className="px-4 py-3 text-center whitespace-nowrap bg-sky-50/30 dark:bg-sky-950/15 align-top">
                        <div className="flex justify-center">
                          <StatusBadge status={tc.ourAccountProviderStatus} size="sm" />
                        </div>
                      </td>

                      {/* Quick action toggle */}
                      <td className="px-4 py-3 text-center whitespace-nowrap align-top">
                        <button
                          onClick={() =>
                            updateStatus(
                              tc.id,
                              'ourAccountProvider',
                              tc.ourAccountProviderStatus === 'Pass' ? 'Pending' : 'Pass'
                            )
                          }
                          className={`text-xs px-2.5 py-1 rounded transition-colors font-medium border cursor-pointer ${
                            tc.ourAccountProviderStatus === 'Pass'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-800'
                          }`}
                          title={`Toggle ${tc.code} status in Our Account Provider`}
                        >
                          {tc.ourAccountProviderStatus === 'Pass' ? 'Set Pending' : 'Mark Passed'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and View Controls Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={0}>All ({filteredCases.length})</option>
              </select>
              <span className="text-slate-400">|</span>
              <span>
                Showing {filteredCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {pageSize === 0 ? filteredCases.length : Math.min(currentPage * pageSize, filteredCases.length)} of{' '}
                {filteredCases.length} in-scope test cases
              </span>
            </div>

            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
