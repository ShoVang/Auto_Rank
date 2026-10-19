import type { CountBar, YearPoint } from "../types/stats";

type HomeChartsProps = {
  byYear: YearPoint[];
  mpgBuckets: CountBar[];
  byClass: CountBar[];
};

function MpgByYear({ points }: { points: YearPoint[] }) {
  const width = 640;
  const height = 220;
  const pad = { left: 36, right: 12, top: 16, bottom: 28 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const mpg = points.map((point) => point.avg_comb);
  const low = Math.floor(Math.min(...mpg)) - 1;
  const high = Math.ceil(Math.max(...mpg)) + 1;
  const x = (index: number) => pad.left + (index / (points.length - 1)) * innerWidth;
  const y = (value: number) => pad.top + ((high - value) / (high - low)) * innerHeight;
  const line = points.map((point, index) => `${x(index)},${y(point.avg_comb)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Average combined MPG by model year">
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} className="axis" />
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} className="axis" />
      <text x={4} y={y(high) + 4} className="tick">{high}</text>
      <text x={4} y={y(low) + 4} className="tick">{low}</text>
      <polyline points={line} className="mpg-line" />
      <text x={x(0)} y={height - 8} className="tick">{first.year}</text>
      <text x={x(points.length - 1)} y={height - 8} textAnchor="end" className="tick">{last.year}</text>
    </svg>
  );
}

function VerticalBars({ bars }: { bars: CountBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.vehicles));
  return (
    <div className="v-bars">
      {bars.map((bar) => (
        <div key={bar.label} className="v-bar">
          <span className="v-count">{bar.vehicles.toLocaleString()}</span>
          <div className="v-track">
            <div style={{ height: `${(bar.vehicles / max) * 100}%` }} />
          </div>
          <span className="v-label">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ bars }: { bars: CountBar[] }) {
  const max = Math.max(...bars.map((bar) => bar.vehicles));
  return (
    <div className="h-bars">
      {bars.map((bar) => (
        <div key={bar.label} className="h-bar">
          <span title={bar.label}>{bar.label}</span>
          <div className="h-track">
            <div style={{ width: `${(bar.vehicles / max) * 100}%` }} />
          </div>
          <strong>{bar.vehicles.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export function HomeCharts({ byYear, mpgBuckets, byClass }: HomeChartsProps) {
  return (
    <section className="charts">
      <article>
        <h2>Combined MPG by model year</h2>
        <p>Average window-sticker rating for every certified vehicle that year.</p>
        <MpgByYear points={byYear} />
      </article>
      <article>
        <h2>Where the MPG ratings sit</h2>
        <p>Most vehicles cluster in the middle. The long tail is mostly hybrids and electrics.</p>
        <VerticalBars bars={mpgBuckets} />
      </article>
      <article className="chart-wide">
        <h2>Largest vehicle classes</h2>
        <HorizontalBars bars={byClass} />
      </article>
    </section>
  );
}
