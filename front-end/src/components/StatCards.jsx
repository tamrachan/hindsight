import { ALL_ASSETS, ASSET_COLORS } from "../constants";

export default function StatCards({ chartData }) {
  return (
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
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: ASSET_COLORS[asset] }} />
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{asset}</p>
            {change != null ? (
              <p className={`text-lg font-bold mt-1 ${positive ? "text-green-500" : "text-red-500"}`}>
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
  );
}
