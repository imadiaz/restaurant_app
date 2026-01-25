import React, { useState } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { ShoppingBag, Clock, CheckCircle, Sparkles, Flame } from 'lucide-react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import OrderDetailModal, { type OrderDetail } from './OrderDetailModal';
import PageHeader from '../../components/common/PageHeader';


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

const MOCK_ORDERS_DETAILS: OrderDetail[] = [
  {
    id: '#044',
    status: 'new',
    date: '7 Apr, 11:30 AM',
    customer: { name: 'Robert Fox', phone: '(555) 123-4567', email: 'robert@test.com' },
    address: '123 Maple Street, Apt 4B, Springfield, IL 62704',
    paymentMethod: 'Visa ending in 4242',
    orderNote: 'Please do not ring the doorbell, baby sleeping.',
    subtotal: 16.00,
    tax: 1.28,
    deliveryFee: 2.00,
    total: 19.28,
    items: [
      { 
        name: 'Cheese Burger', 
        qty: 1, 
        price: 12.00, 
        modifiers: [
          { name: 'Extra Cheese', price: 1.00 },
          { name: 'No Onions', price: 0.00 }
        ] 
      },
      { name: 'Lemonade', qty: 1, price: 4.00, note: 'Less ice please' },
    ]
  },
  // ... (You can duplicate the structure above for other mock items)
];
// --- COMPONENT: ORDER CARD ---

const OrderCard = ({ order, onClick }: { order: OrderDetail, onClick: () => void }) => {  

  let statusConfig = {
    icon: Sparkles,
    text: 'New Order',
    className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  };

  if (order.status === 'cooking') {
    statusConfig = { 
      icon: Flame, 
      text: 'Cooking', 
      className: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' 
    };
  } else if (order.status === 'ready') {
    statusConfig = { 
      icon: ShoppingBag, 
      text: 'Ready to serve', 
      className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' 
    };
  } else if (order.status === 'completed') {
    statusConfig = { 
      icon: CheckCircle, 
      text: 'Completed', 
      className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' 
    };
  }

  const itemCount = order.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="bg-background-card p-5 rounded-3xl shadow-sm border border-border flex flex-col hover:shadow-md transition-all duration-300 cursor-pointer group h-full" onClick={onClick}>
      
      {/* 1. Header: Name & ID */}
      <div className="flex justify-between items-start mb-4">
        {/* Using AnatomyText.H1 but overridden to be smaller for the card */}
        <AnatomyText.H1 className="text-lg font-bold text-gray-900">
          {order.customer.name}
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
      <div className="border-b border-dashed border-border my-2"></div>

     {/* 3. Items List Summary */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <AnatomyText.Label className="ml-0 text-text-main">
          Order ({itemCount})
        </AnatomyText.Label>
        
        <AnatomyText.Label className="ml-0 text-primary">
          ${order.total.toFixed(2)}
        </AnatomyText.Label>
      </div>

      {/* The Actual Items */}
      <div className="space-y-2 mb-6 flex-1">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-sm text-text-muted">
              <span className="font-bold text-text-main">{item.qty}x</span> {item.name}
            </span>
            <span className="text-sm font-medium text-text-main">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
        
        {/* "See more" link */}
        {order.items.length > 3 && (
           <div className="text-center pt-1">
             <span className="text-xs text-primary font-medium hover:underline">
               See {order.items.length - 3} more items &gt;
             </span>
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

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers
  const handleCardClick = (order: OrderDetail) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    console.log(`Update Order ${selectedOrder?.id} to ${newStatus}`);
    // Update local state or call API here
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
      
      {/* HEADER AREA */}
       <PageHeader title={"Orders"} subtitle={"Manage incoming orders"} showNavBack={false} actions={
      <div className="w-full md:w-96" >
            <AnatomySearchBar
              placeholder="Search customer or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        } />

<div className="bg-background-card p-4 rounded-3xl shadow-sm border border-border flex flex-col gap-6">        

        {/* Tabs Row */}
        <div>
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
px-2 py-0.5 rounded-full text-xs font-bold transition-colors
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={MOCK_ORDERS_DETAILS[0]}
                onClick={() => handleCardClick(MOCK_ORDERS_DETAILS[0])} 
              /> 
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-background-card rounded-3xl border border-dashed border-border">
             <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-text-muted" />
             </div>
             <AnatomyText.Subtitle>No orders found.</AnatomyText.Subtitle>
          </div>
        )}
      </div>


      <OrderDetailModal
        isOpen={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />

    </div>
  );
};

export default OrdersPage;