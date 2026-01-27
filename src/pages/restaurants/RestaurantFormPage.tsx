import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2, MapPin, FileText, Phone, DollarSign, 
  ImageIcon, Upload, Save, User as UserIcon, Globe
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import type { PriceRange } from "../../data/models/restaurant/restaurant";
import { useImagesUpload } from "../../hooks/images/use.images.upload";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useRestaurants } from "../../hooks/restaurants/use.restaurant";
import { useUsers } from "../../hooks/users/use.users";
import type { UpdateRestaurantDto, CreateRestaurantDto } from "../../service/restaurant.service";
import { useToastStore } from "../../store/toast.store";
import type { AddressResult } from "../../utils/maps/google.maps.utils";
import GoogleMapsLocationPicker from "../../components/common/GoogleMapsLocationPicker";
import { ROLES } from "../../config/roles";



const RestaurantFormPage: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Hooks
  const { 
    createRestaurant, 
    updateRestaurant, 
    getRestaurantById, 
    isLoading: isRestaurantLoading,
    isCreating,
    isUpdating
  } = useRestaurants();
  
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers();
  const { uploadRestaurant, isUploading } = useImagesUpload();
  const addToast = useToastStore((state) => state.addToast);

  const filteredUsers = allUsers.filter((value) => value.role.name == ROLES.ADMIN)

  // --- FORM STATE ---
  // General
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>("moderate");
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [avgPrepTime, setAvgPrepTime] = useState<number>(25);

  // Legal / Contact
  const [rfc, setRfc] = useState("");
  const [legalName, setLegalName] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [privatePhone, setPrivatePhone] = useState("");

  // Location
  const [streetAddress, setStreetAddress] = useState("");
  const [colony, setColony] = useState("");
  const [city, setCity] = useState("");
  const [stateGeo, setStateGeo] = useState(""); 
  const [zipCode, setZipCode] = useState("");
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  
  // Status
  const [status, setStatus] = useState("active");

  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [isBannerUploaded, setIsBannerUploaded] = useState(false);

  // Images
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  // Loading Guard
  const hasLoadedData = useRef(false);
    useEffect(() => {
      hasLoadedData.current = false;
    }, [id]);

  // --- 3. LOAD DATA (Edit Mode) ---
  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        const data = await getRestaurantById(id);
        if (data) {
          setUserId(data.userId);
          setName(data.name);
          setDescription(data.description || "");
          setPriceRange(data.priceRange);
          setCommissionRate(data.commissionRate);
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

  // --- 4. MAP SELECTION HANDLER ---
  const handleLocationSelect = (data: AddressResult) => {
    setStreetAddress(data.streetAddress);
    setColony(data.colony);
    setCity(data.city);
    setStateGeo(data.state);
    setZipCode(data.zipCode);
    setLat(data.lat);
    setLng(data.lng);
  };

  // --- 5. SAVE HANDLER ---
  const handleSave = async () => {
    // Validation
    if (!name || !userId || !streetAddress || !zipCode || !city || !description) {
      addToast("Please fill in required fields (Name, Owner, Address, Zip, City, Description)", "error");
      return;
    }
    
    if (lat === 0 && lng === 0) {
      addToast("Please select a location on the map", "warning");
      return;
    }

    if(rfc == "" || rfc == null || rfc.length < 10) {
        addToast("Invalid format for RFC","error");
        return;
    }

    let finalLogoUrl = logoPreview || "";
    let finalHeroUrl = heroPreview || "";

    if (logoFile != null && !isLogoUploaded) {
      const url = await uploadRestaurant(logoFile);
      console.log("URL LOGO", url);
      if (url) {
        setLogoPreview(url);
        setIsLogoUploaded(true);
      }
    }
    
    if (heroFile != null && !isBannerUploaded) {
      const url = await uploadRestaurant(heroFile);
      console.log("URL BANNER", url);
      if (url) {
        setHeroPreview(url);
        setIsBannerUploaded(true);
      }
    }

    console.log("Hero File", logoFile && !isLogoUploaded);
    console.log("Banner File", heroFile && !isBannerUploaded);

    try {
      const payloadBase = {
        userId,
        name, description, priceRange,
        commissionRate: Number(commissionRate),
        averagePrepTimeMin: Number(avgPrepTime),
        streetAddress, colony, city, state: stateGeo, zipCode,
        lat: Number(lat), lng: Number(lng),
        publicPhone, privatePhone, rfc, legalName,
        logoUrl: finalLogoUrl,
        heroImageUrl: finalHeroUrl,
        isOpen: true,
      };

      if (isEditMode && id) {
        // UPDATE
        const payload: UpdateRestaurantDto = { ...payloadBase, status };
        console.log("Payload", payload);
        await updateRestaurant({id, data: payload});
      } else {
         if(finalLogoUrl == null || finalLogoUrl == "" || finalHeroUrl == null || finalHeroUrl == "") {
            addToast("You need to upload an image and logo","error");
            return;
        }
        const payload: CreateRestaurantDto = payloadBase;
        console.log("Payload", payload);
        await createRestaurant(payload);
      }
      goBack();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = isRestaurantLoading || isUploading || isLoadingUsers || isCreating || isUpdating;

  return (
    <BasePageLayout
      title={isEditMode ? "Edit Restaurant" : "New Restaurant"}
      subtitle={isEditMode ? `Managing ${name}` : "Onboard a new client franchise"}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Processing..." : <><Save className="w-4 h-4 mr-2"/> Save</>}
          </AnatomyButton>
        </div>
      }
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        
        {/* --- LEFT COLUMN (2/3): FORM DATA --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Info */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Building2 className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">General Information</AnatomyText.H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <AnatomyTextField 
                   label="Restaurant Name" 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   placeholder="e.g. Burger King Centro"
                   required
                 />
              </div>

              {/* Owner Selection */}
              <div className="md:col-span-2">
                 <AnatomySelect 
                    label="Restaurant Owner (User)"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                 >
                    <option value="">Select an Owner...</option>
                    {filteredUsers?.map(user => (
                      <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} {` - @${user.username}`}
                      </option>
                    ))}
                 </AnatomySelect>
                 <AnatomyText.Small className="text-xs text-text-muted mt-1 block">
                   * The user who will manage this restaurant.
                 </AnatomyText.Small>
              </div>

              <AnatomySelect 
                label="Price Range"
                value={priceRange}
                onChange={e => setPriceRange(e.target.value as PriceRange)}
              >
                <option value="$">Inexpensive ($)</option>
                <option value="$$">Moderate ($$)</option>
                <option value="$$$">Expensive ($$$)</option>
                <option value="$$$$">Very Expensive ($$$$)</option>
              </AnatomySelect>

              <AnatomyTextField 
                label="Commission Rate (%)"
                type="number"
                value={commissionRate}
                onChange={e => setCommissionRate(Number(e.target.value))}
                min={0} max={100}
              />
              
               <div className="md:col-span-2">
                 <AnatomyTextField 
                   label="Description"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   placeholder="Best burgers in town..."
                 />
               </div>

               <AnatomyTextField 
                   label="Time of preparation in minutes (Ej, 30, 40)"
                   value={avgPrepTime}
                   type="number"
                   onChange={e => setAvgPrepTime(Number(e.target.value))}
                   placeholder="30"
                 />
            </div>
          </div>

          {/* Location - NOW WITH MAP */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <MapPin className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">Location & Coordinates</AnatomyText.H3>
            </div>

            {/* --- MAP COMPONENT --- */}
            <div className="mb-6">
                <GoogleMapsLocationPicker 
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                    initialLat={lat}
                    initialLng={lng}
                    onLocationSelect={handleLocationSelect}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <AnatomyTextField label="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required />
              </div>
              <AnatomyTextField label="Colony" value={colony} onChange={e => setColony(e.target.value)} />
              <AnatomyTextField label="Zip Code" value={zipCode} onChange={e => setZipCode(e.target.value)} required />
              <AnatomyTextField label="City" value={city} onChange={e => setCity(e.target.value)} required />
              <AnatomyTextField label="State" value={stateGeo} onChange={e => setStateGeo(e.target.value)} required />

              {/* Read Only Coordinates (User sets them via Map) */}
              <div className="opacity-80">
                <AnatomyTextField 
                    label="Latitude" 
                    value={lat} 
                    disabled
                    readOnly
                    icon={<Globe className="w-4 h-4 text-text-muted"/>}
                />
              </div>
              <div className="opacity-80">
                <AnatomyTextField 
                    label="Longitude" 
                    value={lng} 
                    readOnly
                    disabled
                    icon={<Globe className="w-4 h-4 text-text-muted"/>}
                />
              </div>
            </div>
          </div>

           {/* Legal & Contact */}
           <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <FileText className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">Legal & Contact</AnatomyText.H3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnatomyTextField label="RFC" value={rfc} onChange={e => setRfc(e.target.value)} placeholder="XAXX010101000" minLength={10} maxLength={15} />
               <AnatomyTextField label="Legal Name" value={legalName} onChange={e => setLegalName(e.target.value)} />
               <AnatomyTextField label="Public Phone" value={publicPhone} onChange={e => setPublicPhone(e.target.value)} icon={<Phone className="w-4 h-4"/>} />
               <AnatomyTextField label="Private Phone" value={privatePhone} onChange={e => setPrivatePhone(e.target.value)} icon={<Phone className="w-4 h-4"/>} />
            </div>
           </div>

        </div>

        {/* --- RIGHT COLUMN (1/3): IMAGES & STATUS --- */}
        <div className="space-y-6">
          
          {/* Logo Upload */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center">
             <AnatomyText.H3 className="mb-2">Logo</AnatomyText.H3>
             <div className="relative group mb-4">
               <div className="w-40 h-40 rounded-full border-4 border-border shadow-inner overflow-hidden relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                 {logoPreview ? (
                   <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center text-text-muted">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Upload Logo</span>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                   <ImageIcon className="w-8 h-8 text-white mb-2" />
                 </div>
               </div>
               <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) { 
                    setLogoFile(file); 
                    setLogoPreview(URL.createObjectURL(file)); 
                    if(isEditMode) {
                      setIsLogoUploaded(false);
                    }
                  }
               }}/>
             </div>
          </div>

          {/* Hero Image Upload */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border">
             <AnatomyText.H3 className="mb-4">Cover Image</AnatomyText.H3>
             <div className="w-full h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                {heroPreview ? (
                   <img src={heroPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                   <div className="text-center text-text-muted">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Upload Cover</span>
                   </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) { 
                    setHeroFile(file); 
                    setHeroPreview(URL.createObjectURL(file)); 
                    if(isEditMode) {
                      setIsBannerUploaded(false);
                    }
                  }
               }}/>
             </div>
          </div>

          {/* Status (Edit Mode Only) */}
          {isEditMode && (
             <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border">
                <AnatomySelect label="Status" value={status} onChange={e => setStatus(e.target.value)}>
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                   <option value="suspended">Suspended</option>
                </AnatomySelect>
             </div>
          )}

        </div>

      </div>
    </BasePageLayout>
  );
};

export default RestaurantFormPage;