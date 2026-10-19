import { DatasetStats } from "../components/DatasetStats";
import { HomeCharts } from "../components/HomeCharts";
import { useStats } from "../hooks/useStats";

type HomeScreenProps = {
  onBrowse: () => void;
};

export function HomeScreen({ onBrowse }: HomeScreenProps) {
  const { stats, error } = useStats();

  return (
    <main>
      <p className="eyebrow">AutoRank</p>
      <h1>Which vehicles give you the most for the money?</h1>
      <p className="lede">
        AutoRank grades cars on safety, reliability, speed, luxury, and cost,
        then ranks them by value: how much car you get per dollar.
      </p>
      <DatasetStats stats={stats} error={error} />
      {stats ? (
        <HomeCharts
          byYear={stats.by_year}
          mpgBuckets={stats.mpg_buckets}
          byClass={stats.by_class}
        />
      ) : null}

      <section className="home-grid">
        <article>
          <h2>Not a sales listing</h2>
          <p>
            This is not a list of cars currently for sale. It is the EPA and
            Department of Energy fuel economy database, published at{" "}
            <a href="https://www.fueleconomy.gov/">fueleconomy.gov</a>. These
            are the same ratings printed on a new car’s window sticker.
          </p>
        </article>
        <article>
          <h2>Coverage</h2>
          <p>
            The data goes back to model year 1984 and includes every vehicle
            the EPA has certified for sale in the US. It is historical as well
            as current. Filter on year if you only want recent models.
          </p>
        </article>
      </section>

      <button type="button" className="primary" onClick={onBrowse}>
        Browse vehicles
      </button>
    </main>
  );
}
