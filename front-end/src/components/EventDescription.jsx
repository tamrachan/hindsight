export default function EventDescription({ event }) {
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
      <span className="text-2xl mt-0.5">
        {event.category === "sustainability" ? "🌱" : "📌"}
      </span>
      <div>
        <h3 className="font-bold text-base">
          {event.name}{" "}
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
  );
}
