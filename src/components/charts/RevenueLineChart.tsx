interface RevenueLineChartProps {
  labels: string[];
  values: number[];
  formatValue: (value: number) => string;
  accessibleLabel: string;
  emptyLabel: string;
}

const RevenueLineChart = ({
  labels,
  values,
  formatValue,
  accessibleLabel,
  emptyLabel,
}: RevenueLineChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const [size, setSize] = useState({ width: 720, height: 288 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (values.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex h-full items-center justify-center text-sm text-text-muted"
      >
        {emptyLabel}
      </div>
    );
  }

  const maxValue = Math.max(...values, 1);
  const gridValues = [0, 0.25, 0.5, 0.75, 1];
  const tickLabels = gridValues.map((ratio) => formatValue(maxValue * ratio));
  // Reserve room for the whole currency label, not a fixed-width gutter.
  const PADDING = {
    top: 20,
    right: 24,
    bottom: 40,
    left: Math.max(64, ...tickLabels.map((label) => label.length * 8 + 16)),
  };
  const plotWidth = Math.max(1, size.width - PADDING.left - PADDING.right);
  const plotHeight = Math.max(1, size.height - PADDING.top - PADDING.bottom);
  const xFor = (index: number) =>
    PADDING.left +
    (values.length === 1
      ? plotWidth / 2
      : (index / (values.length - 1)) * plotWidth);
  const yFor = (value: number) =>
    PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  const points = values
    .map((value, index) => `${xFor(index)},${yFor(value)}`)
    .join(" ");
  const areaPoints = `${PADDING.left},${PADDING.top + plotHeight} ${points} ${PADDING.left + plotWidth},${PADDING.top + plotHeight}`;
  const labelSlots = Math.max(2, Math.floor(plotWidth / 90) + 1);
  const labelStep = Math.max(
    1,
    Math.ceil((labels.length - 1) / (labelSlots - 1)),
  );

  return (
    <div ref={containerRef} className="h-full w-full min-w-0">
      <svg
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="block h-full w-full"
        role="img"
        aria-label={accessibleLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.24"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {gridValues.map((ratio, index) => {
          const y = PADDING.top + plotHeight - ratio * plotHeight;
          return (
            <g key={ratio}>
              <line
                x1={PADDING.left}
                x2={PADDING.left + plotWidth}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize="11"
              >
                {tickLabels[index]}
              </text>
            </g>
          );
        })}

        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {values.map((value, index) => (
          <g key={`${labels[index]}-${index}`}>
            <circle
              cx={xFor(index)}
              cy={yFor(value)}
              r="5"
              fill="var(--color-background-card)"
              stroke="var(--color-primary)"
              strokeWidth="3"
            >
              <title>{`${labels[index]}: ${formatValue(value)}`}</title>
            </circle>
            {((index % labelStep === 0 &&
              labels.length - 1 - index >= labelStep) ||
              index === labels.length - 1) && (
              <text
                x={xFor(index)}
                y={size.height - 14}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === labels.length - 1
                      ? "end"
                      : "middle"
                }
                fill="var(--color-text-muted)"
                fontSize="11"
              >
                {labels[index]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default RevenueLineChart;
import { useEffect, useId, useRef, useState } from "react";
