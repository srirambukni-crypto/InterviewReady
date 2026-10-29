import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Award,
  HelpCircle
} from 'lucide-react';
import type { VocabularyWord } from '../backend/models/types.ts';
import { playSpeech } from '../utils/speechUtils.ts';

interface VocabularyModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

export const VocabularyModule: React.FC<VocabularyModuleProps> = ({ onModuleCompleted }) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalQuizzed, setTotalQuizzed] = useState(0);

  // Fetch vocabulary from backend
  useEffect(() => {
    async function loadVocab() {
      try {
        setLoading(true);
        const res = await fetch('/api/vocabulary');
        if (!res.ok) throw new Error('Failed to load vocabulary');
        const data = await res.json();
        setWords(data.vocabulary || []);
      } catch (err) {
        console.error('Error fetching vocabulary:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVocab();
  }, []);

  // Filtered list
  const filteredWords = selectedCategory === 'all'
    ? words
    : words.filter(w => w.category === selectedCategory);

  const currentWord = filteredWords[currentIndex] || filteredWords[0];

  const handleNextWord = () => {
    setIsFlipped(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevWord = () => {
    setIsFlipped(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredWords.length - 1);
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(optionIdx);
    setQuizSubmitted(true);
    setTotalQuizzed(prev => prev + 1);

    const isCorrect = optionIdx === currentWord.quiz.correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      onModuleCompleted('vocab', 9);
    } else {
      onModuleCompleted('vocab', 7);
    }
  };

  const categories = ['all', 'Impact Verbs', 'Leadership', 'Problem Solving', 'Collaboration', 'Work Ethic'];

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading 30+ Professional Vocabulary Flashcards...</p>
      </div>
    );
  }

  if (!currentWord) {
    return <div className="p-12 text-center text-slate-500">No words found in this category.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Module 4: Professional Vocabulary</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              30+ High-Impact Interview Power Verbs
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Replace weak, informal language with executive terms that highlight leadership, diligence, and quantifiable results.
            </p>
          </div>

          {/* Mode Switcher: Flashcard vs Quiz */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              onClick={() => { setMode('flashcard'); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'flashcard' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flashcards Mode
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'quiz' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Quiz Mode
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
              setQuizSubmitted(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All 30 Words' : cat}
          </button>
        ))}
      </div>

      {/* FLASHCARD MODE */}
      {mode === 'flashcard' && (
        <div className="space-y-6">
          {/* 3D Flip Card Container */}
          <div className="perspective-1000 w-full min-h-[380px] select-none">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative w-full h-full min-h-[380px] rounded-3xl border border-slate-200 shadow-sm transition-all duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      {currentWord.category}
                    </span>
                    <span className="text-slate-400 font-medium">
                      Card {currentIndex + 1} of {filteredWords.length}
                    </span>
                  </div>

                  <div className="my-10 text-center space-y-3">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
                      {currentWord.word}
                    </h2>
                    <div className="text-sm text-slate-500 font-mono flex items-center justify-center gap-2">
                      <span>{currentWord.phonetic}</span>
                      <span className="text-slate-300">•</span>
                      <span className="italic text-slate-600">{currentWord.partOfSpeech}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSpeech(currentWord.word);
                    }}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Pronounce Aloud</span>
                  </button>

                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to see definition & interview example</span>
                  </span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span className="font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/20">
                      Meaning & Application
                    </span>
                    <span className="font-mono text-amber-300 font-bold text-sm">
                      {currentWord.word}
                    </span>
                  </div>

                  <div className="my-6 space-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold mb-1">
                        Professional Definition:
                      </div>
                      <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-100">
                        {currentWord.meaning}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                      <div className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold mb-1 flex items-center justify-between">
                        <span>Interview Example Sentence:</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playSpeech(currentWord.exampleSentence);
                          }}
                          className="text-xs text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed italic">
                        "{currentWord.exampleSentence}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-blue-200">
                  <span>Click to flip back</span>
                  <span className="text-slate-400">Card {currentIndex + 1} of {filteredWords.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Previous / Next */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevWord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Word</span>
            </button>

            <button
              onClick={() => {
                setMode('quiz');
                setQuizSubmitted(false);
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Test Knowledge in Quiz Mode</span>
            </button>

            <button
              onClick={handleNextWord}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>Next Word</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {mode === 'quiz' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Interview Quiz: {currentWord.word}
            </span>
            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Score: {quizScore}/{totalQuizzed} Correct
            </div>
          </div>

          {/* Quiz Question */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug">
              {currentWord.quiz.question}
            </h2>
            <p className="text-xs text-slate-500">
              Select the best answer that accurately matches high-standard interview English.
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentWord.quiz.options.map((opt, idx) => {
              const isSelected = selectedQuizOption === idx;
              const isCorrectOpt = idx === currentWord.quiz.correctIndex;

              let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50';

              if (quizSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  disabled={quizSubmitted}
                  className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {quizSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {quizSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quiz Result & Explanation */}
          {quizSubmitted && (
            <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
              selectedQuizOption === currentWord.quiz.correctIndex
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                {selectedQuizOption === currentWord.quiz.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Incorrect Choice</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Why:</strong> {currentWord.quiz.explanation}
              </p>
            </div>
          )}

          {/* Next Question in Quiz */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setMode('flashcard')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Back to Flashcards
            </button>

            <button
              onClick={handleNextWord}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>Next Quiz Word</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
