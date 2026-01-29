// Inside src/pages/ProductsPage.tsx
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { useMemo, useState } from 'react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import { CheckCircle, Edit, Eye, Filter, ImageOff, Plus, SlidersHorizontal, Utensils, XCircle } from 'lucide-react';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import { useTranslation } from 'react-i18next';
import AnatomyTag from '../../components/anatomy/AnatomyTag';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { useMenuSections } from '../../hooks/restaurants/use.menu.section';
import { useProducts } from '../../hooks/products/use.products';
import AnatomySwitcher from '../../components/anatomy/AnatomySwitcher';
import ProductCard from './components/ProductCard';
import { Routes } from '../../config/routes';


const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { products, isLoading, toggleAvailability, isUpdaingStatus } = useProducts();
  const { sections } = useMenuSections();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
          (p && p.menuSections.map((e) => e.id).includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleToggleVisibility = async(value: boolean, id: string) => {
   await toggleAvailability({ id: id, isAvailable: value })
  }

  return (
    <BasePageLayout
      title={t('products.products')}
      subtitle={t('products.description')}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.ProudctAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t('products.add')}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filteredProducts.length === 0 && !isLoading}
      renderControls={
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1">
             <AnatomySearchBar 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t('common.search')}
             />
          </div>
          <div className="w-full md:w-64">
             <AnatomySelect 
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
              >
                 <option value="all">{t('products.all_categories')}</option>
                 {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                 ))}
              </AnatomySelect>
          </div>
        </div>
      }
      emptyLabel={t('products.empty')}
      emptyIcon={Utensils}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id} 
            product={product}
            onEdit={() => navigateTo(Routes.ProudctEdit(product.id))}
            onToggleAvailability={(value: boolean) => handleToggleVisibility(value, product.id)}
            onViewDetails={() => {}}
            isLoading={isUpdaingStatus}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

export default ProductsPage;