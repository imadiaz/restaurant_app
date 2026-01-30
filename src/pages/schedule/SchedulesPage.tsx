import { getDay, isWithinInterval } from "date-fns";
import { Edit, CheckCircle, XCircle, Calendar, Clock } from "lucide-react";
import { parse, format } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import AnatomyText from "../../components/anatomy/AnatomyText";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useSchedules } from "../../hooks/schedules/use.schedules";
import { Routes } from "../../config/routes";

const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0];

const SchedulesPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { groupedSchedules, isLoading } = useSchedules();
  const currentTime = new Date();

  const todayIndex = getDay(new Date());

  const currentStatus = useMemo(() => {
    const todaysSlots = groupedSchedules[todayIndex] || [];
    if (todaysSlots.length === 0)
      return {
        isOpen: false,
        text: t("schedules.closed_today") || "Closed Today",
      };

    const now = new Date();
    const normalizeTime = (timeStr: string) => timeStr.slice(0, 5);

    const isOpenNow = todaysSlots.some((slot) => {
      const start = parse(normalizeTime(slot.openTime), "HH:mm", now);
      const end = parse(normalizeTime(slot.closeTime), "HH:mm", now);

      return isWithinInterval(now, { start, end });
    });

    if (isOpenNow) {
      const currentSlot = todaysSlots.find((slot) => {
        const start = parse(normalizeTime(slot.openTime), "HH:mm", now);
        const end = parse(normalizeTime(slot.closeTime), "HH:mm", now);
        return isWithinInterval(now, { start, end });
      });

      const closingDisplay = currentSlot
        ? normalizeTime(currentSlot.closeTime)
        : "";
      return { isOpen: true, text: `Open until ${closingDisplay}` };
    }

    return { isOpen: false, text: "Currently Closed" };
  }, [groupedSchedules, todayIndex, t]);

  return (
    <BasePageLayout
      title={t("schedules.title")}
      subtitle="Overview of operating hours"
      isLoading={isLoading}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.ScheduleAddOrEdit)}>
          <Edit className="w-4 h-4 mr-2" /> {t("common.edit")}
        </AnatomyButton>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <div className="bg-background-card p-6 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStatus.isOpen ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {currentStatus.isOpen ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <AnatomyText.Label className="mb-0.5 uppercase tracking-wider">
                {t("common.status")}
              </AnatomyText.Label>
              <AnatomyText.H3
                className={
                  currentStatus.isOpen ? "text-green-600" : "text-red-500"
                }
              >
                {currentStatus.text}
              </AnatomyText.H3>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-bold text-text-main font-mono">
              {format(currentTime, "HH:mm")}
            </div>
            <div className="text-text-muted text-sm">
              {format(currentTime, "EEEE, MMMM do")}
            </div>
          </div>
        </div>

        <div className="bg-background-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">
                {t("schedules.weakly_hours")}
              </AnatomyText.H3>
            </div>
          </div>

          <div className="divide-y divide-border">
            {DISPLAY_DAYS.map((day) => {
              const slots = groupedSchedules[day];
              const isToday = day === todayIndex;
              const isClosed = slots.length === 0;
              return (
                <div
                  key={day}
                  className={`
                           p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors
                           ${isToday ? "bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}
                        `}
                >
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    {isToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    <span
                      className={`font-bold ${isToday ? "text-primary" : "text-text-main"}`}
                    >
                      {t(`schedules.days.${day}`)}
                    </span>
                    {isToday && (
                      <AnatomyTag className="ml-2">
                        {t("common.today")}
                      </AnatomyTag>
                    )}
                  </div>

                  <div className="flex-1">
                    {isClosed ? (
                      <span className="text-text-muted italic flex items-center text-sm">
                        <XCircle className="w-3.5 h-3.5 mr-1.5 opacity-50" />{" "}
                        {t("common.closed")}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex items-center bg-white dark:bg-gray-800 border border-border px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            <Clock className="w-3.5 h-3.5 mr-2 text-text-muted" />
                            <span className="text-sm font-medium text-text-main">
                              {slot.openTime} - {slot.closeTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default SchedulesPage;
