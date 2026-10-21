import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Clipboard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { parseExcelBuffer, parsePastedText, ImportResult } from '../utils/excelImport';
import { useTestTracker } from '../context/TestTrackerContext';

interface ImportSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportSheetModal: React.FC<ImportSheetModalProps> = ({ isOpen, onClose }) => {
  const { importTestCases } = useTestTracker();
  const [tab, setTab] = useState<'upload' | 'paste'>('paste');
  const [pastedContent, setPastedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelBuffer(buffer);
      setResult(parsed);
    } catch (err: any) {
      setResult({
        success: false,
        cases: [],
        count: 0,
        error: err?.message || 'Error reading file'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParsePaste = () => {
    if (!pastedContent.trim()) return;
    setIsProcessing(true);
    setResult(null);
    try {
      const parsed = parsePastedText(pastedContent);
      setResult(parsed);
    } catch (err: any) {
      setResult({
        success: false,
        cases: [],
        count: 0,
        error: err?.message || 'Error parsing pasted data'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!result || !result.success || result.cases.length === 0) return;
    importTestCases(result.cases);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Sync / Import Excel Test Cases
              </h3>
              <p className="text-xs text-slate-500">
                Uses <strong>Test ID</strong> as the primary key. Matches exact codes and descriptions from your sheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-6 pt-2">
          <button
            onClick={() => { setTab('paste'); setResult(null); }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'paste'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste from Excel
          </button>
          <button
            onClick={() => { setTab('upload'); setResult(null); }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'upload'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .xlsx / .csv File
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-lg p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {fileName ? fileName : 'Click to browse or drop your Excel file here'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .xlsx, .xls, and .csv with Test ID, Code, and Description columns
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Paste rows directly from Excel (including headers):
                </label>
                <textarea
                  value={pastedContent}
                  onChange={e => setPastedContent(e.target.value)}
                  placeholder={`Test ID\tCode\tDescription\tRole\tPhase\nMT_32\tMT_32\tDirect Debit Transfer\tPayer PSP\tWeek 1 – TAPP↔TAPP\nMT_33\tMT_33\tQR Payment Settlement\tPayer PSP\tWeek 1 – TAPP↔TAPP\nMT_34\tMT_34\tAccount Verification\tPayer PSP\tWeek 1 – TAPP↔TAPP`}
                  rows={8}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleParsePaste}
                  disabled={!pastedContent.trim() || isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-colors"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clipboard className="w-3.5 h-3.5" />}
                  Parse Clipboard Data
                </button>
              </div>
            </div>
          )}

          {/* Results / Preview Box */}
          {result && (
            <div className={`p-4 rounded-lg border text-xs ${
              result.success
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
            }`}>
              {result.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Successfully parsed {result.count} test cases with Test ID primary keys!</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded border border-emerald-200 dark:border-emerald-800/40 bg-white/80 dark:bg-slate-900/80">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-emerald-100/50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-medium">
                        <tr>
                          <th className="px-2 py-1 font-mono">Test ID</th>
                          <th className="px-2 py-1 font-mono">Code</th>
                          <th className="px-2 py-1">Description</th>
                          <th className="px-2 py-1">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100 dark:divide-emerald-950">
                        {result.cases.slice(0, 5).map(c => (
                          <tr key={c.id}>
                            <td className="px-2 py-1 font-mono font-bold text-slate-900 dark:text-white">{c.id}</td>
                            <td className="px-2 py-1 font-mono text-slate-700 dark:text-slate-300">{c.code}</td>
                            <td className="px-2 py-1 text-slate-600 dark:text-slate-400 truncate max-w-xs">{c.description}</td>
                            <td className="px-2 py-1 text-slate-500">{c.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.count > 5 && (
                    <p className="text-[11px] text-slate-500 italic">
                      + {result.count - 5} more test cases ready to be imported.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Import Error: </span>
                    <span>{result.error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Primary key will be set to the sheet's exact Test ID column.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!result || !result.success || result.cases.length === 0}
              className="px-4 py-1.5 rounded text-xs font-medium bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white cursor-pointer transition-colors"
            >
              Apply {result?.count ? `${result.count} Cases` : 'Sheet Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
