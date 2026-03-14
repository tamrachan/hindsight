export const ASSET_COLORS = {
  Stocks: "#3b82f6",
  Bonds: "#10b981",
  Commodities: "#f59e0b",
  Crypto: "#8b5cf6",
  "Real Estate": "#ec4899",
};

export const ASSET_PROXIES = [
  { assetClass: "Stocks", symbol: "SPY", reason: "Most common S&P 500 proxy" },
  { assetClass: "Bonds", symbol: "TLT", reason: "Long-duration US Treasury bonds" },
  { assetClass: "Commodities", symbol: "DBC", reason: "Commodity index ETF" },
  { assetClass: "Crypto", symbol: "BTC/USD", reason: "Dominant crypto asset" },
  { assetClass: "Real Estate", symbol: "VNQ", reason: "REIT index ETF" },
];

export const ALL_ASSETS = Object.keys(ASSET_COLORS);
