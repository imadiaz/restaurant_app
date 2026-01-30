import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySwitcher from '../../components/anatomy/AnatomySwitcher';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import { useForm } from 'react-hook-form';
import { useToastStore } from '../../store/toast.store';


export interface ScheduleOverrideDto {
  date: string;       // YYYY-MM-DD
  isClosed: boolean;
  reason: string;
  openTime?: string;  // HH:mm
  closeTime?: string; // HH:mm
}

interface ScheduleOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleOverrideDto) => Promise<void>;
  initialDate?: string; 
}

const ScheduleOverrideModal: React.FC<ScheduleOverrideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const todayStr = getTodayString();
  const currentTimeStr = getCurrentTimeString();
  const {addToast} = useToastStore();

  const { register, handleSubmit, watch, setValue, reset } = useForm<ScheduleOverrideDto>({
    defaultValues: {
      date: initialDate || todayStr,
      isClosed: true, 
      reason: '',
      openTime: '',
      closeTime: ''
    }
  });

  const isClosed = watch('isClosed');
  const selectedDate = watch('date');
  const openTime = watch('openTime');
  const closeTime = watch('closeTime');


  const isDateInvalid = useMemo(() => {
    if (!selectedDate) return false;
    return selectedDate < todayStr;
  }, [selectedDate, todayStr]);

  const isOpenTimeInvalid = useMemo(() => {
    if (isClosed || !openTime || !selectedDate) return false;
    if (selectedDate === todayStr) {
       return openTime < currentTimeStr;
    }
    return false;
  }, [isClosed, openTime, selectedDate, todayStr, currentTimeStr]);

  const isRangeInvalid = useMemo(() => {
    if (isClosed || !openTime || !closeTime) return false;
    return openTime >= closeTime;
  }, [isClosed, openTime, closeTime]);


  useEffect(() => {
    if (isOpen) {
      reset({
        date: initialDate || todayStr,
        isClosed: true,
        reason: '',
        openTime: '',
        closeTime: ''
      });
    }
  }, [isOpen, initialDate, reset, todayStr]);

  const onSubmit = async (data: ScheduleOverrideDto) => {
    if (isDateInvalid || isOpenTimeInvalid || isRangeInvalid) {
      addToast(t('schedules.validate_fields'),"error");
      return;
    };

    setIsSubmitting(true);
    try {
      const cleanData = { ...data };
      if (cleanData.isClosed) {
         delete cleanData.openTime;
         delete cleanData.closeTime;
      }
      await onSave(cleanData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        <div className="p-6 border-b border-border bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
          <div>
            <AnatomyText.H3 className="mb-1">{t('schedules.special_schedule')}</AnatomyText.H3>
            <AnatomyText.Small className="text-text-muted">
              {t('schedules.setup_events')}
            </AnatomyText.Small>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-4">
             <div>
                <AnatomyTextField
                    label={t('common.date')}
                    type="date"
                    min={todayStr} 
                    icon={<Calendar className="w-4 h-4 text-text-muted" />}
                    {...register('date', { required: true })}
                />
                
                {isDateInvalid && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('schedules.validation_past_date')}
                    </div>
                )}
             </div>

             <div>
                <AnatomyText.Label className="mb-1.5 block">{t('common.status')}</AnatomyText.Label>
                <div className="dark:bg-gray-900/50 p-1 rounded-xl">
                   <AnatomySwitcher 
                      value={isClosed ? 'true' : 'false'}
                      onChange={(val) => setValue('isClosed', val === 'true')}
                      options={[
                        { value: 'true', label: t('schedules.close_all_day'), icon: <X className="w-3.5 h-3.5" /> },
                        { value: 'false', label: t('schedules.special_hours'), icon: <Clock className="w-3.5 h-3.5" /> }
                      ]}
                   />
                </div>
             </div>
          </div>

          <AnatomyTextField 
             label={t('schedules.reason')}
             placeholder="e.g. Christmas Day, Super Bowl Final..."
             {...register('reason', { required: true })}
             required
          />

          {!isClosed && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 space-y-3">
               <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">{t('schedules.set_new_hours')}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <AnatomyTextField
                        label="Open"
                        type="time"
                        min={selectedDate === todayStr ? currentTimeStr : undefined}
                        {...register('openTime', { required: !isClosed })}
                    />
                    {isOpenTimeInvalid && (
                        <span className="text-[10px] text-red-500 font-medium block mt-1">
                           {t('schedules.validation_hours_later')} ({currentTimeStr})
                        </span>
                    )}
                  </div>
                  
                  <div>
                    <AnatomyTextField
                        label="Close"
                        type="time"
                        {...register('closeTime', { required: !isClosed })}
                    />
                    {isRangeInvalid && !isOpenTimeInvalid && (
                        <span className="text-[10px] text-red-500 font-medium block mt-1">
                           {t('schedules.validation_hours_after')}
                        </span>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-border bg-gray-50 dark:bg-gray-900 flex gap-3">
           <AnatomyButton type="button" variant="secondary" onClick={onClose} fullWidth>
              {t('common.cancel')}
           </AnatomyButton>
           
           <AnatomyButton 
              type="submit" 
              isLoading={isSubmitting} 
              disabled={isDateInvalid || isOpenTimeInvalid || isRangeInvalid || isSubmitting} 
              fullWidth
           >
              {t('common.save')}
           </AnatomyButton>
        </div>
      </form>
    </div>
  );
};

export default ScheduleOverrideModal;

