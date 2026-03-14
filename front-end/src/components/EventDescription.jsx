import { useArticles } from "../hooks/useArticles";

const SOURCE_FAVICON = {
  "Investopedia":                    "https://www.investopedia.com/favicon.ico",
  "Federal Reserve Bank of St. Louis": "https://www.stlouisfed.org/favicon.ico",
  "IMF":                             "https://www.imf.org/favicon.ico",
  "Federal Reserve History":         "https://www.federalreservehistory.org/favicon.ico",
  "BIS":                             "https://www.bis.org/favicon.ico",
  "Nareit":                          "https://www.reit.com/favicon.ico",
  "Coin Metrics":                    "https://coinmetrics.io/favicon.ico",
};

const CATEGORY_COLORS = {
  Stocks:       "bg-blue-50  dark:bg-blue-950  text-blue-600  dark:text-blue-400  border-blue-200  dark:border-blue-800",
  Bonds:        "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
  Commodities:  "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Crypto:       "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Real Estate":"bg-rose-50  dark:bg-rose-950  text-rose-600  dark:text-rose-400  border-rose-200  dark:border-rose-800",
};

export default function EventDescription({ event }) {
  const { articles, loading, error } = useArticles(event?.id);
  const sustainabilityLike =
    event.category === "sustainability" ||
    event.category === "policy agreement" ||
    event.id === "paris-agreement";

  return (
    <div className="space-y-4">

      {/* ── Event header card ── */}
      <div className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
        <span className="text-2xl mt-0.5">
          {sustainabilityLike ? "🌱" : "📌"}
        </span>
        <div>
          <h3 className="font-bold text-base">
            {event.name ?? event.title}{" "}
            <span className="text-gray-400 font-normal text-sm">
              (
              {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
              )
            </span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {event.description}
          </p>
        </div>
      </div>

      {/* ── Supporting articles ── */}
      {loading && (
        <p className="text-xs text-gray-400 px-1">Loading supporting articles…</p>
      )}

      {error && !loading && (
        <p className="text-xs text-red-400 px-1">⚠️ Could not load articles: {error}</p>
      )}

      {!loading && !error && articles.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
            Supporting Reading
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                {/* Source + date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {SOURCE_FAVICON[article.source] && (
                      <img
                        src={SOURCE_FAVICON[article.source]}
                        alt=""
                        className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {article.source}
                    </span>
                  </div>
                  <span className="text-xs text-gray-300 dark:text-gray-600 flex-shrink-0">
                    {new Date(article.publishedAt).getFullYear()}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </p>

                {/* Summary */}
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>

                {/* Asset class tags */}
                {article.assetClasses?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {article.assetClasses.map((cls) => (
                      <span
                        key={cls}
                        className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                          CATEGORY_COLORS[cls] ?? "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
