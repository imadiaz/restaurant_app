import React from 'react';
import { Save, Plus, Trash2, Copy, Clock, CalendarOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyTag from '../../components/anatomy/AnatomyTag';
import AnatomyText from '../../components/anatomy/AnatomyText';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useSchedules } from '../../hooks/schedules/use.schedules';
import type { CreateScheduleItemDto } from '../../service/schedule.service';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';

// Order: Monday (1) to Sunday (0)
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0];

const ScheduleFormPage: React.FC = () => {
   const {goBack} = useAppNavigation();
  const { t } = useTranslation();
  const { 
    groupedSchedules, 
    addSlot, 
    removeSlot, 
    updateSlot, 
    copyDayToAll, 
    saveChanges, 
    isDirty, 
    isLoading,
    isSaving
  } = useSchedules();


  const handleSave = async () => {
     try {
        await saveChanges(); 
        goBack();           
     } catch (error) {
       console.log(error);
     }
  };

  return (
    <BasePageLayout
      title={t('schedules.title')}
      subtitle={t('schedules.subtitle')}
      showNavBack
      isLoading={isLoading}
      headerActions={
        <AnatomyButton 
          onClick={handleSave} 
          disabled={!isDirty || isSaving}
          isLoading={isSaving}
        >
          <Save className="w-4 h-4 mr-2" /> {t('common.save')}
        </AnatomyButton>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-start gap-3">
           <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
           <div>
              <AnatomyText.H3 className="text-blue-800 dark:text-blue-300 text-sm mb-1">{t('schedules.weakly_hours')}</AnatomyText.H3>
              <AnatomyText.Small className="text-blue-600 dark:text-blue-400">
                 {t('schedules.schedules_help_text')}
              </AnatomyText.Small>
           </div>
        </div>

        <div className="bg-background-card rounded-3xl border border-border shadow-sm divide-y divide-border">
           {DISPLAY_DAYS.map((day) => (
              <DayRow 
                key={day}
                dayIndex={day}
                slots={groupedSchedules[day]}
                onAdd={() => addSlot(day)}
                onRemove={(idx) => removeSlot(day, idx)}
                onUpdate={(idx, field, val) => updateSlot(day, idx, field, val)}
                onCopy={() => copyDayToAll(day)}
                t={t}
              />
           ))}
        </div>

      </div>
    </BasePageLayout>
  );
};

interface DayRowProps {
  dayIndex: number;
  slots: CreateScheduleItemDto[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, field: 'openTime' | 'closeTime', val: string) => void;
  onCopy: () => void;
  t: (key: string) => string;
}

const DayRow: React.FC<DayRowProps> = ({ 
  dayIndex, slots, onAdd, onRemove, onUpdate, onCopy, t 
}) => {
  const isClosed = slots.length === 0;

  return (
    <div className="p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
       <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          
          <div className="md:w-48 shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between">
             <div>
                <AnatomyText.H3 className="mb-1 capitalize">
                   {t(`schedules.days.${dayIndex}`)}
                </AnatomyText.H3>
                <AnatomyTag 
                   variant={isClosed ? 'default' : 'success'} 
                   className={isClosed ? 'opacity-70' : ''}
                >
                   {isClosed ? t('schedules.closed') : t('schedules.open')}
                </AnatomyTag>
             </div>

             {!isClosed && (
                <button 
                   onClick={onCopy}
                   className="mt-0 md:mt-3 text-xs text-primary hover:text-primary-dark font-medium flex items-center transition-colors group"
                   title={t('schedules.copy_to_all')}
                >
                   <Copy className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:scale-110" />
                   <span className="hidden md:inline">{t('schedules.copy_to_all')}</span>
                   <span className="md:hidden">{t('common.copy_all')}</span>
                </button>
             )}
          </div>

          <div className="flex-1 space-y-3">
             {isClosed ? (
                <div className="flex items-center text-text-muted h-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 border border-dashed border-border w-full md:w-auto self-start">
                   <CalendarOff className="w-4 h-4 mr-2 opacity-50" />
                   <span className="text-sm italic">{t('no_shifts_configured')}</span>
                </div>
             ) : (
                slots.map((slot, idx) => (
                   <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                      
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                         <div className="relative group">
                            <input 
                               type="time" 
                               value={slot.openTime}
                               onChange={(e) => onUpdate(idx, 'openTime', e.target.value)}
                               className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 w-24 text-center cursor-pointer"
                            />
                            <span className="absolute -top-2 left-2 text-[10px] text-text-muted bg-background px-1 opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                         </div>
                         
                         <span className="text-text-muted text-xs">{t('common.to')}</span>
                         
                         <div className="relative group">
                            <input 
                               type="time" 
                               value={slot.closeTime}
                               onChange={(e) => onUpdate(idx, 'closeTime', e.target.value)}
                               className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 w-24 text-center cursor-pointer"
                            />
                            <span className="absolute -top-2 left-2 text-[10px] text-text-muted bg-background px-1 opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                         </div>
                      </div>

                      <button 
                         onClick={() => onRemove(idx)}
                         className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))
             )}

             <div className="pt-1">
                <button 
                   onClick={onAdd}
                   className="flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
                >
                   <Plus className="w-4 h-4 mr-1.5" />
                   {t('schedules.add_hours')}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ScheduleFormPage;