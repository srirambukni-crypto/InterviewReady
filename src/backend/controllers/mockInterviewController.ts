import type { Request, Response } from 'express';
import { db } from '../models/db.ts';
import { generateEnglishFeedback } from '../services/geminiService.ts';

const MOCK_QUESTION_BANK = [
  'Tell me about yourself, your background, and why you are interested in this position.',
  'Can you describe your greatest professional strength and share an example where you demonstrated it?',
  'Tell me about a time you faced a difficult conflict or challenge within a team and how you resolved it.',
  'Where do you envision your career progressing over the next three to five years, and how does this role fit that goal?'
];

export async function startMockInterview(req: Request, res: Response) {
  try {
    const { userId = 'default-user', questionCount = 4 } = req.body;

    const count = Math.min(Math.max(1, questionCount), MOCK_QUESTION_BANK.length);
    const selectedQuestions = [...MOCK_QUESTION_BANK].slice(0, count);

    const session = db.createMockSession(userId, selectedQuestions);

    return res.status(200).json({
      sessionId: session.id,
      totalQuestions: session.totalQuestions,
      currentQuestionIndex: 0,
      question: session.questions[0],
      coachGreeting: "Hello! Welcome to your simulated English interview. I am your English communication coach. Speak naturally and take your time. Let's begin with our first question:"
    });
  } catch (error) {
    console.error('Error starting mock interview:', error);
    return res.status(500).json({ error: 'Failed to initialize mock interview session.' });
  }
}

export async function submitMockAnswer(req: Request, res: Response) {
  try {
    const { sessionId, answer, userId = 'default-user' } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({ error: 'answer is required and must be a string.' });
    }

    const session = db.getMockSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Mock session not found or expired.' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        error: 'This mock interview session is already completed.',
        finalSummary: session.finalSummary
      });
    }

    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];

    // Evaluate user's answer
    const feedback = await generateEnglishFeedback('mock', currentQuestion, answer);

    // Save turn
    session.answers.push({
      question: currentQuestion,
      userAnswer: answer,
      feedback,
      timestamp: new Date().toISOString()
    });

    const isLastQuestion = currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      // Calculate overall summary
      const scores = session.answers.map(a => a.feedback.score);
      const averageScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));

      const finalSummary = {
        overallScore: averageScore,
        grammarScore: Math.min(10, Math.round(averageScore + (averageScore >= 8 ? 0.5 : -0.2))),
        vocabularyScore: Math.min(10, Math.round(averageScore)),
        fluencyScore: Math.min(10, Math.round(averageScore + (averageScore >= 7 ? 0.3 : 0))),
        keyStrengths: [
          'Demonstrated clear enthusiasm and genuine dedication in communicating personal experiences.',
          'Consistently attempted structured explanations to connect past projects with future aspirations.',
          'Maintained respectful, professional interview etiquette throughout the dialogue.'
        ],
        areasForImprovement: [
          'Incorporate more high-impact action verbs (e.g., "spearheaded", "orchestrated", "streamlined") instead of generic phrasing.',
          'Use deliberate brief pauses to organize thoughts rather than conversational fillers.',
          'Conclude behavioral stories with quantifiable results (metrics, time saved, percentage gains).'
        ],
        recommendations: [
          'Review the Vocabulary Flashcards module to internalize 5 new power verbs each week.',
          'Practice with the Pronunciation and Fluency recorder to maintain an optimal 130–150 WPM cadence.',
          'Rehearse the STAR method framework for behavioral scenarios.'
        ]
      };

      session.status = 'completed';
      session.finalSummary = finalSummary;
      db.updateMockSession(session);

      // Record in user progress
      db.saveUserProgress(userId, {
        completedModules: ['mock'],
        moduleScores: { mock: averageScore }
      });

      return res.status(200).json({
        isComplete: true,
        feedback,
        finalSummary,
        coachFarewell: 'Congratulations on completing your mock interview session! Here is your comprehensive communication performance assessment.'
      });
    } else {
      session.currentQuestionIndex = currentIndex + 1;
      db.updateMockSession(session);

      return res.status(200).json({
        isComplete: false,
        feedback,
        nextQuestionIndex: session.currentQuestionIndex,
        nextQuestion: session.questions[session.currentQuestionIndex],
        totalQuestions: session.totalQuestions,
        coachComment: 'Thank you for that response. Review your communication feedback below, and when you are ready, let us move to the next question.'
      });
    }
  } catch (error) {
    console.error('Error submitting mock answer:', error);
    return res.status(500).json({ error: 'Failed to process mock interview answer.' });
  }
}
