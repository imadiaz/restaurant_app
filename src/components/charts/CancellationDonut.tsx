import { useTranslation } from "react-i18next";

const CancellationDonut = ({
  cancelled,
  cashCancelled,
}: {
  cancelled: number;
  cashCancelled: number;
}) => {
  const { t } = useTranslation();
  const cashFraction =
    cancelled > 0 ? Math.min(1, Math.max(0, cashCancelled / cancelled)) : 0;
  const circumference = 2 * Math.PI * 58;
  return (
    <div className="relative mx-auto h-44 w-44 shrink-0">
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={t("statistics.dashboard.cancelled_activity_chart", {
          cancelled,
          cash: cashCancelled,
          terminal: cancelled - cashCancelled,
        })}
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke={
            cancelled > 0
              ? "var(--color-warning)"
              : "var(--color-surface-muted)"
          }
          strokeWidth="18"
        />
        {cancelled > 0 && (
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="18"
            strokeDasharray={`${cashFraction * circumference} ${circumference}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-text-main">{cancelled}</span>
        <span className="text-xs text-text-muted">
          {t("statistics.dashboard.cancelled")}
        </span>
      </div>
    </div>
  );
};

export default CancellationDonut;
