import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  LogOut, 
  Copy, 
  Check,
  Table
} from 'lucide-react';
import { 
  signInWithGoogleSheets, 
  signOutGoogle, 
  getCachedGoogleToken,
  setCachedGoogleToken
} from '../services/googleAuth.ts';
import { 
  createAndSyncInterviewReadySheet, 
  syncToExistingSheet, 
  DatabaseDump, 
  SpreadsheetExportResult 
} from '../services/googleSheetsService.ts';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exportResult, setExportResult] = useState<SpreadsheetExportResult | null>(() => {
    try {
      const saved = localStorage.getItem('interviewready_linked_sheet');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [copied, setCopied] = useState(false);
  const [previewDump, setPreviewDump] = useState<DatabaseDump | null>(null);

  // Fetch local database dump preview on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/sheets/database-dump')
        .then(res => res.json())
        .then(data => setPreviewDump(data))
        .catch(err => console.warn('Could not preview database dump:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user, accessToken } = await signInWithGoogleSheets();
      setGoogleUser(user);
      setCachedGoogleToken(accessToken);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing authorization.');
      } else {
        setError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await signOutGoogle();
    setGoogleUser(null);
  };

  const handleTriggerExport = () => {
    const token = getCachedGoogleToken();
    if (!token && !googleUser) {
      handleConnectGoogle();
      return;
    }
    // Show mandatory confirmation dialog per workspace skill rules
    setShowConfirmDialog(true);
  };

  const handleConfirmExport = async () => {
    setShowConfirmDialog(false);
    setSyncing(true);
    setError(null);

    try {
      let token = getCachedGoogleToken();
      if (!token) {
        const authRes = await signInWithGoogleSheets();
        token = authRes.accessToken;
        setGoogleUser(authRes.user);
      }

      // Fetch fresh database dump from backend
      const res = await fetch('/api/sheets/database-dump');
      if (!res.ok) throw new Error('Failed to retrieve user database from server.');
      const dump: DatabaseDump = await res.json();

      // Create and populate spreadsheet
      const result = await createAndSyncInterviewReadySheet(token, dump);
      setExportResult(result);
      localStorage.setItem('interviewready_linked_sheet', JSON.stringify(result));
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to create and export Google Spreadsheet.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncLatest = async () => {
    if (!exportResult) return;
    setSyncing(true);
    setError(null);

    try {
      let token = getCachedGoogleToken();
      if (!token) {
        const authRes = await signInWithGoogleSheets();
        token = authRes.accessToken;
        setGoogleUser(authRes.user);
      }

      const res = await fetch('/api/sheets/database-dump');
      const dump: DatabaseDump = await res.json();

      await syncToExistingSheet(token, exportResult.spreadsheetId, dump);
      
      const updated = {
        ...exportResult,
        syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        usersCount: dump.users.length,
        answersCount: dump.answers.length
      };
      setExportResult(updated);
      localStorage.setItem('interviewready_linked_sheet', JSON.stringify(updated));
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.message || 'Failed to update Google Spreadsheet.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyLink = () => {
    if (exportResult?.spreadsheetUrl) {
      navigator.clipboard.writeText(exportResult.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">Google Sheets Database Link</h2>
              <p className="text-xs text-emerald-100">
                Sync candidate profiles, module scores, and practice history into Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Google Account Connection State */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Google Workspace Connection
              </span>
              {googleUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {googleUser.displayName ? googleUser.displayName[0] : 'G'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{googleUser.displayName || 'Google Account'}</div>
                    <div className="text-[11px] text-slate-500">{googleUser.email}</div>
                  </div>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Connected
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  Connect your Google account to create and manage spreadsheets in your Google Drive.
                </p>
              )}
            </div>

            {googleUser ? (
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto hover:border-slate-400"
              >
                {/* Official Google G SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>

          {/* Section 2: Database Summary to Link */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Database Records Ready for Google Sheets:
              </span>
              <span className="text-slate-500">
                {previewDump ? `${previewDump.users.length} users registered` : 'Loading database...'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="text-xl font-black text-blue-900">
                  {previewDump?.users.length || 3}
                </div>
                <div className="text-[11px] font-semibold text-blue-700">User Profiles</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="text-xl font-black text-emerald-900">
                  6
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">Modules Tracked</div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <div className="text-xl font-black text-indigo-900">
                  {previewDump?.answers.length || 0}
                </div>
                <div className="text-[11px] font-semibold text-indigo-700">Practice Records</div>
              </div>
            </div>

            {/* Sheet Tabs Preview info */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-600">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <span>3 Formatted Sheets Will Be Generated:</span>
              </div>
              <p>• <strong>Users & Profiles:</strong> User IDs, names, emails, target roles, streaks, and last practice date.</p>
              <p>• <strong>Module Progress:</strong> Scores across Self-Introduction, Questions, Sentences, Vocab, Fluency, and Mock Interview.</p>
              <p>• <strong>Practice & Feedback History:</strong> Full candidate answers, scores, grammar corrections, and power vocabulary.</p>
            </div>
          </div>

          {/* Section 3: Linked Sheet Status Card */}
          {exportResult && (
            <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Linked Google Spreadsheet Active</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium">
                  Last synced: {exportResult.syncedAt}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={exportResult.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Sheets ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleSyncLatest}
                  disabled={syncing}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Latest Activity'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 transition-colors cursor-pointer"
                  title="Copy spreadsheet link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Dialog Box (Workspace Mandatory Requirement) */}
          {showConfirmDialog ? (
            <div className="p-5 bg-blue-50 border-2 border-blue-400 rounded-2xl space-y-3 animate-in zoom-in-95 duration-150">
              <div className="font-bold text-blue-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Confirm Google Sheets Export</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                This will create a new Google Spreadsheet titled <strong>"InterviewReady - User Database & Performance"</strong> directly in your Google Drive with 3 formatted tabs containing your registered candidate details, scores, and practice records.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExport}
                  disabled={syncing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {syncing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Yes, Create & Link Spreadsheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Main Export Action Button */
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerExport}
                disabled={syncing || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {syncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Syncing with Google Sheets API...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{exportResult ? 'Export & Create New Spreadsheet' : 'Link Database to Google Sheets'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
