import { 
  FiArrowDown, 
  FiTrendingUp, 
  FiGlobe, 
  FiFeather, 
  FiZap 
} from "react-icons/fi";

const FEATURES = [
  { 
    icon: FiTrendingUp,
    title: "25+ Years of Data",
    desc: "Real market prices from 1999 to today across stocks, bonds, commodities, crypto, real estate, and ESG funds."
  },
  { 
    icon: FiGlobe,
    title: "Major Global Events",
    desc: "From the Dot-com crash to COVID-19, see exactly how each crisis or milestone moved every asset class."
  },
  { 
    icon: FiFeather,
    title: "Sustainability Lens",
    desc: "Track how ESG investing evolved through key sustainability milestones like the Paris Agreement."
  },
  { 
    icon: FiZap,
    title: "Interactive Deep-Dives",
    desc: "Click any event to compare indexed performance before, during, and after with per-asset return metrics."
  },
];

export default function HeroSection({ onScrollToApp }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 bg-white dark:bg-gray-950 overflow-hidden">

      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-6">

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white">
          In hindsight,
          <br />
          <span className="text-4xl sm:text-6xl">
            we should've seen that coming.
          </span>
        </h2>
        
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">BlackRock Hackathon 2026</p>

        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Explore how wars, crises, and sustainability milestones shaped
          global asset prices — across 25 years of real market data.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {["Stocks","Bonds","Commodities","Crypto","Real Estate","ESG"].map((label) => (
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
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-14 w-full">

        {FEATURES.map((f) => {
          const Icon = f.icon;

          return (
            <div
              key={f.title}
              className="group border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-left transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 mb-4">
                <Icon size={18} className="text-gray-700 dark:text-gray-300"/>
              </div>

              <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                {f.title}
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}

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