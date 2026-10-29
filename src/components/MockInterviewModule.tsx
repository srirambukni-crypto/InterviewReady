import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Award, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  User,
  GraduationCap
} from 'lucide-react';
import type { FeedbackResult } from '../backend/models/types.ts';
import { FeedbackCard } from './FeedbackCard.tsx';
import { playSpeech } from '../utils/speechUtils.ts';

interface MockInterviewModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'coach' | 'user';
  text: string;
  feedback?: FeedbackResult;
  timestamp: string;
}

export const MockInterviewModule: React.FC<MockInterviewModuleProps> = ({ onModuleCompleted }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Start a new mock session on mount
  const handleStartSession = async () => {
    setIsInitializing(true);
    setError(null);
    setMessages([]);
    setIsCompleted(false);
    setFinalSummary(null);
    setCurrentQuestionIndex(0);

    try {
      const res = await fetch('/api/mock/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionCount: 4 })
      });

      if (!res.ok) throw new Error('Failed to start interview session');
      const data = await res.json();

      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(0);
      setTotalQuestions(data.totalQuestions);

      // Add coach initial message
      const initialMsgs: ChatMessage[] = [
        {
          id: 'msg-greeting',
          sender: 'coach',
          text: data.coachGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-q-0',
          sender: 'coach',
          text: data.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setMessages(initialMsgs);

      // Speak question
      playSpeech(`${data.coachGreeting} ${data.question}`);
    } catch (err: any) {
      console.error('Error starting mock interview:', err);
      setError('Could not connect to mock interview service.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    handleStartSession();
  }, []);

  // Web speech microphone recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
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
        setUserInput(transcript.trim());
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!userInput.trim() || !sessionId) return;

    const userText = userInput.trim();
    setUserInput('');
    setLoading(true);
    setError(null);

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/mock/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answer: userText
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await res.json();

      // Attach feedback to user message or coach response
      const coachFeedbackMsg: ChatMessage = {
        id: `msg-coach-feedback-${Date.now()}`,
        sender: 'coach',
        text: `Feedback for Question ${currentQuestionIndex + 1} (Score: ${data.feedback.score}/10):`,
        feedback: data.feedback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (data.isComplete) {
        // Mock interview completed!
        setIsCompleted(true);
        setFinalSummary(data.finalSummary);

        const farewellMsg: ChatMessage = {
          id: `msg-farewell-${Date.now()}`,
          sender: 'coach',
          text: data.coachFarewell,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, coachFeedbackMsg, farewellMsg]);
        playSpeech(data.coachFarewell);

        onModuleCompleted('mock', data.finalSummary?.overallScore || 8);
      } else {
        // Next question
        setCurrentQuestionIndex(data.nextQuestionIndex);
        setCurrentQuestion(data.nextQuestion);

        const nextQMsg: ChatMessage = {
          id: `msg-q-${data.nextQuestionIndex}`,
          sender: 'coach',
          text: data.nextQuestion,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, coachFeedbackMsg, nextQMsg]);
        playSpeech(data.nextQuestion);
      }
    } catch (err: any) {
      console.error('Error submitting answer in mock interview:', err);
      setError(err.message || 'Failed to send answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Module 6: Mock Interview Simulator</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Live Conversational English Interview Simulation
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Engage with an experienced virtual recruiter. Answer one question at a time by typing or speaking, 
              receive targeted communication feedback after each turn, and view your final score summary card.
            </p>
          </div>

          <button
            onClick={handleStartSession}
            disabled={isInitializing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Session</span>
          </button>
        </div>
      </div>

      {/* Round Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            Q{Math.min(currentQuestionIndex + 1, totalQuestions)}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {isCompleted ? 'Interview Concluded' : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            </div>
            <div className="text-[11px] text-slate-500">
              {isCompleted ? 'Review your final assessment below' : 'Take your time to articulate clearly'}
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < currentQuestionIndex || isCompleted
                  ? 'bg-emerald-500'
                  : i === currentQuestionIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="bg-slate-50/70 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isInitializing ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to virtual English interview room...</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isCoach = msg.sender === 'coach';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isCoach ? 'justify-start' : 'justify-end'}`}
                >
                  {isCoach && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isCoach
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                          : 'bg-blue-600 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                        <span className="font-semibold uppercase">{isCoach ? 'Coach' : 'Candidate'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {isCoach && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => playSpeech(msg.text)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Hear Voice</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Feedback block nested in chat */}
                    {msg.feedback && (
                      <div className="mt-2">
                        <FeedbackCard
                          feedback={msg.feedback}
                          title="Instant Coach Evaluation"
                        />
                      </div>
                    )}
                  </div>

                  {!isCoach && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Coach is analyzing your English response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar or Completed State */}
        <div className="bg-white border-t border-slate-200 p-4">
          {error && (
            <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isCompleted ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isListening ? 'Stop recording' : 'Dictate with microphone'}
              >
                {isListening ? <MicOff className="w-5 h-5 text-rose-600" /> : <Mic className="w-5 h-5 text-slate-600" />}
              </button>

              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                disabled={loading || isInitializing}
                placeholder="Type or speak your answer to the coach..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none text-slate-800 transition-all"
              />

              <button
                type="button"
                onClick={handleSendAnswer}
                disabled={loading || !userInput.trim()}
                className={`p-3 rounded-xl font-semibold text-white transition-all shadow-sm cursor-pointer shrink-0 ${
                  loading || !userInput.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Send answer"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                You have completed this mock session! Review your final score summary below.
              </div>
              <button
                onClick={handleStartSession}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Start Another Simulation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FINAL SCORE SUMMARY CARD (shown at end of session) */}
      {finalSummary && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Mock Interview Assessment Completed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                Overall Interview Readiness Card
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Comprehensive evaluation synthesized from your answers across all 4 interview rounds.
              </p>
            </div>

            {/* Big Overall Score Meter */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0">
              <div className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">Overall Score</div>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 font-heading">
                {finalSummary.overallScore}
                <span className="text-base text-blue-200 font-medium">/10</span>
              </div>
            </div>
          </div>

          {/* Sub-Score Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grammar Precision</span>
              <div className="text-2xl font-bold text-slate-900">{finalSummary.grammarScore}/10</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${finalSummary.grammarScore * 10}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vocabulary Richness</span>
              <div className="text-2xl font-bold text-slate-900">{finalSummary.vocabularyScore}/10</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${finalSummary.vocabularyScore * 10}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Speech Fluency</span>
              <div className="text-2xl font-bold text-slate-900">{finalSummary.fluencyScore}/10</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${finalSummary.fluencyScore * 10}%` }} />
              </div>
            </div>
          </div>

          {/* Key Strengths & Areas for Improvement 2-col */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Communication Strengths</span>
              </div>
              <ul className="space-y-2">
                {finalSummary.keyStrengths?.map((st: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Key Areas for Refinement</span>
              </div>
              <ul className="space-y-2">
                {finalSummary.areasForImprovement?.map((area: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Coach's Recommended Next Steps:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {finalSummary.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
