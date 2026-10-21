import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '../../store/toast.store';
import { shortOrderId } from '../../utils/order.actions';

const OrderNumber = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);

  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-text-main hover:border-primary"
      title={`${t('common.click_to_copy')}: ${id}`}
      aria-label={t('orders.copy_full_id', { id })}
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(id);
          addToast(t('common.copied_to_clipboard'), 'success');
        } catch {
          addToast(t('orders.copy_failed'), 'error');
        }
      }}
    >
      <span>{t('orders.number')} <span className="font-mono">#{shortOrderId(id)}</span></span>
      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
};

export default OrderNumber;
