import { Router } from 'express';

export const itemsRouter = Router();

itemsRouter.get('/', async (req, res) => {
  // TODO: replace placeholder with Recharge-backed subscription item lookup.
  return res.json({
    items: [],
    message: 'Placeholder response for GET /apps/cbv-subscriptions/items.'
  });
});

itemsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (type && !['candle', 'wax-melt'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be candle or wax-melt.' });
  }

  // TODO: replace placeholder with Recharge-backed single item lookup.
  return res.json({
    id,
    type: type ?? null,
    message: 'Placeholder response for GET /apps/cbv-subscriptions/items/:id.'
  });
});

itemsRouter.post('/:id', async (req, res) => {
  const { id } = req.params;

  // TODO: replace placeholder with Recharge-backed subscription item update.
  return res.json({
    id,
    receivedPayload: req.body,
    message: 'Placeholder response for POST /apps/cbv-subscriptions/items/:id.'
  });
});
