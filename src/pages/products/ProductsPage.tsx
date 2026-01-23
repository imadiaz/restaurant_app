// Inside src/pages/ProductsPage.tsx
import { useNavigate } from 'react-router-dom';
import AnatomyButton from '../../components/anatomy/AnatomyButton';

const ProductsPage = () => {
  const navigate = useNavigate();
  // ...
  return (
    // ...
    <AnatomyButton onClick={() => {
     navigate('add');
    }}>+ Add Product</AnatomyButton>
    // ...
  );
}

export default ProductsPage;