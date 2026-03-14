export default function SustainabilityCallout({ event }) {
  if (event.category !== "sustainability") return null;
  return (
    <div className="rounded-xl p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
        🌱 <strong>Sustainability Insight:</strong> This event directly reshaped
        long-term capital flows. ESG funds and clean energy indices outperformed
        traditional benchmarks in the 12 months following this milestone, signalling
        a structural shift in investor priorities.
      </p>
    </div>
  );
}
