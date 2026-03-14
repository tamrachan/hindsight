import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import TimelineChart from "./components/TimelineChart";
import {
  EVENTS,
  EVENTS_BY_ID,
  ALL_ASSETS,
  ASSET_COLORS,
  CATEGORY_BADGE_CLASSES,
} from "./constants";
import { useState, useRef } from "react";
import { FiSun, FiMoon, FiArrowDown } from "react-icons/fi";


// ---------------------------------------------------------------------------
// Per-event impact chart data (indexed to 100 at pre-event baseline)
// Keyed by event id to match constants/events.js
// ---------------------------------------------------------------------------
const PERFORMANCE_DATA = {
  dotcom: [
    { month: "Dec 99", Stocks: 100, Bonds: 100, Commodities: 96,  Crypto: null, "Real Estate": 100, ESG: 99  },
    { month: "Jan 00", Stocks: 97,  Bonds: 101, Commodities: 97,  Crypto: null, "Real Estate": 101, ESG: 97  },
    { month: "Feb 00", Stocks: 94,  Bonds: 102, Commodities: 96,  Crypto: null, "Real Estate": 102, ESG: 95  },
    { month: "Mar 00", Stocks: 82,  Bonds: 105, Commodities: 95,  Crypto: null, "Real Estate": 103, ESG: 83  },
    { month: "Apr 00", Stocks: 76,  Bonds: 106, Commodities: 94,  Crypto: null, "Real Estate": 102, ESG: 78  },
    { month: "May 00", Stocks: 72,  Bonds: 107, Commodities: 93,  Crypto: null, "Real Estate": 101, ESG: 74  },
    { month: "Jun 00", Stocks: 75,  Bonds: 106, Commodities: 94,  Crypto: null, "Real Estate": 103, ESG: 76  },
  ],
  "911": [
    { month: "Jun 01", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: null, "Real Estate": 100, ESG: 98  },
    { month: "Jul 01", Stocks: 97,  Bonds: 101, Commodities: 99,  Crypto: null, "Real Estate": 101, ESG: 97  },
    { month: "Aug 01", Stocks: 95,  Bonds: 102, Commodities: 98,  Crypto: null, "Real Estate": 101, ESG: 95  },
    { month: "Sep 01", Stocks: 82,  Bonds: 106, Commodities: 96,  Crypto: null, "Real Estate": 99,  ESG: 84  },
    { month: "Oct 01", Stocks: 85,  Bonds: 107, Commodities: 94,  Crypto: null, "Real Estate": 100, ESG: 86  },
    { month: "Nov 01", Stocks: 88,  Bonds: 106, Commodities: 95,  Crypto: null, "Real Estate": 101, ESG: 89  },
    { month: "Dec 01", Stocks: 91,  Bonds: 105, Commodities: 97,  Crypto: null, "Real Estate": 102, ESG: 91  },
  ],
  gfc: [
    { month: "Jun 08", Stocks: 100, Bonds: 100, Commodities: 110, Crypto: null, "Real Estate": 85,  ESG: 99  },
    { month: "Jul 08", Stocks: 96,  Bonds: 101, Commodities: 115, Crypto: null, "Real Estate": 82,  ESG: 95  },
    { month: "Aug 08", Stocks: 94,  Bonds: 102, Commodities: 108, Crypto: null, "Real Estate": 80,  ESG: 93  },
    { month: "Sep 08", Stocks: 70,  Bonds: 108, Commodities: 95,  Crypto: null, "Real Estate": 70,  ESG: 72  },
    { month: "Oct 08", Stocks: 55,  Bonds: 110, Commodities: 80,  Crypto: null, "Real Estate": 62,  ESG: 58  },
    { month: "Nov 08", Stocks: 52,  Bonds: 112, Commodities: 75,  Crypto: null, "Real Estate": 58,  ESG: 55  },
    { month: "Dec 08", Stocks: 56,  Bonds: 115, Commodities: 72,  Crypto: null, "Real Estate": 55,  ESG: 59  },
  ],
  covid: [
    { month: "Dec 19", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100,  "Real Estate": 100, ESG: 100 },
    { month: "Jan 20", Stocks: 102, Bonds: 101, Commodities: 98,  Crypto: 130,  "Real Estate": 101, ESG: 103 },
    { month: "Feb 20", Stocks: 90,  Bonds: 104, Commodities: 90,  Crypto: 110,  "Real Estate": 95,  ESG: 91  },
    { month: "Mar 20", Stocks: 68,  Bonds: 100, Commodities: 72,  Crypto: 75,   "Real Estate": 80,  ESG: 70  },
    { month: "Apr 20", Stocks: 78,  Bonds: 103, Commodities: 65,  Crypto: 90,   "Real Estate": 78,  ESG: 82  },
    { month: "May 20", Stocks: 85,  Bonds: 104, Commodities: 70,  Crypto: 105,  "Real Estate": 80,  ESG: 90  },
    { month: "Jun 20", Stocks: 90,  Bonds: 104, Commodities: 75,  Crypto: 115,  "Real Estate": 83,  ESG: 97  },
  ],
  ukraine: [
    { month: "Nov 21", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100,  "Real Estate": 100, ESG: 100 },
    { month: "Dec 21", Stocks: 101, Bonds: 99,  Commodities: 103, Crypto: 90,   "Real Estate": 102, ESG: 100 },
    { month: "Jan 22", Stocks: 96,  Bonds: 97,  Commodities: 108, Crypto: 75,   "Real Estate": 100, ESG: 96  },
    { month: "Feb 22", Stocks: 93,  Bonds: 96,  Commodities: 125, Crypto: 70,   "Real Estate": 98,  ESG: 94  },
    { month: "Mar 22", Stocks: 94,  Bonds: 94,  Commodities: 135, Crypto: 72,   "Real Estate": 97,  ESG: 95  },
    { month: "Apr 22", Stocks: 91,  Bonds: 92,  Commodities: 130, Crypto: 68,   "Real Estate": 96,  ESG: 93  },
    { month: "May 22", Stocks: 88,  Bonds: 91,  Commodities: 128, Crypto: 55,   "Real Estate": 94,  ESG: 90  },
  ],
  fed2022: [
    { month: "Dec 21", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100,  "Real Estate": 100, ESG: 100 },
    { month: "Jan 22", Stocks: 96,  Bonds: 97,  Commodities: 105, Crypto: 80,   "Real Estate": 99,  ESG: 96  },
    { month: "Feb 22", Stocks: 93,  Bonds: 95,  Commodities: 118, Crypto: 72,   "Real Estate": 97,  ESG: 93  },
    { month: "Mar 22", Stocks: 91,  Bonds: 90,  Commodities: 122, Crypto: 68,   "Real Estate": 95,  ESG: 91  },
    { month: "Apr 22", Stocks: 89,  Bonds: 87,  Commodities: 118, Crypto: 60,   "Real Estate": 93,  ESG: 89  },
    { month: "May 22", Stocks: 85,  Bonds: 84,  Commodities: 115, Crypto: 48,   "Real Estate": 90,  ESG: 86  },
    { month: "Jun 22", Stocks: 80,  Bonds: 82,  Commodities: 112, Crypto: 35,   "Real Estate": 86,  ESG: 82  },
  ],
  paris: [
    { month: "Sep 15", Stocks: 100, Bonds: 100, Commodities: 85,  Crypto: 100,  "Real Estate": 100, ESG: 102 },
    { month: "Oct 15", Stocks: 103, Bonds: 101, Commodities: 83,  Crypto: 98,   "Real Estate": 101, ESG: 105 },
    { month: "Nov 15", Stocks: 102, Bonds: 100, Commodities: 80,  Crypto: 100,  "Real Estate": 101, ESG: 104 },
    { month: "Dec 15", Stocks: 101, Bonds: 100, Commodities: 78,  Crypto: 102,  "Real Estate": 102, ESG: 107 },
    { month: "Jan 16", Stocks: 97,  Bonds: 101, Commodities: 75,  Crypto: 101,  "Real Estate": 101, ESG: 105 },
    { month: "Feb 16", Stocks: 95,  Bonds: 103, Commodities: 72,  Crypto: 105,  "Real Estate": 100, ESG: 104 },
    { month: "Mar 16", Stocks: 99,  Bonds: 102, Commodities: 74,  Crypto: 110,  "Real Estate": 102, ESG: 108 },
  ],
};

