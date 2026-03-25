import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { verifyAppProxy } from './middleware/verifyAppProxy.js';
import { itemsRouter } from './routes/items.js';

const app = express();

app.use(helmet());
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'cbv-subscriptions-app' });
});

app.use('/apps/cbv-subscriptions/items', verifyAppProxy, itemsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(env.port, () => {
  console.log(`CBV subscriptions app listening on port ${env.port}`);
});
