import React, { useState } from 'react';
import { Clock, Save, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { useToastStore } from '../../store/toast.store';


// --- TYPES ---
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

// --- INITIAL STATE ---
const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '21:00' },
];

const SchedulePage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);

  // --- HANDLERS ---
  
  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isOpen = !newSchedule[index].isOpen;
    setSchedule(newSchedule);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleCopyToAll = () => {
    // Takes Monday's hours (index 0) and applies them to all other OPEN days
    const model = schedule[0];
    const newSchedule = schedule.map((day) => ({
      ...day,
      isOpen: true, // Optional: Force open or keep existing status
      openTime: model.openTime,
      closeTime: model.closeTime
    }));
    setSchedule(newSchedule);
    addToast("Monday's hours copied to all days", 'info');
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      console.log("Saving Schedule:", schedule);
      setIsSaving(false);
      addToast("Operating hours updated successfully", 'success');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <AnatomyText.H1>Operating Hours</AnatomyText.H1>
          <AnatomyText.Subtitle>Manage when your restaurant is open for business</AnatomyText.Subtitle>
        </div>
        <AnatomyButton onClick={handleSave} isLoading={isSaving}>
                        <Save className="w-5 h-5 mr-2" /> Save Changes

        </AnatomyButton>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Helper Bar */}
        <div className="bg-blue-50/50 p-4 border-b border-blue-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex items-center gap-3 text-blue-800">
             <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm border border-blue-100">
               <Clock className="w-4 h-4" />
             </div>
             <p className="text-sm font-medium">Set your standard weekly schedule.</p>
           </div>
           
           <button 
             onClick={handleCopyToAll}
             className="text-sm font-bold text-primary hover:text-primary-dark flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-colors"
           >
             <Copy className="w-4 h-4 mr-2" />
             Copy Monday to All
           </button>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-gray-50">
          {schedule.map((day, index) => (
            <div 
              key={day.day} 
              className={`
                p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors
                ${!day.isOpen ? 'bg-gray-50/80' : 'hover:bg-gray-50/30'}
              `}
            >
              {/* Left: Day Toggle */}
              <div className="flex items-center gap-4 w-40 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(index)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className={`font-bold ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.day}
                </span>
              </div>

              {/* Right: Time Pickers */}
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                {day.isOpen ? (
                  <>
                    <div className="relative flex-1 max-w-[160px]">
                      <input 
                        type="time" 
                        value={day.openTime}
                        onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 font-bold shadow-sm"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none hidden sm:block">Open</span>
                    </div>

                    <span className="text-gray-300 font-medium">–</span>

                    <div className="relative flex-1 max-w-[160px]">
                      <input 
                        type="time" 
                        value={day.closeTime}
                        onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 font-bold shadow-sm"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none hidden sm:block">Close</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-sm italic py-3 bg-gray-100/50 w-full rounded-xl justify-center border border-dashed border-gray-200">
                    <AlertCircle className="w-4 h-4" />
                    Closed for business
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SchedulePage;