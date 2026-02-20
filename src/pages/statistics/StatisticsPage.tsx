import { BarChart3 } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Filler, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useStatistics } from "../../hooks/statistics/use.statistics";


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Filler,
  Legend
);

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();

  // Set default dates to the current month
  const [dates, setDates] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    };
  });

  const { summary, chartData, topProducts, platformDebt, isFetchingAny, hasAnyError } = useStatistics(dates);

  // Helper to format currency
  const formatCurrency = (number: number) =>
    `$${Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(number)}`;

  // NEW: Helper to format dates nicely (e.g., "2026-02-01" -> "Feb 1")
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // You can change 'en-US' to 'es-MX' or whatever your primary locale is
    return new Intl.DateTimeFormat("en-US", { 
      month: "short", 
      day: "numeric" 
    }).format(date);
  };

  // --- Chart.js Configuration ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for a cleaner look
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${formatCurrency(context.raw)}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#888" },
      },
      y: {
        border: { display: false },
        grid: { color: "#eee" },
        ticks: {
          color: "#888",
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  const chartJsData = {
    labels: chartData.map((d) => formatDate(d.date)),
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: chartData.map((d) => d.dailyEarnings),
        borderColor: "#EE8410", // Brand orange
        backgroundColor: "rgba(245, 166, 35, 0.15)", // Transparent orange for the area
        tension: 0.4, // Makes the line curved and smooth
        pointBackgroundColor: "#EE8410",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

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
      <div className="pb-20 space-y-6">
        {platformDebt && platformDebt.debtAmount < 0 && 
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-red-500">
            <h3 className="text-sm font-medium text-gray-500">{t("statistics.platform_debt", "Platform Debt")}</h3>
            <span className="text-sm  text-gray-500">{t("statistics.platform_debt_description")}</span>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isFetchingAny ? "..." : formatCurrency(platformDebt.debtAmount || 0)}
            </p>
          </div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-orange-500">
            <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_revenue")}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isFetchingAny ? "..." : formatCurrency(summary?.totalEarnings || 0)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
            <h3 className="text-sm font-medium text-gray-500">{t("statistics.total_orders")}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isFetchingAny ? "..." : summary?.totalOrders || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t("statistics.revenue_over_time", "Revenue Over Time")}</h3>
            <div className="h-[320px] w-full">
              <Line data={chartJsData} options={chartOptions} />
            </div>
          </div>

          <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("statistics.top_products", "Top Selling Products")}</h3>
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
    </BasePageLayout>
  );
};

export default StatisticsPage;