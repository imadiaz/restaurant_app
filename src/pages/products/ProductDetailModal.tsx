import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Edit, Tag, Clock, Flame, Info } from 'lucide-react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';


// Reuse the type or import it if you have a types file
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  status: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  // Handler for closing when clicking outside (Backdrop)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    // In a real app: navigate(`/dashboard/products/edit/${product.id}`)
    navigate('/dashboard/products/add');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      {/* MODAL CARD */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. HERO IMAGE HEADER */}
        <div className="relative h-64 bg-gray-100 shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          
          {/* Close Button (Absolute) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full text-gray-800 shadow-sm transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Badge (Absolute) */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`
              px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm flex items-center gap-1
              ${product.status === 'active' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-800 text-white'}
            `}>
              {product.status === 'active' ? 'Active' : 'Out of Stock'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800 shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3" /> {product.category}
            </span>
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div className="p-8 overflow-y-auto">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-6">
            <div className="max-w-[70%]">
              <AnatomyText.H1 className="text-2xl mb-1">{product.name}</AnatomyText.H1>
              <AnatomyText.Small className="text-gray-400">ID: #{product.id.padStart(4, '0')}</AnatomyText.Small>
            </div>
            <div className="text-right">
              <AnatomyText.H1 className="text-3xl text-primary">${product.price.toFixed(2)}</AnatomyText.H1>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <AnatomyText.Label className="mb-2 block">Description</AnatomyText.Label>
            <AnatomyText.Body className="text-gray-600 text-base">
              {product.description}
            </AnatomyText.Body>
          </div>

          {/* Info Grid (Mock Data for Visuals) */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
              <div className="p-2 bg-white rounded-full text-orange-500 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <AnatomyText.Label className="text-orange-800/70 mb-0">Calories</AnatomyText.Label>
                <p className="font-bold text-gray-800">320 kcal</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <div className="p-2 bg-white rounded-full text-blue-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <AnatomyText.Label className="text-blue-800/70 mb-0">Prep Time</AnatomyText.Label>
                <p className="font-bold text-gray-800">15-20 min</p>
              </div>
            </div>
          </div>

          {/* Ingredients / Modifiers Mock */}
          <div>
            <AnatomyText.Label className="mb-3 block">Ingredients & Options</AnatomyText.Label>
            <div className="flex flex-wrap gap-2">
              {['Sesame Bun', 'Cheddar Cheese', 'Beef Patty', 'Pickles', 'Special Sauce'].map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center text-gray-400 text-sm">
            <Info className="w-4 h-4 mr-2" />
            Last updated 2 days ago
          </div>
          
          <div className="flex gap-3">
            <AnatomyButton variant="secondary" onClick={onClose}>
              Close
            </AnatomyButton>
            <AnatomyButton onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </AnatomyButton>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;