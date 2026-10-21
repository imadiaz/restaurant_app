import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Ban } from 'lucide-react';
import AnatomyText from '../anatomy/AnatomyText';
import { PaymentMethod, PaymentStatus, type Order } from '../../service/order.service';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../../hooks/use.confirm.modal';


interface OrderNotificationToastProps {
  order: Order;
  onClose: () => void;
  onCancel?: () => Promise<void>;
}

const OrderNotificationToast: React.FC<OrderNotificationToastProps> = ({ order, onClose, onCancel }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClick = () => {
    navigate(`/dashboard/orders?orderId=${encodeURIComponent(order.id)}`);
    onClose();
  };

  const handleCancel = () => {
    if (!onCancel) return;

    const requiresRefund =
      order.paymentMethod === PaymentMethod.CARD &&
      order.paymentStatus === PaymentStatus.PAID;

    confirm({
      title: t('orders.cancel_pending.title'),
      message: t(
        requiresRefund
          ? 'orders.cancel_pending.card_message'
          : order.paymentMethod === PaymentMethod.CASH
            ? 'orders.cancel_pending.cash_message'
            : 'orders.cancel_pending.terminal_message',
        { amount: Number(order.totalAmount).toFixed(2) },
      ),
      confirmText: t('orders.cancel_pending.confirm_action'),
      variant: 'danger',
      onConfirm: onCancel,
    });
  };

  return (
    <div 
      className={`
        pointer-events-auto w-full max-w-sm bg-background-card rounded-2xl shadow-xl border border-border overflow-hidden
        transition-all duration-500 transform
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}
      `}
    >
      {/* Header: Status Color Bar */}
      <div className="h-1.5 w-full bg-primary" />

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-subtle uppercase tracking-wide">{t('orders.new_order_received')}</p>
              <AnatomyText.H3 className="text-sm leading-none">{order.customerSnapshot?.firstName}{order.customerSnapshot?.lastName}</AnatomyText.H3>
            </div>
          </div>
          <button aria-label={t('common.close')} onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-text-subtle hover:text-text-main">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini Item Summary */}
        <div className="bg-surface-muted rounded-lg p-3 mb-3 border border-border">
           <div className="space-y-1">
             {order.products.slice(0, 2).map((item, idx) => (
               <div key={idx} className="flex justify-between text-sm">
                 <span className="text-text-muted font-medium">{item.quantity}x {item.name}</span>
               </div>
             ))}
             {order.products.length > 2 && (
               <p className="text-xs text-text-subtle italic">{t('orders.more_items', { count: order.products.length - 2 })}</p>
             )}
           </div>
           <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
             <span className="text-xs font-bold text-text-subtle">{t('orders.total')}</span>
             <span className="text-sm font-bold text-success">${order.totalAmount.toFixed(2)}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="flex items-center justify-center rounded-xl border border-danger px-3 py-2 text-sm font-bold text-danger transition-colors hover:bg-danger-surface"
            >
              <Ban className="mr-2 h-4 w-4" />
              {t('orders.cancel_pending.action')}
            </button>
          )}
          <button
            onClick={handleClick}
            className={`${onCancel ? '' : 'col-span-2'} group flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-contrast transition-colors hover:bg-primary-hover`}
          >
            {t('orders.view_details')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderNotificationToast;
