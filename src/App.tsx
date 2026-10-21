/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TestTrackerProvider } from './context/TestTrackerContext';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header with strict 3-zone contract */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ExecutiveDashboard />
      </main>

      {/* Executive Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>Niubiz PAC Certification · Interoperabilidad PSP</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>In-Scope Denominator: 93 Test Cases</span>
            <span aria-hidden="true">·</span>
            <span>Other Account Providers vs Our Account Provider</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TestTrackerProvider>
      <AppContent />
    </TestTrackerProvider>
  );
}
