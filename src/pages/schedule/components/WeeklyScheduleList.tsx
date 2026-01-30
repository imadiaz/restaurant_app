import React from 'react';
import { Clock, XCircle } from 'lucide-react';
import type { CreateScheduleItemDto } from '../../../service/schedule.service';
import AnatomyTag from '../../../components/anatomy/AnatomyTag';
import { useTranslation } from 'react-i18next';

interface WeeklyScheduleListProps {
groupedSchedules: Record<number, CreateScheduleItemDto[]>;
  todayIndex: number;
  displayDays: number[];
}

const WeeklyScheduleList: React.FC<WeeklyScheduleListProps> = ({ 
  groupedSchedules, 
  todayIndex, 
  displayDays, 
  
}) => {
      const { t } = useTranslation();
    
  return (
    <div className="divide-y divide-border">
      {displayDays.map((day) => {
        const slots = groupedSchedules[day] || [];
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
              <span className={`font-bold ${isToday ? "text-primary" : "text-text-main"}`}>
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
                  <XCircle className="w-3.5 h-3.5 mr-1.5 opacity-50" />
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
                        {slot.openTime?.slice(0, 5)} - {slot.closeTime?.slice(0, 5)}
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
  );
};

export default WeeklyScheduleList;