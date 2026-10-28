import { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function getSentences(req: Request, res: Response) {
  try {
    const sentences = db.getSentences();
    return res.status(200).json({
      count: sentences.length,
      sentences
    });
  } catch (error) {
    console.error('Error in getSentences:', error);
    return res.status(500).json({ error: 'Failed to fetch sentence building exercises.' });
  }
}
