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
      new: 'bg-purple-100 text-purple-700',
      cooking: 'bg-orange-100 text-orange-700',
      ready: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AnatomyText.H1 className="text-2xl">Order {order.id}</AnatomyText.H1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>
            <AnatomyText.Small className="text-gray-400 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> {order.date}
            </AnatomyText.Small>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            
            {/* LEFT COLUMN: ITEMS LIST (60%) */}
            <div className="flex-1 p-8 border-r border-gray-100 bg-white">
              <AnatomyText.H3 className="mb-6">Items Ordered</AnatomyText.H3>
              
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {/* Qty Box */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-gray-700 shrink-0">
                      {item.qty}x
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <AnatomyText.Body className="font-bold text-gray-900 text-base">
                          {item.name}
                        </AnatomyText.Body>
                        <AnatomyText.Body className="font-bold text-gray-900">
                          ${(item.price * item.qty).toFixed(2)}
                        </AnatomyText.Body>
                      </div>

                      {/* Modifiers List */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.modifiers.map((mod, mIdx) => (
                            <div key={mIdx} className="flex justify-between text-sm text-gray-500 pl-2 border-l-2 border-gray-100">
                              <span>+ {mod.name}</span>
                              <span>${mod.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Item Specific Note */}
                      {item.note && (
                        <div className="mt-2 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100 inline-block">
                          Note: "{item.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: LOGISTICS & SUMMARY (40%) */}
            <div className="w-full lg:w-96 bg-gray-50 p-8 space-y-8 h-full">
              
              {/* Customer Info */}
              <div className="space-y-4">
                <AnatomyText.Label>Customer Details</AnatomyText.Label>
                
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-full text-gray-400 shadow-sm"><User className="w-4 h-4"/></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{order.customer.name}</p>
                    <p className="text-gray-500 text-xs">{order.customer.phone}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-full text-gray-400 shadow-sm"><MapPin className="w-4 h-4"/></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Delivery Address</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{order.address}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-full text-gray-400 shadow-sm"><CreditCard className="w-4 h-4"/></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Payment Method</p>
                    <p className="text-gray-500 text-xs">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Order Note */}
              {order.orderNote && (
                <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-800 mb-1">
                    <StickyNote className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase">Instructions from customer</span>
                  </div>
                  <p className="text-sm text-yellow-900 font-medium italic">"{order.orderNote}"</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2">
                <AnatomyText.Label>Payment Summary</AnatomyText.Label>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax (8%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-primary text-xl">${order.total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center z-10">
          <AnatomyButton variant="ghost" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </AnatomyButton>

          <div className="flex gap-3">
             {/* Dynamic Buttons based on status */}
             {order.status === 'new' && (
               <AnatomyButton onClick={() => onStatusChange('cooking')} className="bg-orange-500 hover:bg-orange-600 border-transparent text-white shadow-orange-200">
                 <ChefHat className="w-4 h-4 mr-2" /> Start Cooking
               </AnatomyButton>
             )}
             
             {order.status === 'cooking' && (
               <AnatomyButton onClick={() => onStatusChange('ready')} className="bg-blue-500 hover:bg-blue-600 border-transparent text-white shadow-blue-200">
                 <ShoppingBag className="w-4 h-4 mr-2" /> Mark Ready
               </AnatomyButton>
             )}

             {order.status === 'ready' && (
               <AnatomyButton onClick={() => onStatusChange('completed')} className="bg-green-600 hover:bg-green-700 border-transparent text-white shadow-green-200">
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