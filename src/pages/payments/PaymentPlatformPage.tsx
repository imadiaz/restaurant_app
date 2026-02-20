import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, Home, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import BasePageLayout from '../../components/layout/BaseLayout';

const PaymentPlatformPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  return (
    <BasePageLayout title=''>
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="w-full max-w-lg">
          {status === "success" ? (
            <div className="bg-background-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>

              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <AnatomyText.H3 className="text-green-700 dark:text-green-400">
                  {t('stripe.payment_success')}
                </AnatomyText.H3>
                <AnatomyText.Body className="text-text-muted text-lg">
                  {t('stripe.payment_success_desc')}
                </AnatomyText.Body>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-border text-left flex items-center gap-4">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                   <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">{t('stripe.payment_status')}</p>
                  <p className="text-xs text-text-muted">Status: <span className="text-green-500 font-bold">{t('stripe.verified')}</span></p>
                </div>
              </div>

              <div className="pt-4">
                <AnatomyButton 
                  onClick={() => navigate('/')} 
                  className="w-full justify-center py-3 text-base"
                >
                   {t('common.go_dashboard')} <ArrowRight className="w-4 h-4 ml-2" />
                </AnatomyButton>
              </div>
            </div>
          ) : (
            
            <div className="bg-background-card border border-amber-200 dark:border-amber-900/50 rounded-3xl p-8 shadow-lg text-center space-y-6 relative">
               <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <AnatomyText.H3 className="text-amber-700 dark:text-amber-500">
                     {t('stripe.payment_failure')}
                </AnatomyText.H3>
                <AnatomyText.Body className="text-text-muted">
                   {t('stripe.payment_failure_desc')}
                </AnatomyText.Body>
              </div>

              <div className="pt-4 flex flex-col gap-3">                
                <AnatomyButton 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="w-full justify-center"
                >
                   <Home className="w-4 h-4 mr-2" /> {t('common.return_home')}
                </AnatomyButton>
              </div>
            </div>
          )}

        </div>
      </div>
    </BasePageLayout>
  );
};

export default PaymentPlatformPage;