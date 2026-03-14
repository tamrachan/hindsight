import { FiSun, FiMoon } from "react-icons/fi";

export default function Navbar({ dark, onToggleDark }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight">Hindsight</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">20/20</p>
      </div>
      <button
        onClick={onToggleDark}
        className="relative group flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-700 text-white dark:bg-gray-200 dark:text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {dark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    </header>
  );
}
