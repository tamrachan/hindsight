import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import './index.css'
import TimelineChart from "./components/TimelineChart";


// --- DATA ---
const EVENTS = [
  {
    id: 1,
    name: "9/11 Attacks",
    date: "Sep 2001",
    dataKey: "sep2001",
    category: "Geopolitical",
    description:
      "Terrorist attacks triggered immediate market sell-offs, with stocks plunging ~15% in the following week.",
  },
  {
    id: 2,
    name: "2008 Financial Crisis",
    date: "Sep 2008",
    dataKey: "sep2008",
    category: "Financial",
    description:
      "Lehman Brothers collapse sparked a global recession. Equities fell ~50%, while gold surged as a safe haven.",
  },
  {
    id: 3,
    name: "COVID-19 Pandemic",
    date: "Mar 2020",
    dataKey: "mar2020",
    category: "Pandemic",
    description:
      "Global lockdowns caused the fastest market crash in history, followed by a rapid ESG-led recovery.",
  },
  {
    id: 4,
    name: "Russia-Ukraine War",
    date: "Feb 2022",
    dataKey: "feb2022",
    category: "Geopolitical",
    description:
      "Energy commodity prices surged. European clean energy indices also rose on energy security concerns.",
  },
  {
    id: 5,
    name: "Fed Rate Hikes",
    date: "Mar 2022",
    dataKey: "mar2022",
    category: "Monetary Policy",
    description:
      "Aggressive rate hikes hit bonds and growth stocks hard. Crypto entered a prolonged bear market.",
  },
  {
    id: 6,
    name: "Paris Agreement",
    date: "Dec 2015",
    dataKey: "dec2015",
    category: "Sustainability",
    description:
      "Global climate accord boosted ESG and clean energy funds. Fossil fuel stocks began long-term repricing.",
  },
];

// Simulated indexed performance (100 = baseline, ~3 months before/after event)
const PERFORMANCE_DATA = {
  sep2001: [
    { month: "Jun 01", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: null, ESG: 98 },
    { month: "Jul 01", Stocks: 97, Bonds: 101, Commodities: 99, Crypto: null, ESG: 97 },
    { month: "Aug 01", Stocks: 95, Bonds: 102, Commodities: 98, Crypto: null, ESG: 95 },
    { month: "Sep 01", Stocks: 82, Bonds: 106, Commodities: 96, Crypto: null, ESG: 84 },
    { month: "Oct 01", Stocks: 85, Bonds: 107, Commodities: 94, Crypto: null, ESG: 86 },
    { month: "Nov 01", Stocks: 88, Bonds: 106, Commodities: 95, Crypto: null, ESG: 89 },
    { month: "Dec 01", Stocks: 91, Bonds: 105, Commodities: 97, Crypto: null, ESG: 91 },
  ],
  sep2008: [
    { month: "Jun 08", Stocks: 100, Bonds: 100, Commodities: 110, Crypto: null, ESG: 99 },
    { month: "Jul 08", Stocks: 96, Bonds: 101, Commodities: 115, Crypto: null, ESG: 95 },
    { month: "Aug 08", Stocks: 94, Bonds: 102, Commodities: 108, Crypto: null, ESG: 93 },
    { month: "Sep 08", Stocks: 70, Bonds: 108, Commodities: 95, Crypto: null, ESG: 72 },
    { month: "Oct 08", Stocks: 55, Bonds: 110, Commodities: 80, Crypto: null, ESG: 58 },
    { month: "Nov 08", Stocks: 52, Bonds: 112, Commodities: 75, Crypto: null, ESG: 55 },
    { month: "Dec 08", Stocks: 56, Bonds: 115, Commodities: 72, Crypto: null, ESG: 59 },
  ],
  mar2020: [
    { month: "Dec 19", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100, ESG: 100 },
    { month: "Jan 20", Stocks: 102, Bonds: 101, Commodities: 98, Crypto: 130, ESG: 103 },
    { month: "Feb 20", Stocks: 90, Bonds: 104, Commodities: 90, Crypto: 110, ESG: 91 },
    { month: "Mar 20", Stocks: 68, Bonds: 100, Commodities: 72, Crypto: 75, ESG: 70 },
    { month: "Apr 20", Stocks: 78, Bonds: 103, Commodities: 65, Crypto: 90, ESG: 82 },
    { month: "May 20", Stocks: 85, Bonds: 104, Commodities: 70, Crypto: 105, ESG: 90 },
    { month: "Jun 20", Stocks: 90, Bonds: 104, Commodities: 75, Crypto: 115, ESG: 97 },
  ],
  feb2022: [
    { month: "Nov 21", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100, ESG: 100 },
    { month: "Dec 21", Stocks: 101, Bonds: 99, Commodities: 103, Crypto: 90, ESG: 100 },
    { month: "Jan 22", Stocks: 96, Bonds: 97, Commodities: 108, Crypto: 75, ESG: 96 },
    { month: "Feb 22", Stocks: 93, Bonds: 96, Commodities: 125, Crypto: 70, ESG: 94 },
    { month: "Mar 22", Stocks: 94, Bonds: 94, Commodities: 135, Crypto: 72, ESG: 95 },
    { month: "Apr 22", Stocks: 91, Bonds: 92, Commodities: 130, Crypto: 68, ESG: 93 },
    { month: "May 22", Stocks: 88, Bonds: 91, Commodities: 128, Crypto: 55, ESG: 90 },
  ],
  mar2022: [
    { month: "Dec 21", Stocks: 100, Bonds: 100, Commodities: 100, Crypto: 100, ESG: 100 },
    { month: "Jan 22", Stocks: 96, Bonds: 97, Commodities: 105, Crypto: 80, ESG: 96 },
    { month: "Feb 22", Stocks: 93, Bonds: 95, Commodities: 118, Crypto: 72, ESG: 93 },
    { month: "Mar 22", Stocks: 91, Bonds: 90, Commodities: 122, Crypto: 68, ESG: 91 },
    { month: "Apr 22", Stocks: 89, Bonds: 87, Commodities: 118, Crypto: 60, ESG: 89 },
    { month: "May 22", Stocks: 85, Bonds: 84, Commodities: 115, Crypto: 48, ESG: 86 },
    { month: "Jun 22", Stocks: 80, Bonds: 82, Commodities: 112, Crypto: 35, ESG: 82 },
  ],
  dec2015: [
    { month: "Sep 15", Stocks: 100, Bonds: 100, Commodities: 85, Crypto: 100, ESG: 102 },
    { month: "Oct 15", Stocks: 103, Bonds: 101, Commodities: 83, Crypto: 98, ESG: 105 },
    { month: "Nov 15", Stocks: 102, Bonds: 100, Commodities: 80, Crypto: 100, ESG: 104 },
    { month: "Dec 15", Stocks: 101, Bonds: 100, Commodities: 78, Crypto: 102, ESG: 107 },
    { month: "Jan 16", Stocks: 97, Bonds: 101, Commodities: 75, Crypto: 101, ESG: 105 },
    { month: "Feb 16", Stocks: 95, Bonds: 103, Commodities: 72, Crypto: 105, ESG: 104 },
    { month: "Mar 16", Stocks: 99, Bonds: 102, Commodities: 74, Crypto: 110, ESG: 108 },
  ],
};

