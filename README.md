# CBV Subscriptions App (Shopify App Proxy Backend)

Minimal Node.js backend for Candles By Victoria subscription management pages:

- `/pages/manage-subscriptions`
- `/pages/edit-subscription-item`

This service is intended to sit behind Shopify App Proxy routes and provide backend JSON endpoints the theme can call.

## What this project includes

- Lightweight Express server
- App Proxy signature verification middleware for Shopify requests
- Required placeholder routes:
  - `GET /apps/cbv-subscriptions/items`
  - `GET /apps/cbv-subscriptions/items/:id?type=<candle|wax-melt>`
  - `POST /apps/cbv-subscriptions/items/:id`
- Environment variable validation on boot
- Basic production hardening (`helmet`, JSON parsing, error handler)

## 1) Prerequisites

- Node.js 20+
- npm 10+
- A Shopify app with App Proxy enabled
- Recharge API credentials

## 2) Environment variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required values:

- `NODE_ENV` - `development` or `production`
- `PORT` - local port (default `3000`)
- `SHOPIFY_API_KEY` - Shopify app API key
- `SHOPIFY_API_SECRET` - Shopify app API secret
- `SHOPIFY_SHARED_SECRET` - shared secret used to validate app proxy requests
- `SHOP_DOMAIN` - your shop domain (`candlesbyvictoria.myshopify.com`)
- `RECHARGE_API_KEY` - Recharge API key
- `RECHARGE_STORE_HASH` - Recharge store identifier/hash
- `RECHARGE_API_VERSION` - Recharge API version (default `2021-11`)

## 3) Local development

Install dependencies:

```bash
npm install
```

Start in dev mode:

```bash
npm run dev
```

Run in production mode locally:

```bash
npm start
```

Health check:

```bash
curl http://localhost:3000/healthz
```

## 4) Shopify app dashboard settings (exact values to configure)

In **Shopify Admin → Apps → Develop apps → [Your app]**:

1. **App proxy**
   - **Subpath prefix**: `apps`
   - **Subpath**: `cbv-subscriptions`
   - **Proxy URL**: `https://<your-backend-domain>/apps/cbv-subscriptions`

2. **App URL / Allowed redirection URL(s)**
   - Set your backend base URL (for example `https://cbv-subscriptions.example.com`)

3. **Storefront access**
   - Ensure the app is installed on the target shop and app proxy is active.

After proxy is configured, Shopify requests to:

- `/apps/cbv-subscriptions/items`
- `/apps/cbv-subscriptions/items/:id`

will be forwarded to this backend and include signed query parameters for verification.

## 5) Route map

All routes are protected with app proxy signature verification middleware:

- `GET /apps/cbv-subscriptions/items`
  - Placeholder: returns empty `items` array
- `GET /apps/cbv-subscriptions/items/:id?type=<candle|wax-melt>`
  - Placeholder: validates `type` if provided
- `POST /apps/cbv-subscriptions/items/:id`
  - Placeholder: echoes payload

## 6) Deployment notes

- Deploy as a standard Node.js web service (Render, Fly.io, Railway, Heroku, AWS, etc.)
- Set all environment variables in your hosting platform
- Use HTTPS (required for Shopify proxy target URLs)
- Keep one canonical public domain and point Shopify app proxy URL to it
- If running behind a load balancer, ensure request query parameters are forwarded unchanged

## 7) Next implementation steps

- Add Recharge client module and data mapping for CBV theme payload shape
- Add request logging/monitoring and structured logs
- Add integration tests for signature validation and route behavior
- Add rate limiting if needed once traffic patterns are known
