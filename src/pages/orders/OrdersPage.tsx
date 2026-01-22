import React, { useState } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { ShoppingBag, Clock, CheckCircle, Utensils, Sparkles, Flame } from 'lucide-react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchbar';


// --- MOCK DATA ---
const MOCK_ORDERS = [
  {
    id: '#044',
    customerName: 'Robert Fox',
    date: '7 Apr, 11:30 AM',
    status: 'new',
    total: 16.00,
    items: [
      { name: 'Cheese Burger', qty: 1, price: 12.00 },
      { name: 'Lemonade', qty: 1, price: 4.00 },
    ]
  },
  {
    id: '#043',
    customerName: 'Jenny Wilson',
    date: '7 Apr, 11:25 AM',
    status: 'cooking',
    total: 46.20,
    items: [
      { name: 'Cheese Burger', qty: 1, price: 12.00 },
      { name: 'Salad with Sesame', qty: 1, price: 16.00 },
      { name: 'Special Pasta', qty: 1, price: 18.20 },
    ]
  },
  {
    id: '#042',
    customerName: 'Cameron William',
    date: '7 Apr, 11:10 AM',
    status: 'ready',
    total: 14.00,
    items: [
      { name: 'Special Sandwich Grill', qty: 1, price: 14.00 },
    ]
  },
  {
    id: '#041',
    customerName: 'Olivia Hart',
    date: '7 Apr, 11:09 AM',
    status: 'cooking',
    total: 32.00,
    items: [
      { name: 'Salad with Sesame', qty: 2, price: 16.00 },
      { name: 'Noodles with Chicken', qty: 1, price: 12.00 },
    ]
  },
  {
    id: '#040',
    customerName: 'Kristin Watson',
    date: '7 Apr, 10:45 AM',
    status: 'completed',
    total: 55.00,
    items: [
      { name: 'Family Pizza Combo', qty: 1, price: 55.00 },
    ]
  },
];

// --- COMPONENT: ORDER CARD ---

const OrderCard = ({ order }: { order: typeof MOCK_ORDERS[0] }) => {
  let statusConfig = {
    icon: Sparkles,
    text: 'New Order',
    className: 'bg-purple-100 text-purple-600',
  };

  if (order.status === 'cooking') {
    statusConfig = { icon: Flame, text: 'Cooking', className: 'bg-orange-100 text-orange-600' };
  } else if (order.status === 'ready') {
    statusConfig = { icon: ShoppingBag, text: 'Ready to serve', className: 'bg-blue-100 text-blue-600' };
  } else if (order.status === 'completed') {
    statusConfig = { icon: CheckCircle, text: 'Completed', className: 'bg-gray-100 text-gray-500' };
  }

  const itemCount = order.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow h-full">
      
      {/* 1. Header: Name & ID */}
      <div className="flex justify-between items-start mb-4">
        {/* Using AnatomyText.H1 but overridden to be smaller for the card */}
        <AnatomyText.H1 className="text-lg font-bold text-gray-900">
          {order.customerName}
        </AnatomyText.H1>
        
        {/* Using AnatomyText.Label for ID */}
        <AnatomyText.Label className="text-gray-400 font-medium text-sm ml-0">
          {order.id}
        </AnatomyText.Label>
      </div>

      {/* 2. Meta Info (Time & Type) */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <AnatomyText.Small className="text-gray-500">
            {order.date}
          </AnatomyText.Small>
        </div>
        <div className="flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2 text-gray-500" />
          <AnatomyText.Small className="text-gray-500">
            Delivery
          </AnatomyText.Small>
        </div>
      </div>

      {/* Dashed Divider */}
      <div className="border-b border-dashed border-gray-200 my-2"></div>

      {/* 3. Items List Summary */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <AnatomyText.Label className="ml-0 text-gray-800 text-sm font-bold">
          Order ({itemCount})
        </AnatomyText.Label>
        
        <AnatomyText.Label className="ml-0 text-green-600 text-sm font-bold">
          ${order.total.toFixed(2)}
        </AnatomyText.Label>
      </div>

      {/* The Actual Items */}
      <div className="space-y-2 mb-6 flex-1">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <AnatomyText.Small className="text-gray-500">
              {item.qty}x {item.name}
            </AnatomyText.Small>
            <AnatomyText.Small className="font-medium text-gray-700">
              ${item.price.toFixed(2)}
            </AnatomyText.Small>
          </div>
        ))}
        
        {/* "See more" link */}
        {order.items.length > 2 && (
           <div className="text-center pt-1">
             <AnatomyText.Link className="text-xs text-green-600 font-medium no-underline hover:underline">
               See more &gt;
             </AnatomyText.Link>
           </div>
        )}
      </div>

      {/* 4. Status Badge */}
      <div className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl w-fit mt-auto
        ${statusConfig.className}
      `}>
        <statusConfig.icon className="w-4 h-4" />
        <span className="text-sm font-bold">{statusConfig.text}</span>
      </div>

    </div>
  );
};

// --- MAIN PAGE ---

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'cooking' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Counts
  const counts = {
    all: MOCK_ORDERS.length,
    new: MOCK_ORDERS.filter(o => o.status === 'new').length,
    cooking: MOCK_ORDERS.filter(o => o.status === 'cooking').length,
    ready: MOCK_ORDERS.filter(o => o.status === 'ready').length,
    completed: MOCK_ORDERS.filter(o => o.status === 'completed').length,
  };

  // 2. Filter Orders
  const filteredOrders = MOCK_ORDERS.filter(order => {
    // Tab Filter
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    
    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!order.customerName.toLowerCase().includes(q) && !order.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      
      {/* HEADER AREA */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        {/* Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <AnatomyText.H1>Orders</AnatomyText.H1>
            <AnatomyText.Subtitle>Manage incoming orders</AnatomyText.Subtitle>
          </div>
          <div className="w-full md:w-96">
            <AnatomySearchBar 
              placeholder="Search customer or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs Row */}
        <div className="border-b border-gray-100">
          <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', 'new', 'cooking', 'ready', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                  ${activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <span className="capitalize">{tab === 'all' ? 'All Orders' : tab}</span>
                
                {/* Count Badge */}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === tab 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600'}
                `}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="flex-1">
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
            <AnatomyText.Subtitle>No orders found.</AnatomyText.Subtitle>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrdersPage;