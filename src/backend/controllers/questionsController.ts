import type { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function getQuestions(req: Request, res: Response) {
  try {
    const { category } = req.query;
    const questions = db.getQuestions(typeof category === 'string' ? category : undefined);
    return res.status(200).json({
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    return res.status(500).json({ error: 'Failed to fetch interview questions.' });
  }
}
