import { useEffect, useState } from "react";
import { BoxPlot } from "../components/BoxPlot";
import { useStats } from "../hooks/useStats";
import type { Vehicle } from "../types/vehicle";

type CompareScreenProps = {
  car: Vehicle;
  onBack: () => void;
};

type PeerGroup = {
  key: "class" | "fuel" | "drive" | "year";
  label: string;
  name: string;
  vehicles: number;
  more_efficient_than: number;
};

const peerWhere: Record<PeerGroup["key"], string> = {
  class: "in this class",
  fuel: "with this fuel",
  drive: "with this drive",
  year: "from this model year",
};

function mpg(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function peerLine(group: PeerGroup) {
  const count = group.vehicles.toLocaleString();
  const where = peerWhere[group.key];
  if (group.vehicles === 0) return "The only vehicle in this group.";
  const share = Math.round((group.more_efficient_than / group.vehicles) * 100);
  if (share === 0) {
    return `Not more efficient than any of the other ${count} vehicles ${where}.`;
  }
  if (share === 100) {
    return `More efficient than every one of the other ${count} vehicles ${where}.`;
  }
  return `More efficient than ${share}% of the other ${count} vehicles ${where}.`;
}

function usePeers(car: Vehicle) {
  const [groups, setGroups] = useState<PeerGroup[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      id: String(car.id),
      class: car.vehicle_class,
      year: String(car.year),
      comb: String(car.comb08),
    });
    if (car.fuel_type) params.set("fuel", car.fuel_type);
    if (car.drive) params.set("drive", car.drive);

    fetch(`/api/peers?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load peer groups.");
        return response.json();
      })
      .then((data: { groups: PeerGroup[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setGroups(data.groups);
        setError("");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setGroups(null);
        setError("Peer comparisons are unavailable until the DuckDB API is running.");
      });

    return () => controller.abort();
  }, [car]);

  return { groups, error };
}

export function CompareScreen({ car }: CompareScreenProps) {
  const { stats, error } = useStats();
  const peers = usePeers(car);
  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <main>
      <p className="eyebrow">Compare</p>
      <h1>{title}</h1>
      <p className="lede">
        Ranked against other vehicles of the same class, fuel, drive, and model
        year. The box plot is this car’s combined rating against the whole
        catalog.
      </p>
      {peers.error ? <p className="error">{peers.error}</p> : null}
      {!peers.groups && !peers.error ? (
        <p className="count">Loading comparisons…</p>
      ) : null}
      {peers.groups ? (
        <section className="stats compare-stats">
          {peers.groups.map((group) => {
            const share =
              group.vehicles === 0
                ? 0
                : Math.round((group.more_efficient_than / group.vehicles) * 100);
            return (
              <article key={group.key} className="stat">
                <span className="peer-kind">{group.label}</span>
                <strong>{group.name}</strong>
                <span>{peerLine(group)}</span>
                <div className="peer-track" aria-hidden="true">
                  <div style={{ width: `${share}%` }} />
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {!stats && !error ? <p className="count">Loading catalog stats…</p> : null}
      {stats ? (
        <section className="charts">
          <article className="chart-wide">
            <h2>Combined MPG against the catalog</h2>
            <p>
              The box is the middle half of every certified vehicle. The line
              inside it is the median, {mpg(stats.comb_box.median)} mpg.
              Whiskers reach the nearest ratings still within 1.5 times that
              spread ({mpg(stats.comb_box.whisker_low)}–
              {mpg(stats.comb_box.whisker_high)} mpg). The dot is this car.
              {stats.comb_box.max > stats.comb_box.whisker_high
                ? ` A long tail of efficient vehicles continues to ${mpg(stats.comb_box.max)} mpg.`
                : ""}
            </p>
            <BoxPlot box={stats.comb_box} value={car.comb08} name={title} />
          </article>
        </section>
      ) : null}
    </main>
  );
}