const ASSET_COLORS = {
  Stocks: "#3b82f6",
  Bonds: "#10b981",
  Commodities: "#f59e0b",
  Crypto: "#8b5cf6",
  ESG: "#22c55e",
};

const CATEGORY_COLORS = {
  Geopolitical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Financial: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Pandemic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "Monetary Policy": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Sustainability: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const ALL_ASSETS = ["Stocks", "Bonds", "Commodities", "Crypto", "ESG"];

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label, dark }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-xl shadow-lg p-3 text-sm border ${
          dark
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN APP ---
export default function App() {
  const [dark, setDark] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[2]); // Default: COVID
  const [activeAssets, setActiveAssets] = useState(new Set(ALL_ASSETS));

  const toggleAsset = (asset) => {
    setActiveAssets((prev) => {
      const next = new Set(prev);
      next.has(asset) ? next.delete(asset) : next.add(asset);
      return next;
    });
  };

  const EVENT_ID_MAP = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

  const handleTimelineSelect = (point) => {
    const event = EVENT_ID_MAP[point.id];
    if (event) setSelectedEvent(event);
  };


  const chartData = PERFORMANCE_DATA[selectedEvent.dataKey];
  const eventMonthIndex = 3; // The event always falls at index 3 in each dataset

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Hindsight 20/20 Vision</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                From History to Markets
              </p>
            </div>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {dark ? (
              <>
                <span>☀️</span>
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <span>🌙</span>
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* INTRO */}
          <div>
            <TimelineChart
              dark={dark}
              selectedEventId={selectedEvent.id}
              onSelectEvent={handleTimelineSelect}
            />  
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">How do global events move markets?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Select an event below to explore how different asset classes — including ESG funds —
              responded. Green events reflect sustainability milestones.
            </p>
          </div>

          {/* EVENT SELECTOR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    CATEGORY_COLORS[event.category]
                  }`}
                >
                  {event.category}
                </span>
                <p className="font-semibold text-sm leading-tight">{event.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
              </button>
            ))}
          </div>

          {/* EVENT DESCRIPTION */}
          <div className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
            <span className="text-2xl mt-0.5">
              {selectedEvent.category === "Sustainability" ? "🌱" : "📌"}
            </span>
            <div>
              <h3 className="font-bold text-base">
                {selectedEvent.name}{" "}
                <span className="text-gray-400 font-normal text-sm">({selectedEvent.date})</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedEvent.description}
              </p>
            </div>
          </div>

          {/* ASSET TOGGLES */}
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

          {/* CHART */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Indexed Performance (100 = Pre-Event Baseline)
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  x={chartData[eventMonthIndex]?.month}
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

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ALL_ASSETS.map((asset) => {
              const first = chartData[0]?.[asset];
              const last = chartData[chartData.length - 1]?.[asset];
              const change =
                first != null && last != null
                  ? (((last - first) / first) * 100).toFixed(1)
                  : null;
              const positive = change > 0;
              return (
                <div
                  key={asset}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: ASSET_COLORS[asset] }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{asset}</p>
                  {change != null ? (
                    <p
                      className={`text-lg font-bold mt-1 ${
                        positive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {change}%
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">N/A</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">over period</p>
                </div>
              );
            })}
          </div>

          {/* SUSTAINABILITY NOTE */}
          {selectedEvent.category === "Sustainability" && (
            <div className="rounded-xl p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                🌱 <strong>Sustainability Insight:</strong> This event directly reshaped long-term
                capital flows. ESG funds and clean energy indices outperformed traditional benchmarks
                in the 12 months following this milestone, signalling a structural shift in investor
                priorities.
              </p>
            </div>
          )}

          {/* FOOTER */}
          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
            MarketPulse · Built for BlackRock Hackathon · Data is illustrative and indexed for
            educational purposes
          </footer>
        </main>
      </div>
    </div>
  );
}
