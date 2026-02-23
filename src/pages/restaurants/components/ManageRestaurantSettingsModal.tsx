import React, { useEffect, useState } from 'react';
import { X, Save, DollarSign, Store, Shield, Link, Plus, Trash2, Receipt, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Assuming you have these exported from your hooks/services
import { useRestaurantOperations, useRestaurantFees } from '../../../hooks/restaurants/use.operations';
import { FeeType, type CreateRestaurantFeeDto } from '../../../service/restaurant.service';
import AnatomyButton from '../../../components/anatomy/AnatomyButton';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import type { Restaurant } from '../../../data/models/restaurant/restaurant';
import { Controller, useForm } from 'react-hook-form';
import AnatomyTextField from '../../../components/anatomy/AnatomyTextField';

interface ManageRestaurantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  isAdminMode: boolean;
  onSuccess?: () => void;
}

interface SettingsFormData {
  isOpen: boolean;
  averagePrepTimeMin: number;
}

const ManageRestaurantSettingsModal: React.FC<ManageRestaurantSettingsModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  isAdminMode,
  onSuccess
}) => {
  const { t } = useTranslation();
  
  // Hooks for Operations and Fees
  const { setupPaymentLink, isSettingUpPaymentLink, syncRestaurantFees, isSyncingFees } = useRestaurantOperations();
  const { fees, isLoadingFees } = useRestaurantFees(restaurant.id);

  // Local state to manage the dynamic list of fees before saving
  const [localFees, setLocalFees] = useState<CreateRestaurantFeeDto[]>([]);

  // Load existing fees into our local form state when the modal opens/data loads
  useEffect(() => {
    if (fees) {
      setLocalFees(
        fees.map((f) => ({
          name: f.name,
          description: f.description || '',
          type: f.type,
          value: f.value,
        }))
      );
    }
  }, [fees]);

  const setupPaymentLinkHandler = async () => {
    try {
      await setupPaymentLink({ id: restaurant.id });
    } catch (error) {
      console.error("Failed to send Stripe link", error);
    }
  };

  // --- Dynamic Fee Handlers ---
  const handleAddFee = () => {
    setLocalFees([...localFees, { name: '', description: '', type: FeeType.FLAT, value: 0 }]);
  };

  const handleRemoveFee = (index: number) => {
    const newFees = [...localFees];
    newFees.splice(index, 1);
    setLocalFees(newFees);
  };

  const handleFeeChange = (index: number, field: keyof CreateRestaurantFeeDto, val: any) => {
    const newFees = [...localFees];
    newFees[index] = { ...newFees[index], [field]: val };
    setLocalFees(newFees);
  };

  const handleSaveFees = async () => {
    try {
      await syncRestaurantFees({
        id: restaurant.id,
        data: { fees: localFees },
      });
      // Optionally call onSuccess or show a local success state
    } catch (error) {
      console.error("Failed to save fees", error);
    }
  };

  const  {updateOperational, isUpdatingOperational} = useRestaurantOperations();
  const { control, register, handleSubmit, reset, watch } = useForm<SettingsFormData>({
    defaultValues: {
      isOpen: restaurant.isOpen,
      averagePrepTimeMin: restaurant.averagePrepTimeMin,
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateOperational({
          id: restaurant.id,
          data: {
            isOpen: data.isOpen,
            averagePrepTimeMin: Number(data.averagePrepTimeMin),
        }});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 border-b border-border flex justify-between items-center shrink-0 rounded-t-3xl ${isAdminMode ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
          <div>
            <div className="flex items-center gap-2">
              {isAdminMode ? <Shield className="w-5 h-5 text-purple-600" /> : <Store className="w-5 h-5 text-primary" />}
              <AnatomyText.H3 className="text-lg">
                {isAdminMode ? t('settings.admin_title', 'Admin Settings') : t('settings.operational_title', 'Operational Settings')}
              </AnatomyText.H3>
            </div>
            <AnatomyText.Small className="text-text-muted mt-1">
              {isAdminMode 
                ? t('settings.admin_subtitle', { name: restaurant.name }) 
                : t('settings.operational_subtitle', 'Manage your restaurant parameters')}
            </AnatomyText.Small>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <section className="flex flex-col p-6  overflow-y-auto space-y-4">
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
              {/* Prep Time */}
              <AnatomyTextField
                label={t('settings.prep_time')}
                type="number"
                icon={<Clock className="w-4 h-4 text-gray-400" />}
                {...register('averagePrepTimeMin', { min: 0, required: true })}
                placeholder="20"
              />
            </div>

            <AnatomyButton 
             onClick={handleSubmit(onSubmit)} 
             disabled={isUpdatingOperational}
             // Change color if admin
             className={isAdminMode ? "bg-purple-600 hover:bg-purple-700 text-white border-transparent" : ""}
          >
            {isUpdatingOperational ? t('common.saving') : (
              <>
                <Save className="w-4 h-4 mr-2"/> 
                {isAdminMode ? t('common.save_config') : t('common.save_changes')}
              </>
            )}
          </AnatomyButton>
          </section>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* ========================================== */}
          {/* SECTION 1: FEES & SURCHARGES (For Everyone) */}
          {/* ========================================== */}
          <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-500" />
                <AnatomyText.Label className="text-orange-600 dark:text-orange-400">
                  {t('settings.section_fees', 'Additional Fees & Surcharges')}
                </AnatomyText.Label>
              </div>
              <AnatomyButton variant="ghost"  onClick={handleAddFee}>
                <Plus className="w-4 h-4 mr-2" />
                {t('settings.add_fee', 'Add Fee')}
              </AnatomyButton>
            </div>

            <div className="bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-4">
              {isLoadingFees ? (
                <div className="text-center text-gray-500 py-4">Loading fees...</div>
              ) : localFees.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm">
                  {t('settings.no_fees', 'No additional fees configured.')}
                </div>
              ) : (
                <div className="space-y-4">
                  {localFees.map((fee, index) => (
                    <div key={index} className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      
                      {/* Top Row: Name, Type, Value, Delete */}
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        
                        {/* Name Input */}
                        <div className="flex-1 w-full">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Fee Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Packaging Fee"
                            value={fee.name}
                            onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                            className="w-full text-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary outline-none dark:bg-gray-700"
                          />
                        </div>

                        {/* Type Dropdown */}
                        <div className="w-full sm:w-32 shrink-0">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                          <select
                            value={fee.type}
                            onChange={(e) => handleFeeChange(index, 'type', e.target.value as FeeType)}
                            className="w-full text-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-primary outline-none bg-white dark:bg-gray-700"
                          >
                            <option value={FeeType.FLAT}>Flat ($)</option>
                            <option value={FeeType.PERCENTAGE}>Percent (%)</option>
                          </select>
                        </div>

                        {/* Value Input */}
                        <div className="w-full sm:w-24 shrink-0">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Value</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={fee.value}
                            onChange={(e) => handleFeeChange(index, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full text-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-primary outline-none dark:bg-gray-700"
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFee(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                          title="Remove Fee"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bottom Row: Description */}
                      <div className="w-full">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          {t('settings.fee_description_label', 'Description (Optional)')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('settings.fee_description_placeholder', 'e.g. Required for eco-friendly containers')}
                          value={fee.description}
                          onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                          className="w-full text-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary outline-none dark:bg-gray-700"
                        />
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
              
              {/* Save Fees Button */}
              <div className="flex justify-end pt-2">
                <AnatomyButton 
                  variant="primary" 
                 
                  onClick={handleSaveFees}
                  isLoading={isSyncingFees}
                  disabled={isLoadingFees || isSyncingFees}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('settings.save_fees', 'Save Fees')}
                </AnatomyButton>
              </div>
            </div>
          </section>
          
          {/* ========================================== */}
          {/* SECTION 2: FINANCIALS (Admin Only) */}
          {/* ========================================== */}
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
                   {/* Put your existing admin inputs like commission % here */}
                </div>
              </section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/20 shrink-0 flex justify-end gap-3 rounded-b-3xl">
          {isAdminMode && (!restaurant.stripePayoutsEnabled || !restaurant.stripeOnboardingCompleted || !restaurant.stripeChargesEnabled) && (
            <AnatomyButton variant="ghost" isLoading={isSettingUpPaymentLink} onClick={setupPaymentLinkHandler}>
              <Link className="w-4 h-4 mr-2" />
              {t('payments.send_strip_link')}
            </AnatomyButton>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageRestaurantSettingsModal;