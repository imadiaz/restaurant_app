import React, { useState } from 'react';
import { Plus, Store} from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import { useRestaurants } from '../../hooks/restaurants/use.restaurant';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import type { Restaurant } from '../../data/models/restaurant/restaurant';
import { Routes } from '../../config/routes';
import { RestaurantCard } from './components/RestaurantCard';
import RestaurantDetailModal from './RestaurantDetailModal';


const RestaurantsPage: React.FC = () => {
  const { isLoading, restaurants } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>();
  const { navigateTo } = useAppNavigation();
  const setActiveRestaurant = useAppStore((state) => state.setActiveRestaurant);

  const filtered = (restaurants || []).filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnterDashboard = (restaurant: Restaurant) => {
        setActiveRestaurant(restaurant);
        navigateTo('/'); 
      };

   const handleRestaurantClick = (restaurant: Restaurant) => {
      setSelectedRestaurant(restaurant);
      setIsModalOpen(true);
    };

  return(
    <BasePageLayout
      title="Restaurants"
      subtitle="Manage your franchise locations"
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.RestaurantAdd)}>
          <Plus className="w-5 h-5 mr-2" /> Add New Restaurant
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
        <>
          <div className="w-full md:flex-1">
            <AnatomySearchBar
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </>
      }
      emptyLabel="No restaurants found."
      emptyIcon={Store}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {filtered.map((restaurant) => (
          <RestaurantCard 
          key={restaurant.id}
          restaurant={restaurant}  
          onEnterDashboard={() => handleEnterDashboard(restaurant)} 
          onEdit={() => navigateTo(Routes.RestaurantEdit(restaurant.id))} 
          onViewDetail={() => handleRestaurantClick(restaurant)} />
        ))}
      </div>


     <RestaurantDetailModal
        isOpen={isModalOpen}
        restaurant={selectedRestaurant}
        onClose={() => setIsModalOpen(false)}
      />
    </BasePageLayout>
  );
}

export default RestaurantsPage;