import { Request, Response } from 'express';
import { analyzeSpeechMetrics } from '../services/speechMetricsService.ts';

export function handleSpeechMetrics(req: Request, res: Response) {
  try {
    const { transcript, duration, durationSeconds } = req.body;

    if (transcript === undefined || transcript === null) {
      return res.status(400).json({ error: 'Transcript string is required.' });
    }

    const durationVal = typeof duration === 'number' ? duration : (typeof durationSeconds === 'number' ? durationSeconds : 10);

    const metrics = analyzeSpeechMetrics(String(transcript), durationVal);
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error analyzing speech metrics:', error);
    return res.status(500).json({ error: 'Failed to analyze speech metrics.' });
  }
}
