import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Award,
  Zap,
  Info
} from 'lucide-react';
import type { SpeechMetrics } from '../backend/models/types.ts';
import { playSpeech } from '../utils/speechUtils.ts';

interface FluencyModuleProps {
  onModuleCompleted: (moduleName: string, score: number) => void;
}

const PRACTICE_PROMPTS = [
  {
    title: '30-Second Elevator Pitch',
    prompt: 'Summarize your main career background, your greatest technical skill, and why you are excited to speak with this company today.'
  },
  {
    title: 'Overcoming a Difficult Challenge',
    prompt: 'Describe a situation where a project deadline was at risk or an unexpected software bug occurred. How did you react and resolve it?'
  },
  {
    title: 'Why Should We Hire You?',
    prompt: 'Explain what makes your combination of work ethic, technical diligence, and team collaboration unique among candidates.'
  }
];

export const FluencyModule: React.FC<FluencyModuleProps> = ({ onModuleCompleted }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const lastSpokeTimeRef = useRef<number>(Date.now());
  const silenceCheckRef = useRef<any>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
        setTranscript('');
        setDurationSeconds(0);
        setPauseCount(0);
        setMetrics(null);
        lastSpokeTimeRef.current = Date.now();

        // Start duration timer
        timerRef.current = setInterval(() => {
          setDurationSeconds(prev => prev + 1);
        }, 1000);

        // Detect conversational pauses (silence > 1.8 seconds)
        silenceCheckRef.current = setInterval(() => {
          const elapsedSinceLastSpoke = Date.now() - lastSpokeTimeRef.current;
          if (elapsedSinceLastSpoke >= 2000 && elapsedSinceLastSpoke < 3000) {
            setPauseCount(p => p + 1);
          }
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        lastSpokeTimeRef.current = Date.now();
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullText.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
        }
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  // Analyze speech metrics via backend API
  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please record yourself speaking before analyzing fluency.');
      return;
    }

    setLoadingMetrics(true);
    setError(null);

    try {
      const res = await fetch('/api/speech-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          duration: Math.max(3, durationSeconds)
        })
      });

      if (!res.ok) throw new Error('Failed to compute speech metrics');
      const data: SpeechMetrics = await res.json();
      setMetrics(data);

      onModuleCompleted('fluency', data.fluencyScore);
    } catch (err: any) {
      console.error('Error analyzing metrics:', err);
      setError('Could not analyze speech metrics. Please try again.');
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Calculate live approximate WPM while recording
  const liveWords = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const liveWpm = durationSeconds > 0 ? Math.round((liveWords / (durationSeconds / 60))) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Mic className="w-3.5 h-3.5" />
          <span>Module 5: Pronunciation & Fluency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Real-Time Speaking Speed, Pauses & Filler-Word Counter
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Top interviewers evaluate cadence and clarity. Speak into your microphone to measure your 
          <strong> Words Per Minute (130–160 WPM target)</strong>, identify verbal crutches ("um", "uh", "like"), 
          and track conversational pauses.
        </p>
      </div>

      {/* Practice Prompt Picker Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Recommended Practice Prompt:</span>
          </span>
          <span className="text-slate-500">Pick a prompt below to rehearse</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRACTICE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPromptIdx(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPromptIdx === idx
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-slate-800 font-medium bg-white/80 p-3 rounded-xl border border-blue-100">
          "{PRACTICE_PROMPTS[selectedPromptIdx].prompt}"
        </p>
      </div>

      {/* Main Live Recording Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Top Control Bar with Big Mic Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-4">
            {/* Record / Stop Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
              }`}
              title={isRecording ? 'Click to finish speaking' : 'Click to start recording'}
              aria-label={isRecording ? 'Stop speaking recording' : 'Start speaking recording'}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <div>
              <div className="text-base font-bold text-slate-900 font-heading">
                {isRecording ? 'Recording & Transcribing Live...' : 'Ready to Record'}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRecording
                  ? 'Speak clearly into your microphone. Click the red button when finished.'
                  : 'Click the microphone button and read the prompt aloud.'}
              </p>
            </div>
          </div>

          {/* Live Soundwave or Timer Status */}
          <div className="flex items-center gap-6">
            {isRecording && (
              <div className="flex items-center gap-1.5 h-8 px-3">
                <span className="w-1.5 bg-blue-600 rounded-full animate-wave-1" />
                <span className="w-1.5 bg-blue-600 rounded-full animate-wave-2" />
                <span className="w-1.5 bg-blue-600 rounded-full animate-wave-3" />
                <span className="w-1.5 bg-blue-600 rounded-full animate-wave-4" />
                <span className="w-1.5 bg-blue-600 rounded-full animate-wave-5" />
              </div>
            )}

            {/* Timer pill */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-mono font-bold text-slate-800 text-sm">
                {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Live Pauses count */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Pauses:</span>
              <span className="font-bold text-blue-700 text-sm">{pauseCount}</span>
            </div>
          </div>
        </div>

        {/* Live Transcribed Text Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wide">
              Transcribed Speech Output (Web Speech API)
            </span>
            <span className="text-slate-500">
              Words: <strong className="text-slate-800">{liveWords}</strong>
              {liveWpm > 0 && <span> | Live Pace: <strong className="text-blue-700">{liveWpm} WPM</strong></span>}
            </span>
          </div>

          <div className="min-h-36 p-4 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
            {transcript ? (
              transcript
            ) : (
              <span className="text-slate-400 italic font-sans text-xs">
                Your spoken words will appear here in real-time as you speak...
              </span>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {transcript && !isRecording && (
            <button
              onClick={() => {
                setTranscript('');
                setDurationSeconds(0);
                setPauseCount(0);
                setMetrics(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Try Again</span>
            </button>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loadingMetrics || isRecording || !transcript.trim()}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer sm:ml-auto ${
              loadingMetrics || isRecording || !transcript.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.01]'
            }`}
          >
            {loadingMetrics ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing Fluency Metrics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Speaking Speed & Fillers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD RESULT (renders once analyzed) */}
      {metrics && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold font-heading text-slate-900">
                Speech & Fluency Diagnostic
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl">
              <span className="text-xs text-blue-700 font-bold uppercase">Fluency Score:</span>
              <span className="text-lg font-black text-blue-900">{metrics.fluencyScore}/10</span>
            </div>
          </div>

          {/* 4 Diagnostic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WPM */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Words Per Minute
              </span>
              <div className="text-2xl font-black text-slate-900">
                {metrics.wordsPerMinute} <span className="text-xs font-semibold text-slate-500">WPM</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                metrics.paceRating === 'Optimal Pace'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {metrics.paceRating}
              </span>
            </div>

            {/* Filler Words */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Filler Words Count
              </span>
              <div className="text-2xl font-black text-slate-900">
                {metrics.fillerWordCount}
              </div>
              <span className="text-[11px] text-slate-500">
                {metrics.fillerWordCount === 0 ? 'Zero verbal fillers!' : `${metrics.fillerWordsFound.length} distinct crutches found`}
              </span>
            </div>

            {/* Pauses */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pauses & Hesitations
              </span>
              <div className="text-2xl font-black text-slate-900">
                {metrics.pauseCount}
              </div>
              <span className="text-[11px] text-slate-500">
                Silence segments over 1.8s
              </span>
            </div>

            {/* Duration & Words */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Speech Length
              </span>
              <div className="text-2xl font-black text-slate-900">
                {metrics.durationSeconds}s
              </div>
              <span className="text-[11px] text-slate-500">
                {metrics.wordCount} spoken words
              </span>
            </div>
          </div>

          {/* Breakdown of fillers found */}
          {metrics.fillerWordsFound.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                Detected Fillers:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {metrics.fillerWordsFound.map((item, idx) => (
                  <span key={idx} className="bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    "{item.word}": used {item.count} time(s)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Coaching Recommendations */}
          <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
              <Zap className="w-4 h-4 text-blue-700" />
              <span>Pacing & Fluency Coaching Advice</span>
            </div>
            <ul className="space-y-2">
              {metrics.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
