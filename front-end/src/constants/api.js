export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:25355";

export const API_ENDPOINTS = {
  events:            `${API_BASE_URL}/api/events`,
  normalised:        `${API_BASE_URL}/api/charts/normalized-index`,
  monthlyAssets:     `${API_BASE_URL}/api/asset-classes/monthly`,
  monthlySummary:    `${API_BASE_URL}/api/asset-classes/monthly/summary`,
  threeMonthMetrics: `${API_BASE_URL}/api/event-metrics?months=3`,
  articles:          `${API_BASE_URL}/api/articles`,

  impact: (eventId, windowDays = 30) =>
    `${API_BASE_URL}/api/impact/${eventId}?windowDays=${windowDays}`,
};
