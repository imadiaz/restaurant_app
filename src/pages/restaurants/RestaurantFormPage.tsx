import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import {  useParams } from "react-router-dom";
import {
  Building2, MapPin, FileText, Phone, 
  Save, Globe,
  Mail
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import type { PriceRange } from "../../data/models/restaurant/restaurant";
import { FILES_PATHS, useImagesUpload } from "../../hooks/images/use.images.upload";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useRestaurants } from "../../hooks/restaurants/use.restaurant";
import { useUsers } from "../../hooks/users/use.users";
import type { UpdateRestaurantDto, CreateRestaurantDto } from "../../service/restaurant.service";
import { useToastStore } from "../../store/toast.store";
import type { AddressResult } from "../../utils/maps/google.maps.utils";
import { ROLES } from "../../config/roles";
import { useTranslation } from "react-i18next";
import { isBlank, isValidEmail } from "../../utils/validation.utils";
import { ImageUploadInput } from "../../components/common/ImageUploadInput";

const GoogleMapsLocationPicker = lazy(() => import("../../components/common/GoogleMapsLocationPicker"));



const RestaurantFormPage: React.FC = () => {
  const {t} = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { 
    createRestaurant, 
    updateRestaurant, 
    getRestaurantById, 
    isLoading: isRestaurantLoading,
    isCreating,
    isUpdating
  } = useRestaurants();
  
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers();
  const { uploadFile, isUploading } = useImagesUpload();
  const addToast = useToastStore((state) => state.addToast);

  const filteredUsers = allUsers.filter((value) => value.role.name == ROLES.ADMIN)
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>("moderate");
  const [avgPrepTime, setAvgPrepTime] = useState<number>(25);
  const [rfc, setRfc] = useState("");
  const [legalName, setLegalName] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [privatePhone, setPrivatePhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [colony, setColony] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [stateGeo, setStateGeo] = useState(""); 
  const [zipCode, setZipCode] = useState("");
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [status, setStatus] = useState("active");
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [isBannerUploaded, setIsBannerUploaded] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const hasLoadedData = useRef(false);
    useEffect(() => {
      hasLoadedData.current = false;
    }, [id]);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        const data = await getRestaurantById(id);
        if (data) {
          setUserId(data.userId);
          setName(data.name);
          setDescription(data.description || "");
          setPriceRange(data.priceRange);
          setAvgPrepTime(data.averagePrepTimeMin);   
          setRfc(data.rfc || "");
          setLegalName(data.legalName || "");
          setPublicPhone(data.publicPhone || "");
          setPrivatePhone(data.privatePhone || "");
          setStreetAddress(data.streetAddress);
          setColony(data.colony);
          setCity(data.city);
          setStateGeo(data.state);
          setZipCode(data.zipCode);
          setLat(Number(data.lat));
          setLng(Number(data.lng));
          setStatus(data.status);
          setEmail(data.email || "");
          if (data.logoUrl) {
            setLogoPreview(data.logoUrl);
            setIsLogoUploaded(true);
          }
          if (data.heroImageUrl) {
            setHeroPreview(data.heroImageUrl || null);
            setIsBannerUploaded(true);
          }

          hasLoadedData.current = true;
        }
      };
      loadData();
    }
  }, [isEditMode, id, getRestaurantById]);

  const handleLocationSelect = (data: AddressResult) => {
    setFieldErrors((errors) => ({ ...errors, location: '' }));
    setStreetAddress(data.streetAddress);
    setColony(data.colony);
    setCity(data.city);
    setStateGeo(data.state);
    setZipCode(data.zipCode);
    setLat(data.lat);
    setLng(data.lng);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (isBlank(name)) nextErrors.name = t('forms.required');
    if (isBlank(userId)) nextErrors.userId = t('forms.required');
    if (isBlank(description)) nextErrors.description = t('forms.required');
    if (isBlank(streetAddress)) nextErrors.streetAddress = t('forms.required');
    if (isBlank(zipCode)) nextErrors.zipCode = t('forms.required');
    if (isBlank(city)) nextErrors.city = t('forms.required');
    if (isBlank(stateGeo)) nextErrors.state = t('forms.required');
    if (isBlank(email)) nextErrors.email = t('forms.required');
    else if (!isValidEmail(email)) nextErrors.email = t('forms.invalid_email');
    if (lat === 0 && lng === 0) nextErrors.location = t('restaurants.validation_select_location');
    if (isBlank(rfc) || rfc.trim().length < 10) nextErrors.rfc = t('restaurants.validation_rfc');
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast(t('restaurants.fields_validation'), "error");
      return;
    }

    let finalLogoUrl = logoPreview || "";
    let finalHeroUrl = heroPreview || "";

    if (logoFile != null && !isLogoUploaded) {
      const url = await uploadFile(logoFile, FILES_PATHS.RestaurantsLogo);
      if (url) {
        finalLogoUrl = url;
        setLogoPreview(url);
        setIsLogoUploaded(true);
      }
    }
    
    if (heroFile != null && !isBannerUploaded) {
      const url = await uploadFile(heroFile, FILES_PATHS.RestaurantsBanner);
      if (url) {
        finalHeroUrl = url;
        setHeroPreview(url);
        setIsBannerUploaded(true);
      }
    }

    try {
      const payloadBase = {
        userId,
        name, description, priceRange,
        averagePrepTimeMin: Number(avgPrepTime),
        streetAddress, colony, city, state: stateGeo, zipCode,
        lat: Number(lat), lng: Number(lng),
        publicPhone, privatePhone, rfc, legalName,
        logoUrl: finalLogoUrl,
        heroImageUrl: finalHeroUrl,
        isOpen: true,
        email
      };

      if (isEditMode && id) {
        // UPDATE
        const payload: UpdateRestaurantDto = { ...payloadBase, status };
        await updateRestaurant({id, data: payload});
      } else {
         if(finalLogoUrl == null || finalLogoUrl == "" || finalHeroUrl == null || finalHeroUrl == "") {
            addToast(t('images.required_image'),"error");
            return;
        }
        const payload: CreateRestaurantDto = payloadBase;
        await createRestaurant(payload);
      }
      goBack();
    } catch {
      return;
    }
  };

  const isLoading = isRestaurantLoading || isUploading || isLoadingUsers || isCreating || isUpdating;

  return (
    <BasePageLayout
      title={isEditMode ? t('restaurants.edit') : t('restaurants.new')}
      subtitle={isEditMode ? `${t('restaurants.managing')} ${name}` : t('restaurants.onboard_new')}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? t('common.loading') : <><Save className="w-4 h-4 mr-2"/> {t('common.save')}</>}
          </AnatomyButton>
        </div>
      }
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Building2 className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">{t('restaurants.general_information')}</AnatomyText.H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <AnatomyTextField 
                   label={t('restaurants.field_name')}
                   value={name} 
                   onChange={e => { setName(e.target.value); setFieldErrors((errors) => ({ ...errors, name: '' })); }}
                   error={fieldErrors.name}
                   placeholder="e.g. Burger King"
                   required
                 />
              </div>

              {/* Owner Selection */}
              <div className="md:col-span-2">
                 <AnatomySelect 
                     label={t('restaurants.field_owner')}
                    value={userId}
                    onChange={e => { setUserId(e.target.value); setFieldErrors((errors) => ({ ...errors, userId: '' })); }}
                    error={fieldErrors.userId}
                 >
                    <option value="">{t('restaurants.select_owner')}</option>
                    {filteredUsers?.map(user => (
                      <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} {` - @${user.username}`}
                      </option>
                    ))}
                 </AnatomySelect>
                 <AnatomyText.Small className="text-xs text-text-muted mt-1 block">
                   * {t('restaurants.field_owner_help')}.
                 </AnatomyText.Small>
              </div>

              <AnatomySelect 
                label={t('restaurants.price_range')}
                value={priceRange}
                onChange={e => setPriceRange(e.target.value as PriceRange)}
              >
                <option value="$">Inexpensive ($)</option>
                <option value="$$">Moderate ($$)</option>
                <option value="$$$">Expensive ($$$)</option>
                <option value="$$$$">Very Expensive ($$$$)</option>
              </AnatomySelect>
              
               <div className="md:col-span-2">
                 <AnatomyTextField 
                   label={t('common.description')}
                   value={description}
                   onChange={e => { setDescription(e.target.value); setFieldErrors((errors) => ({ ...errors, description: '' })); }}
                   error={fieldErrors.description}
                   placeholder="Best burgers in town..."
                 />
               </div>

               <AnatomyTextField 
                   label={t('restaurants.time_preparation')}
                   value={avgPrepTime}
                   type="number"
                   onChange={e => setAvgPrepTime(Number(e.target.value))}
                   placeholder="30"
                 />
            </div>
          </div>

          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <MapPin className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">{t('restaurants.location_and_coordinates')}</AnatomyText.H3>
            </div>

            <div className="mb-6">
                <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-surface-muted" aria-label={t('common.loading')} />}>
                  <GoogleMapsLocationPicker
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                      initialLat={lat}
                      initialLng={lng}
                      onLocationSelect={handleLocationSelect}
                  />
                </Suspense>
                {fieldErrors.location && <p role="alert" className="mt-2 text-xs font-medium text-danger">{fieldErrors.location}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <AnatomyTextField label={t('common.street_address')} value={streetAddress} onChange={e => { setStreetAddress(e.target.value); setFieldErrors((errors) => ({ ...errors, streetAddress: '' })); }} error={fieldErrors.streetAddress} required />
              </div>
              <AnatomyTextField label={t('common.colony')} value={colony} onChange={e => setColony(e.target.value)} />
              <AnatomyTextField label={t('common.zip_code')} value={zipCode} onChange={e => { setZipCode(e.target.value); setFieldErrors((errors) => ({ ...errors, zipCode: '' })); }} error={fieldErrors.zipCode} required />
              <AnatomyTextField label={t('common.city')} value={city} onChange={e => { setCity(e.target.value); setFieldErrors((errors) => ({ ...errors, city: '' })); }} error={fieldErrors.city} required />
              <AnatomyTextField label={t('common.state')} value={stateGeo} onChange={e => { setStateGeo(e.target.value); setFieldErrors((errors) => ({ ...errors, state: '' })); }} error={fieldErrors.state} required />

              <div className="opacity-80">
                <AnatomyTextField 
                    label={t('common.latitude')} 
                    value={lat} 
                    disabled
                    readOnly
                    icon={<Globe className="w-4 h-4 text-text-muted"/>}
                />
              </div>
              <div className="opacity-80">
                <AnatomyTextField 
                    label={t('common.longitude')}
                    value={lng} 
                    readOnly
                    disabled
                    icon={<Globe className="w-4 h-4 text-text-muted"/>}
                />
              </div>
            </div>
          </div>

           <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <FileText className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">{t('restaurants.legal_contact')}</AnatomyText.H3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnatomyTextField label={t('restaurants.rfc')} value={rfc} onChange={e => { setRfc(e.target.value.toUpperCase()); setFieldErrors((errors) => ({ ...errors, rfc: '' })); }} error={fieldErrors.rfc} placeholder="XAXX010101000" minLength={10} maxLength={15} />
               <AnatomyTextField label={t('restaurants.legal_name')} value={legalName} onChange={e => setLegalName(e.target.value)} />
               <AnatomyTextField label={t('restaurants.public_phone')} value={publicPhone} onChange={e => setPublicPhone(e.target.value)} icon={<Phone className="w-4 h-4"/>} />
               <AnatomyTextField label={t('restaurants.private_phone')} value={privatePhone} onChange={e => setPrivatePhone(e.target.value)} icon={<Phone className="w-4 h-4"/>} />
                <AnatomyTextField type="email" label={t('restaurants.email')} value={email} onChange={e => { setEmail(e.target.value); setFieldErrors((errors) => ({ ...errors, email: '' })); }} error={fieldErrors.email} placeholder="example@example.com" icon={<Mail className="w-4 h-4"/>} />

            </div>
           </div>

        </div>

        <div className="space-y-6">
          
          <ImageUploadInput
            label={t('images.upload_logo')}
            initialPreview={logoPreview}
            previewAlt={t('images.logo_preview')}
            sticky={false}
            onFileSelect={(file) => {
              setLogoFile(file);
              setIsLogoUploaded(false);
            }}
          />

          {/* Hero Image Upload */}
          <ImageUploadInput
            label={t('images.upload_cover')}
            initialPreview={heroPreview}
            previewAlt={t('images.cover_preview')}
            shape="landscape"
            sticky={false}
            onFileSelect={(file) => {
              setHeroFile(file);
              setIsBannerUploaded(false);
            }}
          />

          {isEditMode && (
             <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border">
                <AnatomySelect label={t('common.status')} value={status} onChange={e => setStatus(e.target.value)}>
                   <option value="active">{t('common.status_active')}</option>
                   <option value="inactive">{t('common.status_inactive')}</option>
                   <option value="suspended">{t('common.status_suspended')}</option>
                </AnatomySelect>
             </div>
          )}

        </div>

      </div>
    </BasePageLayout>
  );
};

export default RestaurantFormPage;
