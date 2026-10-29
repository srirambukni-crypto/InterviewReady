import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Briefcase, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  ArrowLeft,
  AlertCircle,
  Code2,
  FileCode,
  Copy,
  Download,
  Upload,
  Check,
  RefreshCw
} from 'lucide-react';
import type { User, UserProgress } from '../backend/models/types.ts';

interface LoginPageProps {
  onSuccess: (user: User, progress: UserProgress) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'register' | 'json';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onCancel,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'json'>(initialMode);
  
  // Standard Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // JSON Input Mode States
  const defaultJsonTemplate = JSON.stringify({
    email: 'student@interviewready.com',
    password: 'password123'
  }, null, 2);

  const [jsonText, setJsonText] = useState(defaultJsonTemplate);
  const [jsonParsed, setJsonParsed] = useState<any>(null);
  const [jsonSyntaxError, setJsonSyntaxError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Request States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live JSON validation & parsing
  useEffect(() => {
    if (mode === 'json') {
      try {
        const trimmed = jsonText.trim();
        if (!trimmed) {
          setJsonParsed(null);
          setJsonSyntaxError('JSON payload cannot be empty.');
          return;
        }
        const parsed = JSON.parse(trimmed);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          setJsonParsed(null);
          setJsonSyntaxError('JSON must be a valid key-value object { ... }');
          return;
        }
        setJsonParsed(parsed);
        setJsonSyntaxError(null);
      } catch (err: any) {
        setJsonParsed(null);
        setJsonSyntaxError(err.message || 'Invalid JSON syntax');
      }
    }
  }, [jsonText, mode]);

