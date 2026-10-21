import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  TestCase,
  TestStatus,
  DailyProgressRecord,
  ScopeByRoleRecord,
  ProviderCoverageStats,
  AccountProviderKey
} from '../types';
import { generateInitialTestCases } from '../data/initialTrackerData';
import {
  calculateDailyProgress,
  calculateScopeByRole,
  calculateProviderStats,
  generateCsvExport,
  downloadCsvFile
} from '../utils/csvSync';

interface TestTrackerContextType {
  testCases: TestCase[];
  dailyProgress: DailyProgressRecord[];
  scopeByRole: ScopeByRoleRecord[];
  providerStats: {
    other: ProviderCoverageStats;
    our: ProviderCoverageStats;
  };
  activeTab: 'comparison' | 'daily' | 'ledger';
  setActiveTab: (tab: 'comparison' | 'daily' | 'ledger') => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterRole: string;
  setFilterRole: (r: string) => void;
  filterPhase: string;
  setFilterPhase: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterDate: string;
  setFilterDate: (d: string) => void;

  // Actions
  updateStatus: (
    id: string,
    provider: AccountProviderKey,
    newStatus: TestStatus,
    blockedReason?: string
  ) => void;
  markAllPhaseDone: (provider: AccountProviderKey, phase: string) => void;
  importTestCases: (cases: TestCase[]) => void;
  resetToDefault: () => void;
  exportCsv: () => void;
}

const STORAGE_KEY = 'niubiz_pac_tracker_v9';
const TestTrackerContext = createContext<TestTrackerContextType | undefined>(undefined);

export const TestTrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id?.startsWith('MT_32')) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return generateInitialTestCases();
  });

  const [activeTab, setActiveTab] = useState<'comparison' | 'daily' | 'ledger'>('comparison');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterPhase, setFilterPhase] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testCases));
    } catch (e) {
      console.warn('Failed to save test cases to localStorage', e);
    }
  }, [testCases]);

  const dailyProgress = calculateDailyProgress(testCases);
  const scopeByRole = calculateScopeByRole(testCases);
  const providerStats = calculateProviderStats(testCases);

  const updateStatus = useCallback(
    (
      id: string,
      provider: AccountProviderKey,
      newStatus: TestStatus,
      blockedReason?: string
    ) => {
      setTestCases(prev =>
        prev.map(tc => {
          if (tc.id !== id) return tc;

          if (provider === 'otherAccountProviders') {
            return {
              ...tc,
              otherAccountProviderStatus: newStatus,
              blockedReason: newStatus === 'Blocked' ? (blockedReason || tc.blockedReason) : undefined,
              lastUpdated: 'Just now'
            };
          } else {
            return {
              ...tc,
              ourAccountProviderStatus: newStatus,
              lastUpdated: 'Just now'
            };
          }
        })
      );
    },
    []
  );

  const markAllPhaseDone = useCallback((provider: AccountProviderKey, phase: string) => {
    setTestCases(prev =>
      prev.map(tc => {
        if (phase !== 'All' && tc.phase !== phase) return tc;
        if (provider === 'otherAccountProviders') {
          return { ...tc, otherAccountProviderStatus: 'Pass', lastUpdated: 'Just now' };
        } else {
          return { ...tc, ourAccountProviderStatus: 'Pass', lastUpdated: 'Just now' };
        }
      })
    );
  }, []);

  const importTestCases = useCallback((newCases: TestCase[]) => {
    if (Array.isArray(newCases) && newCases.length > 0) {
      setTestCases(newCases);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    const initial = generateInitialTestCases();
    setTestCases(initial);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportCsv = useCallback(() => {
    const content = generateCsvExport(testCases);
    downloadCsvFile(content);
  }, [testCases]);

  return (
    <TestTrackerContext.Provider
      value={{
        testCases,
        dailyProgress,
        scopeByRole,
        providerStats,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filterRole,
        setFilterRole,
        filterPhase,
        setFilterPhase,
        filterStatus,
        setFilterStatus,
        filterDate,
        setFilterDate,
        updateStatus,
        markAllPhaseDone,
        importTestCases,
        resetToDefault,
        exportCsv
      }}
    >
      {children}
    </TestTrackerContext.Provider>
  );
};

export const useTestTracker = () => {
  const context = useContext(TestTrackerContext);
  if (!context) {
    throw new Error('useTestTracker must be used within a TestTrackerProvider');
  }
  return context;
};
