import React from 'react';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { ScheduleOverride } from '../../../service/schedule.service';
import AnatomyTag from '../../../components/anatomy/AnatomyTag';
import { useTranslation } from 'react-i18next';


interface SchedulesOverrideCardProps {
  override: ScheduleOverride;
  onDelete: (id: string) => void;
}

const SchedulesOverrideCard: React.FC<SchedulesOverrideCardProps> = ({ override, onDelete }) => {
   const {t} = useTranslation();
  const formatTime = (time?: string | null) => time?.slice(0, 5) || '';

  return (
    <div 
       className={`
          relative p-5 rounded-2xl border flex flex-col gap-3 transition-shadow hover:shadow-md
          ${override.isClosed 
             ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' 
             : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
          }
       `}
    >
       <div className="flex justify-between items-start pr-8">
          <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-text-muted" />
             <span className="font-bold text-text-main">
                {format(parseISO(override.date), 'EEEE, MMMM do, yyyy')}
             </span>
          </div>
          <AnatomyTag variant={override.isClosed ? 'error' : 'primary'}>
             {override.isClosed ? t('schedules.close_all_day') : t('schedules.special_hours')}
          </AnatomyTag>
       </div>

       <div>
          <div className="font-medium text-sm text-text-main mb-1">
             {override.reason}
          </div>
          
          {!override.isClosed && (
             <div className="flex items-center text-sm text-text-muted bg-white dark:bg-gray-800 w-fit px-2 py-1 rounded-lg border border-border/50">
                <Clock className="w-3.5 h-3.5 mr-2" />
                {formatTime(override.openTime)} - {formatTime(override.closeTime)}
             </div>
          )}
       </div>

       <button 
          onClick={() => onDelete(override.id)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Remove Exception"
       >
          <Trash2 className="w-4 h-4" />
       </button>
    </div>
  );
};

export default SchedulesOverrideCard;