  // Format JSON code cleanly
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonSyntaxError(null);
    } catch (err: any) {
      setJsonSyntaxError('Cannot format: ' + err.message);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interviewready_login.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload .json file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          setJsonText(JSON.stringify(parsed, null, 2));
          setMode('json');
          setError(null);
        } catch (err) {
          setError('The uploaded file does not contain valid JSON.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Load JSON templates
  const loadJsonTemplate = (templateType: 'student' | 'analyst' | 'new_engineer' | 'minimal') => {
    setError(null);
    if (templateType === 'student') {
      setJsonText(JSON.stringify({
        email: 'student@interviewready.com',
        password: 'password123'
      }, null, 2));
    } else if (templateType === 'analyst') {
      setJsonText(JSON.stringify({
        email: 'priya@interviewready.com',
        password: 'password123'
      }, null, 2));
    } else if (templateType === 'new_engineer') {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setJsonText(JSON.stringify({
        name: `Jordan Lee ${randomSuffix}`,
        email: `jordan.lee${randomSuffix}@example.com`,
        password: 'password123',
        targetRole: 'Full Stack Engineer'
      }, null, 2));
    } else if (templateType === 'minimal') {
      setJsonText(JSON.stringify({
        username: 'guest@interviewready.com',
        secret: 'guest'
      }, null, 2));
    }
  };

  // Submit JSON credentials to backend
  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (jsonSyntaxError || !jsonParsed) {
      setError(`Cannot authenticate: Please fix JSON syntax error (${jsonSyntaxError || 'Invalid JSON'})`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/json', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jsonParsed)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'JSON Authentication failed.');
      }

      setSuccessMessage(data.message || `Welcome, ${data.user?.name || 'User'}!`);
      
      setTimeout(() => {
        onSuccess(data.user, data.progress);
      }, 500);
    } catch (err: any) {
      console.error('JSON Auth error:', err);
      setError(err.message || 'JSON authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill with Demo Account
  const handleQuickDemo = async (demoType: 'student' | 'analyst' | 'guest') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: demoType })
      });

      if (!res.ok) {
        throw new Error('Failed to load demo profile');
      }

      const data = await res.json();
      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onSuccess(data.user, data.progress);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit standard email/password form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password, targetRole };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      setSuccessMessage(mode === 'login' ? `Welcome back, ${data.user.name}!` : `Account created! Welcome, ${data.user.name}!`);
      
      setTimeout(() => {
        onSuccess(data.user, data.progress);
      }, 600);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Unable to connect to login service.');
    } finally {
      setLoading(false);
    }
  };

  // Convert current standard inputs to JSON tab
  const handleSwitchToCurrentInputsAsJson = () => {
    const currentObj: any = {
      email: email || 'student@interviewready.com',
      password: password || 'password123'
    };
    if (name) currentObj.name = name;
    if (targetRole) currentObj.targetRole = targetRole;

    setJsonText(JSON.stringify(currentObj, null, 2));
    setMode('json');
  };

  const targetRoleOptions = [
    'Software Engineer',
    'Frontend / Web Developer',
    'Data & Business Analyst',
    'Product / Project Manager',
    'Marketing & Growth Associate',
    'Finance & Consulting Analyst',
    'Customer Success / Operations'
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Branding & Highlights Column (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative space-y-6">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Practice</span>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="font-heading font-extrabold text-xl text-white">
                  Interview<span className="text-blue-400">Ready</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-white mt-4 leading-snug">
                JSON-Ready English Interview Coach
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
                Log in via classic form or direct <strong>JSON payload</strong> to sync your interview performance, track speaking metrics, and link candidate records to Google Sheets.
              </p>
            </div>

            {/* Value bullets */}
            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Supports Direct JSON &amp; File Import</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Save module milestones &amp; daily streaks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Detailed grammar &amp; power verb feedback</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live sync to Google Sheets candidate tables</span>
              </div>
            </div>
          </div>

          {/* JSON Friendly Badge */}
          <div className="relative pt-6 border-t border-white/10 text-xs text-blue-200">
            <div className="flex items-center gap-2 font-mono text-[11px] bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Code2 className="w-3.5 h-3.5 text-blue-300" />
              <span>API Endpoint: POST /api/auth/json</span>
            </div>
          </div>
        </div>

        {/* Right Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Mode Switcher Tabs (Sign In, Create Account, JSON Login) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  mode === 'login'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  mode === 'register'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setMode('json'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  mode === 'json'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-700 hover:text-blue-900 bg-blue-50/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Login</span>
                <span className="text-[9px] px-1 py-0.2 bg-emerald-500 text-white rounded font-mono">NEW</span>
              </button>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Hidden JSON file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json,application/json,text/plain" 
              className="hidden" 
            />

            {/* ======================================================== */}
            {/* TAB 3: DEDICATED JSON LOGIN INTERFACE                    */}
            {/* ======================================================== */}
            {mode === 'json' ? (
              <form onSubmit={handleJsonSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>Raw JSON Credentials Payload</span>
                  </div>

                  {/* JSON Syntax Badge */}
                  {jsonSyntaxError ? (
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Syntax Error</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Valid JSON Object</span>
                    </span>
                  )}
                </div>

                {/* JSON Quick Presets Bar */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Templates:</span>
                  <button
                    type="button"
                    onClick={() => loadJsonTemplate('student')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-mono transition-colors cursor-pointer"
                  >
                    Alex (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadJsonTemplate('analyst')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-mono transition-colors cursor-pointer"
                  >
                    Priya (Analyst)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadJsonTemplate('new_engineer')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-mono transition-colors cursor-pointer"
                  >
                    New Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload .json</span>
                  </button>
                </div>

                {/* Monospace JSON Textarea */}
                <div className="relative">
                  <textarea
                    rows={7}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{&#10;  "email": "student@interviewready.com",&#10;  "password": "password123"&#10;}'
                    className={`w-full font-mono text-xs sm:text-sm p-3.5 rounded-xl border ${
                      jsonSyntaxError ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-blue-500 bg-slate-900 text-emerald-400'
                    } focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed resize-y`}
                    spellCheck={false}
                  />

                  {/* Actions inside textarea toolbar */}
                  <div className="absolute right-2.5 bottom-3.5 flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-xs p-1 rounded-lg border border-slate-700 text-slate-300 text-[10px]">
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      title="Format & Indent JSON"
                      className="px-1.5 py-0.5 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                      Format
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      title="Copy to clipboard"
                      className="px-1.5 py-0.5 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      title="Download JSON file"
                      className="px-1.5 py-0.5 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Parsed JSON Preview Details */}
                {jsonParsed && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>Parsed Credentials Summary:</span>
                      <span className="text-[10px] text-blue-600 font-mono">
                        {jsonParsed.name || jsonParsed.action === 'register' ? 'Mode: Auto-Register' : 'Mode: Login'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 text-[11px] pt-1 font-mono">
                      <div>Email: <span className="text-slate-900 font-semibold">{jsonParsed.email || jsonParsed.username || 'None'}</span></div>
                      <div>Password: <span className="text-slate-900 font-semibold">{jsonParsed.password ? '••••••••' : 'None'}</span></div>
                      {jsonParsed.name && <div>Name: <span className="text-slate-900 font-semibold">{jsonParsed.name}</span></div>}
                      {jsonParsed.targetRole && <div>Role: <span className="text-slate-900 font-semibold">{jsonParsed.targetRole}</span></div>}
                    </div>
                  </div>
                )}

                {/* Submit JSON Button */}
                <button
                  type="submit"
                  disabled={loading || Boolean(jsonSyntaxError)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating via JSON...</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-4 h-4" />
                      <span>Submit JSON Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ======================================================== */
              /* TABS 1 & 2: STANDARD SIGN IN & REGISTRATION FORMS        */
              /* ======================================================== */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none text-slate-800 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Job Role / Field
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <select
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none text-slate-800 transition-all bg-white cursor-pointer"
                        >
                          {targetRoleOptions.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@interviewready.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none text-slate-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleSwitchToCurrentInputsAsJson}
                      className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Edit as JSON</span>
                    </button>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In' : 'Create My Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Login Preset Bar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ⚡ Instant One-Click Demo Profiles (Zero Typing Required):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <span>👨‍💻 Alex Morgan</span>
                    <span className="text-[10px] bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded font-mono">student@...</span>
                  </div>
                  <div className="text-[11px] text-blue-700">Software Engineer • 8.4 avg score</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('analyst')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <span>📊 Priya Sharma</span>
                    <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-1.5 py-0.2 rounded font-mono">priya@...</span>
                  </div>
                  <div className="text-[11px] text-indigo-700">Business Analyst • 8.9 avg score</div>
                </button>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('guest')}
                  disabled={loading}
                  className="text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
                >
                  Continue as Guest (Clean Slate)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('json');
                    loadJsonTemplate('student');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Inspect JSON Payload</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
