import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/backend/routes/apiRoutes.ts';
import { apiLimiter } from './src/backend/middleware/rateLimiter.ts';
import { centralErrorHandler } from './src/backend/middleware/errorHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Trust proxy for reverse proxy environments (Cloud Run / AI Studio)
  app.set('trust proxy', 1);

  // Security and CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ type: ['text/*', 'application/json', 'text/json'], limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Auto-parse stringified JSON bodies if sent as raw text
  app.use((req, res, next) => {
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // keep as is
      }
    }
    next();
  });

  // General rate limiter on API endpoints
  app.use('/api', apiLimiter);

  // Mount backend API routes
  app.use('/api', apiRouter);

  // Frontend integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Central error handling
  app.use(centralErrorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InterviewReady] Server is actively running at http://0.0.0.0:${PORT}`);
    console.log(`[InterviewReady] Environment: ${isProduction ? 'Production' : 'Development'}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting InterviewReady server:', err);
  process.exit(1);
});
