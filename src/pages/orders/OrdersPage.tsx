import PickupCompletionModal from './components/PickupCompletionModal';
import { useAppStore } from '../../store/app.store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { ShoppingBag} from 'lucide-react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import { useTranslation } from 'react-i18next';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useOrders } from '../../hooks/orders/use.orders';
import { useOrder } from '../../hooks/orders/use.order';
import { useOrderHistory } from '../../hooks/orders/use.order.history';
import { ACTIVE_ORDER_STATUSES, OrderStatus, type Order } from '../../service/order.service';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './OrderDetailModal';
type OrderStatusType = keyof typeof OrderStatus;
const EMPTY_ORDERS: Order[] = [];


interface OrderTab {
  id: string;
  labelKey: string;
  statuses: OrderStatusType[];
}

const TABS: OrderTab[] = [
  { id: 'new', labelKey: 'orders.tabs.new', statuses: [OrderStatus.PENDING, OrderStatus.CONFIRMED,] },
  { id: 'cooking', labelKey: 'orders.tabs.cooking', statuses: [OrderStatus.PREPARING] },
  { id: 'ready', labelKey: 'orders.tabs.ready', statuses: [OrderStatus.READY] },
  { id: 'active', labelKey: 'orders.tabs.active', statuses: [OrderStatus.AT_RESTAURANT, OrderStatus.PICKED_UP, OrderStatus.ON_WAY, OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.COURIER_ARRIVING] },
  { id: 'all', labelKey: 'orders.tabs.all', statuses: ACTIVE_ORDER_STATUSES },
];

