import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Home, 
  UserCheck, 
  HelpCircle, 
  Puzzle, 
  BookOpen, 
  Mic, 
  MessageSquare,
  Volume2,
  VolumeX,
  Flame,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  LogIn,
  FileSpreadsheet,
  Code2
} from 'lucide-react';
import { stopSpeech } from '../utils/speechUtils.ts';
import type { User } from '../backend/models/types.ts';

export type NavTab = 'home' | 'intro' | 'questions' | 'sentences' | 'vocab' | 'fluency' | 'mock' | 'login';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  completedModulesCount: number;
  totalModulesCount?: number;
  streakDays?: number;
  currentUser: User | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenJsonLogin?: () => void;
  onSwitchDemo: (demoType: 'student' | 'analyst' | 'guest') => void;
  onOpenSheets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  completedModulesCount,
  totalModulesCount = 6,
  streakDays = 1,
  currentUser,
  onLogout,
  onOpenLogin,
  onOpenJsonLogin,
  onSwitchDemo,
  onOpenSheets
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(100, Math.round((completedModulesCount / totalModulesCount) * 100));

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'intro', label: 'Self-Introduction', icon: UserCheck },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'sentences', label: 'Sentence Builder', icon: Puzzle },
    { id: 'vocab', label: 'Vocabulary', icon: BookOpen },
    { id: 'fluency', label: 'Pronunciation', icon: Mic },
    { id: 'mock', label: 'Mock Interview', icon: MessageSquare },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab: NavTab) => {
    stopSpeech();
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const toggleSound = () => {
    if (soundEnabled) {
      stopSpeech();
    }
    setSoundEnabled(!soundEnabled);
  };

  const isGuest = !currentUser || currentUser.id === 'default-user' || currentUser.email === 'guest@interviewready.com';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Progress Bar */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">Interview</span>
                <span className="font-heading font-extrabold text-lg text-blue-600">Ready</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block -mt-0.5">
                English Coach
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status (Progress, Streak & User Login) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Progress badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-500 font-medium">Completed:</span>
              <span className="font-bold text-blue-700">
                {completedModulesCount}/{totalModulesCount}
              </span>
              <span className="text-slate-400">({percentage}%)</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Voice toggle */}
            <button
              onClick={toggleSound}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title={soundEnabled ? 'Speech audio active' : 'Audio stopped'}
              aria-label="Toggle audio assistance"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Google Sheets button */}
            <button
              onClick={onOpenSheets}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Link user details & scores to Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Google Sheets</span>
            </button>

            {/* User Profile / Login Button */}
            {currentUser && !isGuest ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-semibold text-slate-800 line-clamp-1 block max-w-[100px]">
                      {currentUser.name}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 px-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-slate-100 pb-2.5">
                      <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      {currentUser.targetRole && (
                        <div className="mt-1 inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          🎯 {currentUser.targetRole}
                        </div>
                      )}
                    </div>

                    {/* Switch accounts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Switch Demo Profile
                      </span>
                      <button
                        onClick={() => { onSwitchDemo('student'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                      >
                        <span>👨‍💻 Alex Morgan (Software)</span>
                        <span className="text-[10px] text-slate-400">8.4 avg</span>
                      </button>
                      <button
                        onClick={() => { onSwitchDemo('analyst'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                      >
                        <span>📊 Priya Sharma (Analyst)</span>
                        <span className="text-[10px] text-slate-400">8.9 avg</span>
                      </button>
                    </div>

                    {/* Google Sheets link */}
                    <div className="border-t border-slate-100 pt-1.5 pb-1">
                      <button
                        type="button"
                        onClick={() => { onOpenSheets(); setUserDropdownOpen(false); }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link to Google Sheets</span>
                      </button>
                    </div>

                    {/* JSON Mode shortcut in dropdown */}
                    <div className="border-t border-slate-100 pt-1.5 pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenJsonLogin) onOpenJsonLogin();
                          else onOpenLogin();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-blue-50 text-blue-700 font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>JSON Credentials Mode</span>
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                        className="w-full text-left text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-2 py-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out / Switch Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenJsonLogin || onOpenLogin}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-bold text-xs transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
                  title="JSON-friendly Login: Paste or import candidate JSON details"
                >
                  <Code2 className="w-3 h-3 text-blue-600" />
                  <span>{`{ } JSON`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* User Status Bar in mobile drawer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            {currentUser && !isGuest ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {getInitials(currentUser.name)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.targetRole || currentUser.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Guest User</span>
              </div>
            )}

            {currentUser && !isGuest ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Google Sheets button in mobile */}
          <button
            type="button"
            onClick={() => { onOpenSheets(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Link Database to Google Sheets</span>
          </button>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500">
              Module Progress: <strong className="text-blue-700">{completedModulesCount}/{totalModulesCount} ({percentage}%)</strong>
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {streakDays} Day Streak
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
