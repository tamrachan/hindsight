import { EVENTS, CATEGORY_BADGE_CLASSES } from "../constants";

export default function EventSelectorCards({ selectedEvent, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {EVENTS.map((event) => (
        <button
          key={event.id}
          onClick={() => onSelect(event)}
          className={`text-left p-4 rounded-xl border transition-all ${
            selectedEvent.id === event.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
          }`}
        >
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${
              CATEGORY_BADGE_CLASSES[event.category] ?? ""
            }`}
          >
            {event.category}
          </span>
          <p className="font-semibold text-sm leading-tight">{event.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </button>
      ))}
    </div>
  );
}
