import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { ALL_ASSETS, ASSET_COLORS } from "../constants";

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={`rounded-xl shadow-lg px-4 py-3 text-sm border ${
      dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800"
    }`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) =>
        entry.value != null ? (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{Number(entry.value).toFixed(1)}</span>
          </p>
        ) : null
      )}
    </div>
  );
};

export default function ImpactChart({ dark, selectedEvent, chartData, eventMonthIndex, activeAssets }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
        Indexed Performance — {selectedEvent.name}
        <span className="ml-2 normal-case font-normal text-gray-400">
          (100 = pre-event baseline)
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#e5e7eb"} />
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
            label={{ value: "Event", position: "top", fill: "#ef4444", fontSize: 11, fontWeight: 600 }}
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
  );
}
