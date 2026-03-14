import { FiArrowDown } from "react-icons/fi";

const FEATURES = [
  { icon: "📈", title: "25+ Years of Data",      desc: "Real market prices from 1999 to today across stocks, bonds, commodities, crypto, real estate, and ESG funds." },
  { icon: "🌍", title: "Major Global Events",    desc: "From the Dot-com crash to COVID-19, see exactly how each crisis or milestone moved every asset class." },
  { icon: "🌱", title: "Sustainability Lens",    desc: "Track how ESG investing has evolved and outperformed during key sustainability milestones like the Paris Agreement." },
  { icon: "⚡", title: "Interactive Deep-Dives", desc: "Click any event to compare indexed performance before, during, and after — with per-asset return metrics." },
];

export default function HeroSection({ onScrollToApp }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 bg-white dark:bg-gray-950 overflow-hidden">

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
          BlackRock Hackathon 2026
        </p>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter text-gray-900 dark:text-white">
          Markets don't move<br />
          <span className="text-gray-300 dark:text-gray-600">in a vacuum.</span>
        </h2>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Explore how wars, crises, and sustainability milestones have shaped
          global asset prices — across 25 years of real market data.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Stocks", "Bonds", "Commodities", "Crypto", "Real Estate", "ESG"].map((label) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            >
              {label}
            </span>
          ))}
        </div>
        <button
          onClick={onScrollToApp}
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Explore the data
          <FiArrowDown size={15} className="group-hover:translate-y-0.5 transition-transform duration-150" />
        </button>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mt-20 w-full">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-950"
          >
            <span className="text-xl">{f.icon}</span>
            <h3 className="font-semibold text-sm mt-3 mb-1 text-gray-900 dark:text-gray-100">{f.title}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onScrollToApp}
        className="relative z-10 mt-12 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
      >
        <FiArrowDown size={18} className="animate-bounce" />
      </button>
    </section>
  );
}
