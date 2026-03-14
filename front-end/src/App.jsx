import { useEffect, useRef, useState } from "react";
import { EVENTS, EVENTS_BY_ID, ALL_ASSETS } from "./constants";
import { API_ENDPOINTS } from "./constants/api";

import Navbar from "./components/NavBar";
import HeroSection           from "./components/HeroSection";
import TimelineChart         from "./components/TimelineChart";
import EventSelectorCards    from "./components/EventSelectorCards";
import EventDescription      from "./components/EventDescription";
import AssetToggles          from "./components/AssetToggles";
import ImpactChart           from "./components/ImpactChart";
import StatCards             from "./components/StatCards";
import SustainabilityCallout from "./components/SustainabilityCallout";

function parseJsonSafely(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const noFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(noFence);
  } catch {
    return null;
  }
}

function normalizeAnalysis(raw) {
  if (!raw) return null;

  let parsed = raw;
  if (typeof raw === "string") {
    parsed = parseJsonSafely(raw) ?? { eventSummary: raw };
  } else if (typeof raw?.eventSummary === "string") {
    const nested = parseJsonSafely(raw.eventSummary);
    if (nested && typeof nested === "object") parsed = nested;
  }

  const assetExplanations = Array.isArray(parsed?.assetExplanations)
    ? parsed.assetExplanations.filter((x) => x?.assetClass && (x?.whyItMoved || x?.evidence))
    : [];
  const teachingNotes = Array.isArray(parsed?.teachingNotes)
    ? parsed.teachingNotes.filter(Boolean)
    : [];
  const globalCitations = Array.isArray(parsed?.globalCitations)
    ? [...new Set(parsed.globalCitations.filter(Boolean))]
    : [];

  return {
    eventSummary: parsed?.eventSummary || "",
    crossAssetNarrative: parsed?.crossAssetNarrative || "",
    assetExplanations,
    teachingNotes,
    globalCitations,
  };
}

function buildImpactChartData(metricsPayload) {
  const assets = Array.isArray(metricsPayload?.assets) ? metricsPayload.assets : [];
  const points = [
    { month: "-3m" },
    { month: "Event" },
    { month: "+3m" },
  ];

  for (const asset of assets) {
    const key = asset.assetClass;
    points[0][key] = asset.beforePoint?.value ?? null;
    points[1][key] = asset.eventPoint?.value ?? null;
    points[2][key] = asset.afterPoint?.value ?? null;
  }

  return points;
}

