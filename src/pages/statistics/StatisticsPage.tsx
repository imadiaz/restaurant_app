import { BarChart3 } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useStatistics } from "../../hooks/statistics/use.statistics";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import { useRestaurantOperations } from "../../hooks/restaurants/use.operations";
import { useAppStore } from "../../store/app.store";
import { useAuthStore } from "../../store/auth.store";
import { isRestaurantAdmin, isSuperAdmin } from "../../data/models/user/utils/user.utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Filler,
  Legend,
);

// 🆕 Helper component to create clean dividers between sections
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center space-x-4 mb-4 mt-8 first:mt-0">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    <div className="flex-1 h-px bg-gray-200"></div>
  </div>
);

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeRestaurant } = useAppStore();
  const { user } = useAuthStore();
  
  const [dates, setDates] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    };
  });

  const {
    summary,
    chartData,
    topProducts,
    platformDebt,
    financialSummary, // 👈 Destructure our new data
    isFetchingAny,
    hasAnyError,
  } = useStatistics(dates);
  
  const { generatePaymentLink, isGeneratingPaymentLink } = useRestaurantOperations();

  // Helper to format currency safely
  const formatCurrency = (number: number | undefined | null) =>
    `$${Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(number || 0)}`;

  // Helper to format dates nicely (e.g., "2026-02-01" -> "Feb 1")
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  // --- Chart.js Configuration ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context: any) => ` ${formatCurrency(context.raw)}` },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#888" } },
      y: { border: { display: false }, grid: { color: "#eee" }, ticks: { color: "#888", callback: (value: any) => `$${value}` } },
    },
  };

  const chartJsData = {
    labels: chartData.map((d) => formatDate(d.date)),
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: chartData.map((d) => d.dailyEarnings),
        borderColor: "#EE8410", 
        backgroundColor: "rgba(245, 166, 35, 0.15)", 
        tension: 0.4, 
        pointBackgroundColor: "#EE8410",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const handleGeneratePaymentLink = async (restaurantId: string) => {
    try {
      const data: any = await generatePaymentLink({ id: restaurantId });
      if(data != null && data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error generating payment link:", error);
    }
  }

  if (hasAnyError) {
    return <div className="p-6 text-red-500">{t("common.error_loading_data")}</div>;
  }

  return (
    <BasePageLayout
      title={t("statistics.title", "Dashboard")}
      subtitle={t("statistics.description", "Monitor your restaurant's performance")}
      isLoading={isFetchingAny}
      isEmpty={false}
      emptyLabel={t("statistics.empty", "No data available")}
      emptyIcon={BarChart3}
      renderControls={
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={dates.startDate}
            onChange={(e) => setDates((prev) => ({ ...prev, startDate: e.target.value }))}
            className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm text-sm p-2 focus:ring-primary focus:border-primary outline-none border"
          />
          <span className="text-gray-500 hidden sm:block">{t("common.to", "to")}</span>
          <input
            type="date"
            value={dates.endDate}
            onChange={(e) => setDates((prev) => ({ ...prev, endDate: e.target.value }))}
            className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm text-sm p-2 focus:ring-primary focus:border-primary outline-none border"
          />
        </div>
      }
    >
      <div className="pb-20 space-y-8">
        
        {/* ======================= 1. PLATFORM SECTION ======================= */}
        <div>
          {/* ======================= 1. PLATFORM SECTION ======================= */}
        {/* Only render this section header if the user is a Super Admin OR if they are a restaurant with debt */}
        {(isSuperAdmin(user) || (isRestaurantAdmin(user) && platformDebt && platformDebt.debtAmount < 0)) && (
          <div>
            <SectionHeader title={t("statistics.sections.platform", "Platform & Debt")} />
            
            {/* 🔒 SUPER ADMIN ONLY: Platform Financials */}
            {isSuperAdmin(user) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-purple-500">
                  <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_commissions", "Platform Commissions")}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isFetchingAny ? "..." : formatCurrency(financialSummary?.totalPlatformCommissions)}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-500">
                  <h3 className="text-sm font-medium text-gray-500">{t("statistics.net_profit", "Net Profit (After Refunds)")}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isFetchingAny ? "..." : formatCurrency(financialSummary?.netPlatformProfit)}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-teal-500">
                  <h3 className="text-sm font-medium text-gray-500">{t("statistics.debt_settled", "Total Debt Settled")}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isFetchingAny ? "..." : formatCurrency(financialSummary?.totalDebtSettled)}
                  </p>
                </div>
              </div>
            )}

            {/* ⚠️ RESTAURANT ADMIN ONLY: Conditional Debt Warning Block */}
            {isRestaurantAdmin(user) && platformDebt && platformDebt.debtAmount < 0 && (
              <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100 border-t-4 border-t-red-500 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-red-800">
                      {t("statistics.platform_debt", "Platform Debt Attention")}
                    </h3>
                    <p className="text-sm text-red-600 mt-1">
                      {t("statistics.platform_debt_description", "You have an outstanding balance from cash order commissions.")}
                    </p>
                    <p className="text-3xl font-black text-red-900 mt-3">
                      {isFetchingAny ? "..." : formatCurrency(Math.abs(platformDebt.debtAmount))}
                    </p>
                  </div>
                  <div>
                    <AnatomyButton variant="danger" isLoading={isGeneratingPaymentLink} onClick={() => handleGeneratePaymentLink(activeRestaurant?.id || "")}>
                      {t("statistics.generate_payment_link", "Pay Outstanding Debt")}
                    </AnatomyButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* ======================= 2. FINANCIAL SECTION ======================= */}
        <div>
          <SectionHeader title={t("statistics.sections.financial", "Financial Overview")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-orange-500">
              <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_revenue", "Total Revenue")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isFetchingAny ? "..." : formatCurrency(summary?.totalEarnings)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
              <h3 className="text-sm font-medium text-gray-500">{t("statistics.card_revenue", "Card Revenue")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isFetchingAny ? "..." : formatCurrency(financialSummary?.totalCardRevenue)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-500">
              <h3 className="text-sm font-medium text-gray-500">{t("statistics.cash_revenue", "Cash Revenue")}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isFetchingAny ? "..." : formatCurrency(financialSummary?.totalCashRevenue)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-rose-500">
              <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_refunded", "Total Refunded")}</h3>
              <p className="text-3xl font-bold text-rose-600 mt-2">
                {isFetchingAny ? "..." : `-${formatCurrency(financialSummary?.totalRefunded)}`}
              </p>
            </div>

          </div>
        </div>

        {/* ======================= 3. ORDERS SECTION ======================= */}
        <div>
          <SectionHeader title={t("statistics.sections.orders", "Orders & Products")} />
          
          <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 inline-block pr-12">
            <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_orders", "Total Delivered Orders")}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isFetchingAny ? "..." : summary?.totalOrders || 0}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {t("statistics.revenue_over_time", "Revenue Over Time")}
              </h3>
              <div className="h-[320px] w-full">
                <Line data={chartJsData} options={chartOptions} />
              </div>
            </div>

            <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("statistics.top_products", "Top Selling Products")}
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {t("statistics.best_sellers", "Best Sellers")}
                </span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">{t("common.product", "Product")}</th>
                      <th scope="col" className="px-4 py-3 font-medium text-right">{t("common.sold", "Sold")}</th>
                      <th scope="col" className="px-4 py-3 font-medium text-right">{t("common.revenue", "Revenue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.productId || product.productName} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[120px]" title={product.productName}>
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-right">{product.totalSold}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(product.revenueGenerated)}
                        </td>
                      </tr>
                    ))}

                    {topProducts.length === 0 && !isFetchingAny && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          {t("statistics.no_sales_data", "No sales data for this period.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </BasePageLayout>
  );
};

export default StatisticsPage;
