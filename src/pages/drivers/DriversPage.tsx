import React, { useState } from 'react';
import { Plus, Motorbike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useDrivers } from '../../hooks/drivers/use.drivers';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { Routes } from '../../config/routes';
import DriverCard from './components/DriverCard';
import DriverDetailModal from './DriverDetailModal';
import type { Driver } from '../../service/drivers.service';


const DriversPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { drivers, isLoading } = useDrivers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const {updateDriverStatus} = useDrivers();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDrivers = drivers.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (id: string,newStatus: string) => {
    await updateDriverStatus({id: id, status: newStatus});
  }

   const handleDriverClick = (driver: Driver) => {
      setSelectedDriver(driver);
      setIsModalOpen(true);
    };

  return (
    <BasePageLayout
      title={t('drivers.title')}
      subtitle={t('drivers.subtitle')}
      isLoading={isLoading}
      isEmpty={filteredDrivers.length === 0 && !isLoading}
      emptyIcon={Motorbike}
      emptyLabel={t('drivers.no_drivers')}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.DriversAdd)}>
          <Plus className="w-4 h-4 mr-2" /> {t('drivers.add')}
        </AnatomyButton>
      }
      renderControls={
        <div className="w-full max-w-md">
          <AnatomySearchBar 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('drivers.search_placeholder') || "Search drivers..."}
          />
        </div>
      }
    >
     <>
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {filteredDrivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} onEdit={() => navigateTo(Routes.DriversEdit(driver.id))} onViewDetails={() => handleDriverClick(driver)} onStatusChange={(value) => handleUpdateStatus(driver.id, value)} />
        ))} 
      </div>


        <DriverDetailModal
          isOpen={isModalOpen} 
        driver={selectedDriver} 
        onClose={() => setIsModalOpen(false)} 
        />
     
     </>

      
    </BasePageLayout>
  );
};

export default DriversPage;