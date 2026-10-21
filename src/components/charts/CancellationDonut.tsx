import { useTranslation } from "react-i18next";

const CancellationDonut = ({
  cancelled,
  total,
}: {
  cancelled: number;
  total: number;
}) => {
  const { t } = useTranslation();
  const percent = total > 0 ? (cancelled / total) * 100 : 0;
  const circumference = 2 * Math.PI * 58;
  return (
    <div className="relative mx-auto h-44 w-44 shrink-0">
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={t("statistics.dashboard.cancelled_chart", {
          cancelled,
          total,
        })}
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth="18"
        />
        {total > 0 && (
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="18"
            strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-text-main">{cancelled}</span>
        <span className="text-xs text-text-muted">
          {t("statistics.dashboard.cancelled")}
        </span>
        <span className="mt-1 text-xs font-medium text-danger">
          {percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default CancellationDonut;
