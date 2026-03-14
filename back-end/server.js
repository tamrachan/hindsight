const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const ASSET_PROXIES = [
  { assetClass: "Stocks", symbol: "SPY", reason: "Most common S&P 500 proxy" },
  {
    assetClass: "Bonds",
    symbol: "IEF",
    symbolCandidates: ["IEF", "TLT"],
    reason: "US Treasury bond ETF proxy (available on current plan)",
  },
  {
    assetClass: "Commodities",
    symbol: "DBC",
    symbolCandidates: ["DBC"],
    reason: "Commodity index ETF proxy (available on current plan)",
  },
  { assetClass: "Crypto", symbol: "BTC/USD", reason: "Dominant crypto asset" },
  {
    assetClass: "Real Estate",
    symbol: "VNQ",
    symbolCandidates: ["VNQ"],
    reason: "REIT index ETF proxy (available on current plan)",
  },
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

function getMonthlyRangeFromFirstEvent() {
  const sortedEvents = [...MAJOR_EVENTS].sort(
    (a, b) => new Date(`${a.date}T00:00:00Z`) - new Date(`${b.date}T00:00:00Z`),
  )
  const firstEvent = sortedEvents[0]
  const startDate = addDays(firstEvent.date, -365)
  const endDate = toIsoDate(new Date())
  return { firstEvent, startDate, endDate }
}

function normalizeToBase100(series) {
  if (!series.length) return { baseClose: null, points: [] }
  const baseClose = series[0].close
  const points = series.map((point) => ({
    datetime: point.datetime,
    close: point.close,
    normalized: (point.close / baseClose) * 100,
  }))
  return { baseClose, points }
}

function dateDiffDays(fromIsoDate, toIsoDate) {
  const from = new Date(`${fromIsoDate}T00:00:00Z`).getTime()
  const to = new Date(`${toIsoDate}T00:00:00Z`).getTime()
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}

function roundOrNull(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return Number(value.toFixed(decimals))
}

function getReturnAtDays(series, eventDate, days, baselineClose) {
  const targetDate = addDays(eventDate, days)
  const point = getNearestPoint(series, targetDate, "after")
  return {
    targetDate,
    pointDate: point?.datetime || null,
    returnPct: roundOrNull(pctChange(baselineClose, point?.close)),
  }
}

function calculatePostEventDrawdown(series, eventDate) {
  const post = series.filter((row) => row.datetime >= eventDate)
  if (!post.length) return null
  const peak = post[0].close
  let trough = post[0]

  for (const point of post) {
    if (point.close < trough.close) trough = point
  }

  return {
    troughDate: trough.datetime,
    maxDrawdownPct: roundOrNull(pctChange(peak, trough.close)),
  }
}

function calculateRecoveryDays(series, eventDate, baselineClose) {
  const post = series.filter((row) => row.datetime >= eventDate)
  const recovered = post.find((row) => row.close >= baselineClose)
  if (!recovered) return null
  return dateDiffDays(eventDate, recovered.datetime)
}

function buildLessonTakeaways(event, metrics) {
  const valid30 = metrics
    .filter((m) => m.returns.d30.returnPct !== null)
    .sort((a, b) => b.returns.d30.returnPct - a.returns.d30.returnPct)

  if (!valid30.length) {
    return [`No complete 30-day data was available for ${event.title}.`]
  }

  const best = valid30[0]
  const worst = valid30[valid30.length - 1]
  const safeHaven = metrics.find((m) => m.assetClass === "Bonds")

  const takeaways = [
    `${best.assetClass} led after 30 days (${best.returns.d30.returnPct}%).`,
    `${worst.assetClass} lagged after 30 days (${worst.returns.d30.returnPct}%).`,
  ]

  if (safeHaven?.returns?.d30?.returnPct !== null) {
    takeaways.push(
      `Bonds moved ${safeHaven.returns.d30.returnPct}% over 30 days, useful for safe-haven discussion.`,
    )
  }

  return takeaways
}

function buildLessonQuiz(event, metrics) {
  const valid30 = metrics
    .filter((m) => m.returns.d30.returnPct !== null)
    .sort((a, b) => b.returns.d30.returnPct - a.returns.d30.returnPct)

  const winner = valid30[0]?.assetClass || "N/A"
  const loser = valid30[valid30.length - 1]?.assetClass || "N/A"
  const optionPool = [...new Set(metrics.map((m) => m.assetClass))]

  return [
    {
      id: `${event.id}-q1`,
      question: `Which asset class performed best 30 days after ${event.title}?`,
      options: optionPool,
      correctAnswer: winner,
      explanation: `${winner} had the highest 30-day return in this dataset.`,
    },
    {
      id: `${event.id}-q2`,
      question: `Which asset class performed worst 30 days after ${event.title}?`,
      options: optionPool,
      correctAnswer: loser,
      explanation: `${loser} had the lowest 30-day return in this dataset.`,
    },
  ]
}

function getLastIndexOnOrBefore(timestamps, targetDate) {
  for (let i = timestamps.length - 1; i >= 0; i -= 1) {
    if (timestamps[i] <= targetDate) return i
  }
  return -1
}

function getFirstIndexOnOrAfter(timestamps, targetDate) {
  for (let i = 0; i < timestamps.length; i += 1) {
    if (timestamps[i] >= targetDate) return i
  }
  return -1
}

function buildEventMetricsForEvent(event, summary, months = 3) {
  const monthsClamped = Math.max(1, Math.min(24, months))
  const windowDays = monthsClamped * 30
  const startDate = addDays(event.date, -windowDays)
  const endDate = addDays(event.date, windowDays)
  const timestamps = summary.timestamps || []
  const beforeTargetDate = addDays(event.date, -windowDays)
  const afterTargetDate = addDays(event.date, windowDays)
  const beforeIdx = getLastIndexOnOrBefore(timestamps, beforeTargetDate)
  const eventIdx = getLastIndexOnOrBefore(timestamps, event.date)
  const afterIdx = getFirstIndexOnOrAfter(timestamps, afterTargetDate)

  const assets = summary.assets.map((asset) => {
    const beforeValue = beforeIdx >= 0 ? asset.values[beforeIdx] : null
    const eventValue = eventIdx >= 0 ? asset.values[eventIdx] : null
    const afterValue = afterIdx >= 0 ? asset.values[afterIdx] : null
    const hasMissingPoint = beforeValue === null || eventValue === null || afterValue === null

    if (asset.error || hasMissingPoint) {
      return {
        assetClass: asset.assetClass,
        symbol: asset.symbol,
        symbolUsed: asset.symbolUsed || null,
        error: asset.error || "Insufficient monthly normalized data for this event window",
        metrics: null,
      }
    }

    return {
      assetClass: asset.assetClass,
      symbol: asset.symbol,
      symbolUsed: asset.symbolUsed || null,
      beforePoint: {
        datetime: timestamps[beforeIdx],
        value: beforeValue,
      },
      eventPoint: {
        datetime: timestamps[eventIdx],
        value: eventValue,
      },
      afterPoint: {
        datetime: timestamps[afterIdx],
        value: afterValue,
      },
      metrics: {
        months: monthsClamped,
        beforeToEventPct: roundOrNull(pctChange(beforeValue, eventValue)),
        eventToAfterPct: roundOrNull(pctChange(eventValue, afterValue)),
        beforeToAfterPct: roundOrNull(pctChange(beforeValue, afterValue)),
      },
    }
  })

  return {
    event,
    source: "monthly-normalized-summary",
    months: monthsClamped,
    windowDays,
    window: {
      startDate,
      eventDate: event.date,
      endDate,
    },
    assets,
  }
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

async function fetchSeriesForAsset(asset, startDate, endDate, interval = "1day") {
  const candidates =
    Array.isArray(asset.symbolCandidates) && asset.symbolCandidates.length
      ? asset.symbolCandidates
      : [asset.symbol]
  let lastError = null

  for (const candidate of candidates) {
    try {
      const series = await fetchAssetSeries(candidate, startDate, endDate, interval)
      if (series.length > 0) {
        return { symbolUsed: candidate, series }
      }
    } catch (error) {
      lastError = error
    }
  }

  const reason = lastError?.message || "No valid data returned for any symbol candidate"
  throw new Error(`No data for ${asset.assetClass}. Tried: ${candidates.join(", ")}. ${reason}`)
}

function buildEventMarkers(timestamps) {
  return MAJOR_EVENTS.map((event) => {
    const idx = timestamps.findIndex((ts) => ts >= event.date)
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      category: event.category,
      timestampIndex: idx >= 0 ? idx : null,
      timestamp: idx >= 0 ? timestamps[idx] : null,
    }
  })
}

async function buildMonthlySummaryPayload() {
  const { firstEvent, startDate, endDate } = getMonthlyRangeFromFirstEvent()

  const rawAssets = await Promise.all(
    ASSET_PROXIES.map(async (asset) => {
      try {
        const { symbolUsed, series } = await fetchSeriesForAsset(asset, startDate, endDate, "1month")
        return { ...asset, symbolUsed, series }
      } catch (error) {
        return { ...asset, series: [], error: error.message }
      }
    }),
  )

  const timestampSet = new Set()
  rawAssets.forEach((asset) => {
    asset.series.forEach((point) => timestampSet.add(point.datetime))
  })

  const timestamps = [...timestampSet].sort(
    (a, b) => new Date(`${a}T00:00:00Z`) - new Date(`${b}T00:00:00Z`),
  )

  const assets = rawAssets.map((asset) => {
    if (asset.error) {
      return {
        assetClass: asset.assetClass,
        symbol: asset.symbol,
        symbolUsed: null,
        reason: asset.reason,
        error: asset.error,
        baseClose: null,
        latestClose: null,
        totalReturnPct: null,
        values: [],
      }
    }

    const { baseClose, points } = normalizeToBase100(asset.series)
    const byDate = new Map(points.map((point) => [point.datetime, point]))
    const values = timestamps.map((date) => {
      const point = byDate.get(date)
      if (!point) return null
      return Number(point.normalized.toFixed(4))
    })

    const latestClose = asset.series[asset.series.length - 1]?.close ?? null
    const totalReturnPct = pctChange(baseClose, latestClose)

    return {
      assetClass: asset.assetClass,
      symbol: asset.symbol,
      symbolUsed: asset.symbolUsed,
      reason: asset.reason,
      baseClose,
      latestClose,
      totalReturnPct: totalReturnPct === null ? null : Number(totalReturnPct.toFixed(4)),
      values,
    }
  })

  return {
    firstEvent,
    interval: "1month",
    startDate,
    endDate,
    timestamps,
    assets,
  }
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
          <li><a href="/api/asset-classes/monthly/summary">/api/asset-classes/monthly/summary</a></li>
          <li><a href="/api/charts/normalized-index">/api/charts/normalized-index</a></li>
          <li><a href="/api/event-metrics?months=3">/api/event-metrics?months=3</a></li>
          <li><a href="/api/lesson-cards/covid">/api/lesson-cards/covid</a></li>
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
    const { firstEvent, startDate, endDate } = getMonthlyRangeFromFirstEvent()

    const assets = await Promise.all(
      ASSET_PROXIES.map(async (asset) => {
        try {
          const { symbolUsed, series } = await fetchSeriesForAsset(
            asset,
            startDate,
            endDate,
            "1month",
          )
          return {
            ...asset,
            symbolUsed,
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

app.get("/api/asset-classes/monthly/summary", async (req, res) => {
  try {
    const payload = await buildMonthlySummaryPayload()
    return res.json(payload)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.get("/api/charts/normalized-index", async (req, res) => {
  try {
    const summary = await buildMonthlySummaryPayload()
    const eventMarkers = buildEventMarkers(summary.timestamps)

    return res.json({
      chartType: "normalized-index",
      yAxisBase: 100,
      logScaleSupported: true,
      ...summary,
      eventMarkers,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.get("/api/event-metrics", async (req, res) => {
  try {
    const months = Number.parseInt(req.query.months, 10) || 3
    const summary = await buildMonthlySummaryPayload()
    const events = MAJOR_EVENTS.map((event) => buildEventMetricsForEvent(event, summary, months))
    return res.json({
      months: Math.max(1, Math.min(24, months)),
      events,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.get("/api/event-metrics/:eventId", async (req, res) => {
  try {
    const event = MAJOR_EVENTS.find((item) => item.id === req.params.eventId)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const months = Number.parseInt(req.query.months, 10) || 3
    const summary = await buildMonthlySummaryPayload()
    const payload = buildEventMetricsForEvent(event, summary, months)
    return res.json(payload)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.get("/api/lesson-cards/:eventId", async (req, res) => {
  try {
    const event = MAJOR_EVENTS.find((item) => item.id === req.params.eventId)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const windowDays = Math.max(
      30,
      Math.min(365, Number.parseInt(req.query.windowDays, 10) || 180),
    )
    const startDate = addDays(event.date, -30)
    const endDate = addDays(event.date, windowDays)

    const assetMetrics = await Promise.all(
      ASSET_PROXIES.map(async (asset) => {
        try {
          const { symbolUsed, series } = await fetchSeriesForAsset(asset, startDate, endDate)
          const preEvent = getNearestPoint(series, event.date, "before")
          if (!preEvent) {
            return {
              assetClass: asset.assetClass,
              symbol: asset.symbol,
              symbolUsed,
              error: "No baseline data before event date",
            }
          }

          const d7 = getReturnAtDays(series, event.date, 7, preEvent.close)
          const d30 = getReturnAtDays(series, event.date, 30, preEvent.close)
          const d90 = getReturnAtDays(series, event.date, 90, preEvent.close)
          const drawdown = calculatePostEventDrawdown(series, event.date)
          const recoveryDays = calculateRecoveryDays(series, event.date, preEvent.close)

          return {
            assetClass: asset.assetClass,
            symbol: asset.symbol,
            symbolUsed,
            baseline: {
              date: preEvent.datetime,
              close: preEvent.close,
            },
            returns: { d7, d30, d90 },
            maxDrawdownPct: drawdown?.maxDrawdownPct ?? null,
            troughDate: drawdown?.troughDate ?? null,
            recoveryDays,
          }
        } catch (error) {
          return {
            assetClass: asset.assetClass,
            symbol: asset.symbol,
            error: error.message,
          }
        }
      }),
    )

    const validMetrics = assetMetrics.filter((metric) => !metric.error)
    const lessonCard = {
      id: `lesson-${event.id}`,
      title: `${event.title}: Cross-Asset Impact`,
      event,
      teachingFocus: [
        "Compare immediate vs medium-term market reactions",
        "Identify relative winners and losers by asset class",
        "Discuss drawdowns and recovery behavior",
      ],
      keyTakeaways: buildLessonTakeaways(event, validMetrics),
      quizQuestions: buildLessonQuiz(event, validMetrics),
      metrics: assetMetrics,
    }

    return res.json({
      windowDays,
      startDate,
      endDate,
      lessonCard,
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
          const { symbolUsed, series } = await fetchSeriesForAsset(asset, startDate, endDate)
          const preEvent = getNearestPoint(series, event.date, "before")
          const postEvent = getNearestPoint(series, event.date, "after")

          return {
            ...asset,
            symbolUsed,
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
