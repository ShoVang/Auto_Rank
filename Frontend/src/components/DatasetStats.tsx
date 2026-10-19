import type { DatasetStats as Stats } from "../types/stats";

type DatasetStatsProps = {
  stats: Stats | null;
  error: string;
};

function mpg(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function DatasetStats({ stats, error }: DatasetStatsProps) {
  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="count">Loading stats…</p>;

  const items = [
    { value: `${mpg(stats.avg_comb)} mpg`, label: "Average combined" },
    { value: `${mpg(stats.median_comb)} mpg`, label: "Median combined" },
    { value: `${mpg(stats.avg_city)} / ${mpg(stats.avg_highway)}`, label: "Average city / highway" },
    { value: `$${Math.round(stats.avg_fuel_cost).toLocaleString()}`, label: "Average annual fuel cost" },
    { value: stats.vehicles.toLocaleString(), label: "Certified vehicles" },
    { value: `${stats.year_min}–${stats.year_max}`, label: `${stats.makes.toLocaleString()} makes` },
  ];

  return (
    <section className="stats">
      {items.map((item) => (
        <article key={item.label} className="stat">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </section>
  );
}
