import { rechargeClient } from './rechargeClient.js';
import { HttpError } from '../lib/httpError.js';

const ALLOWED_ITEM_TYPES = new Set(['candle', 'wax-melt']);
const ALLOWED_PROPERTY_KEYS = new Set([
  'scent_1',
  'scent_family',
  'wax_color',
  'vessel',
  'vessel_format',
  'wick_upgrade'
]);

function normalizePropertyKey(key) {
  return String(key).trim();
}

function mapPropertiesArrayToObject(properties = []) {
  return properties.reduce((acc, property) => {
    if (!property || typeof property.name !== 'string') {
      return acc;
    }

    acc[property.name] = property.value ?? '';
    return acc;
  }, {});
}

function mapPropertiesObjectToArray(properties = {}) {
  return Object.entries(properties).map(([name, value]) => ({
    name,
    value: value == null ? '' : String(value)
  }));
}

function detectItemType(subscription) {
  const productTitle = String(subscription.product_title ?? '').toLowerCase();
  const variantTitle = String(subscription.variant_title ?? '').toLowerCase();
  const haystack = `${productTitle} ${variantTitle}`;

  if (haystack.includes('wax') && haystack.includes('melt')) {
    return 'wax-melt';
  }

  if (haystack.includes('candle')) {
    return 'candle';
  }

  return null;
}

function toThemeContractItem(subscription) {
  const properties = mapPropertiesArrayToObject(subscription.properties);
  const normalizedStatus = subscription.status == null
    ? null
    : String(subscription.status).toLowerCase();

  return {
    id: String(subscription.id),
    customer_id: subscription.customer_id,
    type: detectItemType(subscription),
    status: normalizedStatus,
    product_title: subscription.product_title ?? null,
    variant_title: subscription.variant_title ?? null,
    quantity: subscription.quantity ?? null,
    price: subscription.price ?? null,
    next_charge_scheduled_at: subscription.next_charge_scheduled_at ?? null,
    order_interval_frequency: subscription.order_interval_frequency ?? null,
    order_interval_unit: subscription.order_interval_unit ?? null,
    charge_interval_frequency: subscription.charge_interval_frequency ?? null,
    properties,
    scent_1: properties.scent_1 ?? null,
    scent_family: properties.scent_family ?? null,
    wax_color: properties.wax_color ?? null,
    vessel: properties.vessel ?? null,
    vessel_format: properties.vessel_format ?? null,
    wick_upgrade: properties.wick_upgrade ?? null
  };
}

async function resolveRechargeCustomerFromShopifyCustomerId(shopifyCustomerId) {
  const candidateQueries = [
    { external_customer_id: shopifyCustomerId },
    { shopify_customer_id: shopifyCustomerId }
  ];

  for (const query of candidateQueries) {
    const customers = await rechargeClient.listCustomers(query);

    if (customers.length) {
      return customers[0];
    }
  }

  throw new HttpError(404, 'No Recharge customer found for Shopify customer.');
}

function validateTypeFilter(type) {
  if (!type) {
    return;
  }

  if (!ALLOWED_ITEM_TYPES.has(type)) {
    throw new HttpError(400, 'Invalid type. Must be candle or wax-melt.');
  }
}

function validateAndNormalizeUpdatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new HttpError(400, 'Payload must be a JSON object.');
  }

  const sourceProperties = payload.properties && typeof payload.properties === 'object'
    ? payload.properties
    : payload;

  const normalized = {};

  for (const [rawKey, rawValue] of Object.entries(sourceProperties)) {
    const key = normalizePropertyKey(rawKey);

    if (!key) {
      continue;
    }

    if (ALLOWED_PROPERTY_KEYS.has(key) || key.startsWith('secondary_')) {
      normalized[key] = rawValue == null ? '' : String(rawValue);
    }
  }

  if (!Object.keys(normalized).length) {
    throw new HttpError(
      400,
      'No updatable properties found. Allowed keys are builder-aligned keys and secondary_*.'
    );
  }

  return normalized;
}

export async function listItemsForShopifyCustomer({ shopifyCustomerId, type }) {
  validateTypeFilter(type);

  const rechargeCustomer = await resolveRechargeCustomerFromShopifyCustomerId(shopifyCustomerId);
  const subscriptions = await rechargeClient.listSubscriptions({ customer_id: rechargeCustomer.id });

  const items = subscriptions
    .map(toThemeContractItem)
    .filter((item) => !type || item.type === type);

  return { rechargeCustomerId: rechargeCustomer.id, items };
}

export async function getItemForShopifyCustomer({ shopifyCustomerId, itemId, type }) {
  validateTypeFilter(type);

  const rechargeCustomer = await resolveRechargeCustomerFromShopifyCustomerId(shopifyCustomerId);
  const subscription = await rechargeClient.getSubscription(itemId);

  if (!subscription) {
    throw new HttpError(404, 'Subscription item not found.');
  }

  if (String(subscription.customer_id) !== String(rechargeCustomer.id)) {
    throw new HttpError(403, 'You do not have access to this subscription item.');
  }

  const item = toThemeContractItem(subscription);

  if (type && item.type !== type) {
    throw new HttpError(404, 'Subscription item not found for requested type.');
  }

  return { rechargeCustomerId: rechargeCustomer.id, item, subscription };
}

export async function updateItemForShopifyCustomer({ shopifyCustomerId, itemId, payload }) {
  const { subscription } = await getItemForShopifyCustomer({ shopifyCustomerId, itemId });
  const requestedProperties = validateAndNormalizeUpdatePayload(payload);
  const existingProperties = mapPropertiesArrayToObject(subscription.properties);

  const mergedProperties = {
    ...existingProperties,
    ...requestedProperties
  };

  const updated = await rechargeClient.updateSubscription(itemId, {
    properties: mapPropertiesObjectToArray(mergedProperties)
  });

  if (!updated) {
    throw new HttpError(502, 'Recharge did not return an updated subscription.');
  }

  return {
    item: toThemeContractItem(updated),
    updated_keys: Object.keys(requestedProperties)
  };
}
