import type { DashboardStatistics } from "../service/statistics.service";

export const mexicoCityDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (name: string) =>
    parts.find((value) => value.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const dashboardDateRange = (preset: string) => {
  const endDate = mexicoCityDate();
  if (preset === "month")
    return { startDate: `${endDate.slice(0, 7)}-01`, endDate };
  const start = new Date(`${endDate}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (preset === "30" ? 29 : 6));
  return { startDate: start.toISOString().slice(0, 10), endDate };
};

export const validDashboardRange = (start: string, end: string) => {
  const days =
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000 +
    1;
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(start) &&
    /^\d{4}-\d{2}-\d{2}$/.test(end) &&
    days >= 1 &&
    days <= 366 &&
    new Date(`${start}T00:00:00Z`).toISOString().slice(0, 10) === start &&
    new Date(`${end}T00:00:00Z`).toISOString().slice(0, 10) === end
  );
};

export type DashboardMetric = "sales" | "orders" | "ticket";
export const dashboardMetric = (
  data: DashboardStatistics,
  metric: DashboardMetric,
) => ({
  total:
    metric === "sales"
      ? data.summary.totalRevenue
      : metric === "orders"
        ? data.summary.deliveredOrders
        : data.summary.averageTicket,
  values: data.chart.map((day) =>
    metric === "sales"
      ? day.dailyEarnings
      : metric === "orders"
        ? day.ordersCount
        : day.averageTicket,
  ),
});
