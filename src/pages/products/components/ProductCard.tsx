import { ImageOff, CheckCircle, XCircle, Eye, Edit, ExternalLink, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import AnatomySwitcher from "../../../components/anatomy/AnatomySwitcher";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { Product } from "../../../data/models/products/product";

interface ProductCardProps {
  product: Product;
  isLoading?: boolean;
  onEdit: () => void;
  onViewDetails: () => void;
  onToggleAvailability: (isAvailable: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isLoading,
  onEdit, 
  onViewDetails, 
  onToggleAvailability, 
}) => {
    const {t} = useTranslation();
    const price = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(product.price);
  
  const categoryNames = product.menuSections?.map((value) => value.name).filter(Boolean) || [];

  if (categoryNames.length === 0) categoryNames.push('Uncategorized');

  return (
    <div className="bg-background-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative">
       <div className="h-44 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.imageUrl ? (
             <>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-50" />
             </>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-text-muted">
                <ImageOff className="w-8 h-8 opacity-50" />
             </div>
          )}

          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
             <AnatomyTag variant="primary">
                {categoryNames[0]}
             </AnatomyTag>
             {categoryNames.length > 1 && (
                <AnatomyTag variant="primary">
                   +{categoryNames.length - 1}
                </AnatomyTag>
             )}
          </div>


          <div className="absolute bottom-3 right-3">
             {!product.isAvailable && <AnatomyTag variant="error" className="mr-2">
                {t('products.sold_out')}
             </AnatomyTag>}
             <AnatomyTag variant="success">
                {price}
             </AnatomyTag>
          </div>
       </div>

       <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-5">
             <AnatomyText.H3 className="text-lg mb-1 line-clamp-1" title={product.name}>
                {product.name}
             </AnatomyText.H3>
             <AnatomyText.Body className="text-xs text-text-muted line-clamp-2 h-9 leading-relaxed" title={product.description}>
                {product.description || t('products.no_description')}
             </AnatomyText.Body>
          </div>

          <div className="mt-auto space-y-4">
             <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl">
                <AnatomySwitcher
                  isLoading={isLoading}
                  disabled={isLoading}
                   value={product.isAvailable ? "true" : "false"}
                   onChange={(val) => onToggleAvailability(val === "true")}
                   options={[
                      { 
                        value: "true", 
                        label: t('products.available'), 
                        icon: <CheckCircle className="w-3.5 h-3.5" /> 
                      },
                      { 
                        value: "false", 
                        label: t('products.sold_out'), 
                        icon: <XCircle className="w-3.5 h-3.5" /> 
                      }
                   ]}
                />
             </div>

             <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <AnatomyButton 
                   variant="primary"
                   onClick={onEdit} 
                   className="h-10 text-xs px-0"
                >
                   <Edit className="w-4 h-4 mr-2" /> {t('common.edit')}
                </AnatomyButton>

                   <AnatomyButton 
                   variant="secondary" 
                   onClick={onViewDetails} 
                   className="h-10 text-xs px-0"
                >
                   <ExternalLink className="w-4 h-4 mr-2" /> {t('common.details')}
                </AnatomyButton>
             </div>

          </div>
       </div>
    </div>
  );
};

export default ProductCard;