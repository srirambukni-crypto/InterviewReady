export interface User {
  id: string;
  name: string;
  email: string;
  targetRole?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface FeedbackResult {
  correctedAnswer: string;
  grammarIssues: Array<{
    issue: string;
    correction: string;
    explanation: string;
  }>;
  vocabularySuggestions: Array<{
    originalWordOrPhrase: string;
    betterAlternative: string;
    reason: string;
  }>;
  improvedAnswer: string;
  score: number; // 0 to 10
  tips: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'introduction' | 'strengths' | 'weaknesses' | 'goals' | 'why-hire-you';
  question: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  guidance: string;
  modelAnswer: string;
  keyVocabulary: string[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  exampleSentence: string;
  category: 'Impact Verbs' | 'Leadership' | 'Problem Solving' | 'Collaboration' | 'Work Ethic';
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SentenceExercise {
  id: string;
  type: 'reorder' | 'fill-blank';
  instruction: string;
  jumbledWords?: string[];
  template?: string; // e.g. "I have consistently ________ to exceed team deliverables."
  options?: string[]; // For fill-in-the-blank
  correctSentence: string;
  explanation: string;
  category: 'STAR Method' | 'Polite Disagreement' | 'Highlighting Strengths' | 'Professional Tone';
}

export interface MockSession {
  id: string;
  userId: string;
  status: 'in-progress' | 'completed';
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: string[];
  answers: Array<{
    question: string;
    userAnswer: string;
    feedback: FeedbackResult;
    timestamp: string;
  }>;
  finalSummary?: {
    overallScore: number;
    grammarScore: number;
    vocabularyScore: number;
    fluencyScore: number;
    keyStrengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SpeechMetrics {
  wordsPerMinute: number;
  wordCount: number;
  durationSeconds: number;
  fillerWordCount: number;
  fillerWordsFound: Array<{ word: string; count: number }>;
  pauseCount: number;
  paceRating: 'Too Slow' | 'Optimal Pace' | 'Slightly Fast' | 'Too Rushed';
  fluencyScore: number; // 0 to 10
  tips: string[];
}

export interface UserProgress {
  userId: string;
  completedModules: string[];
  totalPracticedAnswers: number;
  averageScore: number;
  streakDays: number;
  lastPracticedAt: string;
  moduleScores: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    score: number;
    timestamp: string;
  }>;
}

export default {};
