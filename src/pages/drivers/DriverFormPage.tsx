import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import AnatomyTextFieldPassword from "../../components/anatomy/AnatomyTextFieldPassword";
import { ImageUploadInput } from "../../components/common/ImageUploadInput";
import BasePageLayout from "../../components/layout/BaseLayout";
import { FILES_PATHS, useImagesUpload } from "../../hooks/images/use.images.upload";
import { useDrivers } from "../../hooks/drivers/use.drivers"; // ✅ Switched hook
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useToastStore } from "../../store/toast.store";
import type { CreateDriverDto } from "../../service/drivers.service";
import { useAppStore } from "../../store/app.store";
import { formatMxPhone, stripMxPrefix } from "../../utils/format.phone.utils";
import { hasMinimumDigits, isBlank, isStrongPassword, isValidEmail } from "../../utils/validation.utils";

const DriverFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { 
    createDriver, 
    updateDriver, 
    getDriverById, 
    isCreating, 
    isUpdating, 
    isLoading: isLoadingDriver 
  } = useDrivers();

  const { uploadFile, isUploading } = useImagesUpload();
  const addToast = useToastStore((state) => state.addToast);
  const { activeRestaurant } = useAppStore();
  const [isImageUploaded,setIsImageUploaded] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
      activeRestaurant?.id || ''
  );

  const hasLoadedData = useRef(false);

  useEffect(() => {
    hasLoadedData.current = false;
  }, [id]);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadDriver = async () => {
        try {
          const driver = await getDriverById(id);
          if (driver) {
            setFirstName(driver.firstName); 
            setLastName(driver.lastName);
            setEmail(driver.user?.email || ""); 
            setPhone(stripMxPrefix(driver.phone));
            setImagePreview(driver.profileImageUrl || driver.user?.profileImageUrl || null);
            if(driver.profileImageUrl || driver.user.profileImageUrl) {
              setIsImageUploaded(true);
            }
            setSelectedRestaurantId(driver.restaurantId || "");
            hasLoadedData.current = true;
          }
        } catch {
          goBack();
        }
      };
      loadDriver();
    }
  }, [isEditMode, id, getDriverById, goBack]);

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (isBlank(firstName)) nextErrors.firstName = t('forms.required');
    if (isBlank(lastName)) nextErrors.lastName = t('forms.required');
    if (isBlank(phone)) nextErrors.phone = t('forms.required');
    if (isBlank(email)) nextErrors.email = t('forms.required');
    else if (!isValidEmail(email)) nextErrors.email = t('forms.invalid_email');
    if (phone && !hasMinimumDigits(phone, 10)) nextErrors.phone = t('users.validation_phone');
    if ((!isEditMode || password.length > 0) && !isStrongPassword(password)) {
      nextErrors.password = t('users.validation_password');
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      addToast(t('users.fields_validation'), "error");
      return;
    }

    let finalImageUrl = imagePreview || "";
    if (imageFile && imageFile.size > 0 && !isImageUploaded) {
      const uploadedUrl = await uploadFile(imageFile, FILES_PATHS.Drivers(selectedRestaurantId));
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        setImagePreview(finalImageUrl);
        setIsImageUploaded(true);
      } 
    } else if (!finalImageUrl && !isEditMode) {
      finalImageUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
    } 

    try {
      const payload: CreateDriverDto = {
        firstName,
        lastName,
        email,
        phone: formatMxPhone(phone),
        profileImageUrl: finalImageUrl,
        restaurantId: selectedRestaurantId,
        ...(password ? { password } : {}),
      };

      if (isEditMode && id) {
        await updateDriver({ id, data: payload });
      } else {
        await createDriver(payload);
      }
      goBack();
    } catch (error) {
      console.error("Error saving driver:", error);
      // Error handling is usually done in the hook/service, but logging here helps
    }
  };

  const pageTitle = isEditMode ? t('drivers.edit') : t('drivers.add');
  const pageSubtitle = isEditMode 
    ? `${t('users.update_details_for')} ${firstName} ${lastName}` 
    : t('users.create_account');
    
  const isLoading = isCreating || isUploading || isUpdating || isLoadingDriver;

  return (
    <BasePageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? t('common.loading') : t('common.save')}
          </AnatomyButton>
        </div>
      }
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">{t('users.personal_information')}</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnatomyTextField
                label={t('users.first_name')} 
                placeholder="e.g. Juan"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setFieldErrors((errors) => ({ ...errors, firstName: '' })); }}
                error={fieldErrors.firstName}
                required
              />
              <AnatomyTextField
                label={t('users.last_name')}
                placeholder="e.g. Pérez"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setFieldErrors((errors) => ({ ...errors, lastName: '' })); }}
                error={fieldErrors.lastName}
                required
              />

              <AnatomyTextField
                label={t('drivers.phone')}
                prefix="+52"
                placeholder="55 1234 5678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFieldErrors((errors) => ({ ...errors, phone: '' })); }}
                error={fieldErrors.phone}
                icon={<Phone className="w-4 h-4 text-text-muted" />}
                required
                maxLength={15}
              />

              
            </div>
            <AnatomyTextField
                type="email"
                label={t('users.email')}
                placeholder="driver@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((errors) => ({ ...errors, email: '' })); }}
                error={fieldErrors.email}
                icon={<Mail className="w-4 h-4 text-text-muted" />}
                required
              />
          </div>

          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">{t('users.role_and_security')}</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 gap-6">      
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <AnatomyText.Label className="mb-0">
                    {isEditMode ? t('forms.change_password') : t('forms.password')}
                  </AnatomyText.Label>
                </div>
                <AnatomyTextFieldPassword
                  placeholder={isEditMode ? t('forms.password_description') : "Pass1234!"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((errors) => ({ ...errors, password: '' })); }}
                  error={fieldErrors.password}
                  helperText={isEditMode ? t('forms.password_description') : t('users.validation_password')}
                  required={!isEditMode} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="space-y-6">
          <ImageUploadInput
             onFileSelect={(file) => {
                setImageFile(file);
                setIsImageUploaded(false);
             }}
             initialPreview={imagePreview}
          />
        </div>
        
      </div>
    </BasePageLayout>
  );
};

export default DriverFormPage;
