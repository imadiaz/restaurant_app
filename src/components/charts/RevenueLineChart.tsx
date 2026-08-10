interface RevenueLineChartProps {
  labels: string[];
  values: number[];
  formatValue: (value: number) => string;
  accessibleLabel: string;
  emptyLabel: string;
}

const WIDTH = 720;
const HEIGHT = 300;
const PADDING = { top: 20, right: 20, bottom: 44, left: 68 };

const RevenueLineChart = ({
  labels,
  values,
  formatValue,
  accessibleLabel,
  emptyLabel,
}: RevenueLineChartProps) => {
  if (values.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        {emptyLabel}
      </div>
    );
  }

  const maxValue = Math.max(...values, 1);
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const xFor = (index: number) =>
    PADDING.left + (values.length === 1 ? plotWidth / 2 : (index / (values.length - 1)) * plotWidth);
  const yFor = (value: number) => PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  const points = values.map((value, index) => `${xFor(index)},${yFor(value)}`).join(' ');
  const areaPoints = `${PADDING.left},${PADDING.top + plotHeight} ${points} ${PADDING.left + plotWidth},${PADDING.top + plotHeight}`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(labels.length / 6));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full overflow-visible"
      role="img"
      aria-label={accessibleLabel}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="revenue-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.24" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {gridValues.map((ratio) => {
        const y = PADDING.top + plotHeight - ratio * plotHeight;
        return (
          <g key={ratio}>
            <line x1={PADDING.left} x2={PADDING.left + plotWidth} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={PADDING.left - 10} y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">
              {formatValue(maxValue * ratio)}
            </text>
          </g>
        );
      })}

      <polygon points={areaPoints} fill="url(#revenue-chart-fill)" />
      <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {values.map((value, index) => (
        <g key={`${labels[index]}-${index}`}>
          <circle cx={xFor(index)} cy={yFor(value)} r="5" fill="var(--color-background-card)" stroke="var(--color-primary)" strokeWidth="3">
            <title>{`${labels[index]}: ${formatValue(value)}`}</title>
          </circle>
          {(index % labelStep === 0 || index === labels.length - 1) && (
            <text x={xFor(index)} y={HEIGHT - 14} textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">
              {labels[index]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

export default RevenueLineChart;
