import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'SHOPIFY_SHARED_SECRET',
  'SHOP_DOMAIN',
  'RECHARGE_API_KEY'
];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  shopifyApiKey: process.env.SHOPIFY_API_KEY,
  shopifyApiSecret: process.env.SHOPIFY_API_SECRET,
  shopifySharedSecret: process.env.SHOPIFY_SHARED_SECRET,
  shopDomain: process.env.SHOP_DOMAIN,
  rechargeApiKey: process.env.RECHARGE_API_KEY,
  rechargeApiVersion: process.env.RECHARGE_API_VERSION ?? '2021-11'
};
