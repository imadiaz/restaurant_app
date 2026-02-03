import { RefreshCw, ShieldCheck, ArrowRight, Home } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyText from "../../components/anatomy/AnatomyText";
import BasePageLayout from "../../components/layout/BaseLayout";
import { usePayments } from "../../hooks/payments/use.payments";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";

export const PaymentRefreshPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeRestaurant } = useAppStore();
  const addToast = useToastStore((s) => s.addToast);

  const restaurantId = searchParams.get('restaurantId') || activeRestaurant?.id;

  const { createAccountLink, isCreatingLink } = usePayments();

  useEffect(() => {
    if (!restaurantId) {
      navigate('/');
    }
  }, [restaurantId, navigate]);

  const handleRetry = async () => {
    if (!restaurantId) return;

    try {
      const data = await createAccountLink(restaurantId);
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        addToast(t('common.error_generic'), 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BasePageLayout title="">
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="w-full max-w-lg">
          
          <div className="bg-background-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <RefreshCw className={`w-10 h-10 ${isCreatingLink ? 'animate-spin' : ''}`} />
            </div>

            <div className="space-y-2">
              <AnatomyText.H3 className="text-text-main">
                {t('payments.session_expired',)}
              </AnatomyText.H3>
              <AnatomyText.Body className="text-text-muted text-lg">
                {t('payments.expired_desc')}
              </AnatomyText.Body>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-border inline-flex items-center gap-2 mx-auto">
               <ShieldCheck className="w-4 h-4 text-green-500" />
               <span className="text-xs text-text-muted font-medium">
                 {t('payments.secure_connection',)}
               </span>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col gap-3">
              <AnatomyButton 
                variant="primary"
                onClick={handleRetry} 
                isLoading={isCreatingLink}
                className="w-full justify-center py-3 text-base"
              >
                 {isCreatingLink 
                    ? t('payments.generating_link') 
                    : <>{t('payments.try_again')} <ArrowRight className="w-4 h-4 ml-2" /></>
                 }
              </AnatomyButton>

              <AnatomyButton 
                 variant="ghost" 
                 onClick={() => navigate('/dashboard')}
                 disabled={isCreatingLink}
                 className="w-full justify-center"
              >
                 <Home className="w-4 h-4 mr-2" /> {t('common.cancel')}
              </AnatomyButton>
            </div>

          </div>
        </div>
      </div>
    </BasePageLayout>
  );
};