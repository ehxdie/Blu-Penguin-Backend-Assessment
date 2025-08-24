import express, { NextFunction, urlencoded } from 'express';
import type { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import router from './routes';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import * as prometheus from 'prom-client';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { BaseError, HttpStatusCode } from './exceptions';
import { port } from './config';
import rateLimit from 'express-rate-limit';

const app = express();

app.enable('trust proxy');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // skip docs/metrics
  skip: (req) => req.path.startsWith('/docs') || req.path.startsWith('/metrics'),
});

app.use(apiLimiter);

// Configure helmet to allow CORS headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Apply CORS first, before other middleware
app.use(cors());

app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));

app.get('/', (_req: Request, res: Response) => {
  res.redirect('/docs');
});

prometheus.collectDefaultMetrics();
app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Docs in JSON format
app.get('/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

console.log(`Docs available at http://localhost:${port}/docs`);

// Add CORS debugging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use('/api', router);

// ─── 404 CATCH-ALL ─────
app.use((req, res) => {
  if (!res.headersSent) {
    res.status(HttpStatusCode.NOT_FOUND).json({ status: 'error', message: 'Route not found' });
  }
});

// ─── CENTRAL ERROR HANDLER ───
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error:', err.message);
  errorHandler.handleError(err, res);

  if (!(err instanceof BaseError)) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER)
      .json({ status: 'error', message: 'Internal server error' });
  }
});

export default app;
