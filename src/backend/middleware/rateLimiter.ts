import rateLimit from 'express-rate-limit';

// Standard API rate limiter to protect backend endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
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
  message: {
    error: 'Evaluation limit reached for this minute. Please pause for a moment before submitting your next answer.'
  }
});