export default function App() {
  const [dark, setDark]                   = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(EVENTS.find((e) => e.id === "covid"));
  const [activeAssets, setActiveAssets]   = useState(new Set(ALL_ASSETS));
  const [impactData, setImpactData]       = useState([]);
  const [impactMetrics, setImpactMetrics] = useState([]);
  const [analysis, setAnalysis]           = useState(null);
  const [analysisArticles, setAnalysisArticles] = useState([]);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError]     = useState(null);
  const appRef = useRef(null);

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleTimelineSelect = (point) => {
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

  useEffect(() => {
    let isCancelled = false;

    async function loadImpactData() {
      setImpactLoading(true);
      setImpactError(null);

      try {
        const [metricsRes, analysisRes] = await Promise.all([
          fetch(API_ENDPOINTS.threeMonthMetrics(selectedEvent.id)),
          fetch(API_ENDPOINTS.eventAnalysis(selectedEvent.id)),
        ]);

        if (!metricsRes.ok) {
          throw new Error(`Failed to load event metrics (${metricsRes.status})`);
        }

        const metricsJson = await metricsRes.json();
        const analysisJson = analysisRes.ok ? await analysisRes.json() : null;

        if (isCancelled) return;
        setImpactData(buildImpactChartData(metricsJson));
        setImpactMetrics(Array.isArray(metricsJson.assets) ? metricsJson.assets : []);
        setAnalysis(normalizeAnalysis(analysisJson?.analysis));
        setAnalysisArticles(Array.isArray(analysisJson?.supportingArticles) ? analysisJson.supportingArticles : []);
      } catch (error) {
        if (isCancelled) return;
        setImpactData([]);
        setImpactMetrics([]);
        setAnalysis(null);
        setAnalysisArticles([]);
        setImpactError(error.message);
      } finally {
        if (!isCancelled) setImpactLoading(false);
      }
    }

    loadImpactData();
    return () => {
      isCancelled = true;
    };
  }, [selectedEvent.id]);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

        <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />

        <HeroSection onScrollToApp={scrollToApp} />

        <main ref={appRef} className="max-w-6xl mx-auto px-4 py-8 space-y-8">

          <div>
            <h2 className="text-2xl font-bold mb-1">How do global events move markets?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Explore the full historical performance of major asset classes — then zoom into
              any event to see exactly how markets reacted. Includes sustainability milestones.
            </p>
          </div>

          <TimelineChart
            dark={dark}
            selectedEventId={selectedEvent.id}
            onSelectEvent={handleTimelineSelect}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
              Event deep-dive
            </p>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <EventSelectorCards selectedEvent={selectedEvent} onSelect={setSelectedEvent} />

          <EventDescription event={selectedEvent} />

          <AssetToggles activeAssets={activeAssets} onToggle={toggleAsset} />

          <ImpactChart
            dark={dark}
            selectedEvent={selectedEvent}
            chartData={impactData}
            eventMonthIndex={1}
            activeAssets={activeAssets}
          />

          {impactLoading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading +/- 3 month impact data...
            </div>
          )}

          {impactError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300">
              {impactError}
            </div>
          )}

          <StatCards chartData={impactData} />

          {impactMetrics.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                3-Month Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="py-2 pr-4">Asset</th>
                      <th className="py-2 pr-4">-3m to Event</th>
                      <th className="py-2 pr-4">Event to +3m</th>
                      <th className="py-2">-3m to +3m</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impactMetrics.map((asset) => {
                      const m = asset.metrics;
                      const fmt = (v) =>
                        v == null ? "N/A" : `${v >= 0 ? "+" : ""}${Number(v).toFixed(2)}%`;
                      return (
                        <tr
                          key={asset.assetClass}
                          className="border-b border-gray-100 dark:border-gray-800/70"
                        >
                          <td className="py-2 pr-4 font-medium">{asset.assetClass}</td>
                          <td className="py-2 pr-4">{fmt(m?.beforeToEventPct)}</td>
                          <td className="py-2 pr-4">{fmt(m?.eventToAfterPct)}</td>
                          <td className="py-2">{fmt(m?.beforeToAfterPct)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {analysis && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                LLM Analysis
              </h3>
              {analysis.eventSummary && <p className="text-sm">{analysis.eventSummary}</p>}
              {analysis.crossAssetNarrative && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.crossAssetNarrative}</p>
              )}
              {Array.isArray(analysis.assetExplanations) && analysis.assetExplanations.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis.assetExplanations.map((item) => (
                    <div
                      key={item.assetClass}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 p-3"
                    >
                      <p className="font-semibold text-sm">{item.assetClass}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.whyItMoved}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.evidence}</p>
                      {Array.isArray(item.citations) && item.citations.length > 0 && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          Sources: {item.citations.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {Array.isArray(analysis.teachingNotes) && analysis.teachingNotes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                    Teaching Notes
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    {analysis.teachingNotes.map((note, idx) => (
                      <li key={`${note}-${idx}`}>- {note}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(analysis.globalCitations) && analysis.globalCitations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                    Supporting Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.globalCitations.map((citationId) => {
                      const article = analysisArticles.find((a) => a.id === citationId);
                      if (!article) {
                        return (
                          <span
                            key={citationId}
                            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          >
                            {citationId}
                          </span>
                        );
                      }
                      return (
                        <a
                          key={citationId}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          {article.source}: {article.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          <SustainabilityCallout event={selectedEvent} />

          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
            Hindsight 20/20 · Built for BlackRock Hackathon · Impact chart uses live +/-3 month
            metrics and LLM analysis
          </footer>

        </main>
      </div>
    </div>
  );
}
