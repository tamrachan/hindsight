## Run

1. Create `.env` in `back-end/`:

```env
TWELVE_DATA_API_KEY=your_twelve_data_key
PORT=5000
```

2. Start server:

```bash
node server.js
```

## Endpoints

- `GET /api/events`
  - Returns hardcoded major events + asset proxy metadata.
- `GET /api/asset-classes/monthly`
  - Returns all asset proxy data from 1 year before the earliest event date.
  - Uses `1month` interval from Twelve Data.
- `GET /api/impact/:eventId?windowDays=30`
  - Example: `/api/impact/covid?windowDays=45`
  - Fetches daily prices from Twelve Data in a symmetric window around the event.
  - Includes nearest `preEvent` and `postEvent` price points and computed `% return`.
