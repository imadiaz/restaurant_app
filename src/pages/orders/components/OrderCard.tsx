import { format } from "date-fns";
import {
  Sparkles,
  Flame,
  CheckCircle,
  Truck,
  AlertCircle,
  Clock,
  ShoppingBag,
  MapPin,
  Bike,
  Phone,
  Copy,
} from "lucide-react";
import AnatomyTag, {
  type TagVariant,
} from "../../../components/anatomy/AnatomyTag";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import {
  OrderStatus,
  OrderType,
  type Order,
} from "../../../service/order.service";
import { useToastStore } from "../../../store/toast.store";
import { useTranslation } from "react-i18next";

type OrderStatusType = keyof typeof OrderStatus;

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onClick,
}) => {

  const {addToast} = useToastStore();
  const {t} = useTranslation();
  const getStatusConfig = (
    status: OrderStatusType,
  ): { variant: TagVariant; icon: any; textKey: string } => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          variant: "primary",
          icon: Sparkles,
          textKey: "orders.status.new",
        };

      case OrderStatus.CONFIRMED:
      case OrderStatus.PREPARING:
        return {
          variant: "warning",
          icon: Flame,
          textKey: "orders.status.cooking",
        };
case OrderStatus.COURIER_ARRIVING:
        return {
          variant: "success",
          icon: CheckCircle,
          textKey: "orders.status.courier_arriving",
        };
      case OrderStatus.READY:
        return {
          variant: "success",
          icon: CheckCircle,
          textKey: "orders.status.ready",
        };

      case OrderStatus.ON_WAY:
        return {
          variant: "primary",
          icon: Truck,
          textKey: "orders.status.on_way",
        };

      case OrderStatus.DELIVERED:
        return {
          variant: "default",
          icon: CheckCircle,
          textKey: "orders.status.delivered",
        };

      case OrderStatus.CANCELLED:
        return {
          variant: "error",
          icon: AlertCircle,
          textKey: "orders.status.cancelled",
        };

      default:
        return {
          variant: "default",
          icon: Sparkles,
          textKey: `orders.status.${status}`,
        };
    }
  };

  const config = getStatusConfig(order.status);
  const Icon = config.icon;
  const itemCount = order.products.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const orderTime = (): string => {
    if (order.statusHistory && order.statusHistory.length > 0) {
      return order.statusHistory[order.statusHistory.length-1].localTime;
    }
    return format(new Date(order.createdAt), "d MMM, h:mm a");
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.id);
    addToast(t('common.copied_to_clipboard'), 'success');
  };

  return (
    <div className="bg-background-card p-5 rounded-3xl shadow-sm border border-border flex flex-col h-full hover:shadow-md transition-all duration-300 group relative">
      <div className="cursor-pointer flex-1" onClick={onClick}>
          <div className="mb-3 flex justify-between items-start">
           <AnatomyTag variant={config.variant} className="flex items-center gap-1 self-center">
              <Icon className="w-3.5 h-3.5" /> 
              <span className="font-semibold">{t(config.textKey)}</span>
           </AnatomyTag>
                      <div className="flex flex-col items-end">
              <div 
                className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 pl-2 pr-1 py-1 rounded-md border border-border/50 group/copy hover:border-primary/30 transition-colors"
                onClick={handleCopyId} // Allow clicking the whole box to copy
                title={t('common.click_to_copy')}
              >
                <span className="text-xs font-mono text-text-main font-medium">
                  #{order.id.slice(0, 8)}
                </span>
                <button 
                  className="p-1 rounded bg-white dark:bg-gray-700 text-text-muted group-hover/copy:text-primary group-hover/copy:bg-primary/10 transition-all"
                >
                   <Copy className="w-3 h-3" />
                </button>
              </div>
           </div>
        </div>

        {/* Row B: Customer Name (Full Width) */}
        <div className="mb-4">
          <AnatomyText.H3 
            className="mb-0 text-text-main font-bold truncate w-full text-lg leading-tight" 
            title={`${order.customerSnapshot?.firstName} ${order.customerSnapshot?.lastName}`}
          >
            {order.customerSnapshot?.firstName || t('common.guest')} {order.customerSnapshot?.lastName || ""}
          </AnatomyText.H3>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center text-text-muted text-xs">
            <Clock className="w-3.5 h-3.5 mr-2" />
            {orderTime()}
          </div>
          <div className="flex items-center text-text-muted text-xs">
            {order.type === OrderType.DELIVERY ? (
              <Truck className="w-3.5 h-3.5 mr-2" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
            )}
            {t(`orders.type.${order.type.toLowerCase()}`)}
          </div>
          {/* Driver Info Card */}
          {order.driverSnapshot && (
            <div className="mt-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-border/50">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 border border-border relative">
                {order.driverSnapshot.photoUrl ? (
                  <img
                    src={order.driverSnapshot.photoUrl}
                    alt={order.driverSnapshot.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Bike className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <AnatomyText.Body className="text-xs font-bold text-text-main truncate leading-tight">
                  {order.driverSnapshot.fullName}
                </AnatomyText.Body>

                <a
                  href={`tel:${order.driverSnapshot.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-[10px] text-text-muted hover:text-primary transition-colors mt-0.5"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  {order.driverSnapshot.phone}
                </a>
              </div>
            </div>
          )}
          {order.type === OrderType.DELIVERY && order.deliveryAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-start text-text-muted text-xs hover:text-primary transition-colors group/address mt-1"
            >
              <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 group-hover/address:text-primary transition-colors" />
              <span className="truncate line-clamp-1 border-b border-transparent group-hover/address:border-primary/30">
                {order.deliveryAddress.streetAddress}
              </span>
            </a>
          )}
        </div>

        <div className="flex justify-between items-center mb-2">
          <AnatomyText.Label className="ml-0 text-text-main">
            {t("orders.pickup_code")}
          </AnatomyText.Label>
          <AnatomyText.H3 className="ml-0 text-primary mb-0">
            {order.pickupCode}
          </AnatomyText.H3>
        </div>

        <div className="border-b border-dashed border-border my-3"></div>

        <div className="flex justify-between items-center mb-2">
          <AnatomyText.Label className="ml-0 text-text-main">
            {t("orders.items_count")} {itemCount}
          </AnatomyText.Label>
          <AnatomyText.H3 className="ml-0 text-primary mb-0">
            ${Number(order.totalAmount).toFixed(2)}
          </AnatomyText.H3>
        </div>

        <div className="space-y-2 mb-4">
          {order.products.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-text-muted truncate pr-2">
                <span className="font-bold text-text-main">
                  {item.quantity}x
                </span>{" "}
                {item.name}
              </span>
            </div>
          ))}
          {order.products.length > 3 && (
            <div className="text-xs text-primary font-medium">
              + {order.products.length - 3} {t("common.more")}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
