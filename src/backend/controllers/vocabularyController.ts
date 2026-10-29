import type { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function getVocabulary(req: Request, res: Response) {
  try {
    const vocabulary = db.getVocabulary();
    return res.status(200).json({
      count: vocabulary.length,
      vocabulary
    });
  } catch (error) {
    console.error('Error in getVocabulary:', error);
    return res.status(500).json({ error: 'Failed to fetch vocabulary words.' });
  }
}
