import React from 'react';
import { 
  X, MapPin, CreditCard, StickyNote, Printer, 
  CheckCircle, Clock, ChefHat, ShoppingBag, User
} from 'lucide-react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';


// --- TYPES (Expanded for Detail View) ---
export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  modifiers?: { name: string; price: number }[]; // e.g. Extra Cheese +$1
  note?: string; // Specific note for this item
}

export interface OrderDetail {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  address: string;
  date: string;
  status: 'new' | 'cooking' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: string; // e.g., "Credit Card ending **42"
  orderNote?: string; // General note for the whole order
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;

}


const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onStatusChange }) => {
  if (!isOpen || !order) return null;

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      cooking: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      ready: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-background-card rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
        
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-background-card z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AnatomyText.H1 className="text-2xl">Order #{order.id}</AnatomyText.H1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>
            <AnatomyText.Small className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> {order.date}
            </AnatomyText.Small>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-background rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            
            {/* LEFT COLUMN: ITEMS LIST (60%) */}
            <div className="flex-1 p-8 border-r border-border bg-background-card">
              <AnatomyText.H3 className="mb-6">Items Ordered</AnatomyText.H3>
              
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    {/* Qty Box */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border flex items-center justify-center font-bold text-text-main shrink-0">
                      {item.qty}x
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <AnatomyText.Body className="font-bold text-text-main text-base">
                          {item.name}
                        </AnatomyText.Body>
                        <AnatomyText.Body className="font-bold text-text-main">
                          ${(item.price * item.qty).toFixed(2)}
                        </AnatomyText.Body>
                      </div>

                      {/* Modifiers List */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.modifiers.map((mod, mIdx) => (
                            <div key={mIdx} className="flex justify-between text-sm text-text-muted pl-2 border-l-2 border-border">
                              <span>+ {mod.name}</span>
                              <span>${mod.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Item Specific Note */}
                      {item.note && (
                        <div className="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded border border-yellow-100 dark:border-yellow-900/30 inline-block">
                          Note: "{item.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: LOGISTICS & SUMMARY (40%) */}
            <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-900/50 p-8 space-y-8 h-full border-t lg:border-t-0 border-border">
              
              {/* Customer Info */}
              <div className="space-y-4">
                <AnatomyText.Label>Customer Details</AnatomyText.Label>
                
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <User className="w-4 h-4"/>
                  </div>
                  <div>
                    <p className="font-bold text-text-main text-sm">{order.customer.name}</p>
                    <p className="text-text-muted text-xs">{order.customer.phone}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <MapPin className="w-4 h-4"/>
                  </div>
                  <div>
                    <p className="font-bold text-text-main text-sm">Delivery Address</p>
                    <p className="text-text-muted text-xs leading-relaxed">{order.address}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <CreditCard className="w-4 h-4"/>
                  </div>
                  <div>
                    <p className="font-bold text-text-main text-sm">Payment Method</p>
                    <p className="text-text-muted text-xs capitalize">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border"></div>

              {/* Order Note */}
              {order.orderNote && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-1">
                    <StickyNote className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase">Instructions</span>
                  </div>
                  <p className="text-sm text-yellow-900 dark:text-yellow-200 font-medium italic">"{order.orderNote}"</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2">
                <AnatomyText.Label>Payment Summary</AnatomyText.Label>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Tax (8%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border my-2 pt-2 flex justify-between items-center">
                  <span className="font-bold text-text-main text-lg">Total</span>
                  <span className="font-bold text-primary text-xl">${order.total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-6 border-t border-border bg-background-card flex justify-between items-center z-10">
          <AnatomyButton variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </AnatomyButton>

          <div className="flex gap-3">
             {/* Dynamic Buttons based on status */}
             {order.status === 'new' && (
               <AnatomyButton onClick={() => onStatusChange('cooking')} className="bg-orange-500 hover:bg-orange-600 border-transparent text-white shadow-orange-200 dark:shadow-none">
                 <ChefHat className="w-4 h-4 mr-2" /> Start Cooking
               </AnatomyButton>
             )}
             
             {order.status === 'cooking' && (
               <AnatomyButton onClick={() => onStatusChange('ready')} className="bg-blue-500 hover:bg-blue-600 border-transparent text-white shadow-blue-200 dark:shadow-none">
                 <ShoppingBag className="w-4 h-4 mr-2" /> Mark Ready
               </AnatomyButton>
             )}

             {order.status === 'ready' && (
               <AnatomyButton onClick={() => onStatusChange('completed')} className="bg-green-600 hover:bg-green-700 border-transparent text-white shadow-green-200 dark:shadow-none">
                 <CheckCircle className="w-4 h-4 mr-2" /> Complete Order
               </AnatomyButton>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailModal;