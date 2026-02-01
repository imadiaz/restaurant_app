import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  CreditCard,
  StickyNote,
  Printer,
  CheckCircle,
  Clock,
  ChefHat,
  ShoppingBag,
  User,
  Bike,
  Check,
} from "lucide-react";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import {
  OrderStatus,
  OrderType,
  type Order,
} from "../../service/order.service";
import { useTranslation } from "react-i18next";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import { format } from "date-fns";
import { useAppStore } from "../../store/app.store";
import { useDrivers } from "../../hooks/drivers/use.drivers";
import AnatomySelect from "../../components/anatomy/AnatomySelect";

type OrderStatusType = keyof typeof OrderStatus;

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: OrderStatusType, timeInMinutes?: number, driverId?: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { t } = useTranslation();
  const { activeRestaurant } = useAppStore((state) => state);
  const [showPrepTime, setShowPrepTime] = useState(false);
  const [prepTime, setPrepTime] = useState<number>(activeRestaurant?.averagePrepTimeMin ?? 15);
  const { drivers } = useDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  if (!isOpen || !order) return null;
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getStatusVariant = (status: OrderStatusType) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "primary";
      case OrderStatus.CONFIRMED:
        return "warning";
      case OrderStatus.PREPARING:
        return "warning";
      case OrderStatus.READY:
        return "success";
      case OrderStatus.ON_WAY:
        return "primary";
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const formattedAddress = order.deliveryAddress
    ? `${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.colony}, ${order.deliveryAddress.city}`
    : t("orders.pickup_at_restaurant");

  const orderTime = (): string => {
    if (order.statusHistory && order.statusHistory.length > 0) {
      return order.statusHistory[0].localTime;
    }
    return format(new Date(order.createdAt), "d MMM, h:mm a");
  };

  const handleStartCooking = () => {
    onStatusChange(OrderStatus.PREPARING, prepTime ?? undefined);
    setPrepTime(activeRestaurant?.averagePrepTimeMin ?? 15);
  };

  const handleReady = () => {
    onStatusChange(OrderStatus.READY, undefined, selectedDriverId);
    setSelectedDriverId("");
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
              <AnatomyText.H3 className="text-2xl mb-0">
                {t("orders.order")} #{order.id.slice(0, 6)}
              </AnatomyText.H3>
              <AnatomyTag variant={getStatusVariant(order.status)}>
                {t(`orders.status.${order.status.toLowerCase()}`)}
              </AnatomyTag>
            </div>
            <AnatomyText.Small className="font-medium flex items-center gap-2 text-text-muted">
              <Clock className="w-4 h-4" />
              {orderTime()}
            </AnatomyText.Small>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            {/* LEFT COLUMN: ITEMS */}
            <div className="flex-1 p-8 border-r border-border bg-background-card">
              <div className="flex justify-between items-center mb-6">
                <AnatomyText.H3 className="mb-0">
                  {t("orders.items_ordered")}
                </AnatomyText.H3>
                <AnatomyText.Small className="text-text-muted font-medium">
                  {order.products.reduce((acc, p) => acc + p.quantity, 0)} items
                </AnatomyText.Small>
              </div>

              <div className="space-y-6">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                      {item.quantity}x
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <AnatomyText.Body className="font-bold text-text-main text-base">
                          {item.name}
                        </AnatomyText.Body>
                        <AnatomyText.Body className="font-bold text-text-main">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </AnatomyText.Body>
                      </div>

                      {/* Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.modifiers.map((mod, mIdx) => (
                            <div
                              key={mIdx}
                              className="flex justify-between pl-2 border-l-2 border-border"
                            >
                              <AnatomyText.Small className="text-text-muted">
                                + {mod.name}
                              </AnatomyText.Small>
                              <AnatomyText.Small className="text-text-muted">
                                ${Number(mod.price).toFixed(2)}
                              </AnatomyText.Small>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Note */}
                      {item.comment && (
                        <div className="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30 inline-flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          <AnatomyText.Small className="text-yellow-700 dark:text-yellow-400">
                            "{item.comment}"
                          </AnatomyText.Small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-900/30 p-8 space-y-8 h-full border-t lg:border-t-0 border-border">
              {/* Customer Info */}
              <div className="space-y-4">
                <AnatomyText.Label className="uppercase tracking-wider text-xs font-bold text-text-muted">
                  {t("orders.customer_details")}
                </AnatomyText.Label>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-full text-text-muted shadow-sm border border-border">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {order.clientSnapshot?.firstName || t("orders.guest")}{" "}
                      {order.clientSnapshot?.lastName || ""}
                    </AnatomyText.Body>
                    <AnatomyText.Small className="text-text-muted text-xs">
                      {order.clientSnapshot?.phone || t("orders.no_phone")}
                    </AnatomyText.Small>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-full text-text-muted shadow-sm border border-border">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {order.type === OrderType.DELIVERY
                        ? t("orders.delivery_address")
                        : t("orders.pickup_point")}
                    </AnatomyText.Body>
                    <AnatomyText.Small className="text-text-muted text-xs leading-relaxed max-w-[200px]">
                      {formattedAddress}
                    </AnatomyText.Small>
                    {order.deliveryAddress?.details && (
                      <AnatomyText.Small className="text-primary mt-1 font-medium">
                        {""} {order.deliveryAddress.details}
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-full text-text-muted shadow-sm border border-border">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {t("orders.payment_method")}
                    </AnatomyText.Body>
                    <AnatomyText.Small className="text-text-muted text-xs capitalize">
                      {order.paymentMethod.replace("_", " ")}
                    </AnatomyText.Small>
                    {order.changeFor && (
                      <AnatomyText.Small className="text-orange-600 mt-1">
                        {t("orders.change_for")}: ${order.changeFor}
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border"></div>

              {/* Global Note */}
              {(order.restaurantNote || order.deliveryNote) && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-1">
                    <StickyNote className="w-4 h-4" />
                    <AnatomyText.Label className="font-bold text-xs uppercase text-yellow-800 dark:text-yellow-400">
                      {t("orders.instructions")}
                    </AnatomyText.Label>
                  </div>
                  <div className="flex flex-col">
                    {order.restaurantNote && (
                      <AnatomyText.Small className="text-yellow-900 dark:text-yellow-200 font-medium italic mb-1">
                        {t("orders.kitchen")}: "{order.restaurantNote}"
                      </AnatomyText.Small>
                    )}
                    {order.deliveryNote && (
                      <AnatomyText.Small className="text-yellow-900 dark:text-yellow-200 font-medium italic">
                        {t("orders.delivery")}: "{order.deliveryNote}"
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="space-y-2">
                <AnatomyText.Label className="uppercase tracking-wider text-xs font-bold text-text-muted">
                  {t("orders.payment_summary")}
                </AnatomyText.Label>

                <div className="flex justify-between">
                  <AnatomyText.Small className="text-text-muted">
                    {t("orders.subtotal")}
                  </AnatomyText.Small>
                  <AnatomyText.Small className="text-text-muted">
                    ${Number(order.subtotal).toFixed(2)}
                  </AnatomyText.Small>
                </div>

                <div className="flex justify-between">
                  <AnatomyText.Small className="text-text-muted">
                    {t("orders.delivery_fee")}
                  </AnatomyText.Small>
                  <AnatomyText.Small className="text-text-muted">
                    ${Number(order.deliveryFee).toFixed(2)}
                  </AnatomyText.Small>
                </div>

                {Number(order.tip) > 0 && (
                  <div className="flex justify-between">
                    <AnatomyText.Small className="text-text-muted">
                      {t("orders.tip")}
                    </AnatomyText.Small>
                    <AnatomyText.Small className="text-text-muted">
                      ${Number(order.tip).toFixed(2)}
                    </AnatomyText.Small>
                  </div>
                )}

                <div className="border-t border-border my-2 pt-2 flex justify-between items-center">
                  <AnatomyText.Body className="font-bold text-text-main text-lg">
                    {t("orders.total")}
                  </AnatomyText.Body>
                  <AnatomyText.Body className="font-bold text-primary text-xl">
                    ${Number(order.totalAmount).toFixed(2)}
                  </AnatomyText.Body>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-background-card flex justify-between items-center z-10">
          <AnatomyButton variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            {t("common.print_receipt")}
          </AnatomyButton>

          <div className="flex gap-3">
            {order.status === OrderStatus.PENDING && (
                showPrepTime ? (
                  <div className="flex items-center gap-3 animate-in slide-in-from-right-5 duration-200">
                     <span className="text-sm font-medium text-text-muted">
                        {t('orders.estimated_time')}:
                     </span>
                     
                     <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                        {[15, 20, 25, 30, 45].map(min => (
                           <button
                             key={min}
                             onClick={() => setPrepTime(min)}
                             className={`
                               px-3 py-1 text-xs font-bold rounded-md transition-all
                               ${prepTime === min 
                                 ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                                 : 'text-text-muted hover:text-text-main'}
                             `}
                           >
                             {min}m
                           </button>
                        ))}
                     </div>

                     <div className="relative w-20">
                        <input 
                           type="number" 
                           value={prepTime}
                           onChange={(e) => setPrepTime(Number(e.target.value))}
                           className="w-full pl-2 pr-6 py-1.5 text-sm font-bold border border-border rounded-lg bg-background text-center focus:ring-2 ring-primary outline-none"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-text-muted">m</span>
                     </div>

                     <AnatomyButton 
                        onClick={handleStartCooking}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                     >
                        <Check className="w-4 h-4 mr-2" /> {t('common.confirm')}
                     </AnatomyButton>

                     <button 
                        onClick={() => setShowPrepTime(false)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                ) : (
                  <AnatomyButton 
                      onClick={() => setShowPrepTime(true)} 
                      className="bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                  >
                    <ChefHat className="w-4 h-4 mr-2" /> {t('orders.actions.start_cooking')}
                  </AnatomyButton>
                )
             )}

            {(order.status === OrderStatus.PREPARING || order.status === OrderStatus.CONFIRMED) && (
                order.type === OrderType.DELIVERY ? (
                  <div className="flex items-center align-center gap-2 animate-in fade-in">
                     <div className="w-50">
                       <AnatomySelect
                          value={selectedDriverId}
                          onChange={(e) => setSelectedDriverId(e.target.value)}                        
                       >
                        <option value="">{t('drivers.select_driver')}</option>
                          {drivers.map((d) => (
                             <option key={d.id} value={d.id}>
                               {d.firstName} {d.lastName}
                             </option>
                          ))}
                       </AnatomySelect>
                     </div>
                     <AnatomyButton 
                        onClick={() => handleReady()} 
                        className="bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                         disabled={!selectedDriverId} 
                     >
                        <ShoppingBag className="w-4 h-4 mr-2" /> {t('orders.actions.mark_ready')}
                     </AnatomyButton>
                  </div>
                ) : (
                  <AnatomyButton 
                      onClick={() => onStatusChange(OrderStatus.READY)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> {t('orders.actions.mark_ready')}
                  </AnatomyButton>
                )
             )}

            {/* {order.status === OrderStatus.READY &&
              (order.type === OrderType.DELIVERY ? (
                <AnatomyButton
                  onClick={() => onStatusChange(OrderStatus.ON_WAY)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                >
                  <Bike className="w-4 h-4 mr-2" />{" "}
                  {t("orders.actions.send_driver")}
                </AnatomyButton>
              ) : (
                <AnatomyButton
                  onClick={() => onStatusChange(OrderStatus.DELIVERED)}
                  className="bg-green-600 hover:bg-green-700 text-white border-transparent"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />{" "}
                  {t("orders.actions.complete_order")}
                </AnatomyButton>
              ))}

            {order.status === OrderStatus.ON_WAY && (
              <AnatomyButton
                onClick={() => onStatusChange(OrderStatus.DELIVERED)}
                className="bg-green-600 hover:bg-green-700 text-white border-transparent"
              >
                <CheckCircle className="w-4 h-4 mr-2" />{" "}
                {t("orders.actions.mark_delivered")}
              </AnatomyButton>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
