import { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function getProgress(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'default-user';
    const progress = db.getUserProgress(userId);
    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Failed to retrieve user progress.' });
  }
}

export function saveProgress(req: Request, res: Response) {
  try {
    const { userId = 'default-user', completedModules, moduleScores, totalPracticedAnswers, averageScore } = req.body;

    const updated = db.saveUserProgress(userId, {
      completedModules,
      moduleScores,
      totalPracticedAnswers,
      averageScore
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({ error: 'Failed to save user progress.' });
  }
}
