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

const SUPPORTING_ARTICLES = [
  {
    id: "dotcom-sp500-2000",
    title: "What Happened in the Dot-Com Bubble?",
    source: "Investopedia",
    publishedAt: "2023-10-31",
    url: "https://www.investopedia.com/terms/d/dotcom-bubble.asp",
    eventIds: ["dotcom"],
    assetClasses: ["Stocks"],
    summary: "Explains equity valuation excesses and the subsequent tech-heavy selloff.",
  },
  {
    id: "gfc-treasury-safe-haven",
    title: "The Financial Crisis and Treasury Yields",
    source: "Federal Reserve Bank of St. Louis",
    publishedAt: "2009-01-01",
    url: "https://www.stlouisfed.org",
    eventIds: ["gfc"],
    assetClasses: ["Bonds"],
    summary: "Discusses flight-to-quality behavior and rate/yield dynamics during crisis stress.",
  },
  {
    id: "covid-cross-asset-2020",
    title: "Policy Responses to COVID-19 and Financial Markets",
    source: "IMF",
    publishedAt: "2020-06-01",
    url: "https://www.imf.org",
    eventIds: ["covid"],
    assetClasses: ["Stocks", "Bonds", "Commodities", "Real Estate", "Crypto"],
    summary: "Summarizes cross-asset dislocations and the impact of policy support.",
  },
  {
    id: "911-market-impact",
    title: "The Market Impact of 9/11",
    source: "Federal Reserve History",
    publishedAt: "2013-01-01",
    url: "https://www.federalreservehistory.org",
    eventIds: ["911"],
    assetClasses: ["Stocks", "Bonds"],
    summary: "Describes near-term market shutdowns and risk-off repricing.",
  },
  {
    id: "commodity-shocks-overview",
    title: "Commodity Price Shocks and Macroeconomic Stability",
    source: "BIS",
    publishedAt: "2022-05-01",
    url: "https://www.bis.org",
    eventIds: ["gfc", "covid"],
    assetClasses: ["Commodities"],
    summary: "Provides context for commodity volatility in global shock episodes.",
  },
  {
    id: "reit-crisis-behavior",
    title: "REIT Performance in Market Downturns",
    source: "Nareit",
    publishedAt: "2021-03-15",
    url: "https://www.reit.com",
    eventIds: ["gfc", "covid"],
    assetClasses: ["Real Estate"],
    summary: "Reviews REIT drawdown and recovery patterns in stress regimes.",
  },
  {
    id: "bitcoin-crisis-correlation",
    title: "Bitcoin’s Evolving Role in Multi-Asset Portfolios",
    source: "Coin Metrics",
    publishedAt: "2023-08-01",
    url: "https://coinmetrics.io",
    eventIds: ["covid"],
    assetClasses: ["Crypto"],
    summary: "Examines bitcoin behavior versus traditional risk assets across cycles.",
  },
]

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

function getSupportingArticles({ eventId = null, assetClass = null, limit = 20 } = {}) {
  const normalizedAsset = assetClass ? String(assetClass).trim().toLowerCase() : null
  const filtered = SUPPORTING_ARTICLES.filter((article) => {
    const eventMatch = eventId ? article.eventIds.includes(eventId) : true
    const assetMatch = normalizedAsset
      ? article.assetClasses.some((cls) => cls.toLowerCase() === normalizedAsset)
      : true
    return eventMatch && assetMatch
  })
  return filtered.slice(0, Math.max(1, Math.min(100, limit)))
}

function roundOrNull(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return Number(value.toFixed(decimals))
}

function buildAnalysisPrompt(metricsPayload) {
  const articles = getSupportingArticles({ eventId: metricsPayload?.event?.id, limit: 12 })
  return [
    "You are a financial education assistant for students.",
    "Use only the provided data. Do not invent facts, dates, or percentages.",
    "Use the supporting articles as context and cite article IDs where relevant.",
    "Write concise, plain-English explanations.",
    "Return strict JSON with this schema:",
    "{",
    '  "eventSummary": "string",',
    '  "crossAssetNarrative": "string",',
    '  "assetExplanations": [',
    "    {",
    '      "assetClass": "string",',
    '      "whyItMoved": "string",',
    '      "evidence": "string",',
    '      "confidence": "low|medium|high",',
    '      "citations": ["article_id"]',
    "    }",
    "  ],",
    '  "teachingNotes": ["string"],',
    '  "globalCitations": ["article_id"]',
    "}",
    "Data:",
    JSON.stringify(metricsPayload),
    "Supporting articles:",
    JSON.stringify(articles),
  ].join("\n")
}

async function generateLLMAnalysis(metricsPayload) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment")
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash"
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  )
  url.searchParams.set("key", apiKey)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildAnalysisPrompt(metricsPayload) }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini request failed (${response.status}): ${errorBody}`)
  }

  const json = await response.json()
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text)
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  if (!text) {
    throw new Error("Gemini returned an empty analysis response")
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      eventSummary: text,
      crossAssetNarrative: "",
      assetExplanations: [],
      teachingNotes: ["Model response was not valid JSON; returned as raw text in eventSummary."],
    }
  }
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
          <li><a href="/api/articles?eventId=covid">/api/articles?eventId=covid</a></li>
          <li><a href="/api/event-metrics?months=3">/api/event-metrics?months=3</a></li>
          <li><a href="/api/event-analysis/covid?months=3">/api/event-analysis/covid?months=3</a></li>
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

app.get("/api/articles", (req, res) => {
  const eventId = req.query.eventId ? String(req.query.eventId) : null
  const assetClass = req.query.assetClass ? String(req.query.assetClass) : null
  const limit = Number.parseInt(req.query.limit, 10) || 20
  const articles = getSupportingArticles({ eventId, assetClass, limit })

  return res.json({
    count: articles.length,
    articles,
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

app.get("/api/event-analysis/:eventId", async (req, res) => {
  try {
    const event = MAJOR_EVENTS.find((item) => item.id === req.params.eventId)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }

    const months = Number.parseInt(req.query.months, 10) || 3
    const summary = await buildMonthlySummaryPayload()
    const metricsPayload = buildEventMetricsForEvent(event, summary, months)
    const supportingArticles = getSupportingArticles({ eventId: event.id, limit: 12 })
    const analysis = await generateLLMAnalysis(metricsPayload)

    return res.json({
      source: "gemini",
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      metrics: metricsPayload,
      supportingArticles,
      analysis,
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
