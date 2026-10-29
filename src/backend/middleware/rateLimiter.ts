import rateLimit from 'express-rate-limit';

// Helper to safely extract client IP behind reverse proxies
const getClientIp = (req: any): string => {
  return (
    req.ip ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['forwarded'] as string)?.match(/for="?([^;"]+)/)?.[1] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

// Standard API rate limiter to protect backend endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Prevents express-rate-limit reverse proxy false-alarm validation errors
  keyGenerator: getClientIp,
  message: {
    error: 'Too many requests from this IP address, please try again in a few minutes.'
  }
});

// Feedback and LLM specific limiter
export const feedbackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 evaluations per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Prevents express-rate-limit reverse proxy false-alarm validation errors
  keyGenerator: getClientIp,
  message: {
    error: 'Evaluation limit reached for this minute. Please pause for a moment before submitting your next answer.'
  }
});
