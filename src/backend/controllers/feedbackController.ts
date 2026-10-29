import type { Request, Response } from 'express';
import { generateEnglishFeedback } from '../services/geminiService.ts';
import { db } from '../models/db.ts';

export async function handleFeedback(req: Request, res: Response) {
  try {
    const { type, question, answer, userId = 'default-user' } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required and must be a string.' });
    }

    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Answer is required and must be a string.' });
    }

    const validTypes = ['introduction', 'question', 'sentence', 'mock'];
    const feedbackType = validTypes.includes(type) ? type : 'question';

    const feedback = await generateEnglishFeedback(feedbackType, question, answer);

    // Save answer into database history and update progress
    db.recordAnswer(userId, feedbackType, question, answer, feedback);

    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error in handleFeedback:', error);
    return res.status(500).json({
      error: 'Failed to process feedback. Please check your network and try again.'
    });
  }
}
