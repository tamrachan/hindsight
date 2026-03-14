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
  - Uses plan-compatible proxy candidates with fallback (`symbolUsed` in responses).
- `GET /api/asset-classes/monthly`
  - Returns all asset proxy data from 1 year before the earliest event date.
  - Uses `1month` interval from Twelve Data.
  - Response includes `symbolUsed` when a fallback ticker was selected.
- `GET /api/asset-classes/monthly/summary`
  - Compact chart-ready payload.
  - Returns shared `timestamps` array and per-asset normalized `values` (base=100).
  - Example: `/api/asset-classes/monthly/summary`
- `GET /api/charts/normalized-index`
  - Normalized index chart payload for frontend charting.
  - Includes `eventMarkers`, `yAxisBase=100`, and `logScaleSupported=true`.
  - Example: `/api/charts/normalized-index`
- `GET /api/event-metrics?months=3`
  - Returns metrics for every major event and every asset class.
  - Calculated from monthly normalized summary data (no extra per-event provider calls).
  - Includes:
    - `% change` from `months` before event to event date
    - `% change` from event date to `months` after
    - `% change` from `months` before to `months` after
- `GET /api/event-metrics/:eventId?months=3`
  - Same metrics for a single event, from monthly normalized summary data.
- `GET /api/impact/:eventId?windowDays=30`
  - Example: `/api/impact/covid?windowDays=45`
  - Fetches daily prices from Twelve Data in a symmetric window around the event.
  - Includes nearest `preEvent` and `postEvent` price points and computed `% return`.
- `GET /api/lesson-cards/:eventId`
  - Example: `/api/lesson-cards/covid?windowDays=180`
  - Returns a teaching-ready lesson card:
    - `teachingFocus` bullets
    - per-asset event metrics (`d7`, `d30`, `d90`, drawdown, recovery)
    - generated `keyTakeaways`
    - generated `quizQuestions`
