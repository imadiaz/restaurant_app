import { CalendarClock, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OrderType, type Order } from '../../../service/order.service';
import { formatPickupSchedule } from '../../../utils/pickup.utils';

export default function PickupOrderBanner({ order }: { order: Order }) {
  const { t, i18n } = useTranslation();
  if (order.type !== OrderType.PICKUP) return null;
  const schedule = formatPickupSchedule(order.scheduledPickupAt, i18n.resolvedLanguage || i18n.language);
  return (
    <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-primary">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold">
        <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t('orders.pickup.label')}
      </div>
      <div className="flex items-start gap-2 text-xs font-medium text-text-main">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{schedule ? t('orders.pickup.scheduled_at', { date: schedule }) : t('orders.pickup.unscheduled')}</span>
      </div>
    </div>
  );
}
