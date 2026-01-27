import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Building2, MapPin, 
  User, Phone, FileText, Image as ImageIcon 
} from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import { useToastStore } from '../../store/toast.store';


const AddRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    rfc: '',
    category: 'Fast Food',
    address: '',
    colony: '',
    state: '',
    postalCode: '',
    ownerName: '',
    phone: '',
    cellphone: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.name || !formData.rfc || !formData.address) {
      addToast("Please fill in required fields (Name, RFC, Address)", 'error');
      return;
    }

    console.log("Saving Restaurant:", { ...formData, logo: logoPreview });
    addToast(`${formData.name} created successfully!`, 'success');
    navigate('/admin/restaurants');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <AnatomyText.H1>New Restaurant</AnatomyText.H1>
            <AnatomyText.Subtitle>Onboard a new client franchise</AnatomyText.Subtitle>
          </div>
        </div>
        <div className="flex gap-3">
          <AnatomyButton variant="secondary" onClick={() => navigate(-1)}>Cancel</AnatomyButton>
          <AnatomyButton onClick={handleSave}>Create Restaurant</AnatomyButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN (2/3): FORM DATA --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. General Info */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
              <Building2 className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">General Information</AnatomyText.H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <AnatomyTextField 
                  label="Restaurant Name" 
                  placeholder="e.g. Burger King Downtown"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              {/* <AnatomyTextField 
                label="RFC (Tax ID)" 
                placeholder="e.g. XAXX010101000"
                value={formData.rfc}
                onChange={(e) => handleChange('rfc', e.target.value)}
                icon={FileText}
              /> */}

              <AnatomySelect 
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="Fast Food">Fast Food</option>
                <option value="Fine Dining">Fine Dining</option>
                <option value="Cafe">Cafe / Coffee Shop</option>
                <option value="Bar & Grill">Bar & Grill</option>
                <option value="Pizza">Pizza</option>
                <option value="Sushi">Sushi / Asian</option>
              </AnatomySelect>
            </div>
          </div>

          {/* 2. Location Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
              <MapPin className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">Location Address</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <AnatomyTextField 
                  label="Street Address" 
                  placeholder="e.g. Av. Reforma 123"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <AnatomyTextField 
                label="Colony (Neighborhood)" 
                placeholder="e.g. Centro Historico"
                value={formData.colony}
                onChange={(e) => handleChange('colony', e.target.value)}
              />

              <AnatomyTextField 
                label="Postal Code" 
                placeholder="e.g. 06000"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />

              <AnatomySelect 
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              >
                <option value="">Select State...</option>
                <option value="CDMX">Ciudad de México</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Nuevo Leon">Nuevo León</option>
                <option value="Yucatan">Yucatán</option>
                {/* Add more states as needed */}
              </AnatomySelect>
            </div>
          </div>

          {/* 3. Owner Contact */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
              <User className="w-5 h-5 text-primary" />
              <AnatomyText.H3 className="mb-0">Owner / Manager Contact</AnatomyText.H3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <AnatomyTextField 
                  label="Full Name" 
                  placeholder="e.g. Roberto Gomez"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                />
              </div>

              {/* <AnatomyTextField 
                label="Phone (Landline)" 
                placeholder="(55) 1234 5678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                icon={Phone}
              />

              <AnatomyTextField 
                label="Cellphone (Mobile)" 
                placeholder="(55) 9876 5432"
                value={formData.cellphone}
                onChange={(e) => handleChange('cellphone', e.target.value)}
                icon={Phone}
              /> */}
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN (1/3): LOGO & PREVIEW --- */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center sticky top-6">
             <div className="mb-4 p-3 bg-primary/10 text-primary rounded-full">
               <ImageIcon className="w-6 h-6" />
             </div>
             <AnatomyText.H3 className="mb-2">Brand Logo</AnatomyText.H3>
             <AnatomyText.Body className="text-gray-500 text-sm mb-6">
               This logo will appear on the sidebar and receipts.
             </AnatomyText.Body>
             
             {/* Circular Upload Area */}
             <div className="relative group mb-6">
               <div className="w-48 h-48 rounded-full border-4 border-gray-100 shadow-inner overflow-hidden relative bg-gray-50 flex items-center justify-center">
                 {logoPreview ? (
                   <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-bold text-gray-300">
                     {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                   </span>
                 )}
                 
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                   <Upload className="w-8 h-8 text-white mb-2" />
                   <span className="text-white text-xs font-bold uppercase tracking-wider">Change Logo</span>
                 </div>
               </div>
               
               <input 
                 type="file" 
                 accept="image/*"
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                 onChange={handleLogoChange}
               />
             </div>

        

          </div>
        </div>

      </div>
    </div>
  );
};

export default AddRestaurantPage;