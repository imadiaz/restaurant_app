import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyText from "../../components/anatomy/AnatomyText";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useDebtPayment } from "../../hooks/payments/use.debt.payment";

const PaymentPlatformPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returningFromPayment = params.get("status") === "success";
  const restaurantId = params.get("restaurantId");
  const sessionId = params.get("session_id");
  const hasSession = Boolean(restaurantId && sessionId);
  const confirmation = useDebtPayment(
    restaurantId,
    sessionId,
    returningFromPayment,
  );
  const verified =
    confirmation.data?.verified === true && !confirmation.isError;
  const checking =
    returningFromPayment && hasSession && confirmation.isFetching;
  const pending = !confirmation.isError && confirmation.data?.pending === true;
  const title = verified
    ? "payment_success"
    : checking
      ? "payment_verifying"
      : pending
        ? "payment_pending"
        : "not_verified";
  const description = verified
    ? "payment_recorded_desc"
    : checking || pending
      ? "payment_pending_desc"
      : returningFromPayment && !hasSession
        ? "payment_missing_session"
        : "payment_failure_desc";

  return (
    <BasePageLayout title="">
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div
          className="w-full max-w-lg space-y-6 rounded-3xl border border-border bg-background-card p-8 text-center shadow-xl"
          aria-live="polite"
          aria-busy={checking}
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${verified ? "bg-success-surface text-success" : "bg-primary/10 text-primary"}`}
          >
            {verified ? (
              <CheckCircle className="h-10 w-10" />
            ) : checking ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <AlertTriangle className="h-10 w-10" />
            )}
          </div>
          <AnatomyText.H3>{t(`stripe.${title}`)}</AnatomyText.H3>
          <AnatomyText.Body className="text-text-muted">
            {t(`stripe.${description}`)}
          </AnatomyText.Body>
          {verified && confirmation.data?.amountPaid !== undefined && (
            <p className="text-lg font-bold text-success">
              {new Intl.NumberFormat(i18n.language, {
                style: "currency",
                currency: "MXN",
              }).format(confirmation.data.amountPaid)}
            </p>
          )}
          {returningFromPayment && hasSession && !verified && (
            <AnatomyButton
              variant="secondary"
              isLoading={checking}
              onClick={() => void confirmation.refetch()}
              fullWidth
            >
              {t("stripe.payment_recheck")}
            </AnatomyButton>
          )}
          <AnatomyButton onClick={() => navigate("/dashboard/home")} fullWidth>
            {t("common.go_dashboard")} <ArrowRight className="ml-2 h-4 w-4" />
          </AnatomyButton>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default PaymentPlatformPage;
