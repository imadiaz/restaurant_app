import { useState } from 'react';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyText from '../../components/anatomy/AnatomyText';

const GlobalAnalyticsPage = () => {
  const [filterId, setFilterId] = useState('all');

  // If filterId is 'all', show sum of all data.
  // If filterId is 'rest_1', filter mock data by that ID.

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <AnatomyText.H1>Global Performance</AnatomyText.H1>
        
        {/* The Filter Dropdown */}
        <div className="w-64">
           <AnatomySelect 
             value={filterId} 
             onChange={e => setFilterId(e.target.value)}
           >
             <option value="all">All Restaurants</option>
             <option value="rest_1">Burger King</option>
             <option value="rest_2">Pizza Hut</option>
           </AnatomySelect>
        </div>
      </div>

      {/* ... Charts render based on filterId ... */}
    </div>
  );
}