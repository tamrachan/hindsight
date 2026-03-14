import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { ASSET_COLORS, CATEGORY_COLORS, API_ENDPOINTS } from "../constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXAxis(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function buildChartData(timestamps, assets) {
  return timestamps.map((datetime, idx) => {
    const point = { datetime };
    for (const asset of assets) {
      point[asset.assetClass] = asset.values[idx] ?? null;
    }
    return point;
  });
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

const CustomTooltip = ({ active, payload, label, events, dark }) => {
  if (!active || !payload || !payload.length) return null;

  const monthStr = label?.slice(0, 7);
  const matchedEvent = events?.find((e) => e.date.slice(0, 7) === monthStr);

  return (
    <div
      className={`rounded-xl shadow-lg px-4 py-3 text-sm border max-w-xs z-50 ${
        dark
          ? "bg-gray-800 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {matchedEvent && (
        <div
          className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-600"
          style={{ color: CATEGORY_COLORS[matchedEvent.category] ?? "#888" }}
        >
          <p className="font-bold">📌 {matchedEvent.title}</p>
          <p className="text-xs opacity-80">
            {matchedEvent.date} · {matchedEvent.category}
          </p>
        </div>
      )}
      <p className="text-xs text-gray-400 mb-1 font-medium">{formatXAxis(label)}</p>
      {payload.map((entry) =>
        entry.value != null ? (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value.toFixed(1)}</span>
          </p>
        ) : null
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Event marker label
// ---------------------------------------------------------------------------

const EventMarker = ({ viewBox, event, dark }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const color = CATEGORY_COLORS[event.category] ?? "#888";

  // Alternate labels above/below to avoid overlap for close events (e.g. ukraine + fed2022)
  const LABEL_OFFSETS = {
    dotcom:  { dy: -38, anchor: "middle" },
    "911":   { dy: -38, anchor: "middle" },
    gfc:     { dy: -38, anchor: "middle" },
    covid:   { dy: -38, anchor: "middle" },
    ukraine: { dy: -38, anchor: "end"    },  // nudged left
    fed2022: { dy: -56, anchor: "start"  },  // pushed higher
    paris:   { dy: -38, anchor: "middle" },
  };

  const offset = LABEL_OFFSETS[event.id] ?? { dy: -38, anchor: "middle" };

  // Shorten long titles for the label
  const SHORT_NAMES = {
    dotcom:  "Dot-com",
    "911":   "9/11",
    gfc:     "GFC",
    covid:   "COVID-19",
    ukraine: "Ukraine",
    fed2022: "Fed Hikes",
    paris:   "Paris Agmt",
  };
  const label = SHORT_NAMES[event.id] ?? event.title;

  return (
    <g style={{ cursor: "pointer" }}>
      {/* Vertical tick */}
      <line
        x1={x} y1={y}
        x2={x} y2={y + offset.dy + 28}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.5}
      />
      {/* Diamond marker */}
      <rect
        x={x - 5}
        y={y - 24}
        width={10}
        height={10}
        rx={2}
        fill={color}
        transform={`rotate(45, ${x}, ${y - 19})`}
      />
      {/* Label background pill */}
      <rect
        x={x - 28}
        y={y + offset.dy - 14}
        width={56}
        height={16}
        rx={4}
        fill={color}
        opacity={0.15}
      />
      {/* Label text */}
      <text
        x={x}
        y={y + offset.dy}
        textAnchor={offset.anchor}
        fontSize={10}
        fontWeight={600}
        fill={color}
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TimelineChart({ dark, selectedEventId, onSelectEvent }) {
  const [chartData, setChartData]       = useState([]);
  const [events, setEvents]             = useState([]);
  const [assetMeta, setAssetMeta]       = useState([]);
  const [activeAssets, setActiveAssets] = useState(new Set());
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, eventsRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.monthlySummary}?commonStart=true`),
          fetch(API_ENDPOINTS.events),
        ]);

        if (!summaryRes.ok || !eventsRes.ok)
          throw new Error("Backend request failed — is the server running on port 5000?");

        const summaryJson = await summaryRes.json();
        const eventsJson  = await eventsRes.json();

        // Log here to debug if chart is still empty
        console.log("[TimelineChart] summary:", summaryJson);
        console.log("[TimelineChart] events:", eventsJson);

        const validAssets = (summaryJson.assets ?? []).filter(
          (a) => !a.error && Array.isArray(a.values) && a.values.length > 0
        );

        if (validAssets.length === 0) {
          throw new Error(
            "No asset data returned. Check your TWELVE_DATA_API_KEY and that symbols are on your plan."
          );
        }

        setChartData(buildChartData(summaryJson.timestamps ?? [], validAssets));
        setAssetMeta(validAssets);
        setActiveAssets(new Set(validAssets.map((a) => a.assetClass)));
        setEvents(eventsJson.events ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleAsset = (assetClass) => {
    setActiveAssets((prev) => {
      const next = new Set(prev);
      next.has(assetClass) ? next.delete(assetClass) : next.add(assetClass);
      return next;
    });
  };

  const getEventX = (eventDate) => {
    const target = eventDate.slice(0, 7);
    return chartData.find((d) => d.datetime.slice(0, 7) === target)?.datetime ?? null;
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Historical Performance Timeline
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Indexed to 100 at common start · Hover for details · Click a marker to explore
          </p>
        </div>
        {loading && (
          <span className="text-xs text-blue-400 animate-pulse">Fetching data…</span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}

      {/* Asset toggle buttons */}
      {!loading && !error && assetMeta.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assetMeta.map((asset) => {
            const on    = activeAssets.has(asset.assetClass);
            const color = ASSET_COLORS[asset.assetClass] ?? "#6b7280";
            const ret   = asset.totalReturnPct;
            return (
              <button
                key={asset.assetClass}
                onClick={() => toggleAsset(asset.assetClass)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  on
                    ? "border-transparent text-white shadow-sm"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
                style={on ? { backgroundColor: color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                {asset.assetClass}
                {ret != null && (
                  <span className={`ml-1 font-bold ${on ? "text-white/80" : ret >= 0 ? "text-green-500" : "text-red-400"}`}>
                    {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 55, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1f2937" : "#f3f4f6"} />
            <XAxis
              dataKey="datetime"
              tickFormatter={formatXAxis}
              tick={{ fill: dark ? "#6b7280" : "#9ca3af", fontSize: 11 }}
              axisLine={{ stroke: dark ? "#374151" : "#e5e7eb" }}
              tickLine={false}
              minTickGap={60}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: dark ? "#6b7280" : "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(0)}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip events={events} dark={dark} />} />

            {/* Baseline */}
            <ReferenceLine y={100} stroke={dark ? "#374151" : "#e5e7eb"} strokeDasharray="4 2" />

            {/* Event markers */}
            {events.map((event) => {
              const xVal = getEventX(event.date);
              if (!xVal) return null;
              const color      = CATEGORY_COLORS[event.category] ?? "#888";
              const isSelected = event.id === selectedEventId;
              return (
                <ReferenceLine
                  key={event.id}
                  x={xVal}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isSelected ? "0" : "4 3"}
                  opacity={isSelected ? 1 : 0.6}
                  label={<EventMarker event={event} dark={dark} />}
                  onClick={() => onSelectEvent?.(event)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

            {/* Asset lines */}
            {assetMeta.map((asset) =>
              activeAssets.has(asset.assetClass) ? (
                <Line
                  key={asset.assetClass}
                  type="monotone"
                  dataKey={asset.assetClass}
                  stroke={ASSET_COLORS[asset.assetClass] ?? "#6b7280"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Event legend */}
      {!loading && !error && events.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {events.map((event) => {
            const color      = CATEGORY_COLORS[event.category] ?? "#888";
            const isSelected = event.id === selectedEventId;
            return (
              <button
                key={event.id}
                onClick={() => onSelectEvent?.(event)}
                className={`flex items-center gap-1.5 text-xs transition-colors rounded px-1.5 py-0.5 ${
                  isSelected
                    ? "font-bold text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
                style={isSelected ? { outline: `2px solid ${color}` } : {}}
              >
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                {event.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
