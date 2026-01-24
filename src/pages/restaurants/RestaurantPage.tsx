import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, ExternalLink, MoreVertical, TrendingUp } from 'lucide-react';
import { useAppStore, type Restaurant } from '../../store/app.store';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import AnatomyText from '../../components/anatomy/AnatomyText';


// --- MOCK DATA ---
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_01',
    name: 'Burger King Downtown',
    logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=100&q=80',
    address: '123 Main St, New York, NY',
    status: 'active',
    ownerName: 'John Doe',
    stats: { totalOrders: 1250, totalRevenue: 45000 }
  },
  {
    id: 'rest_02',
    name: 'Pizza Hut Express',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=100&q=80',
    address: '456 Market Ave, Chicago, IL',
    status: 'active',
    ownerName: 'Jane Smith',
    stats: { totalOrders: 890, totalRevenue: 28000 }
  },
  {
    id: 'rest_03',
    name: 'Sushi Master',
    logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=100&q=80',
    address: '789 Sushi Way, San Francisco, CA',
    status: 'suspended',
    ownerName: 'Kenji Tanaka',
    stats: { totalOrders: 0, totalRevenue: 0 }
  },
];

const RestaurantsPage: React.FC = () => {
  const navigate = useNavigate();
  const setActiveRestaurant = useAppStore((state) => state.setActiveRestaurant);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEnterDashboard = (restaurant: Restaurant) => {
    // 1. Set the context
    setActiveRestaurant(restaurant);
    // 2. Navigate to the dashboard "inside" that restaurant
    navigate('/dashboard/orders');
  };

  const filtered = MOCK_RESTAURANTS.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <AnatomyText.H1>Restaurants</AnatomyText.H1>
          <AnatomyText.Subtitle>Super Admin Overview</AnatomyText.Subtitle>
        </div>
        <AnatomyButton>
          <Plus className="w-5 h-5 mr-2" /> Create Restaurant
        </AnatomyButton>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <AnatomySearchBar 
          placeholder="Search restaurants..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            
            {/* Top Row */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <AnatomyText.H3 className="text-lg">{restaurant.name}</AnatomyText.H3>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    restaurant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {restaurant.status}
                  </span>
                </div>
              </div>
              <button className="text-gray-300 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Address */}
            <div className="flex items-center text-gray-400 text-sm mb-6">
              <MapPin className="w-4 h-4 mr-2" />
              {restaurant.address}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Revenue</p>
                <p className="text-gray-900 font-bold">${restaurant.stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Orders</p>
                <p className="text-gray-900 font-bold">{restaurant.stats.totalOrders}</p>
              </div>
            </div>

            {/* Actions */}
            <AnatomyButton 
              fullWidth 
              onClick={() => handleEnterDashboard(restaurant)}
            >
              Enter Dashboard <ExternalLink className="w-4 h-4 ml-2" />
            </AnatomyButton>

          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsPage;