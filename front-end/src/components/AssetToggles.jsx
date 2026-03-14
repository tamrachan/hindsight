import { ALL_ASSETS, ASSET_COLORS } from "../constants";

export default function AssetToggles({ activeAssets, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_ASSETS.map((asset) => (
        <button
          key={asset}
          onClick={() => onToggle(asset)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            activeAssets.has(asset)
              ? "border-transparent text-white shadow-sm"
              : "border-gray-300 dark:border-gray-600 text-gray-400 bg-transparent"
          }`}
          style={activeAssets.has(asset) ? { backgroundColor: ASSET_COLORS[asset] } : {}}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_COLORS[asset] }} />
          {asset}
        </button>
      ))}
    </div>
  );
}
