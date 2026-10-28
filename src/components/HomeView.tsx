import React from 'react';
import { 
  UserCheck, 
  HelpCircle, 
  Puzzle, 
  BookOpen, 
  Mic, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  TrendingUp, 
  ShieldCheck,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { NavTab } from './Navbar.tsx';
import { UserProgress } from '../backend/models/types.ts';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  progress: UserProgress;
  onOpenSheets?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, progress, onOpenSheets }) => {
  const completedSet = new Set(progress.completedModules || []);

  const modules = [
    {
      id: 'intro' as NavTab,
      title: '1. Self-Introduction',
      subtitle: 'The 90-Second "Tell Me About Yourself"',
      description: 'Draft your introduction using the Present-Past-Future formula. Get instant grammar and vocabulary polish alongside real-world model answers.',
      icon: UserCheck,
      color: 'from-blue-500 to-indigo-600',
      timeEstimate: '5 mins',
      isCompleted: completedSet.has('intro') || completedSet.has('introduction')
    },
    {
      id: 'questions' as NavTab,
      title: '2. Common Questions',
      subtitle: 'Strengths, Weaknesses, Goals & Fit',
      description: 'Practice 20+ foundational questions. Learn what recruiters evaluate and formulate high-impact, persuasive answers.',
      icon: HelpCircle,
      color: 'from-sky-500 to-blue-600',
      timeEstimate: '10 mins',
      isCompleted: completedSet.has('questions') || completedSet.has('question')
    },
    {
      id: 'sentences' as NavTab,
      title: '3. Sentence Builder',
      subtitle: 'STAR Framework & Syntax Drills',
      description: 'Rearrange jumbled words and fill blanks to master professional sentence structure, polite disagreement, and assertive phrasing.',
      icon: Puzzle,
      color: 'from-indigo-500 to-violet-600',
      timeEstimate: '8 mins',
      isCompleted: completedSet.has('sentences') || completedSet.has('sentence')
    },
    {
      id: 'vocab' as NavTab,
      title: '4. Professional Vocabulary',
      subtitle: '30+ Power Verbs & Flashcards',
      description: 'Upgrade basic phrases like "did good" to "spearheaded and streamlined". Flip 3D flashcards with audio pronunciation and test yourself.',
      icon: BookOpen,
      color: 'from-cyan-600 to-blue-700',
      timeEstimate: '7 mins',
      isCompleted: completedSet.has('vocab') || completedSet.has('vocabulary')
    },
    {
      id: 'fluency' as NavTab,
      title: '5. Pronunciation & Fluency',
      subtitle: 'Live Voice & Filler-Word Analyzer',
      description: 'Speak into your microphone with live speech recognition. Measure your Words Per Minute (WPM), detect filler words ("um", "uh"), and track pauses.',
      icon: Mic,
      color: 'from-blue-600 to-teal-600',
      timeEstimate: '6 mins',
      isCompleted: completedSet.has('fluency')
    },
    {
      id: 'mock' as NavTab,
      title: '6. Mock Interview',
      subtitle: 'Interactive AI Coach Simulation',
      description: 'Experience a live chat interview. Answer by speaking or typing, receive immediate feedback after every answer, and get a final report card.',
      icon: MessageSquare,
      color: 'from-indigo-600 to-blue-800',
      timeEstimate: '12 mins',
      isCompleted: completedSet.has('mock')
    }
  ];

  const completedCount = modules.filter(m => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl border border-blue-800/50">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI English Communication Coach for Job Seekers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
            Speak with Confidence. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
              Ace Your Interview in English.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
            Overcome language anxiety and present your skills with executive polish. 
            Receive real-time feedback on your grammar, high-impact word choices, speech pace, and answer structure from our virtual English coach.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('intro')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Start Practising</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('mock')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <MessageSquare className="w-4 h-4 text-blue-300" />
              <span>Full Mock Simulation</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Sign In / Profile</span>
            </button>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Grammar Diffs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Power Word Upgrades</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Speech Pace & WPM</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>STAR Method Coaching</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Milestone Overview Card */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold font-heading text-slate-900">Your Interview Readiness Roadmap</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete each focused module to build full fluency, from self-introductions to full mock simulations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-2xl font-black text-blue-600 leading-none">{progressPercent}%</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
          <span>{completedCount} of 6 Modules Mastered</span>
          <span>
            {completedCount === 6 ? 'Interview Ready! Ready for real job rounds.' : `${6 - completedCount} remaining to achieve full mastery`}
          </span>
        </div>
      </section>

      {/* Modules Cards Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900">Training Modules</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select any module below to begin targeted practice.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => onNavigate(m.id)}
                className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar with Icon & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {m.isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mastered</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {m.timeEstimate}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-heading">
                    {m.title}
                  </h3>
                  <div className="text-xs font-semibold text-blue-600 mb-2">
                    {m.subtitle}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {m.description}
                  </p>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>{m.isCompleted ? 'Review & Practice Again' : 'Start Module'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Practice Flow / Tip Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/70 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Recommended 15-Minute Daily Routine</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
              How to maximize your English communication results
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Step 1: Learn 3 new power verbs in <strong>Vocabulary</strong>. <br className="hidden sm:inline" />
              Step 2: Rehearse your answer aloud in <strong>Pronunciation & Fluency</strong> to check your speaking speed. <br className="hidden sm:inline" />
              Step 3: Test your spontaneity in the <strong>Mock Interview</strong> simulator.
            </p>
          </div>

          <button
            onClick={() => onNavigate('mock')}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
          >
            <span>Launch Mock Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Google Sheets Database Link Card */}
      {onOpenSheets && (
        <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Google Sheets Integration</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Export Candidate Records & Speech Metrics to Google Drive
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
                Link the InterviewReady candidate database to a styled Google Spreadsheet in your Google Drive. 
                Keep track of registered users, module milestones, and practice feedback history with live one-click syncing.
              </p>
            </div>

            <button
              onClick={onOpenSheets}
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Link to Google Sheets</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
