import { Router } from 'express';
import { handleFeedback } from '../controllers/feedbackController.ts';
import { getQuestions } from '../controllers/questionsController.ts';
import { getVocabulary } from '../controllers/vocabularyController.ts';
import { getSentences } from '../controllers/sentencesController.ts';
import { startMockInterview, submitMockAnswer } from '../controllers/mockInterviewController.ts';
import { handleSpeechMetrics } from '../controllers/speechMetricsController.ts';
import { getProgress, saveProgress } from '../controllers/progressController.ts';
import { 
  handleLogin, 
  handleRegister, 
  handleGetMe, 
  handleDemoLogin,
  handleJsonAuth,
  handleAuthSchema
} from '../controllers/authController.ts';
import { getDatabaseExportForSheets } from '../controllers/sheetsController.ts';
import { sanitizeInput, validateFeedbackInput } from '../middleware/validator.ts';
import { feedbackLimiter } from '../middleware/rateLimiter.ts';

export const apiRouter = Router();

// Apply sanitization to all incoming body requests
apiRouter.use(sanitizeInput);

// 0. Authentication endpoints (Standard + Universal JSON)
apiRouter.post('/auth/login', handleLogin);
apiRouter.post('/auth/register', handleRegister);
apiRouter.post('/auth/json', handleJsonAuth);
apiRouter.get('/auth/schema', handleAuthSchema);
apiRouter.get('/auth/me', handleGetMe);
apiRouter.post('/auth/demo', handleDemoLogin);

// Sheets database export endpoint
apiRouter.get('/sheets/database-dump', getDatabaseExportForSheets);

// 1. Feedback endpoint
apiRouter.post('/feedback', feedbackLimiter, validateFeedbackInput, handleFeedback);

// 2. Interview Questions endpoint
apiRouter.get('/questions', getQuestions);

// 3. Vocabulary endpoint
apiRouter.get('/vocabulary', getVocabulary);

// 4. Sentences builder endpoint
apiRouter.get('/sentences', getSentences);

// 5. Mock Interview endpoints
apiRouter.post('/mock/start', startMockInterview);
apiRouter.post('/mock/answer', feedbackLimiter, submitMockAnswer);

// 6. Speech Metrics endpoint
apiRouter.post('/speech-metrics', handleSpeechMetrics);

// 7. User Progress endpoints
apiRouter.get('/progress', getProgress);
apiRouter.post('/progress', saveProgress);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'InterviewReady API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});
