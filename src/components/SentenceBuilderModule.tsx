import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Lightbulb, 
  Sparkles, 
  Volume2,
  Award,
  Flame
} from 'lucide-react';
import type { SentenceExercise, FeedbackResult } from '../backend/models/types.ts';
import { FeedbackCard } from './FeedbackCard.tsx';
import { playSpeech } from '../utils/speechUtils.ts';

interface SentenceBuilderModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

export const SentenceBuilderModule: React.FC<SentenceBuilderModuleProps> = ({ onModuleCompleted }) => {
  const [exercises, setExercises] = useState<SentenceExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reorder exercise state
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Fill in the blank state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Result state
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreCounter, setScoreCounter] = useState(0);
  const [streak, setStreak] = useState(0);

  // Optional AI analysis
  const [aiFeedback, setAiFeedback] = useState<FeedbackResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch sentences from backend
  useEffect(() => {
    async function loadSentences() {
      try {
        setLoading(true);
        const res = await fetch('/api/sentences');
        if (!res.ok) throw new Error('Failed to load sentences');
        const data = await res.json();
        setExercises(data.sentences || []);
      } catch (err: any) {
        console.error('Error fetching sentences:', err);
        setError('Failed to fetch sentence exercises from server.');
      } finally {
        setLoading(false);
      }
    }

    loadSentences();
  }, []);

  const currentExercise = exercises[currentIndex];

  // Reset exercise interactive state when current index changes
  useEffect(() => {
    if (!currentExercise) return;
    setChecked(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setAiFeedback(null);

    if (currentExercise.type === 'reorder' && currentExercise.jumbledWords) {
      // Shuffle words initially
      const shuffled = [...currentExercise.jumbledWords].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords([]);
    }
  }, [currentIndex, currentExercise]);

  const handleWordClick = (word: string, indexInAvailable: number) => {
    if (checked) return;
    setSelectedWords([...selectedWords, word]);
    const updatedAvailable = [...availableWords];
    updatedAvailable.splice(indexInAvailable, 1);
    setAvailableWords(updatedAvailable);
  };

  const handleSelectedWordRemove = (indexInSelected: number) => {
    if (checked) return;
    const word = selectedWords[indexInSelected];
    const updatedSelected = [...selectedWords];
    updatedSelected.splice(indexInSelected, 1);
    setSelectedWords(updatedSelected);
    setAvailableWords([...availableWords, word]);
  };

  const handleResetWords = () => {
    if (!currentExercise || !currentExercise.jumbledWords) return;
    setAvailableWords([...currentExercise.jumbledWords]);
    setSelectedWords([]);
    setChecked(false);
  };

  const handleCheckAnswer = () => {
    if (!currentExercise) return;

    let userBuilt = '';
    if (currentExercise.type === 'reorder') {
      userBuilt = selectedWords.join(' ').trim().toLowerCase().replace(/[.,!]/g, '');
    } else {
      if (!selectedOption) return;
      userBuilt = selectedOption.trim().toLowerCase();
    }

    const target = currentExercise.correctSentence.trim().toLowerCase().replace(/[.,!]/g, '');

    let correct = false;
    if (currentExercise.type === 'reorder') {
      correct = userBuilt === target;
    } else {
      correct = currentExercise.correctSentence.toLowerCase().includes(userBuilt);
    }

    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      setScoreCounter(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        onModuleCompleted('sentences', 9);
      } else {
        onModuleCompleted('sentences', 8);
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reached the end, wrap around
      setCurrentIndex(0);
    }
  };

  const handleRequestDeepAiFeedback = async () => {
    if (!currentExercise) return;
    setAiLoading(true);

    try {
      const sentenceToCheck = currentExercise.type === 'reorder'
        ? selectedWords.join(' ')
        : currentExercise.template?.replace('________', selectedOption || '') || currentExercise.correctSentence;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sentence',
          question: `Grammar and Syntax Drill: ${currentExercise.instruction}`,
          answer: sentenceToCheck
        })
      });

      if (!res.ok) throw new Error('Feedback request failed');
      const data: FeedbackResult = await res.json();
      setAiFeedback(data);
    } catch (err) {
      console.error('Error getting AI feedback:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading Sentence Builder Drills...</p>
      </div>
    );
  }

  if (!currentExercise) {
    return <div className="p-12 text-center text-slate-500">No sentence exercises found.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Puzzle className="w-3.5 h-3.5" />
          <span>Module 3: Sentence Builder</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Professional Syntax & STAR Framework Drills
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Rearrange jumbled components or select precision words to internalize natural English interview patterns.
            </p>
          </div>

          {/* Streak & Score pills */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Streak: {streak}</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800">
              Score: {scoreCounter}/{exercises.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Exercise Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Progress & Category Top Bar */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {currentExercise.category}
          </span>
          <span className="text-slate-500 font-medium">
            Exercise {currentIndex + 1} of {exercises.length}
          </span>
        </div>

        {/* Instruction */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
            {currentExercise.instruction}
          </h2>
          <p className="text-xs text-slate-500">
            {currentExercise.type === 'reorder'
              ? 'Click the word tokens below in correct grammatical order.'
              : 'Choose the most professional vocabulary word to complete the sentence.'}
          </p>
        </div>

        {/* REORDER EXERCISE TYPE */}
        {currentExercise.type === 'reorder' && (
          <div className="space-y-6">
            {/* Target Constructed Sentence Slot */}
            <div className="min-h-24 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 flex flex-wrap items-center gap-2">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Constructed sentence will appear here as you click words...
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectedWordRemove(idx)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs shadow-2xs hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1 group"
                    title="Click to remove from sentence"
                  >
                    <span>{word}</span>
                    <span className="text-blue-200 group-hover:text-white text-[10px]">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Available Words Pool */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <span>Available Word Bank:</span>
                {selectedWords.length > 0 && !checked && (
                  <button
                    onClick={handleResetWords}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-100/70 rounded-xl border border-slate-200">
                {availableWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWordClick(word, idx)}
                    disabled={checked}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-300 hover:border-blue-400 font-medium text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    {word}
                  </button>
                ))}
                {availableWords.length === 0 && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All words placed! Click "Check Answer".
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FILL IN THE BLANK EXERCISE TYPE */}
        {currentExercise.type === 'fill-blank' && currentExercise.template && (
          <div className="space-y-6">
            {/* Sentence Preview with Blank */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-base font-medium text-slate-800 leading-relaxed">
              {currentExercise.template.split('________').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block mx-1.5 px-3 py-1 rounded-lg border font-bold text-sm min-w-28 text-center transition-all ${
                      selectedOption
                        ? 'bg-blue-100 border-blue-400 text-blue-900'
                        : 'bg-white border-dashed border-slate-400 text-slate-400'
                    }`}>
                      {selectedOption || '________'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentExercise.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!checked) setSelectedOption(opt);
                  }}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Correct/Incorrect Feedback Banner */}
        {checked && (
          <div className={`p-5 rounded-xl border transition-all ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Instant Feedback: Spot on! Perfectly Structured.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Instant Feedback: Not quite. Let us examine the grammar rule.</span>
                  </>
                )}
              </div>

              <button
                onClick={() => playSpeech(currentExercise.correctSentence)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/70 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Sentence</span>
              </button>
            </div>

            {/* Correct Sentence Display */}
            <div className="text-xs sm:text-sm font-semibold mb-2">
              Correct English phrasing: <br />
              <span className="text-blue-900 bg-white/80 p-2 rounded-lg border border-blue-200 block mt-1 font-mono text-[13px]">
                "{currentExercise.correctSentence}"
              </span>
            </div>

            {/* English Grammar Rule Explanation */}
            <div className="text-xs text-slate-700 flex items-start gap-1.5 mt-2 bg-white/60 p-2.5 rounded-lg border border-slate-200/80">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>English Coaching Rule:</strong> {currentExercise.explanation}
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!checked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={currentExercise.type === 'reorder' ? selectedWords.length === 0 : !selectedOption}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                (currentExercise.type === 'reorder' ? selectedWords.length === 0 : !selectedOption)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={handleNextExercise}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm cursor-pointer"
              >
                <span>Next Exercise</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!aiFeedback && (
                <button
                  onClick={handleRequestDeepAiFeedback}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{aiLoading ? 'Analyzing...' : 'Deep AI Evaluation'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render Deep AI Feedback if requested */}
      {aiFeedback && (
        <div className="pt-2">
          <FeedbackCard
            feedback={aiFeedback}
            title="Grammar & Professional Tone Breakdown"
            continueText="Proceed to Next Drill"
            onContinue={handleNextExercise}
          />
        </div>
      )}
    </div>
  );
};
