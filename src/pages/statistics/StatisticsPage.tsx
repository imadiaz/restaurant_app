import {
  Banknote,
  CreditCard,
  ExternalLink,
  Loader2,
  ReceiptText,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import BasePageLayout from "../../components/layout/BaseLayout";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import RevenueLineChart from "../../components/charts/RevenueLineChart";
import CancellationDonut from "../../components/charts/CancellationDonut";
import { useStatistics } from "../../hooks/statistics/use.statistics";
import { useRestaurantOperations } from "../../hooks/restaurants/use.operations";
import { useAppStore } from "../../store/app.store";
import { useAuthStore } from "../../store/auth.store";
import { ROLES } from "../../config/roles";
import {
  dashboardDateRange,
  dashboardMetric,
  validDashboardRange,
  type DashboardMetric,
} from "../../utils/statistics.utils";

const panelClass =
  "rounded-card border border-border bg-background-card shadow-sm";
const Panel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <section className={panelClass}>
    <div className="border-b border-border px-5 py-4">
      <h2 className="font-bold text-text-main">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const StatisticsPage = () => {
  const { t, i18n } = useTranslation();
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const role = useAuthStore((state) => state.user?.role.name);
  const [dates, setDates] = useState(() => dashboardDateRange("7"));
  const [preset, setPreset] = useState("7");
  const [method, setMethod] = useState<"" | "CASH" | "CARD_TERMINAL">("");
  const [metric, setMetric] = useState<DashboardMetric>("sales");
  const [paymentLink, setPaymentLink] = useState<{
    restaurantId: string;
    url: string;
    amount: number;
  } | null>(null);
  const validRange = validDashboardRange(dates.startDate, dates.endDate);
  const { dashboard, debt } = useStatistics(
    { ...dates, paymentMethod: method || undefined },
    validRange,
  );
  const { generatePaymentLink, isGeneratingPaymentLink } =
    useRestaurantOperations();
  const canPay = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  const balance = Number(debt.data?.debtAmount ?? 0);
  const amountDue = Math.max(0, -balance);
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "MXN",
    }).format(value);
  const count = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(
      value,
    );
  const data = dashboard.data;
  const summary = data?.summary;
  const selectedMetric = data ? dashboardMetric(data, metric) : undefined;
  const formatMetric = metric === "orders" ? count : money;
  const dateLabel = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));
  const selectDate = (key: "startDate" | "endDate", value: string) => {
    setPreset("custom");
    setDates((previous) => ({ ...previous, [key]: value }));
  };
  const handlePaymentLink = async () => {
    if (!restaurantId) return;
    setPaymentLink(null);
    try {
      const result = await generatePaymentLink({ id: restaurantId });
      if (result.url)
        setPaymentLink({ restaurantId, url: result.url, amount: amountDue });
    } catch {
      // The shared mutation handler presents API errors.
    }
  };
  const inputClass =
    "min-h-11 rounded-control border border-border-strong bg-input px-3 py-2 text-sm text-text-main outline-none focus:ring-2 focus:ring-primary";

  return (
    <BasePageLayout
      title={t("statistics.dashboard.title")}
      subtitle={t("statistics.dashboard.description")}
      headerActions={
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            {t("statistics.dashboard.start_date")}
            <input
              type="date"
              className={inputClass}
              value={dates.startDate}
              max={dates.endDate || undefined}
              onChange={(event) => selectDate("startDate", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            {t("statistics.dashboard.end_date")}
            <input
              type="date"
              className={inputClass}
              value={dates.endDate}
              min={dates.startDate || undefined}
              onChange={(event) => selectDate("endDate", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            {t("statistics.dashboard.period")}
            <select
              className={inputClass}
              value={preset}
              onChange={(event) => {
                setPreset(event.target.value);
                if (event.target.value !== "custom")
                  setDates(dashboardDateRange(event.target.value));
              }}
            >
              <option value="7">{t("statistics.dashboard.last_7")}</option>
              <option value="30">{t("statistics.dashboard.last_30")}</option>
              <option value="month">
                {t("statistics.dashboard.this_month")}
              </option>
              <option value="custom">{t("statistics.dashboard.custom")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            {t("orders.payment_method")}
            <select
              className={inputClass}
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as typeof method)
              }
            >
              <option value="">{t("statistics.dashboard.both_methods")}</option>
              <option value="CASH">{t("statistics.dashboard.cash")}</option>
              <option value="CARD_TERMINAL">
                {t("statistics.dashboard.terminal")}
              </option>
            </select>
          </label>
        </div>
      }
    >
      {!restaurantId ? (
        <p className="text-text-muted">
          {t("statistics.dashboard.select_restaurant")}
        </p>
      ) : (
        <div className="space-y-6">
          {!validRange && (
            <p role="alert" className="text-sm text-danger">
              {t("statistics.dashboard.invalid_range")}
            </p>
          )}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="contents">
              {dashboard.isError ? (
                <div role="alert" className={`${panelClass} p-6 text-danger`}>
                  <p>{t("common.error_loading_data")}</p>
                  <AnatomyButton
                    variant="secondary"
                    onClick={() => void dashboard.refetch()}
                    disabled={!validRange}
                  >
                    {t("orders.retry_detail")}
                  </AnatomyButton>
                </div>
              ) : !data || !validRange ? (
                <div
                  className={`${panelClass} flex min-h-80 items-center justify-center text-text-muted`}
                  role="status"
                >
                  {validRange && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {t(
                    validRange
                      ? "common.loading_data"
                      : "statistics.dashboard.invalid_range",
                  )}
                </div>
              ) : (
                <>
                  <section
                    className={`${panelClass} min-w-0 overflow-hidden xl:col-span-2`}
                  >
                    <div
                      className="flex overflow-x-auto border-b border-border"
                      role="tablist"
                      aria-label={t("statistics.dashboard.metrics")}
                    >
                      {(["sales", "orders", "ticket"] as const).map((value) => (
                        <button
                          key={value}
                          role="tab"
                          aria-selected={metric === value}
                          aria-controls="dashboard-chart"
                          id={`dashboard-tab-${value}`}
                          onClick={() => setMetric(value)}
                          className={`min-w-36 flex-1 border-b-4 px-5 py-4 text-left transition-colors ${metric === value ? "border-primary bg-primary/5" : "border-transparent hover:bg-surface-hover"}`}
                        >
                          <span className="text-xs font-medium text-text-muted">
                            {t(`statistics.dashboard.${value}`)}
                          </span>
                          <span className="mt-1 block whitespace-nowrap text-xl font-bold text-text-main">
                            {value === "orders"
                              ? count(dashboardMetric(data, value).total)
                              : money(dashboardMetric(data, value).total)}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div
                      className="p-5"
                      role="tabpanel"
                      id="dashboard-chart"
                      aria-labelledby={`dashboard-tab-${metric}`}
                    >
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-2xl font-bold text-text-main">
                            {formatMetric(selectedMetric!.total)}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {t("statistics.dashboard.delivered_only")}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {dateLabel(dates.startDate)} —{" "}
                          {dateLabel(dates.endDate)}
                        </span>
                      </div>
                      <div className="h-72 w-full overflow-x-auto">
                        <div className="h-full min-w-[460px]">
                          <RevenueLineChart
                            labels={data.chart.map((day) =>
                              dateLabel(day.date),
                            )}
                            values={selectedMetric!.values}
                            formatValue={formatMetric}
                            accessibleLabel={t(
                              `statistics.dashboard.${metric}`,
                            )}
                            emptyLabel={t("statistics.dashboard.no_data")}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid min-w-0 gap-4 sm:grid-cols-3 xl:col-span-2">
                    {[
                      {
                        label: "received",
                        value: count(summary!.receivedOrders),
                        icon: ReceiptText,
                      },
                      {
                        label: "cash_revenue",
                        value: money(summary!.cashRevenue),
                        icon: Banknote,
                      },
                      {
                        label: "terminal_revenue",
                        value: money(summary!.terminalRevenue),
                        icon: CreditCard,
                      },
                    ].map(({ label, value, icon: Icon }) => (
                      <div className={`${panelClass} p-5`} key={label}>
                        <Icon className="mb-3 h-5 w-5 text-primary" />
                        <p className="text-xs text-text-muted">
                          {t(`statistics.dashboard.${label}`)}
                        </p>
                        <p className="mt-1 break-words text-xl font-bold text-text-main">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                    <Panel
                      title={t("statistics.dashboard.top_products")}
                      subtitle={t("statistics.dashboard.ranked_by_units")}
                    >
                      {data.topProducts.length ? (
                        <ol className="space-y-4">
                          {data.topProducts.map((product, index) => (
                            <li
                              key={`${product.productId}-${product.productName}`}
                              className="flex items-center gap-3"
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-primary/15 text-primary" : "bg-surface-muted text-text-muted"}`}
                              >
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-sm font-medium text-text-main"
                                  title={product.productName}
                                >
                                  {product.productName}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {money(product.revenueGenerated)}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-text-main">
                                {count(product.totalSold)}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="py-8 text-center text-sm text-text-muted">
                          {t("statistics.dashboard.no_data")}
                        </p>
                      )}
                    </Panel>
                    <Panel
                      title={t("statistics.dashboard.payment_mix")}
                      subtitle={t("statistics.dashboard.delivered_only")}
                    >
                      <div className="space-y-6">
                        {[
                          {
                            label: "cash",
                            amount: summary!.cashRevenue,
                            orders: summary!.cashOrders,
                            color: "bg-primary",
                          },
                          {
                            label: "terminal",
                            amount: summary!.terminalRevenue,
                            orders: summary!.terminalOrders,
                            color: "bg-info",
                          },
                        ].map((payment) => (
                          <div key={payment.label}>
                            <div className="flex justify-between gap-2 text-sm">
                              <span className="text-text-muted">
                                {t(`statistics.dashboard.${payment.label}`)}
                              </span>
                              <span className="font-bold text-text-main">
                                {money(payment.amount)}
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                              <div
                                className={`h-full rounded-full ${payment.color}`}
                                style={{
                                  width: `${summary!.totalRevenue ? (payment.amount / summary!.totalRevenue) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-text-subtle">
                              {t("statistics.dashboard.order_count", {
                                count: payment.orders,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Panel>
                    <Panel
                      title={t("statistics.dashboard.cancelled")}
                      subtitle={t("statistics.dashboard.cancelled_in_period")}
                    >
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        <CancellationDonut
                          cancelled={summary!.cancelledOrders}
                          cashCancelled={summary!.cashCancelledOrders}
                        />
                        <dl className="space-y-3 text-sm">
                          <div>
                            <dt className="text-text-muted">
                              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-danger" />
                              {t("statistics.dashboard.cash")}
                            </dt>
                            <dd className="font-bold text-text-main">
                              {summary!.cashCancelledOrders}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-text-muted">
                              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-warning" />
                              {t("statistics.dashboard.terminal")}
                            </dt>
                            <dd className="font-bold text-text-main">
                              {summary!.terminalCancelledOrders}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </Panel>
                    <Panel
                      title={t("statistics.dashboard.period_commissions")}
                      subtitle={t("statistics.dashboard.delivered_only")}
                    >
                      <Wallet className="mb-4 h-7 w-7 text-primary" />
                      <p className="text-3xl font-bold text-text-main">
                        {money(summary!.platformCommissions)}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-text-muted">
                        {t("statistics.dashboard.commission_hint")}
                      </p>
                    </Panel>
                    <p className="text-xs text-text-subtle lg:col-span-2">
                      {t("statistics.dashboard.cohort_note")}
                    </p>
                  </div>
                </>
              )}
            </div>

            <aside className="space-y-6 xl:sticky xl:top-6">
              <section
                className={`${panelClass} overflow-hidden border-t-4 border-t-primary`}
              >
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <Wallet className="h-5 w-5" />
                    <h2 className="font-bold">
                      {t("statistics.platform_debt")}
                    </h2>
                  </div>
                  {debt.isError ? (
                    <div role="alert">
                      <p className="text-sm text-danger">
                        {t("statistics.dashboard.debt_error")}
                      </p>
                      <AnatomyButton
                        variant="ghost"
                        onClick={() => void debt.refetch()}
                      >
                        {t("orders.retry_detail")}
                      </AnatomyButton>
                    </div>
                  ) : debt.isLoading ? (
                    <p role="status" className="text-sm text-text-muted">
                      {t("common.loading_data")}
                    </p>
                  ) : (
                    <>
                      <p
                        className={`text-3xl font-bold ${amountDue > 0 ? "text-danger" : "text-success"}`}
                      >
                        {money(amountDue)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {t("statistics.dashboard.current_balance")}
                      </p>
                      {balance > 0 && (
                        <p className="mt-2 text-xs text-success">
                          {t("statistics.dashboard.credit", {
                            amount: money(balance),
                          })}
                        </p>
                      )}
                    </>
                  )}
                  <p className="my-4 text-sm leading-relaxed text-text-muted">
                    {t("statistics.dashboard.debt_hint")}
                  </p>
                  {canPay ? (
                    <AnatomyButton
                      fullWidth
                      isLoading={isGeneratingPaymentLink}
                      disabled={
                        debt.isLoading || debt.isError || amountDue <= 0
                      }
                      onClick={() => void handlePaymentLink()}
                    >
                      {t("statistics.generate_payment_link")}
                    </AnatomyButton>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {t("statistics.dashboard.owner_payment")}
                    </p>
                  )}
                  {!debt.isLoading && !debt.isError && amountDue === 0 && (
                    <p className="mt-3 text-sm text-success">
                      {t("statistics.dashboard.no_debt")}
                    </p>
                  )}
                  {paymentLink?.restaurantId === restaurantId &&
                    canPay &&
                    !debt.isError &&
                    paymentLink.amount === amountDue &&
                    amountDue > 0 && (
                      <a
                        href={paymentLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 rounded-control border border-primary px-3 py-3 text-sm font-bold text-primary"
                      >
                        {t("statistics.dashboard.open_payment")}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary"
                    onClick={() => {
                      setPaymentLink(null);
                      void debt.refetch();
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t("statistics.dashboard.refresh_balance")}
                  </button>
                </div>
              </section>
              {summary && validRange && (
                <Panel
                  title={t("statistics.dashboard.operations")}
                  subtitle={t("statistics.dashboard.current_status")}
                >
                  <dl className="divide-y divide-border">
                    {[
                      {
                        label: "pending",
                        value: summary.pendingOrders,
                        color: "text-primary",
                      },
                      {
                        label: "cooking",
                        value: summary.preparingOrders,
                        color: "text-warning",
                      },
                      {
                        label: "ready",
                        value: summary.readyOrders,
                        color: "text-info",
                      },
                      {
                        label: "in_progress",
                        value: summary.inProgressOrders,
                        color: "text-info",
                      },
                      {
                        label: "delivered",
                        value: summary.deliveredOrders,
                        color: "text-success",
                      },
                      {
                        label: "cancelled",
                        value: summary.cancelledOrders,
                        color: "text-danger",
                      },
                      {
                        label: "incomplete",
                        value: summary.incompletePaymentOrders,
                        color: "text-danger",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <dt className="text-sm text-text-muted">
                          {t(`statistics.dashboard.${label}`)}
                        </dt>
                        <dd className={`font-bold ${color}`}>{count(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
              )}
            </aside>
          </div>
        </div>
      )}
    </BasePageLayout>
  );
};

export default StatisticsPage;
