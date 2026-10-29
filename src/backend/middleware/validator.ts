import type { Request, Response, NextFunction } from 'express';

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip potential script tags and trim leading/trailing whitespace
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      }
    }
  }
  next();
}

export function validateFeedbackInput(req: Request, res: Response, next: NextFunction) {
  const { question, answer } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Field "question" must be a non-empty string.' });
  }
  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({ error: 'Field "answer" must be a non-empty string.' });
  }
  next();
}
