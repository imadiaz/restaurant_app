import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Lock,
  AtSign,
  Activity,
  Store,
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyRolesSelect from "../../components/anatomy/AnatomyRolesSelect";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import AnatomyTextFieldPassword from "../../components/anatomy/AnatomyTextFieldPassword";
import { ImageUploadInput } from "../../components/common/ImageUploadInput";
import BasePageLayout from "../../components/layout/BaseLayout";
import { FILES_PATHS, useImagesUpload } from "../../hooks/images/use.images.upload";
import { useUsers } from "../../hooks/users/use.users";
import type { UpdateUserDto, CreateUserDto } from "../../service/user.service";
import { useToastStore } from "../../store/toast.store";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useAuthStore } from "../../store/auth.store";
import { useRestaurants } from "../../hooks/restaurants/use.restaurant";
import { isSuperAdmin } from "../../data/models/user/utils/user.utils";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/app.store";
import { formatMxPhone, stripMxPrefix } from "../../utils/format.phone.utils";



const UserFormPage: React.FC = () => {
  const {t} = useTranslation();
  const {goBack} = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { createUser, updateUser, getUserById, isCreating, isUpdating, isLoading: isLoadingUser } = useUsers();
  const { restaurants, isLoading: loadingRestaurants } = useRestaurants();
  const { uploadFile, isUploading } = useImagesUpload();
  const addToast = useToastStore((state) => state.addToast);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentUser = useAuthStore(state => state.user);
  const { activeRestaurant } = useAppStore((state) => state);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
     activeRestaurant?.id || ''
  );
    const [isImageUploaded,setIsImageUploaded] = useState(false);
  

  
const hasLoadedData = useRef(false);
  useEffect(() => {
    hasLoadedData.current = false;
  }, [id]);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadUser = async () => {
        try {
          const user = await getUserById(id);
          if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setUsername(user.username);
            setEmail(user.email || "");
            setPhone(stripMxPrefix(user.phone));
            setRoleId(user.role?.id);
            setStatus(user.status || "active");
            setImagePreview(user.profileImageUrl || null);
            if(user.profileImageUrl) {
              setIsImageUploaded(true);
            }
            setSelectedRestaurantId(user.restaurantId || "");
            hasLoadedData.current = true;
          }
        } catch (error) {
          goBack();
        }
      };
      loadUser();
    }
  }, [isEditMode, id, getUserById]);

  const handleSave = async () => {
    if (!firstName || !lastName || !phone || !username) {
      addToast(t('users.fields_validation'), "error");
      return;
    }

    if (roleId === undefined) {
      addToast(t('users.validation_role'), "error");
      return;
    }

    if (phone.length < 10) {
      addToast(t('users.validation_phone'), "error");
      return;
    }

    if (!isEditMode || (isEditMode && password.length > 0)) {
       const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
       if (!passwordRegex.test(password)) {
         addToast(t('users.validation_password'), "error");
         return;
       }
    }

    let finalImageUrl = imagePreview || "";

    if (imageFile && imageFile.size > 0 && !isImageUploaded) {
      const uploadedUrl = await uploadFile(imageFile, FILES_PATHS.RestaurantUsers(selectedRestaurantId));
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        setImagePreview(finalImageUrl);
        setIsImageUploaded(true);
      } 
    } else if (!finalImageUrl && !isEditMode) {
      finalImageUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
    }

    try {
      if (isEditMode && id) {
        const updatePayload: UpdateUserDto = {
          firstName,
          lastName,
          username,
          email,
          phone: formatMxPhone(phone),
          roleId,
          status,
          profileImageUrl: finalImageUrl,
          restaurantId: selectedRestaurantId,
        };
        
        if (password) {
            updatePayload.password = password; 
        }
        console.log("User updated", updatePayload);
        await updateUser({id, data: updatePayload});
      } else {
        const createPayload: CreateUserDto = {
          firstName,
          lastName,
          username,
          email,
          phone: formatMxPhone(phone),
          password,
          roleId,
          profileImageUrl: finalImageUrl,
          restaurantId: selectedRestaurantId,
        };
        console.log("User saved", createPayload)
        await createUser(createPayload);
      }
      goBack();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const pageTitle = isEditMode ? t('users.edit') : t('users.add');
  const pageSubtitle = isEditMode ? `${t('users.update_details_for')} ${firstName} ${lastName}` : t('users.create_account');
  const isLoading = isCreating || isUploading || isUpdating || isLoadingUser;

  return (
    <BasePageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? t('common.loading'): isEditMode ? t('common.update') : t('common.save')}
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
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <AnatomyTextField
                label={t('users.last_name')}
                placeholder="e.g. Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <AnatomyTextField
                label={t('forms.username')}
                placeholder="e.g. juan.perez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<AtSign className="w-4 h-4 text-text-muted" />}
                required
              />

              <AnatomyTextField
                label={t('users.phone_number')}
                prefix="+52"
                placeholder="55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4 text-text-muted" />}
                required
                maxLength={15}
              />

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <AnatomyText.Label className="mb-0">
                    {t('users.email_address')}
                  </AnatomyText.Label>
                </div>
                <AnatomyTextField
                  type="email"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">{t('users.role_and_security')}</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">     

                 {isSuperAdmin(currentUser) && (
             <div className="space-y-4 mt-6 md:col-span-2">
                <div className="flex items-center gap-2">
                   <Store className="w-5 h-5 text-text-muted" />
                   <h3 className="font-semibold">{t('users.assigne_restaurant')}</h3>
                </div>

                {loadingRestaurants ? (
                  <p className="text-sm text-gray-500">{t('loading')}</p>
                ) : (
                  <AnatomySelect 
                    className="w-full p-3 border rounded-lg bg-background"
                    value={selectedRestaurantId}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  >
                    <option value="">-- {t('users.select_restaurant')} --</option>
                    {restaurants.map(rest => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name} - {rest.city}
                      </option>
                    ))}
                  </AnatomySelect>
                )}
                <p className="text-xs text-gray-500">
                  {t('users.role_description')}
                </p>
             </div>
           )}

              <div>
                 <AnatomyRolesSelect
                    label={t('users.assigne_role')}
                    value={roleId || ""}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    showAllOption={false}
                    valueMode="id"
                    required
                 />
              </div>

              {isEditMode && <div>
                  <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-text-muted" />
                      <AnatomyText.Label className="mb-0">{t('common.status')}</AnatomyText.Label>
                  </div>
                  <AnatomySelect
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">{t('common.status_active')}</option>
                    <option value="inactive">{t('common.status_inactive')}</option>
                    <option value="suspended">{t('common.status_suspended')}</option>
                  </AnatomySelect>
              </div>}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <AnatomyText.Label className="mb-0">
                    {isEditMode ? t('forms.change_password') : t('forms.password')}
                  </AnatomyText.Label>
                </div>
                <AnatomyTextFieldPassword
                  placeholder={isEditMode ? t('forms.password_description'): "Pass1234!"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditMode} 
                />
                {!isEditMode && (
                  <AnatomyText.Small className="text-xs text-text-muted mt-1 block">
                    {t('users.validation_password')}
                  </AnatomyText.Small>
                )}
              </div>
            </div>
          </div>
        </div>

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

export default UserFormPage;