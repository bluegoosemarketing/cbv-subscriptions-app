import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { verifyAppProxy } from './middleware/verifyAppProxy.js';
import { itemsRouter } from './routes/items.js';
import { HttpError } from './lib/httpError.js';
import { logger } from './lib/logger.js';

const app = express();

app.use(helmet());
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'cbv-subscriptions-app' });
});

app.use('/apps/cbv-subscriptions/items', verifyAppProxy, itemsRouter);

app.use((err, req, res, _next) => {
  if (err instanceof HttpError) {
    logger.warn('Request failed with handled error.', {
      path: req.originalUrl,
      method: req.method,
      status: err.status,
      details: err.details ?? undefined
    });

    return res.status(err.status).json({
      error: err.message,
      details: err.details ?? undefined
    });
  }

  logger.error('Unhandled request error.', {
    path: req.originalUrl,
    method: req.method,
    error: err?.message ?? String(err)
  });

  return res.status(500).json({ error: 'Internal server error.' });
});

app.listen(env.port, () => {
  logger.info('CBV subscriptions app listening.', { port: env.port, env: env.nodeEnv });
});
