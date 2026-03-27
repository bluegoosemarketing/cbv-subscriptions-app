import { env } from '../config/env.js';
import { HttpError } from '../lib/httpError.js';

const RECHARGE_BASE_URL = 'https://api.rechargeapps.com';

function buildUrl(path, query = {}) {
  const url = new URL(path, RECHARGE_BASE_URL);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

async function request(path, options = {}) {
  const { method = 'GET', query, body } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Recharge-Access-Token': env.rechargeApiKey,
      'X-Recharge-Version': env.rechargeApiVersion
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, 'Recharge API request failed.', {
      path,
      method,
      rechargeError: data
    });
  }

  return data;
}

export const rechargeClient = {
  async listCustomers(query) {
    const data = await request('/customers', { query });
    return data.customers ?? [];
  },

  async listSubscriptions(query) {
    const data = await request('/subscriptions', { query });
    return data.subscriptions ?? [];
  },

  async getSubscription(subscriptionId) {
    const data = await request(`/subscriptions/${subscriptionId}`);
    return data.subscription ?? null;
  },

  async updateSubscription(subscriptionId, payload) {
    const data = await request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: payload
    });
    return data.subscription ?? null;
  }
};
