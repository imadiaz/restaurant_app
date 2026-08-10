import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import AnatomyText from '../anatomy/AnatomyText';
import type { Order } from '../../service/order.service';
import { useTranslation } from 'react-i18next';


interface OrderNotificationToastProps {
  order: Order;
  onClose: () => void;
}

const OrderNotificationToast: React.FC<OrderNotificationToastProps> = ({ order, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClick = () => {
    navigate('/dashboard/orders');
    onClose();
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

        {/* Action Button */}
        <button 
          onClick={handleClick}
          className="w-full py-2 bg-primary hover:bg-primary-hover text-primary-contrast rounded-xl text-sm font-bold flex items-center justify-center transition-colors group"
        >
          {t('orders.view_details')}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OrderNotificationToast;