const EVENT_MONTH_INDEX = 3;

// ---------------------------------------------------------------------------
// Custom tooltip for the impact chart
// ---------------------------------------------------------------------------
const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className={`rounded-xl shadow-lg px-4 py-3 text-sm border ${
        dark
          ? "bg-gray-800 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) =>
        entry.value != null ? (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ) : null
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const appRef = useRef(null);
  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: "smooth" });

  const [dark, setDark] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(
    EVENTS.find((e) => e.id === "covid")
  );
  const [activeAssets, setActiveAssets] = useState(new Set(ALL_ASSETS));

  const handleTimelineSelect = (point) => {
    // point may come from TimelineChart (backend shape: { id, title, date, category })
    // or from the event cards (constants shape: { id, name, date, category })
    const match = EVENTS_BY_ID[point.id] ?? EVENTS.find((e) => e.name === point.title);
    if (match) setSelectedEvent(match);
  };

  const toggleAsset = (asset) => {
    setActiveAssets((prev) => {
      const next = new Set(prev);
      next.has(asset) ? next.delete(asset) : next.add(asset);
      return next;
    });
  };

  const chartData = PERFORMANCE_DATA[selectedEvent.id] ?? [];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
          </div>

          {/* Center: Hindsight + 20/20 */}
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold tracking-tight">Hindsight</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">20/20</p>
          </div>

          {/* Right: Dark/Light Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="relative group flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
              <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-700 text-white dark:bg-gray-200 dark:text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {dark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

          {/* ── INTRO ── */}
          <div>
            <h2 className="text-2xl font-bold mb-1">
              How do global events move markets?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Explore the full historical performance of major asset classes — then zoom into
              any event to see exactly how markets reacted. Includes sustainability milestones.
            </p>
          </div>

          {/* ── HISTORICAL TIMELINE (real API data) ── */}
          <TimelineChart
            dark={dark}
            selectedEventId={selectedEvent.id}
            onSelectEvent={handleTimelineSelect}
          />

          {/* ── SECTION DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
              Event deep-dive
            </p>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* ── EVENT SELECTOR CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {EVENTS.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedEvent.id === event.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${
                    CATEGORY_BADGE_CLASSES[event.category] ?? ""
                  }`}
                >
                  {event.category}
                </span>
                <p className="font-semibold text-sm leading-tight">{event.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>

          {/* ── EVENT DESCRIPTION ── */}
          <div className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <span className="text-2xl mt-0.5">
              {selectedEvent.category === "sustainability" ? "🌱" : "📌"}
            </span>
            <div>
              <h3 className="font-bold text-base">
                {selectedEvent.name}{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (
                  {new Date(`${selectedEvent.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                  )
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedEvent.description}
              </p>
            </div>
          </div>

          {/* ── ASSET TOGGLES ── */}
          <div className="flex flex-wrap gap-2">
            {ALL_ASSETS.map((asset) => (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeAssets.has(asset)
                    ? "border-transparent text-white shadow-sm"
                    : "border-gray-300 dark:border-gray-600 text-gray-400 bg-transparent"
                }`}
                style={
                  activeAssets.has(asset)
                    ? { backgroundColor: ASSET_COLORS[asset] }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ASSET_COLORS[asset] }}
                />
                {asset}
              </button>
            ))}
          </div>

          {/* ── IMPACT LINE CHART ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Indexed Performance — {selectedEvent.name}
              <span className="ml-2 normal-case font-normal text-gray-400">
                (100 = pre-event baseline)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={dark ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: dark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: dark ? "#374151" : "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: dark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <ReferenceLine
                  x={chartData[EVENT_MONTH_INDEX]?.month}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Event",
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <ReferenceLine
                  y={100}
                  stroke={dark ? "#4b5563" : "#d1d5db"}
                  strokeDasharray="3 3"
                />
                {ALL_ASSETS.map((asset) =>
                  activeAssets.has(asset) ? (
                    <Line
                      key={asset}
                      type="monotone"
                      dataKey={asset}
                      stroke={ASSET_COLORS[asset]}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: ASSET_COLORS[asset] }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  ) : null
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_ASSETS.map((asset) => {
              const first = chartData[0]?.[asset];
              const last  = chartData[chartData.length - 1]?.[asset];
              const change =
                first != null && last != null
                  ? (((last - first) / first) * 100).toFixed(1)
                  : null;
              const positive = Number(change) >= 0;
              return (
                <div
                  key={asset}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: ASSET_COLORS[asset] }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {asset}
                  </p>
                  {change != null ? (
                    <p
                      className={`text-lg font-bold mt-1 ${
                        positive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {positive ? "+" : ""}{change}%
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">N/A</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">over period</p>
                </div>
              );
            })}
          </div>

          {/* ── SUSTAINABILITY CALLOUT ── */}
          {selectedEvent.category === "sustainability" && (
            <div className="rounded-xl p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                🌱 <strong>Sustainability Insight:</strong> This event directly reshaped
                long-term capital flows. ESG funds and clean energy indices outperformed
                traditional benchmarks in the 12 months following this milestone, signalling
                a structural shift in investor priorities.
              </p>
            </div>
          )}

          {/* ── FOOTER ── */}
          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
            MarketPulse · Built for BlackRock Hackathon · Impact chart data is illustrative;
            timeline uses live data via Twelve Data API
          </footer>

        </main>
      </div>
    </div>
  );
}
