import React, { useEffect } from 'react';
import { X, Save, Clock, DollarSign, Store, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import AnatomyButton from '../../../components/anatomy/AnatomyButton';
import AnatomyTextField from '../../../components/anatomy/AnatomyTextField';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import type { Restaurant } from '../../../data/models/restaurant/restaurant';
import { useRestaurantOperations } from '../../../hooks/restaurants/use.operations';
import { CommissionType } from '../../../service/restaurant.service';


interface ManageRestaurantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  isAdminMode: boolean;
  onSuccess?: () => void;
}

// Form Data Shape
interface SettingsFormData {
  // Operational
  isOpen: boolean;
  deliveryFee: number;
  averagePrepTimeMin: number;
  
  // Admin Only
  commissionType?: CommissionType;
  commissionValue?: number;
  stripeFeePct?: number;
  stripeFeeFixed?: number;
}

const ManageRestaurantSettingsModal: React.FC<ManageRestaurantSettingsModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  isAdminMode,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { updateOperational, updateAdminConfig, isUpdatingOperational, isUpdatingAdminConfig } = useRestaurantOperations();

  const isSubmitting = isUpdatingOperational || isUpdatingAdminConfig;

  const { control, register, handleSubmit, reset, watch } = useForm<SettingsFormData>({
    defaultValues: {
      isOpen: restaurant.isOpen,
      deliveryFee: Number(restaurant.deliveryFee),
      averagePrepTimeMin: restaurant.averagePrepTimeMin,
      commissionType: restaurant.commissionType ?? CommissionType.PERCENTAGE,
      commissionValue: Number(restaurant.commissionValue ?? 20),
      stripeFeePct: Number(restaurant.stripeFeePct ?? 3.6),
      stripeFeeFixed: Number(restaurant.stripeFeeFixed ?? 3.0),
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        isOpen: restaurant.isOpen,
        deliveryFee: Number(restaurant.deliveryFee),
        averagePrepTimeMin: restaurant.averagePrepTimeMin,
        commissionType: restaurant.commissionType ?? CommissionType.PERCENTAGE,
        commissionValue: Number(restaurant.commissionValue ?? 20),
        stripeFeePct: Number(restaurant.stripeFeePct ?? 3.6),
        stripeFeeFixed: Number(restaurant.stripeFeeFixed ?? 3.0),
      });
    }
  }, [isOpen, restaurant, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      if (isAdminMode) {
        // 🛡️ Super Admin: Sends everything
        await updateAdminConfig({
          id: restaurant.id,
          data: {
            // Operational
            isOpen: data.isOpen,
            deliveryFee: Number(data.deliveryFee),
            averagePrepTimeMin: Number(data.averagePrepTimeMin),
            // Financials
            commissionType: data.commissionType,
            commissionValue: Number(data.commissionValue),
            stripeFeePct: Number(data.stripeFeePct),
            stripeFeeFixed: Number(data.stripeFeeFixed),
          }
        });
      } else {
        // 👨‍🍳 Owner: Sends only operational data
        await updateOperational({
          id: restaurant.id,
          data: {
            isOpen: data.isOpen,
            deliveryFee: Number(data.deliveryFee),
            averagePrepTimeMin: Number(data.averagePrepTimeMin),
          }
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      // Error handled globally via hook
    }
  };

  // Watch for dynamic commission label
  const commType = watch("commissionType");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 border-b border-border flex justify-between items-center shrink-0 rounded-t-3xl ${isAdminMode ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
          <div>
            <div className="flex items-center gap-2">
              {isAdminMode ? <Shield className="w-5 h-5 text-purple-600" /> : <Store className="w-5 h-5 text-primary" />}
              <AnatomyText.H3 className="text-lg">
                {isAdminMode ? t('settings.admin_title') : t('settings.operational_title')}
              </AnatomyText.H3>
            </div>
            <AnatomyText.Small className="text-text-muted mt-1">
              {isAdminMode 
                ? t('settings.admin_subtitle', { name: restaurant.name }) 
                : t('settings.operational_subtitle')}
            </AnatomyText.Small>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* SECTION 1: OPERATIONS (Everyone sees this) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <AnatomyText.Label className="text-primary">{t('settings.section_operations')}</AnatomyText.Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Toggle Open/Close */}
              <div className="col-span-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between border border-border">
                <div>
                  <AnatomyText.Body className="font-medium">{t('settings.store_status')}</AnatomyText.Body>
                  <AnatomyText.Small className="text-text-muted">
                    {t('settings.store_status_desc')}
                  </AnatomyText.Small>
                </div>
                <Controller
                  name="isOpen"
                  control={control}
                  render={({ field }) => (
                     <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  )}
                />
              </div>

              {/* Delivery Fee */}
              <AnatomyTextField
                label={t('settings.delivery_fee')}
                type="number"
                icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                {...register('deliveryFee', { min: 0, required: true })}
                placeholder="0.00"
              />

              {/* Prep Time */}
              <AnatomyTextField
                label={t('settings.prep_time')}
                type="number"
                icon={<Clock className="w-4 h-4 text-gray-400" />}
                {...register('averagePrepTimeMin', { min: 0, required: true })}
                placeholder="20"
              />
            </div>
          </section>

          {/* SECTION 2: FINANCIALS (Admin Only) */}
          {isAdminMode && (
            <>
              <div className="h-px bg-border" />
              <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <AnatomyText.Label className="text-purple-600 dark:text-purple-400">
                    {t('settings.section_financials')} (Admin Only)
                  </AnatomyText.Label>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 space-y-5">
                  
                  {/* Commission Config */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">{t('settings.commission_type')}</label>
                      <select 
                        {...register('commissionType')}
                        className="w-full rounded-xl border-border bg-background-input px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      >
                        <option value={CommissionType.PERCENTAGE}>{t('settings.comm_percentage')}</option>
                        <option value={CommissionType.FIXED_AMOUNT}>{t('settings.comm_fixed')}</option>
                      </select>
                    </div>

                    <AnatomyTextField
                      label={t('settings.commission_value')}
                      type="number"
                      {...register('commissionValue', { min: 0, required: true })}
                      placeholder="0.00"
                      // Dynamic Icon based on selection
                      icon={commType === CommissionType.PERCENTAGE ? "%" : <DollarSign className="w-3 h-3"/>}
                    />
                  </div>

                  {/* Stripe Config */}
                  <div className="pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                     <AnatomyText.Small className="block mb-3 text-purple-600/70 font-medium">Stripe Configuration</AnatomyText.Small>
                     <div className="grid grid-cols-2 gap-4">
                        <AnatomyTextField
                          label="Stripe Fee (%)"
                          type="number"
                          step="0.01"
                          {...register('stripeFeePct', { min: 0 })}
                        />
                         <AnatomyTextField
                          label="Stripe Fixed ($)"
                          type="number"
                          step="0.01"
                          {...register('stripeFeeFixed', { min: 0 })}
                        />
                     </div>
                  </div>

                </div>
              </section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/20 shrink-0 flex justify-end gap-3 rounded-b-3xl">
          <AnatomyButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </AnatomyButton>
          
          <AnatomyButton 
             onClick={handleSubmit(onSubmit)} 
             disabled={isSubmitting}
             // Change color if admin
             className={isAdminMode ? "bg-purple-600 hover:bg-purple-700 text-white border-transparent" : ""}
          >
            {isSubmitting ? t('common.saving') : (
              <>
                <Save className="w-4 h-4 mr-2"/> 
                {isAdminMode ? t('common.save_config') : t('common.save_changes')}
              </>
            )}
          </AnatomyButton>
        </div>

      </div>
    </div>
  );
};

export default ManageRestaurantSettingsModal;