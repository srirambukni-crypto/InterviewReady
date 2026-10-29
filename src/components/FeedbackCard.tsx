import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Volume2, Award, Lightbulb, ArrowRight } from 'lucide-react';
import type { FeedbackResult } from '../backend/models/types.ts';
import { playSpeech } from '../utils/speechUtils.ts';

interface FeedbackCardProps {
  feedback: FeedbackResult;
  onContinue?: () => void;
  continueText?: string;
  title?: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  onContinue,
  continueText = 'Continue Practising',
  title = 'English Communication Assessment'
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 9) return { label: 'Exceptional (C2 Mastery)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 7) return { label: 'Proficient (Interview Ready)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 5) return { label: 'Competent (Refining Details)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Needs Practice (Focus on Fundamentals)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const badge = getScoreBadge(feedback.score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header bar with Score */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-xl font-bold font-heading">{title}</h3>
          </div>
          <p className="text-blue-100 text-sm">
            Detailed evaluation of grammar accuracy, vocabulary precision, and interview presence.
          </p>
        </div>

        {/* Score pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 self-start sm:self-auto">
          <Award className="w-8 h-8 text-amber-300" />
          <div>
            <div className="text-xs text-blue-100 font-medium uppercase tracking-wider">Score</div>
            <div className="text-2xl font-black text-white leading-none">
              {feedback.score}<span className="text-sm font-semibold text-blue-200">/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score rating badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating:</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Section (a): Corrected Grammar */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>(a) Corrected Grammar & Syntax</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 font-mono text-[13px]">
            {feedback.correctedAnswer}
          </p>

          {feedback.grammarIssues && feedback.grammarIssues.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Identified Adjustments:
              </span>
              {feedback.grammarIssues.map((issue, idx) => (
                <div key={idx} className="text-xs bg-amber-50/70 border border-amber-200/70 rounded-lg p-2.5 text-slate-700">
                  <div className="font-semibold text-amber-900 mb-0.5">
                    "{issue.issue}" → <span className="text-emerald-700">{issue.correction}</span>
                  </div>
                  <div className="text-slate-600">{issue.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section (b): Better Word Choices */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>(b) Better Word Choices & Power Verbs</span>
          </div>
          {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {feedback.vocabularySuggestions.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-500 mb-1">
                    <span className="line-through text-rose-500">{item.originalWordOrPhrase}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-blue-700 font-bold">{item.betterAlternative}</span>
                  </div>
                  <p className="text-slate-600 leading-normal">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border">
              Your vocabulary choice was natural and clear!
            </p>
          )}
        </div>

        {/* Section (c): Stronger Version of the Answer */}
        <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
              <Award className="w-4 h-4 text-blue-700" />
              <span>(c) Stronger Version of Your Answer</span>
            </div>
            <button
              onClick={() => playSpeech(feedback.improvedAnswer)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-100/60 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              title="Listen to standard native English pronunciation"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
          <p className="text-slate-800 text-sm leading-relaxed bg-white p-3.5 rounded-lg border border-blue-200/60 shadow-2xs italic">
            "{feedback.improvedAnswer}"
          </p>
        </div>

        {/* Section (d): Coach's Tips */}
        {feedback.tips && feedback.tips.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Coach's Actionable Tips for Next Time</span>
            </div>
            <ul className="space-y-2 mt-1">
              {feedback.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optional Continue CTA */}
        {onContinue && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
            >
              <span>{continueText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
