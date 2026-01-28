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
import { useImagesUpload } from "../../hooks/images/use.images.upload";
import { useUsers } from "../../hooks/users/use.users";
import type { UpdateUserDto, CreateUserDto } from "../../service/user.service";
import { useToastStore } from "../../store/toast.store";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useAuthStore } from "../../store/auth.store";
import { useRestaurants } from "../../hooks/restaurants/use.restaurant";
import { isSuperAdmin } from "../../data/models/user/utils/user.utils";



const UserFormPage: React.FC = () => {
  const {goBack} = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { createUser, updateUser, getUserById, isCreating, isUpdating } = useUsers();
  const { restaurants, isLoading: loadingRestaurants } = useRestaurants();
  const { upload, isUploading } = useImagesUpload();
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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    !isSuperAdmin(currentUser) ? currentUser?.restaurant?.id || '' : ''
  );

  
const hasLoadedData = useRef(false);
  useEffect(() => {
    hasLoadedData.current = false;
  }, [id]);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadUser = async () => {
        try {
          const user = await getUserById(id);
          console.log("User found ", user);
          if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setUsername(user.username);
            setEmail(user.email || "");
            setPhone(user.phone);
            setRoleId(user.role?.id);
            setStatus(user.status || "active");
            setImagePreview(user.profileImageUrl || null);
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
      addToast("Please fill in required fields (Name, Phone, Username)", "error");
      return;
    }

    if (roleId === undefined) {
      addToast("You must select a role", "error");
      return;
    }

    if (phone.length < 10) {
      addToast("Phone number must be at least 10 digits", "error");
      return;
    }

    if (!isEditMode || (isEditMode && password.length > 0)) {
       const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
       if (!passwordRegex.test(password)) {
         addToast("Password must contain Uppercase, Lowercase, Number, and Symbol", "error");
         return;
       }
    }

    let finalImageUrl = imagePreview || "";

    if (imageFile && imageFile.size > 0 && imagePreview == null) {
      const uploadedUrl = await upload(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        setImagePreview(finalImageUrl);
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
          phone,
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
        goBack();
      } else {

        const createPayload: CreateUserDto = {
          firstName,
          lastName,
          username,
          email,
          phone,
          password,
          roleId,
          profileImageUrl: finalImageUrl,
          restaurantId: selectedRestaurantId,
        };
        console.log("User saved", createPayload)
        await createUser(createPayload);
        handleClearInputs();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      addToast(isEditMode ? "Failed to update user" : "Failed to create user", "error");
    }
  };

  const handleClearInputs = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRoleId(undefined);
    setImageFile(null);
    setImagePreview(null);
  };

  const pageTitle = isEditMode ? "Edit User" : "Add New User";
  const pageSubtitle = isEditMode ? `Update details for ${firstName} ${lastName}` : "Create account credentials";
  const isLoading = isCreating || isUploading || isUpdating;

  return (
    <BasePageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Account"}
          </AnatomyButton>
        </div>
      }
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: FORM DATA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Personal Information */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">Personal Information</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnatomyTextField
                label="First Name"
                placeholder="e.g. Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <AnatomyTextField
                label="Last Name"
                placeholder="e.g. Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <AnatomyTextField
                label="Username"
                placeholder="e.g. juan.perez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<AtSign className="w-4 h-4 text-text-muted" />}
                required
              />

              <AnatomyTextField
                label="Phone Number"
                placeholder="+52 55 1234 5678"
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
                    Email Address (Optional)
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

          {/* 2. Role & Security */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">Role & Security</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">     

                 {isSuperAdmin(currentUser) && (
             <div className="space-y-4 mt-6 md:col-span-2">
                <div className="flex items-center gap-2">
                   <Store className="w-5 h-5 text-text-muted" />
                   <h3 className="font-semibold">Asignar Restaurante</h3>
                </div>

                {loadingRestaurants ? (
                  <p className="text-sm text-gray-500">Cargando restaurantes...</p>
                ) : (
                  <AnatomySelect 
                    className="w-full p-3 border rounded-lg bg-background"
                    value={selectedRestaurantId}
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  >
                    <option value="">-- Selecciona un Restaurante --</option>
                    {restaurants.map(rest => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name} - {rest.city}
                      </option>
                    ))}
                  </AnatomySelect>
                )}
                <p className="text-xs text-gray-500">
                  Este usuario solo tendrá acceso a los datos de este local.
                </p>
             </div>
           )}

              {/* Role Select */}
              <div>
                 <AnatomyRolesSelect
                    label="Assign Role"
                    value={roleId || ""}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    showAllOption={false}
                    valueMode="id"
                    required
                 />
              </div>

              {/* Status Select (New) */}
              {isEditMode && <div>
                  <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-text-muted" />
                      <AnatomyText.Label className="mb-0">Account Status</AnatomyText.Label>
                  </div>
                  <AnatomySelect
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </AnatomySelect>
              </div>}

              {/* Password Field */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <AnatomyText.Label className="mb-0">
                    {isEditMode ? "Change Password" : "Password"}
                  </AnatomyText.Label>
                </div>
                <AnatomyTextFieldPassword
                  placeholder={isEditMode ? "Leave blank to keep current password" : "Pass1234!"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditMode} // Required only on create
                />
                {!isEditMode && (
                  <AnatomyText.Small className="text-xs text-text-muted mt-1 block">
                    Must contain Upper, Lower, Number & Symbol.
                  </AnatomyText.Small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IMAGE UPLOAD */}
        <div className="space-y-6">
          <ImageUploadInput
             onFileSelect={(file) => {
                setImageFile(file);
                setImagePreview(null);
             }}
             initialPreview={imagePreview}
          />
        </div>
        
      </div>
    </BasePageLayout>
  );
};

export default UserFormPage;