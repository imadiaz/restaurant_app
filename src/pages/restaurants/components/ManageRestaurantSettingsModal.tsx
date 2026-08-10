import React, { useRef, useState } from 'react';
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
import { useDialogAccessibility } from '../../../hooks/use.dialog.accessibility';

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
  const [localFees, setLocalFees] = useState<CreateRestaurantFeeDto[] | null>(null);
  const editableFees = localFees ?? fees.map((fee) => ({
    name: fee.name,
    description: fee.description || '',
    type: fee.type,
    value: fee.value,
  }));

  const setupPaymentLinkHandler = async () => {
    try {
      await setupPaymentLink({ id: restaurant.id });
    } catch {
      return;
    }
  };

  // --- Dynamic Fee Handlers ---
  const handleAddFee = () => {
    setLocalFees([...editableFees, { name: '', description: '', type: FeeType.FLAT, value: 0 }]);
  };

  const handleRemoveFee = (index: number) => {
    const newFees = [...editableFees];
    newFees.splice(index, 1);
    setLocalFees(newFees);
  };

  const handleFeeChange = <K extends keyof CreateRestaurantFeeDto>(index: number, field: K, val: CreateRestaurantFeeDto[K]) => {
    const newFees = [...editableFees];
    newFees[index] = { ...newFees[index], [field]: val };
    setLocalFees(newFees);
  };

  const handleSaveFees = async () => {
    try {
      await syncRestaurantFees({
        id: restaurant.id,
        data: { fees: editableFees },
      });
      // Optionally call onSuccess or show a local success state
    } catch {
      return;
    }
  };

  const  {updateOperational, isUpdatingOperational} = useRestaurantOperations();
  const { control, register, handleSubmit} = useForm<SettingsFormData>({
    defaultValues: {
      isOpen: restaurant.isOpen,
      averagePrepTimeMin: restaurant.averagePrepTimeMin,
    }
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(isOpen, dialogRef, onClose);

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
    } catch {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="restaurant-settings-title" className="bg-background-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 border-b border-border flex justify-between items-center shrink-0 rounded-t-3xl ${isAdminMode ? 'bg-primary/5' : ''}`}>
          <div>
            <div className="flex items-center gap-2">
              {isAdminMode ? <Shield className="w-5 h-5 text-primary" /> : <Store className="w-5 h-5 text-primary" />}
              <AnatomyText.H3 id="restaurant-settings-title" className="text-lg">
                {isAdminMode ? t('settings.admin_title', 'Admin Settings') : t('settings.operational_title', 'Operational Settings')}
              </AnatomyText.H3>
            </div>
            <AnatomyText.Small className="text-text-muted mt-1">
              {isAdminMode 
                ? t('settings.admin_subtitle', { name: restaurant.name }) 
                : t('settings.operational_subtitle', 'Manage your restaurant parameters')}
            </AnatomyText.Small>
          </div>
          <button onClick={onClose} aria-label={t('common.close')} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <section className="flex flex-col p-6  overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-text-subtle" />
              <AnatomyText.Label className="text-primary">{t('settings.section_operations')}</AnatomyText.Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Toggle Open/Close */}
              <div className="col-span-full bg-surface-muted p-4 rounded-xl flex items-center justify-between border border-border">
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
                      <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background-card after:border-border-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  )}
                />
              </div>
              {/* Prep Time */}
              <AnatomyTextField
                label={t('settings.prep_time')}
                type="number"
                icon={<Clock className="w-4 h-4 text-text-subtle" />}
                {...register('averagePrepTimeMin', { min: 0, required: true })}
                placeholder="20"
              />
            </div>

            <AnatomyButton 
             onClick={handleSubmit(onSubmit)} 
             disabled={isUpdatingOperational}
             // Change color if admin
             className={isAdminMode ? "bg-primary hover:bg-primary-hover text-white border-transparent" : ""}
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
                <Receipt className="w-4 h-4 text-warning" />
                <AnatomyText.Label className="text-warning">
                  {t('settings.section_fees', 'Additional Fees & Surcharges')}
                </AnatomyText.Label>
              </div>
              <AnatomyButton variant="ghost"  onClick={handleAddFee}>
                <Plus className="w-4 h-4 mr-2" />
                {t('settings.add_fee', 'Add Fee')}
              </AnatomyButton>
            </div>

            <div className="bg-warning-surface p-5 rounded-2xl border border-warning/20 space-y-4">
              {isLoadingFees ? (
                <div className="text-center text-text-muted py-4">{t('common.loading')}</div>
              ) : editableFees.length === 0 ? (
                <div className="text-center text-text-muted py-4 text-sm">
                  {t('settings.no_fees', 'No additional fees configured.')}
                </div>
              ) : (
                <div className="space-y-4">
                  {editableFees.map((fee, index) => (
                    <div key={index} className="flex flex-col gap-3 bg-background-card p-4 rounded-xl border border-border shadow-sm">
                      
                      {/* Top Row: Name, Type, Value, Delete */}
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        
                        {/* Name Input */}
                        <div className="flex-1 w-full">
                          <label className="text-xs font-medium text-text-muted mb-1 block">{t('settings.fee_name', 'Fee Name')}</label>
                          <input
                            type="text"
                            placeholder="e.g. Packaging Fee"
                            value={fee.name}
                            onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                            className="w-full text-sm p-2 border border-border rounded-lg focus:ring-primary focus:border-primary outline-none bg-input text-text-main"
                          />
                        </div>

                        {/* Type Dropdown */}
                        <div className="w-full sm:w-32 shrink-0">
                          <label className="text-xs font-medium text-text-muted mb-1 block">{t('common.type', 'Type')}</label>
                          <select
                            value={fee.type}
                            onChange={(e) => handleFeeChange(index, 'type', e.target.value as FeeType)}
                            className="w-full text-sm p-2 border border-border rounded-lg focus:ring-primary outline-none bg-input text-text-main"
                          >
                            <option value={FeeType.FLAT}>Flat ($)</option>
                            <option value={FeeType.PERCENTAGE}>Percent (%)</option>
                          </select>
                        </div>

                        {/* Value Input */}
                        <div className="w-full sm:w-24 shrink-0">
                          <label className="text-xs font-medium text-text-muted mb-1 block">{t('common.value', 'Value')}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={fee.value}
                            onChange={(e) => handleFeeChange(index, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full text-sm p-2 border border-border rounded-lg focus:ring-primary outline-none bg-input text-text-main"
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFee(index)}
                          className="p-2 text-danger hover:bg-danger-surface rounded-lg transition-colors shrink-0"
                          title={t('settings.remove_fee', 'Remove Fee')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bottom Row: Description */}
                      <div className="w-full">
                        <label className="text-xs font-medium text-text-muted mb-1 block">
                          {t('settings.fee_description_label', 'Description (Optional)')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('settings.fee_description_placeholder', 'e.g. Required for eco-friendly containers')}
                          value={fee.description}
                          onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                          className="w-full text-sm p-2 border border-border rounded-lg focus:ring-primary focus:border-primary outline-none bg-input text-text-main"
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
                  <DollarSign className="w-4 h-4 text-primary" />
                  <AnatomyText.Label className="text-primary">
                    {t('settings.section_financials')} (Admin Only)
                  </AnatomyText.Label>
                </div>

                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 space-y-5">
                   {/* Put your existing admin inputs like commission % here */}
                </div>
              </section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface-muted shrink-0 flex justify-end gap-3 rounded-b-3xl">
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
