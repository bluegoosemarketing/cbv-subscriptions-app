import crypto from 'crypto';
import { env } from '../config/env.js';

function safeCompare(a, b) {
  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function generateAppProxySignature(query) {
  const sortedPairs = Object.entries(query)
    .filter(([key]) => key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
    .join('');

  return crypto
    .createHmac('sha256', env.shopifySharedSecret)
    .update(sortedPairs)
    .digest('hex');
}

export function verifyAppProxy(req, res, next) {
  const { signature } = req.query;

  if (!signature || typeof signature !== 'string') {
    return res.status(401).json({ error: 'Missing app proxy signature.' });
  }

  const expectedSignature = generateAppProxySignature(req.query);

  if (!safeCompare(expectedSignature, signature)) {
    return res.status(401).json({ error: 'Invalid app proxy signature.' });
  }

  return next();
}
