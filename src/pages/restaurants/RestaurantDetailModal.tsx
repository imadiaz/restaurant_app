import React from 'react';
import { 
  X, MapPin, Phone, FileText, 
  User, Building2, ExternalLink, Edit 
} from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import type { Restaurant, PriceRange } from '../../data/models/restaurant/restaurant';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { Routes } from '../../config/routes';
import { useAppStore } from '../../store/app.store';
import { useTranslation } from 'react-i18next';
import { STATUS } from '../../config/status.config';



interface RestaurantDetailModalProps {
  restaurant: Restaurant | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({ 
  restaurant, isOpen, onClose
}) => {
  if (!isOpen || !restaurant) return null;
  const {t} = useTranslation();
  const { navigateTo } = useAppNavigation();
  const setActiveRestaurant = useAppStore((state) => state.setActiveRestaurant);

  const getPriceSymbol = (range: PriceRange) => {
    const map = { inexpensive: '$', moderate: '$$', expensive: '$$$', very_expensive: '$$$$' };
    return map[range] || '$$';
  };

  const handleEnterDashboard = (restaurant: Restaurant) => {
      setActiveRestaurant(restaurant);
      navigateTo('/'); 
      onClose();
    };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background-card rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
        
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
           {restaurant.heroImageUrl && (
             <img src={restaurant.heroImageUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

           <button 
             onClick={onClose}
             className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
           >
             <X className="w-6 h-6" />
           </button>

           <div className="absolute bottom-6 left-8 flex items-end gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border border-gray-100 shrink-0">
                 {restaurant.logoUrl ? (
                   <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                      <Building2 className="w-8 h-8 text-gray-300" />
                   </div>
                 )}
              </div>
              <div className="pb-1">
                 <AnatomyText.H1 className="text-3xl !text-white drop-shadow-md">
                   {restaurant.name}
                 </AnatomyText.H1>
                 
                 <AnatomyText.Small className="!text-gray-200 flex items-center gap-2 mt-1">
                   <MapPin className="w-4 h-4" /> {restaurant.streetAddress}, {restaurant.city}
                 </AnatomyText.Small>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
               
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                     <AnatomyText.Label>{t('common.status')}</AnatomyText.Label>
                     <AnatomyText.H3 className={`capitalize ${restaurant.status === STATUS.active ? '!text-green-600' : '!text-red-500'}`}>
                        {restaurant.status}
                     </AnatomyText.H3>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                     <AnatomyText.Label>{t('common.open')}</AnatomyText.Label>
                     <AnatomyText.H3 className={restaurant.isOpen ? '!text-blue-600' : '!text-gray-500'}>
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                     </AnatomyText.H3>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                     <AnatomyText.Label>{t('restaurants.commission_rate')}</AnatomyText.Label>
                     <AnatomyText.H3>{restaurant.commissionRate}%</AnatomyText.H3>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                     <AnatomyText.Label>{t('restaurants.preparation_time')}</AnatomyText.Label>
                     <AnatomyText.H3>{restaurant.averagePrepTimeMin} min</AnatomyText.H3>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-border">
                     <AnatomyText.Label>{t('common.price')}</AnatomyText.Label>
                     <AnatomyText.H3 className="!text-primary">{getPriceSymbol(restaurant.priceRange)}</AnatomyText.H3>
                  </div>
               </div>

               <div>
                 <AnatomyText.H3 className="mb-2">{t('common.about')}</AnatomyText.H3>
                 <AnatomyText.Body>
                   {restaurant.description || t('common.empty_description')}
                 </AnatomyText.Body>
               </div>

               {restaurant.user && (
                 <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-background-card flex items-center justify-center shadow-sm border border-border overflow-hidden shrink-0">
                      {restaurant.user.profileImageUrl ? (
                        <img 
                          src={restaurant.user.profileImageUrl} 
                          alt={restaurant.user.firstName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div>
                      <AnatomyText.Label className="!text-primary">{t('restaurants.managed_by')}</AnatomyText.Label>
                      <AnatomyText.H3>
                        {restaurant.user.firstName} {restaurant.user.lastName}
                      </AnatomyText.H3>
                      <AnatomyText.Small className="block">
                        {restaurant.user.email}
                      </AnatomyText.Small>
                      {restaurant.user.phone && (
                        <AnatomyText.Small className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3"/> {restaurant.user.phone}
                        </AnatomyText.Small>
                      )}
                    </div>
                 </div>
               )}

            </div>

            <div className="space-y-6">
               <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-border space-y-4">
                  <AnatomyText.H3 className="text-base">{t('restaurants.legal_contact')}</AnatomyText.H3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-text-muted mt-0.5" />
                      <div>
                        <AnatomyText.Body className="font-medium !text-text-main">{t('restaurants.public_phone')}</AnatomyText.Body>
                        <AnatomyText.Small>{restaurant.publicPhone || 'N/A'}</AnatomyText.Small>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-text-muted mt-0.5" />
                      <div>
                        <AnatomyText.Body className="font-medium !text-text-main">{t('restaurants.rfc')}</AnatomyText.Body>
                        <AnatomyText.Small>{restaurant.rfc || 'N/A'}</AnatomyText.Small>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-text-muted mt-0.5" />
                      <div>
                        <AnatomyText.Body className="font-medium !text-text-main">{t('restaurants.legal_name')}</AnatomyText.Body>
                        <AnatomyText.Small>{restaurant.legalName || 'N/A'}</AnatomyText.Small>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-background-card flex justify-end gap-3 z-10">
           <AnatomyButton variant="secondary" onClick={() => {
            navigateTo(Routes.RestaurantEdit(restaurant.id))
            onClose();
           }}>
             <Edit className="w-4 h-4 mr-2" />
             {t('common.edit')}
           </AnatomyButton>
           <AnatomyButton onClick={() => handleEnterDashboard(restaurant)}>
             {t('common.dashboard')}
             <ExternalLink className="w-4 h-4 ml-2" />
           </AnatomyButton>
        </div>

      </div>
    </div>
  );
};

export default RestaurantDetailModal;