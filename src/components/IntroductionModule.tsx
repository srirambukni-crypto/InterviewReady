import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Volume2, 
  Copy, 
  Check
} from 'lucide-react';
import { FeedbackResult } from '../backend/models/types.ts';
import { FeedbackCard } from './FeedbackCard.tsx';
import { playSpeech } from '../utils/speechUtils.ts';

interface IntroductionModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

const MODEL_ANSWERS = [
  {
    role: 'Software Engineer',
    framework: 'Present: Current expertise & role → Past: Key projects & milestones → Future: Passion for this role',
    text: "I am a frontend developer with two years of experience building responsive, user-friendly web applications in modern frameworks. Recently, I spearheaded the redesign of our client portal, which improved page load performance by thirty percent and increased user retention. Prior to that, I graduated in Computer Science with a focus on human-computer interaction and web accessibility standards. I am eager to join your team because of your pioneering open-source contributions and commitment to inclusive digital design."
  },
  {
    role: 'Business Analyst',
    framework: 'Present: Core analytical capabilities → Past: Quantifiable impact on operations → Future: Strategic growth goals',
    text: "I am an analytical business analyst with a proven track record of converting complex datasets into actionable operational strategies. In my previous role, I streamlined our weekly supply-chain forecasting reports, cutting reporting lag from four days to just under twelve hours. My academic background in economics and data visualization equipped me to bridge technical mechanics with high-level commercial objectives. I am excited about this role because your organization is scaling rapidly, and I want to leverage my analytical diligence to support your data-driven decision making."
  },
  {
    role: 'Project / Marketing Associate',
    framework: 'Present: Brand execution & coordination → Past: Multi-channel campaign results → Future: Cross-functional ambitions',
    text: "I am a proactive marketing coordinator who specializes in multi-channel brand campaigns and cross-functional team alignment. Over the past eighteen months, I managed our flagship product launch across digital media, driving a forty-five percent increase in inbound lead conversions. I pride myself on active stakeholder communication, methodical organization, and creative problem solving. I am thrilled by this opportunity with your team because your customer-first culture aligns directly with my professional ethos."
  }
];

export const IntroductionModule: React.FC<IntroductionModuleProps> = ({ onModuleCompleted }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('interviewready_intro_draft');
    if (savedDraft) {
      setUserInput(savedDraft);
    }
  }, []);

  // Save draft to localStorage on change
  const handleInputChange = (text: string) => {
    setUserInput(text);
    localStorage.setItem('interviewready_intro_draft', text);
  };

  // Sentence count and word count
  const wordCount = userInput.trim() ? userInput.trim().split(/\s+/).length : 0;
  const sentenceCount = userInput.trim() 
    ? (userInput.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (userInput.trim().length > 0 ? 1 : 0)
    : 0;

  // Web Speech API recognition for voice input
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please type your answer or use Google Chrome/Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        handleInputChange(transcript.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!userInput.trim()) {
      setError('Please write or speak your 4-5 sentence self-introduction first.');
      return;
    }

    if (wordCount < 15) {
      setError('Your introduction is quite short. Aim for 4-5 sentences (around 50-90 words) to cover Present, Past, and Future.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'introduction',
          question: 'Tell me about yourself and your professional journey (4-5 sentences).',
          answer: userInput.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: FeedbackResult = await res.json();
      setFeedback(data);

      // Save to localStorage progress
      onModuleCompleted('intro', data.score);
    } catch (err: any) {
      console.error('Failed to get introduction feedback:', err);
      setError(err.message || 'Unable to connect to feedback service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyModel = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseModelAsTemplate = (text: string) => {
    handleInputChange(text);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Module 1: Self-Introduction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            The 90-Second "Tell Me About Yourself"
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Recruiters judge confidence within the first 60 seconds. Structure your introduction into 
            <strong> 4–5 sentences</strong> using the proven <em>Present-Past-Future</em> framework.
          </p>
        </div>

        {/* Framework tooltip banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1 sm:max-w-xs shrink-0">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>The 4-5 Sentence Formula</span>
          </div>
          <p>• Sentence 1-2: Who you are & current role (Present)</p>
          <p>• Sentence 3-4: Major achievement or background (Past)</p>
          <p>• Sentence 5: Why this company & role (Future)</p>
        </div>
      </div>

      {/* Main 2-Column Grid: User Writing Area & Model Answer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: User Interactive Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="intro-text" className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <span>Write Your Self-Introduction</span>
                <span className="text-xs font-normal text-slate-500">(Target: 4–5 sentences)</span>
              </label>

              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isListening ? 'Click to stop recording' : 'Click to dictate via microphone'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-slate-600" />
                    <span>Dictate with Mic</span>
                  </>
                )}
              </button>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="intro-text"
                rows={7}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Example: I am a passionate software developer with two years of experience building responsive web apps. Recently, I led a project that improved site speed by 30%. Before that, I graduated with a degree in Computer Science. I am excited about this role because your mission to build accessible software resonates with my career values..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm leading-relaxed outline-none transition-all resize-y"
              />
            </div>

            {/* Counters and Reset Bar */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-4">
                <span>
                  Words: <strong className="text-slate-800">{wordCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  Sentences: <strong className={`font-bold ${sentenceCount >= 4 && sentenceCount <= 6 ? 'text-emerald-600' : 'text-slate-800'}`}>{sentenceCount}</strong>
                  {sentenceCount >= 4 && sentenceCount <= 6 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </span>
              </div>

              {userInput && (
                <button
                  onClick={() => handleInputChange('')}
                  className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleGetFeedback}
              disabled={loading || !userInput.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                loading || !userInput.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Grammar, Vocabulary & Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Feedback & Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Sample Model Answer Beside It (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm font-heading">Sample Model Answers</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Field Examples</span>
            </div>

            {/* Model Role Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
              {MODEL_ANSWERS.map((model, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedModelIdx(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center cursor-pointer truncate ${
                    selectedModelIdx === idx
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {model.role}
                </button>
              ))}
            </div>

            {/* Selected Model Content Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="text-[11px] text-blue-700 font-medium bg-blue-50 p-2 rounded-lg border border-blue-100">
                <strong>Structure:</strong> {MODEL_ANSWERS[selectedModelIdx].framework}
              </div>

              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                "{MODEL_ANSWERS[selectedModelIdx].text}"
              </p>

              {/* Action buttons on model answer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => playSpeech(MODEL_ANSWERS[selectedModelIdx].text)}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Model</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyModel(MODEL_ANSWERS[selectedModelIdx].text)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copy text to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleUseModelAsTemplate(MODEL_ANSWERS[selectedModelIdx].text)}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Use as Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Coaching Tip */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-normal">
              <strong>Coach's Golden Rule:</strong> Never recount your entire autobiography. Recruiters only care about: what you do now, one concrete win, and why you are in this room today.
            </div>
          </div>
        </div>
      </div>

      {/* Structured Feedback Section (renders when feedback is available) */}
      {feedback && (
        <div className="pt-4 scroll-mt-24">
          <FeedbackCard
            feedback={feedback}
            title="Self-Introduction Feedback"
            continueText="Refine Introduction or Move to Next Module"
            onContinue={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>
      )}
    </div>
  );
};
