// Inside src/pages/ProductsPage.tsx
import { useNavigate } from 'react-router-dom';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import { useToastStore } from '../../store/toast.store';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { useState } from 'react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import { Edit, Eye, Plus, SlidersHorizontal } from 'lucide-react';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import PageHeader from '../../components/common/PageHeader';
import ProductDetailModal from './ProductDetailModal';



// --- MOCK DATA ---
// Matches the structure from your Add Product form
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Truffle Mushroom Burger',
    category: 'Burgers',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
    description: 'Swiss cheese, truffle mayo, sautéed mushrooms.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60',
    description: 'Classic tomato sauce, fresh mozzarella, basil.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    category: 'Salads',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60',
    description: 'Romaine lettuce, parmesan, croutons, caesar dressing.',
    status: 'out_of_stock'
  },
  {
    id: '4',
    name: 'Spicy Chicken Wings',
    category: 'Starters',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=60',
    description: 'Served with blue cheese dip and celery.',
    status: 'active'
  },
  {
    id: '5',
    name: 'Double Cheeseburger',
    category: 'Burgers',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60',
    description: 'Two beef patties, cheddar cheese, pickles, onions.',
    status: 'active'
  },
];

// --- COMPONENT: PRODUCT CARD ---
const ProductCard = ({ product, onViewDetails }: { product: any, onViewDetails: () => void }) => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  

  const handleEdit = () => {
    navigate('/dashboard/products/add'); 
  };


  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all duration-300">
      
      {/* 1. Image Area */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md
            ${product.status === 'active' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-gray-500/90 text-white'}
          `}>
            {product.status === 'active' ? 'Active' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 space-y-2 px-4">
        <div className="flex justify-between items-start">
          <AnatomyText.Label className="text-primary">{product.category}</AnatomyText.Label>
          <AnatomyText.H3 className="text-lg">${product.price.toFixed(2)}</AnatomyText.H3>
        </div>
        
        <AnatomyText.H3 className="text-base line-clamp-1" title={product.name}>
          {product.name}
        </AnatomyText.H3>
        
        <AnatomyText.Body className="text-xs line-clamp-2 h-10">
          {product.description}
        </AnatomyText.Body>
      </div>

      {/* 3. Actions Footer */}
      <div className="mt-2 grid grid-cols-2 gap-3 px-4 pb-4">
        {/* DETAILS BUTTON (Secondary) */}
        <AnatomyButton 
          variant="secondary" 
          onClick={onViewDetails}
          className="px-0 py-2 text-xs" // Override padding for compact card
        >
          <Eye className="w-4 h-4 mr-2" />
          Details
        </AnatomyButton>

        {/* EDIT BUTTON (Primary) */}
        <AnatomyButton 
          onClick={handleEdit}
          className="px-0 py-2 text-xs"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </AnatomyButton>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Update Handler
  const handleOpenDetails = (product: typeof MOCK_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      
      <PageHeader title={"Products"} subtitle={"Manage your menu items catalog"} showNavBack={false} actions={
         <AnatomyButton onClick={() => navigate('add')}>
            <Plus className="w-5 h-5 mr-2" />
            Add New Dish
          </AnatomyButton>
      } />

      {/* --- CONTROLS BAR --- */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        
        {/* Search */}
        <div className="w-full md:flex-1">
          <AnatomySearchBar
            placeholder="Search by product name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="w-full md:w-64 flex items-center gap-2">
          <div className="text-gray-400">
             <SlidersHorizontal className="w-5 h-5" />
          </div>
          <AnatomySelect
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-none bg-gray-50" // Simple style override for filter context
          >
            <option value="All">All Categories</option>
            <option value="Burgers">Burgers</option>
            <option value="Pizza">Pizza</option>
            <option value="Salads">Salads</option>
            <option value="Drinks">Drinks</option>
          </AnatomySelect>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="flex-1">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onViewDetails={() => handleOpenDetails(product)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
            <AnatomyText.Subtitle>No products found matching your search.</AnatomyText.Subtitle>
            <AnatomyButton 
              variant="ghost" 
              onClick={() => {setSearchQuery(''); setCategoryFilter('All');}} 
              className="mt-4"
            >
              Clear Filters
            </AnatomyButton>
          </div>
        )}
      </div>

<ProductDetailModal
         isOpen={isModalOpen}
         product={selectedProduct}
         onClose={() => setIsModalOpen(false)}
       />
    </div>
  );
};

export default ProductsPage;