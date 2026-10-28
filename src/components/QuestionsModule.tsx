import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { InterviewQuestion, FeedbackResult } from '../backend/models/types.ts';
import { FeedbackCard } from './FeedbackCard.tsx';
import { playSpeech } from '../utils/speechUtils.ts';

interface QuestionsModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

export const QuestionsModule: React.FC<QuestionsModuleProps> = ({ onModuleCompleted }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'strengths', label: 'Strengths' },
    { id: 'weaknesses', label: 'Weaknesses' },
    { id: 'goals', label: 'Career Goals' },
    { id: 'why-hire-you', label: 'Why Hire You' },
    { id: 'introduction', label: 'Introduction' }
  ];

  // Fetch questions from backend
  useEffect(() => {
    async function loadQuestions() {
      try {
        setFetchingQuestions(true);
        const url = selectedCategory === 'all' 
          ? '/api/questions' 
          : `/api/questions?category=${encodeURIComponent(selectedCategory)}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load interview questions');
        const data = await res.json();
        setQuestions(data.questions || []);

        // Default select first question if none selected or if category changed
        if (data.questions && data.questions.length > 0) {
          setSelectedQuestion(data.questions[0]);
          setUserAnswer('');
          setFeedback(null);
          setShowModelAnswer(false);
        }
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError('Could not load questions from server. Please refresh.');
      } finally {
        setFetchingQuestions(false);
      }
    }

    loadQuestions();
  }, [selectedCategory]);

  // Voice speech-to-text
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please type your answer.');
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
        setUserAnswer(transcript.trim());
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion) return;
    if (!userAnswer.trim()) {
      setError('Please type or record an answer before requesting feedback.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'question',
          question: selectedQuestion.question,
          answer: userAnswer.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed with status ${res.status}`);
      }

      const data: FeedbackResult = await res.json();
      setFeedback(data);

      onModuleCompleted('questions', data.score);
    } catch (err: any) {
      console.error('Error submitting question answer:', err);
      setError(err.message || 'Unable to connect to feedback service.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Module 2: Common Interview Questions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Strategic Answers for the Top Interview Questions
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Recruiters ask behavioral questions to test your self-awareness, problem solving, and ability to handle pressure. 
          Pick a question, structure your response, and receive detailed English communication coaching.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Available Questions ({questions.length})</span>
          </div>

          {fetchingQuestions ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading questions...
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {questions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestion(q);
                      setUserAnswer('');
                      setFeedback(null);
                      setShowModelAnswer(false);
                      setError(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer text-xs flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {q.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{q.difficulty}</span>
                      </div>
                      <p className={`font-semibold line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {q.question}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Question Workspace & Input (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedQuestion ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              {/* Question Header Card */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                    Category: {selectedQuestion.category.toUpperCase()}
                  </span>
                  <button
                    onClick={() => playSpeech(selectedQuestion.question)}
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors cursor-pointer"
                    title="Listen to interviewer voice"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Question</span>
                  </button>
                </div>

                <h2 className="text-lg sm:text-xl font-bold font-heading leading-snug">
                  "{selectedQuestion.question}"
                </h2>

                <div className="flex items-start gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10">
                  <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Interviewer Intent:</strong> {selectedQuestion.guidance}
                  </div>
                </div>
              </div>

              {/* Power Vocabulary Pill Row */}
              {selectedQuestion.keyVocabulary && selectedQuestion.keyVocabulary.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500">Recommended Power Words:</span>
                  {selectedQuestion.keyVocabulary.map((kw, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                      +{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* User Answer Textarea */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="question-answer" className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Your Response
                  </label>

                  {/* Dictate button */}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-slate-600" />
                        <span>Dictate Answer</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  id="question-answer"
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here or speak via microphone. Use the STAR method: describe the Situation, Task, Action you took, and quantifiable Result..."
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm leading-relaxed outline-none transition-all resize-y"
                />

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
                  {userAnswer && (
                    <button
                      onClick={() => setUserAnswer('')}
                      className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {error}
                </div>
              )}

              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="w-full sm:w-auto text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{showModelAnswer ? 'Hide Sample Model Answer' : 'View Sample Model Answer'}</span>
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !userAnswer.trim()}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                    loading || !userAnswer.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.01]'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Evaluating Communication...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Get Feedback & Score</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Model Answer */}
              {showModelAnswer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>High-Impact Model Response:</span>
                    </span>
                    <button
                      onClick={() => playSpeech(selectedQuestion.modelAnswer)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-200">
                    "{selectedQuestion.modelAnswer}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              Select a question from the left to start practising.
            </div>
          )}

          {/* Render Feedback */}
          {feedback && (
            <div className="pt-2">
              <FeedbackCard
                feedback={feedback}
                title={`Assessment for "${selectedQuestion?.question}"`}
                continueText="Practice Another Question"
                onContinue={() => {
                  // Move to next question if available
                  const currentIndex = questions.findIndex(q => q.id === selectedQuestion?.id);
                  if (currentIndex >= 0 && currentIndex < questions.length - 1) {
                    setSelectedQuestion(questions[currentIndex + 1]);
                    setUserAnswer('');
                    setFeedback(null);
                    setShowModelAnswer(false);
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
