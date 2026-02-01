import React, { useMemo, useState } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { ShoppingBag} from 'lucide-react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import { useTranslation } from 'react-i18next';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useOrders } from '../../hooks/orders/use.orders';
import { OrderStatus, type Order } from '../../service/order.service';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './OrderDetailModal';
type OrderStatusType = keyof typeof OrderStatus;


interface OrderTab {
  id: string;
  labelKey: string;
  statuses: OrderStatusType[];
}

const TABS: OrderTab[] = [
  { id: 'all', labelKey: 'orders.tabs.all', statuses: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ON_WAY, OrderStatus.PREPARING, OrderStatus.READY] },
  { id: 'new', labelKey: 'orders.tabs.new', statuses: [OrderStatus.PENDING, OrderStatus.CONFIRMED,] },
  { id: 'cooking', labelKey: 'orders.tabs.cooking', statuses: [OrderStatus.PREPARING] },
  { id: 'ready', labelKey: 'orders.tabs.ready', statuses: [OrderStatus.READY] },
  { id: 'active', labelKey: 'orders.tabs.active', statuses: [OrderStatus.ON_WAY] },
  { id: 'completed', labelKey: 'orders.tabs.completed', statuses: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
];

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { orders, isLoading, updateStatus, isUpdating, assignDriver, isAssigning } = useOrders();

  const { counts, filteredOrders } = useMemo(() => {
     const newCounts: Record<string, number> = { all: 0 };
     TABS.forEach(t => newCounts[t.id] = 0);
     const filtered = orders.filter(order => {
        TABS.forEach(tab => {
            if (tab.statuses.includes(order.status)) {
                newCounts[tab.id]++;
            }
        });
        const currentTab = TABS.find(t => t.id === activeTab);
        const matchesTab = currentTab ? currentTab.statuses.includes(order.status) : true;
        const q = searchQuery.toLowerCase();
        const clientName = `${order.clientSnapshot?.firstName || ''} ${order.clientSnapshot?.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchQuery || 
                              clientName.includes(q) || 
                              order.id.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
     });

     return { counts: newCounts, filteredOrders: filtered };
  }, [orders, activeTab, searchQuery]);

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const handleStatusUpdate = async (id: string, newStatus: OrderStatusType, timeInMinutes?: number, driverId?: string) => {
    if(driverId) {
      await assignDriver({orderId: id, status: newStatus, driverId: driverId});
    } else {
      await updateStatus({ id, status: newStatus, timeInMinutes });
    }
  };

  return (
    <BasePageLayout
      title={t('orders.title')}
      subtitle={t('orders.subtitle')}
      isLoading={isLoading}
      renderControls={
        <div className="w-full md:w-96">
            <AnatomySearchBar
                placeholder={t('orders.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        <div className="bg-background-card p-2 rounded-2xl border border-border shadow-sm inline-block w-full overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
              >
                <span>{t(tab.labelKey)}</span>
                <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${activeTab === tab.id 
                       ? 'bg-white/20 text-white' 
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
                `}>
                  {counts[tab.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id} 
                  order={order}
                  onClick={() => handleCardClick(order)} 
                  onStatusChange={handleStatusUpdate}
                  isUpdating={isUpdating || isAssigning}
                  t={t}
                /> 
              ))}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-20 bg-background-card rounded-3xl border border-dashed border-border text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
                 <ShoppingBag className="w-10 h-10 text-text-muted opacity-50" />
              </div>
              <AnatomyText.H3 className="text-text-muted mb-2">
                 {t('orders.empty_list')}
              </AnatomyText.H3>
              <AnatomyText.Small className="text-text-muted max-w-xs mx-auto">
                 {t('orders.empty_list_description')}
              </AnatomyText.Small>
           </div>
        )}

        <OrderDetailModal
            isOpen={isModalOpen}
            order={selectedOrder}
            onClose={handleCloseModal}
            onStatusChange={(newStatus, timeInMinutes, driverId) => {
               if (selectedOrder) {
                setIsModalOpen(false);
                 handleStatusUpdate(selectedOrder.id, newStatus, timeInMinutes, driverId);
               }
            }}
          />

      </div>
    </BasePageLayout>
  );
};

export default OrdersPage;