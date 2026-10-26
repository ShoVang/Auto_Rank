import type { BoxSummary } from "../types/stats";

type BoxPlotProps = {
  box: BoxSummary;
  value: number;
  name: string;
};

function trim(value: number) {
  return Number(value.toFixed(1)).toString();
}

export function BoxPlot({ box, value, name }: BoxPlotProps) {
  const width = 680;
  const height = 168;
  const pad = { left: 36, right: 36, top: 48, bottom: 40 };
  const plotLow = Math.min(box.whisker_low, value);
  const plotHigh = Math.max(box.whisker_high, value);
  const span = Math.max(plotHigh - plotLow, 1);
  const min = plotLow - span * 0.08;
  const max = plotHigh + span * 0.08;
  const x = (point: number) =>
    pad.left + ((point - min) / (max - min)) * (width - pad.left - pad.right);
  const mid = 86;
  const boxTop = 62;
  const boxHeight = 48;
  const ticks = [
    { at: box.whisker_low, label: trim(box.whisker_low) },
    { at: box.q1, label: `Q1 ${trim(box.q1)}` },
    { at: box.median, label: `Median ${trim(box.median)}` },
    { at: box.q3, label: `Q3 ${trim(box.q3)}` },
    { at: box.whisker_high, label: trim(box.whisker_high) },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Box plot of combined MPG. ${name} is ${trim(value)} mpg.`}
    >
      <line
        x1={x(box.whisker_low)}
        y1={mid}
        x2={x(box.whisker_high)}
        y2={mid}
        className="box-whisker"
      />
      <line
        x1={x(box.whisker_low)}
        y1={boxTop + 10}
        x2={x(box.whisker_low)}
        y2={boxTop + boxHeight - 10}
        className="box-whisker"
      />
      <line
        x1={x(box.whisker_high)}
        y1={boxTop + 10}
        x2={x(box.whisker_high)}
        y2={boxTop + boxHeight - 10}
        className="box-whisker"
      />
      <rect
        x={x(box.q1)}
        y={boxTop}
        width={Math.max(x(box.q3) - x(box.q1), 2)}
        height={boxHeight}
        className="box-body"
      />
      <line
        x1={x(box.median)}
        y1={boxTop}
        x2={x(box.median)}
        y2={boxTop + boxHeight}
        className="box-median"
      />
      <circle cx={x(value)} cy={mid} r={7} className="box-car" />
      <text x={x(value)} y={28} textAnchor="middle" className="box-car-label">
        This car
      </text>
      <text x={x(value)} y={44} textAnchor="middle" className="tick">
        {trim(value)} mpg
      </text>
      {ticks.map((tick) => (
        <text
          key={tick.label}
          x={x(tick.at)}
          y={height - 12}
          textAnchor="middle"
          className="tick"
        >
          {tick.label}
        </text>
      ))}
    </svg>
  );
}
