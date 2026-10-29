import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { IntroductionModule } from './components/IntroductionModule.tsx';
import { QuestionsModule } from './components/QuestionsModule.tsx';
import { SentenceBuilderModule } from './components/SentenceBuilderModule.tsx';
import { VocabularyModule } from './components/VocabularyModule.tsx';
import { FluencyModule } from './components/FluencyModule.tsx';
import { MockInterviewModule } from './components/MockInterviewModule.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { GoogleSheetsIntegrationModal } from './components/GoogleSheetsIntegrationModal.tsx';
import type { User, UserProgress } from './backend/models/types.ts';
import { GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

const DEFAULT_GUEST: User = {
  id: 'default-user',
  name: 'Guest Candidate',
  email: 'guest@interviewready.com',
  targetRole: 'Job Applicant',
  createdAt: new Date().toISOString()
};

const INITIAL_PROGRESS: UserProgress = {
  userId: 'default-user',
  completedModules: [],
  totalPracticedAnswers: 0,
  averageScore: 0,
  streakDays: 1,
  lastPracticedAt: new Date().toISOString(),
  moduleScores: {},
  recentActivity: []
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [previousTab, setPreviousTab] = useState<NavTab>('home');
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register' | 'json'>('login');

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('interviewready_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_GUEST;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('interviewready_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROGRESS;
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // URL-based JSON authentication for programmatic & deep-link logins
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authJsonParam = params.get('authJson') || params.get('json') || params.get('loginJson');
      if (authJsonParam) {
        const decoded = decodeURIComponent(authJsonParam);
        fetch('/api/auth/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: decoded
        })
          .then(r => r.json())
          .then(data => {
            if (data.user && data.progress) {
              handleAuthSuccess(data.user, data.progress);
              showNotification(`Signed in via URL JSON as ${data.user.name}`);
              // Clean up query param without refreshing
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          })
          .catch(err => console.warn('URL JSON auth failed:', err));
      }
    } catch (e) {
      console.warn('URL search params parse error:', e);
    }
  }, []);

  // Sync user and progress with backend whenever currentUser changes
  useEffect(() => {
    async function fetchUserProgress(userId: string) {
      try {
        const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
          localStorage.setItem('interviewready_progress', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Could not sync progress with backend, operating from cache:', err);
      }
    }

    if (currentUser?.id) {
      fetchUserProgress(currentUser.id);
    }
  }, [currentUser?.id]);

  // Handle successful login or registration
  const handleAuthSuccess = (user: User, userProgress: UserProgress) => {
    setCurrentUser(user);
    setProgress(userProgress);
    localStorage.setItem('interviewready_current_user', JSON.stringify(user));
    localStorage.setItem('interviewready_progress', JSON.stringify(userProgress));
    showNotification(`Signed in as ${user.name} (${user.targetRole || 'Candidate'})`);
    setCurrentTab(previousTab === 'login' ? 'home' : previousTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(DEFAULT_GUEST);
    localStorage.removeItem('interviewready_current_user');
    showNotification('Logged out. Switched to guest mode.');
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick switch demo profile
  const handleSwitchDemo = async (demoType: 'student' | 'analyst' | 'guest') => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: demoType })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProgress(data.progress);
        localStorage.setItem('interviewready_current_user', JSON.stringify(data.user));
        localStorage.setItem('interviewready_progress', JSON.stringify(data.progress));
        showNotification(`Switched profile to ${data.user.name}`);
      }
    } catch (err) {
      console.error('Error switching demo:', err);
    }
  };

  // Callback whenever user completes or scores on a module
  const handleModuleCompleted = async (moduleName: string, score: number) => {
    setProgress(prev => {
      const completedSet = new Set(prev.completedModules || []);
      completedSet.add(moduleName);

      const newTotal = (prev.totalPracticedAnswers || 0) + 1;
      const prevSum = (prev.averageScore || 0) * (prev.totalPracticedAnswers || 0);
      const newAverage = Number(((prevSum + score) / newTotal).toFixed(1));

      const updatedScores = { ...(prev.moduleScores || {}), [moduleName]: score };

      const updated: UserProgress = {
        ...prev,
        userId: currentUser.id,
        completedModules: Array.from(completedSet),
        totalPracticedAnswers: newTotal,
        averageScore: newAverage,
        moduleScores: updatedScores,
        lastPracticedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('interviewready_progress', JSON.stringify(updated));
      } catch {}

      // Fire and forget background sync to server
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          completedModules: updated.completedModules,
          moduleScores: updated.moduleScores,
          totalPracticedAnswers: updated.totalPracticedAnswers,
          averageScore: updated.averageScore
        })
      }).catch(err => console.warn('Progress sync warning:', err));

      return updated;
    });
  };

  const completedCount = (progress.completedModules || []).length;

  const navigateToTab = (tab: NavTab) => {
    if (tab === 'login') {
      setPreviousTab(currentTab === 'login' ? 'home' : currentTab);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        completedModulesCount={completedCount}
        totalModulesCount={6}
        streakDays={progress.streakDays || 1}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => {
          setLoginInitialMode('login');
          navigateToTab('login');
        }}
        onOpenJsonLogin={() => {
          setLoginInitialMode('json');
          navigateToTab('login');
        }}
        onSwitchDemo={handleSwitchDemo}
        onOpenSheets={() => setIsSheetsModalOpen(true)}
      />

      {/* Google Sheets Linking Modal */}
      <GoogleSheetsIntegrationModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'login' && (
          <LoginPage
            initialMode={loginInitialMode}
            onSuccess={handleAuthSuccess}
            onCancel={() => navigateToTab('home')}
          />
        )}

        {currentTab === 'home' && (
          <HomeView
            onNavigate={navigateToTab}
            progress={progress}
            onOpenSheets={() => setIsSheetsModalOpen(true)}
          />
        )}

        {currentTab === 'intro' && (
          <IntroductionModule onModuleCompleted={handleModuleCompleted} />
        )}

        {currentTab === 'questions' && (
          <QuestionsModule onModuleCompleted={handleModuleCompleted} />
        )}

        {currentTab === 'sentences' && (
          <SentenceBuilderModule onModuleCompleted={handleModuleCompleted} />
        )}

        {currentTab === 'vocab' && (
          <VocabularyModule onModuleCompleted={handleModuleCompleted} />
        )}

        {currentTab === 'fluency' && (
          <FluencyModule onModuleCompleted={handleModuleCompleted} />
        )}

        {currentTab === 'mock' && (
          <MockInterviewModule onModuleCompleted={handleModuleCompleted} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-slate-900 text-sm">InterviewReady</span>
                <p className="text-xs text-slate-500">English Communication & Interview Mastery Platform</p>
              </div>
            </div>

            {/* Quick module links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <button onClick={() => navigateToTab('intro')} className="hover:text-blue-600 cursor-pointer">Self-Introduction</button>
              <button onClick={() => navigateToTab('questions')} className="hover:text-blue-600 cursor-pointer">Common Questions</button>
              <button onClick={() => navigateToTab('sentences')} className="hover:text-blue-600 cursor-pointer">Sentence Builder</button>
              <button onClick={() => navigateToTab('vocab')} className="hover:text-blue-600 cursor-pointer">Vocabulary</button>
              <button onClick={() => navigateToTab('fluency')} className="hover:text-blue-600 cursor-pointer">Fluency Tracker</button>
              <button onClick={() => navigateToTab('mock')} className="hover:text-blue-600 cursor-pointer">Mock Interview</button>
              <button onClick={() => navigateToTab('login')} className="hover:text-blue-600 cursor-pointer font-bold text-blue-700">Account / Login</button>
            </div>

            <div className="text-xs text-slate-400">
              {currentUser && currentUser.id !== 'default-user' ? (
                <span>Signed in as <strong className="text-slate-600">{currentUser.name}</strong></span>
              ) : (
                <span>Guest Session</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
