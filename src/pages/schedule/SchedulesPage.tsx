import { getDay, isWithinInterval, parseISO } from "date-fns";
import { Edit, CheckCircle, XCircle, Calendar, Clock, Trash2, CalendarX } from "lucide-react";
import { parse, format } from "date-fns";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import AnatomyText from "../../components/anatomy/AnatomyText";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useSchedules } from "../../hooks/schedules/use.schedules";
import ScheduleOverrideModal, { type ScheduleOverrideDto } from "./ScheduleOverrideModal";
import SchedulesOverrideCard from "./components/ScheduleOverridesCard";
import { Routes } from "../../config/routes";
import WeeklyScheduleList from "./components/WeeklyScheduleList";

const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0];

const SchedulesPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { 
    groupedSchedules, 
    overrides, 
    createOverride, 
    deleteOverride,
    isLoading 
  } = useSchedules();
  const currentTime = new Date();
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const todayIndex = getDay(new Date());

  const currentStatus = useMemo(() => {
  const todaysSlots = groupedSchedules[todayIndex] || [];
  if (todaysSlots.length === 0)
    return {
      isOpen: false,
      text: t("schedules.currently_closed") || "Closed Today",
    };

  const now = new Date();
  const normalizeTime = (timeStr: string) => timeStr.slice(0, 5);

  const isOpenNow = todaysSlots.some((slot) => {
    const start = parse(normalizeTime(slot.openTime), "HH:mm", now);
    let end = parse(normalizeTime(slot.closeTime), "HH:mm", now);

    // ✅ FIX: If end time is 00:00 or earlier than start, it means the next day
    // For the "Current Status" check, we treat 00:00 as the very end of today
    if (normalizeTime(slot.closeTime) === "00:00" || end <= start) {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    return isWithinInterval(now, { start, end });
  });

  if (isOpenNow) {
    const currentSlot = todaysSlots.find((slot) => {
      const start = parse(normalizeTime(slot.openTime), "HH:mm", now);
      let end = parse(normalizeTime(slot.closeTime), "HH:mm", now);
      
      if (normalizeTime(slot.closeTime) === "00:00" || end <= start) {
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      }
      return isWithinInterval(now, { start, end });
    });

    const closingDisplay = currentSlot ? normalizeTime(currentSlot.closeTime) : "";
    
    // If it's 00:00, you might want to show "Midnight" or "24:00"
    const displayTime = closingDisplay === "00:00" ? "24:00" : closingDisplay;

    return { isOpen: true, text: `${t("schedules.open_until")} ${displayTime}` };
  }

  return { isOpen: false, text: t("schedules.currently_closed") || "Currently Closed" };
}, [groupedSchedules, todayIndex, t]);


  const handleSaveOverride = async (data: ScheduleOverrideDto) => {
    await createOverride(data);
  };

  const handleDeleteOverride = async (id: string) => {
    if (confirm("Are you sure you want to remove this exception?")) {
       await deleteOverride(id);
    }
  };

  return (
    <BasePageLayout
      title={t("schedules.title")}
      subtitle="Overview of operating hours"
      isLoading={isLoading}
      headerActions={
        <div className="flex gap-2">
            <AnatomyButton variant="secondary" onClick={() => setIsOverrideModalOpen(true)}>
               <Calendar className="w-4 h-4 mr-2" /> {t('schedules.add_exception')}
            </AnatomyButton>
            
            <AnatomyButton onClick={() => navigateTo(Routes.ScheduleAddOrEdit)}>
               <Edit className="w-4 h-4 mr-2" /> {t("common.edit")}
            </AnatomyButton>
         </div>
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


          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-2">
               <Calendar className="w-5 h-5 text-red-500" />
               <AnatomyText.H3 className="mb-0">{t('schedules.special_dates_and_holidays')}</AnatomyText.H3>
            </div>

            {overrides.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-border">
             <AnatomyText.Small className="text-text-muted">
                {t('schedules.special_dates_and_holidays_empty')}
             </AnatomyText.Small>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {overrides.map((item) => (
                <SchedulesOverrideCard
                   key={item.id} 
                   override={item} 
                   onDelete={handleDeleteOverride} 
                />
             ))}
          </div>
       )}
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

          <WeeklyScheduleList
             groupedSchedules={groupedSchedules}
             todayIndex={todayIndex}
             displayDays={DISPLAY_DAYS}
          />

        </div>

        <ScheduleOverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          onSave={handleSaveOverride}
       />
      </div>
    </BasePageLayout>
  );
};

export default SchedulesPage;
