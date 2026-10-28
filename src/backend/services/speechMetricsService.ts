import { SpeechMetrics } from '../models/types.ts';

const COMMON_FILLERS = [
  'um',
  'uh',
  'like',
  'you know',
  'actually',
  'basically',
  'literally',
  'i mean',
  'sort of',
  'kind of',
  'so yeah',
  'right'
];

export function analyzeSpeechMetrics(transcript: string, durationSeconds: number): SpeechMetrics {
  const cleanTranscript = (transcript || '').trim();
  const validDuration = Math.max(1, durationSeconds || 5);

  // Split into words
  const words = cleanTranscript.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Words per minute calculation
  const durationInMinutes = validDuration / 60;
  const wordsPerMinute = Math.round(wordCount / durationInMinutes);

  // Analyze filler words
  const lowerText = cleanTranscript.toLowerCase();
  const fillersFound: Array<{ word: string; count: number }> = [];
  let totalFillerCount = 0;

  for (const filler of COMMON_FILLERS) {
    // Regex for whole word / phrase match
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillersFound.push({
        word: filler,
        count: matches.length
      });
      totalFillerCount += matches.length;
    }
  }

  // Estimate pauses from ellipses, commas, dashes or duration gaps
  const pauseMarkers = (cleanTranscript.match(/(\.\.\.|—|–|-|,|\.{2,})/g) || []).length;
  // If duration is high compared to words, also count silence gaps
  const expectedSecondsForWords = wordCount * (60 / 140); // at 140 WPM
  const excessSeconds = Math.max(0, validDuration - expectedSecondsForWords);
  const estimatedHesitations = Math.round(excessSeconds / 3);
  const pauseCount = Math.max(pauseMarkers, estimatedHesitations);

  // Determine pacing rating
  let paceRating: SpeechMetrics['paceRating'] = 'Optimal Pace';
  if (wordsPerMinute < 110) {
    paceRating = 'Too Slow';
  } else if (wordsPerMinute >= 110 && wordsPerMinute <= 160) {
    paceRating = 'Optimal Pace';
  } else if (wordsPerMinute > 160 && wordsPerMinute <= 185) {
    paceRating = 'Slightly Fast';
  } else {
    paceRating = 'Too Rushed';
  }

  // Fluency score (0 to 10)
  // Optimal pacing: +4
  // Low fillers: +4
  // Appropriate pause rhythm: +2
  let paceScore = 4;
  if (paceRating === 'Optimal Pace') {
    paceScore = 4;
  } else if (paceRating === 'Slightly Fast' || wordsPerMinute >= 95) {
    paceScore = 3;
  } else {
    paceScore = 2;
  }

  const fillerRatio = wordCount > 0 ? (totalFillerCount / wordCount) : 0;
  let fillerScore = 4;
  if (fillerRatio <= 0.02) {
    fillerScore = 4;
  } else if (fillerRatio <= 0.05) {
    fillerScore = 3;
  } else if (fillerRatio <= 0.10) {
    fillerScore = 2;
  } else {
    fillerScore = 1;
  }

  const pauseScore = pauseCount <= 4 ? 2 : 1;
  const rawScore = paceScore + fillerScore + pauseScore;
  const fluencyScore = Math.min(10, Math.max(1, rawScore));

  // Construct coaching tips
  const tips: string[] = [];

  if (paceRating === 'Too Rushed') {
    tips.push('Your pace was fast (' + wordsPerMinute + ' WPM). Take deep breaths before key points; aim for a conversational 130–150 WPM so interviewers can absorb your technical achievements.');
  } else if (paceRating === 'Too Slow') {
    tips.push('Your pace was slow (' + wordsPerMinute + ' WPM). Practice linking short sentences together to keep the interviewer engaged.');
  } else {
    tips.push('Great cadence! Your speaking speed of ' + wordsPerMinute + ' WPM matches the standard executive interview baseline.');
  }

  if (totalFillerCount > 3) {
    const topFiller = fillersFound.sort((a, b) => b.count - a.count)[0];
    tips.push(`You used "${topFiller.word}" ${topFiller.count} time(s). Replace verbal crutches with a silent 1-second pause while organizing your thoughts.`);
  } else if (totalFillerCount === 0 && wordCount > 15) {
    tips.push('Outstanding clarity! Zero filler words detected in your speech.');
  } else {
    tips.push('Your filler word usage is well-controlled. Continue practicing deliberate articulation.');
  }

  if (wordCount < 20) {
    tips.push('Your answer was quite brief. Practice elaborating for 45 to 60 seconds with specific achievements.');
  } else {
    tips.push('Solid answer length! Rehearse with vocal variety to emphasize your strongest conclusions.');
  }

  return {
    wordsPerMinute,
    wordCount,
    durationSeconds: validDuration,
    fillerWordCount: totalFillerCount,
    fillerWordsFound: fillersFound,
    pauseCount,
    paceRating,
    fluencyScore,
    tips
  };
}
