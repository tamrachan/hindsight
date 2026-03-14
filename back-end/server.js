const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const ASSET_PROXIES = [
  { assetClass: "Stocks", symbol: "SPY", reason: "Most common S&P 500 proxy" },
  { assetClass: "Bonds", symbol: "TLT", reason: "Long-duration US Treasury bonds" },
  { assetClass: "Commodities", symbol: "DBC", reason: "Commodity index ETF" },
  { assetClass: "Crypto", symbol: "BTC/USD", reason: "Dominant crypto asset" },
  { assetClass: "Real Estate", symbol: "VNQ", reason: "REIT index ETF" },
]

const MAJOR_EVENTS = [
  {
    id: "dotcom",
    title: "Dot-com bubble burst",
    date: "2000-03-10",
    category: "market crash",
  },
  {
    id: "911",
    title: "9/11 attacks",
    date: "2001-09-11",
    category: "geopolitical shock",
  },
  {
    id: "gfc",
    title: "Global Financial Crisis",
    date: "2008-09-15",
    category: "banking crisis",
  },
  {
    id: "covid",
    title: "COVID market crash",
    date: "2020-03-16",
    category: "pandemic",
  },
]

const TWELVE_BASE_URL = "https://api.twelvedata.com/time_series"

function toIsoDate(dateObj) {
  return dateObj.toISOString().slice(0, 10)
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return toIsoDate(d)
}

function getNearestPoint(data, targetDate, direction = "before") {
  const target = new Date(`${targetDate}T00:00:00Z`).getTime()
  const sorted = [...data].sort(
    (a, b) => new Date(`${a.datetime}T00:00:00Z`) - new Date(`${b.datetime}T00:00:00Z`),
  )

  if (direction === "before") {
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const t = new Date(`${sorted[i].datetime}T00:00:00Z`).getTime()
      if (t <= target) return sorted[i]
    }
  } else {
    for (let i = 0; i < sorted.length; i += 1) {
      const t = new Date(`${sorted[i].datetime}T00:00:00Z`).getTime()
      if (t >= target) return sorted[i]
    }
  }

  return null
}

function pctChange(fromPrice, toPrice) {
  if (!fromPrice || !toPrice) return null
  return ((toPrice - fromPrice) / fromPrice) * 100
}

async function fetchAssetSeries(symbol, startDate, endDate, interval = "1day") {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) {
    throw new Error("Missing TWELVE_DATA_API_KEY in environment")
  }

  const url = new URL(TWELVE_BASE_URL)
  url.searchParams.set("symbol", symbol)
  url.searchParams.set("interval", interval)
  url.searchParams.set("start_date", startDate)
  url.searchParams.set("end_date", endDate)
  url.searchParams.set("apikey", apiKey)
  url.searchParams.set("order", "ASC")

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Twelve Data request failed (${response.status}) for symbol ${symbol}`)
  }

  const json = await response.json()
  if (json.status === "error") {
    throw new Error(json.message || `Twelve Data error for symbol ${symbol}`)
  }

  const values = Array.isArray(json.values) ? json.values : []
  return values
    .map((row) => ({
      datetime: row.datetime,
      close: Number.parseFloat(row.close),
    }))
    .filter((row) => Number.isFinite(row.close))
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" })
})

app.get("/", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hindsight Backend</title>
      </head>
      <body style="font-family: sans-serif; max-width: 760px; margin: 40px auto; line-height: 1.5;">
        <h1>Hindsight Backend is running</h1>
        <p>Use these endpoints:</p>
        <ul>
          <li><a href="/api/events">/api/events</a></li>
          <li><a href="/api/asset-classes/monthly">/api/asset-classes/monthly</a></li>
          <li><a href="/api/impact/covid?windowDays=30">/api/impact/covid?windowDays=30</a></li>
          <li><a href="/api/hello">/api/hello</a></li>
        </ul>
      </body>
    </html>
  `)
})

app.get("/api/events", (req, res) => {
  res.json({
    events: MAJOR_EVENTS,
    assetProxies: ASSET_PROXIES,
  })
})

app.get("/api/asset-classes/monthly", async (req, res) => {
  try {
    const sortedEvents = [...MAJOR_EVENTS].sort(
      (a, b) => new Date(`${a.date}T00:00:00Z`) - new Date(`${b.date}T00:00:00Z`),
    )
    const firstEvent = sortedEvents[0]
    const startDate = addDays(firstEvent.date, -365)
    const endDate = toIsoDate(new Date())

    const assets = await Promise.all(
      ASSET_PROXIES.map(async (asset) => {
        try {
          const series = await fetchAssetSeries(asset.symbol, startDate, endDate, "1month")
          return {
            ...asset,
            interval: "1month",
            startDate,
            endDate,
            observations: series.length,
            series,
          }
        } catch (error) {
          return {
            ...asset,
            interval: "1month",
            startDate,
            endDate,
            error: error.message,
            observations: 0,
            series: [],
          }
        }
      }),
    )

    return res.json({
      firstEvent,
      interval: "1month",
      startDate,
      endDate,
      assets,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.get("/api/impact/:eventId", async (req, res) => {
  try {
    const event = MAJOR_EVENTS.find((item) => item.id === req.params.eventId)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const windowDays = Math.max(
      1,
      Math.min(365, Number.parseInt(req.query.windowDays, 10) || 30),
    )
    const startDate = addDays(event.date, -windowDays)
    const endDate = addDays(event.date, windowDays)

    const assets = await Promise.all(
      ASSET_PROXIES.map(async (asset) => {
        try {
          const series = await fetchAssetSeries(asset.symbol, startDate, endDate)
          const preEvent = getNearestPoint(series, event.date, "before")
          const postEvent = getNearestPoint(series, event.date, "after")

          return {
            ...asset,
            startDate,
            endDate,
            preEvent,
            postEvent,
            returnPct: pctChange(preEvent?.close, postEvent?.close),
            observations: series.length,
            series,
          }
        } catch (error) {
          return {
            ...asset,
            startDate,
            endDate,
            error: error.message,
            observations: 0,
            series: [],
          }
        }
      }),
    )

    return res.json({
      event,
      windowDays,
      assets,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

const PORT = Number.parseInt(process.env.PORT, 10) || 5000
const HOST = process.env.HOST || "127.0.0.1"

app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error(`Failed to start server on ${HOST}:${PORT}`)
    console.error(error.message)
    process.exitCode = 1
    return
  }

  console.log(`Server running on http://${HOST}:${PORT}`)
})
