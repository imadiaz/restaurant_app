import React, { useRef, useState } from "react";
import {
  X,
  MapPin,
  CreditCard,
  StickyNote,
  Printer,
  Clock,
  ChefHat,
  ShoppingBag,
  User,
  Bike,
  Check,
  Phone,
  ChevronUp,
  ChevronDown,
  History,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  type Order,
} from "../../service/order.service";
import { useTranslation } from "react-i18next";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import { format } from "date-fns";
import { useAppStore } from "../../store/app.store";
import { useDrivers } from "../../hooks/drivers/use.drivers";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import { useDialogAccessibility } from "../../hooks/use.dialog.accessibility";
import { useAuthStore } from "../../store/auth.store";
import { ROLES } from "../../config/roles";
import { useConfirm } from "../../hooks/use.confirm.modal";

type OrderStatusType = keyof typeof OrderStatus;

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (
    newStatus: OrderStatusType,
    timeInMinutes?: number,
    driverId?: string,
  ) => void;
  onRefund: (reason: string) => Promise<void>;
  isRefunding: boolean;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onRefund,
  isRefunding,
}) => {
  const { t } = useTranslation();
  const { activeRestaurant } = useAppStore((state) => state);
  const { drivers } = useDrivers();
  const user = useAuthStore((state) => state.user);
  const { confirm } = useConfirm();

  // Local State
  const [showPrepTime, setShowPrepTime] = useState(false);
  const [prepTime, setPrepTime] = useState<number>(activeRestaurant?.averagePrepTimeMin ?? 15);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(order?.driverId || "");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Collapsible state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(isOpen && Boolean(order), dialogRef, onClose);

  if (!isOpen || !order) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // --- HELPERS ---

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

  const handleStartCooking = () => {
    onStatusChange(OrderStatus.PREPARING, prepTime ?? undefined);
    setPrepTime(activeRestaurant?.averagePrepTimeMin ?? 15);
  };

  const handleReady = () => {
    onStatusChange(OrderStatus.READY, undefined, selectedDriverId);
    setSelectedDriverId("");
  };

  const handleAcceptOrder = () => {
    onStatusChange(OrderStatus.CONFIRMED, undefined, undefined);
  };

  const canRefund =
    (user?.role.name === ROLES.SUPER_ADMIN || user?.role.name === ROLES.ADMIN) &&
    order.paymentMethod === PaymentMethod.CARD &&
    order.paymentStatus === PaymentStatus.PAID &&
    order.status !== OrderStatus.DELIVERED &&
    order.status !== OrderStatus.INCOMPLETE_PAYMENT &&
    order.refund?.status !== RefundStatus.SUCCEEDED;

  const requestRefund = () => {
    const reason = refundReason.trim();
    if (reason.length < 5) return;
    confirm({
      title: t("orders.refund.confirm_title"),
      message: t("orders.refund.confirm_message", {
        amount: Number(order.totalAmount).toFixed(2),
      }),
      confirmText: t("orders.refund.confirm_action"),
      variant: "danger",
      onConfirm: async () => {
        await onRefund(reason);
        setRefundReason("");
        setShowRefundForm(false);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="bg-background-card rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-background-card z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AnatomyText.H3 id="order-detail-title" className="text-2xl mb-0">
                {t("orders.order")} #{order.id.slice(0, 6)}
              </AnatomyText.H3>
              <AnatomyTag variant={getStatusVariant(order.status)}>
                {t(`orders.status.${order.status.toLowerCase()}`)}
              </AnatomyTag>
            </div>
            <AnatomyText.Small className="font-medium flex items-center gap-2 text-text-muted">
              <Clock className="w-4 h-4" />
              {format(new Date(order.createdAt), "d MMM, h:mm a")}
            </AnatomyText.Small>
          </div>

          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-main"
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
                        <div className="mt-2 text-xs bg-warning-surface text-warning px-2 py-1 rounded-lg border border-warning/20 inline-flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          <AnatomyText.Small className="text-warning">
                            "{item.comment}"
                          </AnatomyText.Small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-96 bg-surface-muted p-5 sm:p-8 space-y-8 h-full border-t lg:border-t-0 border-border">
              <div className="space-y-4">
                <AnatomyText.Label className="uppercase tracking-wider text-xs font-bold text-text-muted">
                  {t("orders.customer_details")}
                </AnatomyText.Label>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {order.customerSnapshot?.firstName || t("orders.guest")}{" "}
                      {order.customerSnapshot?.lastName || ""}
                    </AnatomyText.Body>
                    <AnatomyText.Small className="text-text-muted text-xs">
                      {order.customerSnapshot?.phone || t("orders.no_phone")}
                    </AnatomyText.Small>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {order.type === OrderType.DELIVERY
                        ? t("orders.delivery_address")
                        : t("orders.pickup_point")}
                    </AnatomyText.Body>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress?.lat},${order.deliveryAddress?.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-start text-text-muted text-xs  hover:text-primary transition-colors group/address mt-1"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 group-hover/address:text-primary transition-colors" />
                      <AnatomyText.Small className="text-text-muted text-xs group-hover/address:text-primary leading-relaxed max-w-[200px]">
                        {formattedAddress}
                      </AnatomyText.Small>
                    </a>
                    {order.deliveryAddress?.details && (
                      <AnatomyText.Small className="text-primary mt-1 font-medium">
                        {""} {order.deliveryAddress.details}
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-background-card rounded-full text-text-muted shadow-sm border border-border">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <AnatomyText.Body className="font-bold text-text-main text-sm">
                      {t("orders.payment_method")}
                    </AnatomyText.Body>
                    <AnatomyText.Small className="text-text-muted text-xs capitalize">
                      {order.paymentMethod.replace("_", " ")}
                    </AnatomyText.Small>
                    {order.paymentSnapshot && order.paymentMethod == "CARD" && (
                      <div className="flex flex-col">
                        <AnatomyText.Small className="text-text-muted text-xs capitalize">
                          {order.paymentSnapshot?.brand}
                        </AnatomyText.Small>
                        <AnatomyText.Small className="text-text-muted text-xs capitalize">
                          **** {order.paymentSnapshot?.last4}
                        </AnatomyText.Small>
                      </div>
                    )}
                    {order.changeFor && (
                      <AnatomyText.Small className="text-warning mt-1">
                        {t("orders.change_for")}: ${order.changeFor}
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>
                <div>
                  {order.status == OrderStatus.INCOMPLETE_PAYMENT && order.incompletePaymentAmount && (
                    <div className="flex flex-col p-2 gap-2">
                      <AnatomyTag variant="error">
                        {t("orders.incomplete_payment")}
                      </AnatomyTag>

                      <AnatomyTag variant="error">
                        {t("orders.incomplete_payment_amount")}: $
                        {order.incompletePaymentAmount}
                      </AnatomyTag>
                    </div>
                  )}
                </div>
                {order.driverSnapshot && (
                  <div className="mt-3 flex items-center gap-3 bg-background-card p-3 rounded-xl border border-border/60 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-surface-hover overflow-hidden shrink-0 border border-border flex items-center justify-center">
                      {order.driverSnapshot.photoUrl ? (
                        <img
                          src={order.driverSnapshot.photoUrl}
                          alt={order.driverSnapshot.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bike className="w-5 h-5 text-text-subtle" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <AnatomyText.Label className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">
                        {t("drivers.driver")}
                      </AnatomyText.Label>
                      <AnatomyText.Body className="text-xs font-bold text-text-main truncate leading-tight">
                        {order.driverSnapshot.fullName}
                      </AnatomyText.Body>
                      <a
                        href={`tel:${order.driverSnapshot.phone}`}
                        className="flex items-center text-[10px] text-primary hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {order.driverSnapshot.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border"></div>

              {(order.restaurantNote || order.deliveryNote) && (
                <div className="bg-warning-surface p-4 rounded-xl border border-warning/20">
                  <div className="flex items-center gap-2 text-warning mb-1">
                    <StickyNote className="w-4 h-4" />
                    <AnatomyText.Label className="font-bold text-xs uppercase text-warning">
                      {t("orders.instructions")}
                    </AnatomyText.Label>
                  </div>
                  <div className="flex flex-col">
                    {order.restaurantNote && (
                      <AnatomyText.Small className="text-text-main font-medium italic mb-1">
                        {t("orders.kitchen")}: "{order.restaurantNote}"
                      </AnatomyText.Small>
                    )}
                    {order.deliveryNote && (
                      <AnatomyText.Small className="text-text-main font-medium italic">
                        {t("orders.delivery")}: "{order.deliveryNote}"
                      </AnatomyText.Small>
                    )}
                  </div>
                </div>
              )}

              {order.couponCode && (
                <div className="flex justify-between mt-4">
                  <AnatomyText.Small className="text-text-muted font-bold">
                    {t("orders.coupon")}
                  </AnatomyText.Small>
                  <AnatomyText.Body className="text-primary font-bold">
                    {order.couponCode}
                  </AnatomyText.Body>
                </div>
              )}

              <div className="space-y-2">
                <AnatomyText.Label className="uppercase tracking-wider text-xs font-bold text-text-muted">
                  {t("orders.payment_summary")}
                </AnatomyText.Label>

                <div className="flex justify-between mt-4">
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

                {order.discount != null && Number(order.discount) > 0 && (
                  <div className="flex justify-between">
                    <AnatomyText.Small className="text-text-muted">
                      {t("orders.totalWithDiscount")}
                    </AnatomyText.Small>
                    <AnatomyText.Body className="font-bold">
                      ${Number(order.totalAmount + order.discount).toFixed(2)}
                    </AnatomyText.Body>
                  </div>
                )}

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between">
                    <AnatomyText.Small className="text-text-muted">
                      {t("orders.discount")}
                    </AnatomyText.Small>
                    <AnatomyText.Body className="font-bold text-primary">
                      ${Number(order.discount).toFixed(2)}
                    </AnatomyText.Body>
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

              {order.refund && (
                <div
                  className={`mt-5 rounded-xl border p-4 ${
                    order.refund.status === RefundStatus.SUCCEEDED
                      ? "border-success/30 bg-success-surface"
                      : order.refund.status === RefundStatus.FAILED
                        ? "border-danger/30 bg-danger-surface"
                        : "border-warning/30 bg-warning-surface"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {order.refund.status === RefundStatus.FAILED ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-danger" />
                    ) : (
                      <RotateCcw className="mt-0.5 h-5 w-5 text-text-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <AnatomyText.Label className="font-bold uppercase">
                        {t("orders.refund.title")}
                      </AnatomyText.Label>
                      <AnatomyText.Small className="mt-1 text-text-muted">
                        {t(`orders.refund.status.${order.refund.status.toLowerCase()}`)} · ${Number(order.refund.amount).toFixed(2)} {order.refund.currency}
                      </AnatomyText.Small>
                      {order.refund.reason && (
                        <AnatomyText.Small className="mt-1 block text-text-muted">
                          {order.refund.reason}
                        </AnatomyText.Small>
                      )}
                      {order.refund.failureCode && (
                        <AnatomyText.Small className="mt-1 block font-mono text-danger">
                          {t("orders.refund.failure_code")}: {order.refund.failureCode}
                        </AnatomyText.Small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {canRefund && showRefundForm && (
                <div className="mt-5 rounded-xl border border-danger/30 bg-danger-surface p-4">
                  <label htmlFor="refund-reason" className="mb-2 block text-sm font-bold text-text-main">
                    {t("orders.refund.reason_label")}
                  </label>
                  <textarea
                    id="refund-reason"
                    value={refundReason}
                    onChange={(event) => setRefundReason(event.target.value)}
                    maxLength={500}
                    rows={3}
                    disabled={isRefunding}
                    placeholder={t("orders.refund.reason_placeholder")}
                    className="w-full resize-none rounded-lg border border-border bg-background-card px-3 py-2 text-sm text-text-main outline-none focus:ring-2 focus:ring-danger/40"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <AnatomyButton
                      variant="secondary"
                      onClick={() => setShowRefundForm(false)}
                      disabled={isRefunding}
                    >
                      {t("common.cancel")}
                    </AnatomyButton>
                    <AnatomyButton
                      onClick={requestRefund}
                      disabled={refundReason.trim().length < 5 || isRefunding}
                      className="bg-danger text-white hover:brightness-90"
                    >
                      {t("orders.refund.review_action")}
                    </AnatomyButton>
                  </div>
                </div>
              )}

              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <div className="flex items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
                      <History className="w-4 h-4" />
                      <AnatomyText.Label className="font-bold text-xs uppercase cursor-pointer">
                        {t("orders.status_history")}
                      </AnatomyText.Label>
                    </div>
                    {isHistoryOpen ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                  </button>

                  {isHistoryOpen && (
                    <div className="mt-3 bg-background-card rounded-xl border border-border overflow-hidden animate-in slide-in-from-top-2">
                      <table className="w-full text-xs">
                        <thead className="bg-surface-muted text-text-muted font-medium">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              {t("orders.status_label")}
                            </th>
                            <th className="px-3 py-2 text-left">
                              {t("orders.history_user")}
                            </th>
                            <th className="px-3 py-2 text-right">
                              {t("orders.times")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {order.statusHistory.map((entry, i) => (
                            <tr
                              key={i}
                              className="hover:bg-surface-hover"
                            >
                              <td className="px-3 py-2">
                                <AnatomyTag
                                  variant={getStatusVariant(entry.status)}
                                  className="scale-90 origin-left"
                                >
                                  {entry.status}
                                </AnatomyTag>
                              </td>
                              <td>{entry.changedBy.fullName}</td>
                              <td className="px-3 py-2 text-right text-text-muted">
                                {format(new Date(entry.timestamp), "h:mm a")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-4 sm:p-6 border-t border-border bg-background-card flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center z-10">
          <AnatomyButton variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            {t("common.print_receipt")}
          </AnatomyButton>

          <div className="flex flex-wrap gap-3">
            {canRefund && !showRefundForm && (
              <AnatomyButton
                onClick={() => setShowRefundForm(true)}
                disabled={isRefunding}
                className="bg-danger text-white hover:brightness-90"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {order.refund?.status === RefundStatus.PENDING
                  ? t("orders.refund.check_action")
                  : order.refund?.status === RefundStatus.FAILED
                    ? t("orders.refund.retry_action")
                    : t("orders.refund.action")}
              </AnatomyButton>
            )}
            {/* PENDING -> PREPARING */}
            {order.status === OrderStatus.PENDING && (
              <AnatomyButton
                onClick={handleAcceptOrder}
                className="bg-warning hover:bg-warning/90 text-white border-transparent"
              >
                <Check className="w-4 h-4 mr-2" /> {t("common.acceptOrder")}
              </AnatomyButton>
            )}
            {order.status === OrderStatus.CONFIRMED &&
              (showPrepTime ? (
                <div className="flex items-center gap-3 animate-in slide-in-from-right-5 duration-200">
                  <span className="text-sm font-medium text-text-muted">
                    {t("orders.estimated_time")}:
                  </span>

                  <div className="flex bg-surface-muted rounded-lg p-1 gap-1">
                    {[15, 20, 30, 45].map((min) => (
                      <button
                        key={min}
                        onClick={() => setPrepTime(min)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${prepTime === min ? "bg-background-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
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
                    <span className="absolute right-2 top-1.5 text-xs text-text-muted">
                      m
                    </span>
                  </div>

                  <AnatomyButton
                    onClick={handleStartCooking}
                    className="bg-warning hover:bg-warning/90 text-white border-transparent"
                  >
                    <Check className="w-4 h-4 mr-2" /> {t("common.confirm")}
                  </AnatomyButton>
                  <button
                    onClick={() => setShowPrepTime(false)}
                    className="p-2 text-text-muted hover:text-danger transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <AnatomyButton
                  onClick={() => setShowPrepTime(true)}
                  className="bg-warning hover:bg-warning/90 text-white border-transparent"
                >
                  <ChefHat className="w-4 h-4 mr-2" />{" "}
                  {t("orders.actions.start_cooking")}
                </AnatomyButton>
              ))}

            {/* PREPARING -> READY */}
            {order.status === OrderStatus.PREPARING &&
              (order.type === OrderType.DELIVERY ? (
                <div className="flex items-center align-center gap-2 animate-in fade-in">
                  <div className="w-48">
                    <AnatomySelect
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="text-sm"
                    >
                      <option value="">{t("drivers.select_driver")}</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.firstName} {d.lastName}
                        </option>
                      ))}
                    </AnatomySelect>
                  </div>
                  <AnatomyButton
                    onClick={() => handleReady()}
                    className="bg-info hover:bg-info/90 text-white border-transparent"
                    disabled={!selectedDriverId}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />{" "}
                    {t("orders.actions.mark_ready")}
                  </AnatomyButton>
                </div>
              ) : (
                <AnatomyButton
                  onClick={() => onStatusChange(OrderStatus.READY)}
                  className="bg-info hover:bg-info/90 text-white border-transparent"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />{" "}
                  {t("orders.actions.mark_ready")}
                </AnatomyButton>
              ))}

            {/* PICKUP READY -> DELIVERED */}
            {order.status === OrderStatus.READY &&
              order.type === OrderType.PICKUP && (
                <AnatomyButton
                  onClick={() => onStatusChange(OrderStatus.DELIVERED)}
                  className="bg-success hover:bg-success/90 text-white border-transparent"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t("orders.actions.mark_delivered")}
                </AnatomyButton>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
