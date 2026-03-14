import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const TIMELINE_POINTS = [
  { x: 2001.75, y: 1, event: "9/11 Attacks", date: "Sep 2001", category: "Geopolitical", id: 1 },
  { x: 2008.75, y: 1, event: "2008 Financial Crisis", date: "Sep 2008", category: "Financial", id: 2 },
  { x: 2015.92, y: 1, event: "Paris Agreement", date: "Dec 2015", category: "Sustainability", id: 6 },
  { x: 2020.25, y: 1, event: "COVID-19 Pandemic", date: "Mar 2020", category: "Pandemic", id: 3 },
  { x: 2022.17, y: 1, event: "Russia-Ukraine War", date: "Feb 2022", category: "Geopolitical", id: 4 },
  { x: 2022.25, y: 1, event: "Fed Rate Hikes", date: "Mar 2022", category: "Monetary Policy", id: 5 },
];

const CATEGORY_DOT_COLORS = {
  Geopolitical: "#ef4444",
  Financial: "#f97316",
  Pandemic: "#3b82f6",
  "Monetary Policy": "#eab308",
  Sustainability: "#22c55e",
};

const CustomDot = (props) => {
  const { cx, cy, payload, selectedId, onClick } = props;
  const isSelected = payload.id === selectedId;
  const color = CATEGORY_DOT_COLORS[payload.category];
  return (
    <g onClick={() => onClick(payload)} style={{ cursor: "pointer" }}>
      {isSelected && (
        <circle cx={cx} cy={cy} r={18} fill={color} opacity={0.2} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 10 : 7}
        fill={color}
        stroke={isSelected ? "white" : color}
        strokeWidth={isSelected ? 2.5 : 1}
      />
      <text
        x={cx}
        y={cy - 18}
        textAnchor="middle"
        fontSize={10}
        fontWeight={isSelected ? 700 : 400}
        fill={color}
      >
        {payload.date}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, dark }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const color = CATEGORY_DOT_COLORS[d.category];
    return (
      <div
        className={`rounded-xl shadow-lg px-4 py-3 text-sm border pointer-events-none ${
          dark
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <p className="font-bold text-base">{d.event}</p>
        <p className="text-xs mt-0.5" style={{ color }}>
          {d.category} · {d.date}
        </p>
        <p className="text-xs text-gray-400 mt-1">Click to explore market impact ↓</p>
      </div>
    );
  }
  return null;
};

export default function TimelineChart({ dark, selectedEventId, onSelectEvent }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
        Global Event Timeline
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Hover over a point for details · Click to load market data below
      </p>

      <ResponsiveContainer width="100%" height={110}>
        <ScatterChart margin={{ top: 30, right: 30, left: 30, bottom: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[2000, 2024]}
            ticks={[2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024]}
            tickFormatter={(v) => `${v}`}
            tick={{ fill: dark ? "#6b7280" : "#9ca3af", fontSize: 11 }}
            axisLine={{ stroke: dark ? "#374151" : "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
          {/* The spine line */}
          <ReferenceLine
            y={1}
            stroke={dark ? "#374151" : "#e5e7eb"}
            strokeWidth={2}
          />
          <Tooltip
            content={<CustomTooltip dark={dark} />}
            cursor={false}
          />
          <Scatter
            data={TIMELINE_POINTS}
            shape={(props) => (
              <CustomDot
                {...props}
                selectedId={selectedEventId}
                onClick={onSelectEvent}
              />
            )}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {Object.entries(CATEGORY_DOT_COLORS).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
