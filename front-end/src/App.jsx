import { useState, useRef } from "react";
import { EVENTS, EVENTS_BY_ID, ALL_ASSETS } from "./constants";
import { PERFORMANCE_DATA, EVENT_MONTH_INDEX } from "./data/performanceData";

import Navbar                from "./components/Navbar";
import HeroSection           from "./components/HeroSection";
import TimelineChart         from "./components/TimelineChart";
import EventSelectorCards    from "./components/EventSelectorCards";
import EventDescription      from "./components/EventDescription";
import AssetToggles          from "./components/AssetToggles";
import ImpactChart           from "./components/ImpactChart";
import StatCards             from "./components/StatCards";
import SustainabilityCallout from "./components/SustainabilityCallout";

export default function App() {
  const [dark, setDark]                   = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(EVENTS.find((e) => e.id === "covid"));
  const [activeAssets, setActiveAssets]   = useState(new Set(ALL_ASSETS));
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

  const chartData = PERFORMANCE_DATA[selectedEvent.id] ?? [];

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
            chartData={chartData}
            eventMonthIndex={EVENT_MONTH_INDEX}
            activeAssets={activeAssets}
          />

          <StatCards chartData={chartData} />

          <SustainabilityCallout event={selectedEvent} />

          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
            Hindsight 20/20 · Built for BlackRock Hackathon · Impact chart data is illustrative;
            timeline uses live data via Twelve Data API
          </footer>

        </main>
      </div>
    </div>
  );
}
