import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, X } from 'lucide-react';
import AnatomyButton from '../../../components/anatomy/AnatomyButton';
import AnatomyTextField from '../../../components/anatomy/AnatomyTextField';
import { useDialogAccessibility } from '../../../hooks/use.dialog.accessibility';
import type { Order } from '../../../service/order.service';
import { canCompletePickup } from '../../../utils/order.actions';
import { isValidPickupCode, normalizePickupCode } from '../../../utils/pickup.utils';
import OrderNumber from '../../../components/common/OrderNumber';
import PickupOrderBanner from './PickupOrderBanner';

interface Props {
  order: Order;
  onClose: () => void;
  onComplete: (code: string) => Promise<unknown>;
  isCompleting: boolean;
}

export default function PickupCompletionModal({ order, onClose, onComplete, isCompleting }: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { if (!busy.current) onClose(); }, [onClose]);
  useDialogAccessibility(true, dialogRef, close);
  const available = canCompletePickup(order);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || isCompleting || !available) return;
    if (!isValidPickupCode(code)) { setError(t('orders.pickup.invalid_code')); return; }
    busy.current = true;
    setError('');
    try {
      await onComplete(normalizePickupCode(code));
      onClose();
    } catch {
      // Keep the form open: the operator can correct the code or reconcile a lost response.
      setError(t('orders.pickup.verification_failed'));
    } finally {
      busy.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pickup-completion-title" aria-describedby="pickup-completion-description" tabIndex={-1} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-background-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="pickup-completion-title" className="text-xl font-bold text-text-main">{t('orders.pickup.deliver_action')}</h2>
            <OrderNumber id={order.id} />
          </div>
          <button type="button" onClick={close} disabled={isCompleting} aria-label={t('common.close')} className="rounded-full p-2 text-text-muted hover:bg-surface-hover disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <PickupOrderBanner order={order} />
        <p id="pickup-completion-description" className="mb-5 text-sm text-text-muted">{t('orders.pickup.instructions')}</p>
        <form onSubmit={(event) => void submit(event)}>
          <AnatomyTextField label={t('orders.pickup.code_label')} icon={<KeyRound className="h-5 w-5" />} value={code} maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={isCompleting || !available} onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(''); }} error={error || undefined} />
          {!available && <p role="alert" className="mt-3 text-sm text-danger">{t('orders.pickup.unavailable')}</p>}
          <p className="my-4 text-xs text-text-muted">{t('orders.pickup.payment_hint')}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AnatomyButton type="button" variant="secondary" onClick={close} disabled={isCompleting}>{t('common.cancel')}</AnatomyButton>
            <AnatomyButton type="submit" isLoading={isCompleting} disabled={!available || !isValidPickupCode(code)}>{t('orders.pickup.confirm')}</AnatomyButton>
          </div>
        </form>
      </div>
    </div>
  );
}