const OrdersPage: React.FC<{ mode?: 'active' | 'history' }> = ({ mode = 'active' }) => {
  const isHistory = mode === 'history';
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState<Order['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickupOrderId, setPickupOrderId] = useState<string>();
  const statusBusy = useRef(false);
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const selectedOrderId = searchParams.get('orderId') || undefined;

  const { orders: activeOrders, isLoading: isActiveLoading, isError: isActiveError, refetch: refetchActive, updateStatus, assignDriver, refundOrder, isRefunding, cancelOrder, isCancelling, completePickup, isCompletingPickup, isUpdating, isAssigning } = useOrders(undefined, !isHistory);
  const history = useOrderHistory({ search: debouncedSearch, status: historyStatus || undefined, page, pageSize }, isHistory);
  const orders = isHistory ? history.data?.items ?? EMPTY_ORDERS : activeOrders;
  const isLoading = isHistory ? history.isLoading : isActiveLoading;
  const isError = isHistory ? history.isError : isActiveError;
  const refetch = isHistory ? history.refetch : refetchActive;
  const currentPage = history.data?.page ?? page;
  const isSearching = searchQuery.trim().replace(/\s+/g, ' ') !== debouncedSearch;

  useEffect(() => {
    if (!isHistory || !isSearching) return;
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().replace(/\s+/g, ' '));
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [isHistory, isSearching, searchQuery]);
  const { data: selectedOrder, isLoading: isLoadingDetail, isError: isDetailError, refetch: refetchDetail } = useOrder(selectedOrderId, orders);

  const { data: pickupOrder, isLoading: isPickupLoading, isError: isPickupError, refetch: refetchPickup } = useOrder(pickupOrderId, orders);

  const { counts, filteredOrders } = useMemo(() => {
     if (isHistory) return { counts: {}, filteredOrders: orders };
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
        const clientName = `${order.customerSnapshot?.firstName || ''} ${order.customerSnapshot?.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchQuery || 
                              clientName.includes(q) || 
                              order.id.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
     });

     return { counts: newCounts, filteredOrders: filtered };
  }, [orders, activeTab, searchQuery, isHistory]);

  const handleCardClick = (order: Order) => {
    setSearchParams((params) => {
      params.set('orderId', order.id);
      return params;
    });
  };

  const handleCloseModal = () => {
    setSearchParams((params) => {
      params.delete('orderId');
      return params;
    }, { replace: true });
  };

  const handleStatusUpdate = async (id: string, newStatus: OrderStatusType, timeInMinutes?: number, driverId?: string) => {
    if(driverId) {
      await assignDriver({orderId: id, status: newStatus, driverId: driverId});
    } else {
      await updateStatus({ id, status: newStatus, timeInMinutes });
    }
  };

  const handleRefund = async (id: string, reason: string) => {
    await refundOrder({ id, reason });
  };

  return (
    <BasePageLayout
      title={t(isHistory ? 'orders.history.title' : 'orders.title')}
      subtitle={t(isHistory ? 'orders.history.subtitle' : 'orders.subtitle')}
      isLoading={isLoading}
      renderControls={
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <AnatomySearchBar
                aria-label={t('orders.search_placeholder')}
                placeholder={t('orders.search_placeholder')}
                value={searchQuery}
                maxLength={isHistory ? 200 : undefined}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isHistory && <div className="w-full md:w-72">
            <AnatomySelect
              label={t('orders.history.status')}
              value={historyStatus}
              onChange={(event) => { setHistoryStatus(event.target.value as Order['status'] | ''); setPage(1); }}
            >
              <option value="">{t('orders.history.all_statuses')}</option>
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>{t(`orders.status.${status.toLowerCase()}`)}</option>
              ))}
            </AnatomySelect>
          </div>}
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        {isError && (
          <div role="alert" className="flex items-center gap-4 rounded-xl border border-danger p-4 text-danger">
            <p>{t('common.error_loading_data')}</p>
            <button onClick={() => void refetch()}>{t('orders.retry_detail')}</button>
          </div>
        )}
        {selectedOrderId && isLoadingDetail && (
          <p role="status" className="text-text-muted">{t('common.loading_data')}</p>
        )}
        {selectedOrderId && isDetailError && (
          <div role="alert" className="flex items-center gap-4 rounded-xl border border-danger p-4 text-danger">
            <p>{t('orders.detail_load_error')}</p>
            <button onClick={() => void refetchDetail()}>{t('orders.retry_detail')}</button>
            <button onClick={handleCloseModal}>{t('common.close')}</button>
          </div>
        )}
        {!isHistory && <div className="bg-background-card p-2 rounded-2xl border border-border shadow-sm inline-block w-full overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-text-muted hover:bg-surface-hover'}
                `}
              >
                <span>{t(tab.labelKey)}</span>
                <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${activeTab === tab.id 
                       ? 'bg-white/20 text-white' 
                       : 'bg-surface-hover text-text-muted'}
                `}>
                  {counts[tab.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>}

        {isHistory && history.data && <p role="status" className="text-sm text-text-muted">
          {t('orders.history.results', { count: history.data.total })}
        </p>}
        {filteredOrders.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id} 
                  order={order}
                  onClick={() => handleCardClick(order)}
                  onDeliver={() => setPickupOrderId(order.id)}
                  isDelivering={isCompletingPickup}
                /> 
              ))}
           </div>
        ) : !isError && (
           <div className="flex flex-col items-center justify-center py-20 bg-background-card rounded-3xl border border-dashed border-border text-center">
              <div className="p-4 bg-surface-muted rounded-full mb-4">
                 <ShoppingBag className="w-10 h-10 text-text-muted opacity-50" />
              </div>
              <AnatomyText.H3 className="text-text-muted mb-2">
                 {t(isHistory ? 'orders.history.empty' : 'orders.empty_list')}
              </AnatomyText.H3>
              <AnatomyText.Small className="text-text-muted max-w-xs mx-auto">
                 {t(isHistory ? 'orders.history.empty_description' : 'orders.empty_list_description')}
              </AnatomyText.Small>
           </div>
        )}

        {isHistory && <nav aria-label={t('orders.history.pagination')} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background-card p-4">
          <div className="w-44">
            <AnatomySelect label={t('orders.history.page_size')} value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </AnatomySelect>
          </div>
          {history.data && <p className="text-sm text-text-muted">
            {t('orders.history.range', {
              from: history.data.total ? (currentPage - 1) * pageSize + 1 : 0,
              to: Math.min(currentPage * pageSize, history.data.total),
              total: history.data.total,
            })}
          </p>}
          <div className="flex flex-wrap items-center gap-3">
            <AnatomyButton variant="secondary" disabled={!history.data || isError || history.isFetching || isSearching || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{t('common.previous')}</AnatomyButton>
            <span className="text-sm text-text-muted">{t('orders.history.page', { page: currentPage, total: history.data?.totalPages ?? 1 })}</span>
            <AnatomyButton variant="secondary" disabled={!history.data || isError || history.isFetching || isSearching || currentPage >= history.data.totalPages} onClick={() => setPage(currentPage + 1)}>{t('common.next')}</AnatomyButton>
          </div>
        </nav>}

        {selectedOrderId && selectedOrder && <OrderDetailModal
            key={selectedOrder.id}
            isOpen={true}
            order={selectedOrder}
            onClose={handleCloseModal}
            isRefunding={isRefunding}
            isUpdating={isUpdating || isAssigning}
            onDeliver={() => { handleCloseModal(); setPickupOrderId(selectedOrder.id); }}
            isCancelling={isCancelling}
            onCancel={async () => {
              await cancelOrder(selectedOrder.id);
              handleCloseModal();
            }}
            onRefund={(reason) => handleRefund(selectedOrder.id, reason)}
            onStatusChange={(newStatus, timeInMinutes, driverId) => {
              if (statusBusy.current) return;
              statusBusy.current = true;
              void handleStatusUpdate(selectedOrder.id, newStatus, timeInMinutes, driverId)
                .then(handleCloseModal)
                .catch(() => { /* useOrders reports the error; leave the details open to retry. */ })
                .finally(() => { statusBusy.current = false; });
            }}
          />}

        {pickupOrderId && isPickupLoading && !pickupOrder && <p role="status" className="text-text-muted">{t('common.loading_data')}</p>}
        {pickupOrderId && isPickupError && !pickupOrder && (
          <div role="alert" className="flex items-center gap-4 rounded-xl border border-danger p-4 text-danger">
            <p>{t('orders.detail_load_error')}</p>
            <button onClick={() => void refetchPickup()}>{t('orders.retry_detail')}</button>
            <button onClick={() => setPickupOrderId(undefined)}>{t('common.close')}</button>
          </div>
        )}
        {pickupOrderId && pickupOrder && pickupOrder.restaurantId === restaurantId && (
          <PickupCompletionModal
            key={`${restaurantId}:${pickupOrder.id}`}
            order={pickupOrder}
            isCompleting={isCompletingPickup}
            onClose={() => setPickupOrderId(undefined)}
            onComplete={(verificationCode) => completePickup({ id: pickupOrder.id, verificationCode })}
          />
        )}
      </div>
    </BasePageLayout>
  );
};

export default OrdersPage;
