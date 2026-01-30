import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService, type CreateScheduleItemDto } from '../../service/schedule.service';
import { useAppStore } from '../../store/app.store';
import { useErrorHandler } from '../use.error.handler';
import { useToastStore } from '../../store/toast.store';


export type SchedulesByDay = Record<number, CreateScheduleItemDto[]>;

// Default empty week structure
const generateEmptyWeek = (): SchedulesByDay => {
  const week: SchedulesByDay = {};
  for (let i = 0; i <= 6; i++) week[i] = [];
  return week;
};

export const useSchedules = () => {
  const queryClient = useQueryClient();
  const { activeRestaurant } = useAppStore();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);

  // Local state manages DTOs (write model)
  const [localSchedules, setLocalSchedules] = useState<SchedulesByDay>(generateEmptyWeek());
  const [isDirty, setIsDirty] = useState(false);

  const queryKey = ['schedules', activeRestaurant?.id];

  // --- 1. FETCH ---
  const { data: serverData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeRestaurant?.id) return [];
      return scheduleService.getSchedules(activeRestaurant.id);
    },
    enabled: !!activeRestaurant?.id,
  });

  useEffect(() => {
    if (serverData) {
      const grouped = generateEmptyWeek();
      
      const sorted = [...serverData].sort((a, b) => a.openTime.localeCompare(b.openTime));

      sorted.forEach((entity) => {
        const dto: CreateScheduleItemDto = {
          id: entity.id,
          dayOfWeek: entity.dayOfWeek,
          openTime: entity.openTime,
          closeTime: entity.closeTime
        };

        if (grouped[entity.dayOfWeek]) {
          grouped[entity.dayOfWeek].push(dto);
        }
      });
      setLocalSchedules(grouped);
      setIsDirty(false); 
    }
  }, [serverData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeRestaurant?.id) throw new Error("No restaurant selected");
      const flatList = Object.values(localSchedules).flat();
      return scheduleService.saveSchedules(activeRestaurant.id, flatList);
    },
    onSuccess: () => {      
      addToast('Horarios actualizados correctamente', 'success');
      queryClient.invalidateQueries({ queryKey });
      setIsDirty(false);
    },
    onError: handleError
  });

  const addSlot = useCallback((dayOfWeek: number) => {
    setLocalSchedules((prev) => {
      const currentDaySlots = prev[dayOfWeek] || [];
      const newSlot: CreateScheduleItemDto = {
        dayOfWeek,
        openTime: "09:00", 
        closeTime: "17:00"
      };
      return { ...prev, [dayOfWeek]: [...currentDaySlots, newSlot] };
    });
    setIsDirty(true);
  }, []);

  const removeSlot = useCallback((dayOfWeek: number, index: number) => {
    setLocalSchedules((prev) => {
      const newSlots = [...prev[dayOfWeek]];
      newSlots.splice(index, 1);
      return { ...prev, [dayOfWeek]: newSlots };
    });
    setIsDirty(true);
  }, []);

  const updateSlot = useCallback((dayOfWeek: number, index: number, field: keyof CreateScheduleItemDto, value: string) => {
    setLocalSchedules((prev) => {
      const newSlots = [...prev[dayOfWeek]];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, [dayOfWeek]: newSlots };
    });
    setIsDirty(true);
  }, []);

  const copyDayToAll = useCallback((sourceDay: number) => {
    setLocalSchedules((prev) => {
      const sourceSlots = prev[sourceDay];
      const newWeek = { ...prev };
      
      for (let i = 0; i <= 6; i++) {
        if (i === sourceDay) continue;
        newWeek[i] = sourceSlots.map(s => ({ 
          dayOfWeek: i, 
          openTime: s.openTime, 
          closeTime: s.closeTime,
          id: undefined 
        })); 
      }
      return newWeek;
    });
    setIsDirty(true);
  }, []);

  return {
    // Data
    groupedSchedules: localSchedules,
    isLoading,
    isSaving: saveMutation.isPending,
    isDirty,

    // Actions
    addSlot,
    removeSlot,
    updateSlot,
    copyDayToAll,
    saveChanges: saveMutation.mutateAsync,
    
    // Utilities
    days: [0, 1, 2, 3, 4, 5, 6]
  };
};