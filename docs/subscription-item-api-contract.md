# Subscription Item API Contract

## List items

`GET /apps/cbv-subscriptions/items`

Response:

```json
{
  "items": [
    {
      "id": "123456789",
      "customer_id": 111222333,
      "type": "candle",
      "status": "active",
      "product_title": "Example Product",
      "variant_title": "8 oz",
      "quantity": 1,
      "price": "24.00",
      "next_charge_scheduled_at": "2026-04-15",
      "order_interval_frequency": 1,
      "order_interval_unit": "month",
      "charge_interval_frequency": 1,
      "properties": {
        "scent_1": "Lavender",
        "scent_family": "Floral",
        "wax_color": "Purple",
        "vessel": "Mason Jar",
        "vessel_format": "Classic",
        "wick_upgrade": "wooden",
        "secondary_scent": "Vanilla"
      },
      "scent_1": "Lavender",
      "scent_family": "Floral",
      "wax_color": "Purple",
      "vessel": "Mason Jar",
      "vessel_format": "Classic",
      "wick_upgrade": "wooden"
    }
  ]
}
```

## Get one item

`GET /apps/cbv-subscriptions/items/:id?type=<candle|wax-melt>`

Response:

```json
{
  "item": {
    "id": "123456789",
    "status": "active"
  }
}
```

- `item` has the same shape as objects inside list `items`.

## Update one item

`POST /apps/cbv-subscriptions/items/:id`

Accepted payload:

```json
{
  "properties": {
    "scent_1": "Fresh Linen",
    "secondary_scent": "Sea Salt",
    "vessel": "Ceramic"
  }
}
```

Also accepted:

```json
{
  "scent_1": "Fresh Linen",
  "secondary_scent": "Sea Salt",
  "vessel": "Ceramic"
}
```

Allowed property keys:

- `scent_1`
- `scent_family`
- `wax_color`
- `vessel`
- `vessel_format`
- `wick_upgrade`
- dynamic secondary keys matching: `secondary_*`

Success response:

```json
{
  "ok": true,
  "item": { "id": "123456789" },
  "updated_keys": ["scent_1", "secondary_scent", "vessel"]
}
```

Error response:

```json
{
  "error": "Human readable message",
  "details": {
    "optional": "structured details"
  }
}
```
