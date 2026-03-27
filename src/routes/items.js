import { Router } from 'express';
import { HttpError } from '../lib/httpError.js';
import { logger } from '../lib/logger.js';
import {
  getItemForShopifyCustomer,
  listItemsForShopifyCustomer,
  updateItemForShopifyCustomer
} from '../services/subscriptionItemsService.js';

export const itemsRouter = Router();

function getShopifyCustomerIdOrThrow(req) {
  const customerId = req.query.logged_in_customer_id;

  if (!customerId) {
    throw new HttpError(401, 'Shopify logged in customer context is required.');
  }

  return String(customerId);
}

itemsRouter.get('/', async (req, res, next) => {
  try {
    const shopifyCustomerId = getShopifyCustomerIdOrThrow(req);
    const { type } = req.query;

    const result = await listItemsForShopifyCustomer({ shopifyCustomerId, type });

    logger.info('Listed subscription items.', {
      route: 'GET /apps/cbv-subscriptions/items',
      shopifyCustomerId,
      rechargeCustomerId: result.rechargeCustomerId,
      itemCount: result.items.length
    });

    return res.json({ items: result.items });
  } catch (error) {
    return next(error);
  }
});

itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const shopifyCustomerId = getShopifyCustomerIdOrThrow(req);
    const { id } = req.params;
    const { type } = req.query;

    const result = await getItemForShopifyCustomer({
      shopifyCustomerId,
      itemId: id,
      type
    });

    logger.info('Loaded subscription item.', {
      route: 'GET /apps/cbv-subscriptions/items/:id',
      shopifyCustomerId,
      rechargeCustomerId: result.rechargeCustomerId,
      itemId: id
    });

    return res.json({ item: result.item });
  } catch (error) {
    return next(error);
  }
});

itemsRouter.post('/:id', async (req, res, next) => {
  try {
    const shopifyCustomerId = getShopifyCustomerIdOrThrow(req);
    const { id } = req.params;

    const result = await updateItemForShopifyCustomer({
      shopifyCustomerId,
      itemId: id,
      payload: req.body
    });

    logger.info('Updated subscription item.', {
      route: 'POST /apps/cbv-subscriptions/items/:id',
      shopifyCustomerId,
      itemId: id,
      updatedKeys: result.updated_keys
    });

    return res.json({
      ok: true,
      item: result.item,
      updated_keys: result.updated_keys
    });
  } catch (error) {
    return next(error);
  }
});
