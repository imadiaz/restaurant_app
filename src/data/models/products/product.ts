// 1. Interfaces Base (Espejo de BaseUUIDEntity)
export interface BaseEntity {
  id: string;
  createdAt: string; // Las fechas suelen llegar como ISO String del backend
  updatedAt: string;
  status?: 'active' | 'inactive' | 'suspended'; 
}

// 2. Interfaces de Modificadores (Ingredientes)
export interface ModifierOption extends BaseEntity {
  name: string;
  price: number;
  maxQuantity?: number; // Opcional
  isAvailable: boolean;
  productId?: string;
  modifierGroupId?: string;
  // No necesitamos 'groupId' aquí a menos que lo uses explícitamente en el front
}

export interface ModifierGroup extends BaseEntity {
 name: string;
  minSelected: number;
  maxSelected: number;
  isRequired: boolean;
  options: ModifierOption[];
}

// 3. Interface de Sección de Menú (Simplificada para el producto)
export interface MenuSection extends BaseEntity {
  name: string;
  restaurantId: string;
  sortOrder?: number;
}

// 4. INTERFACE PRINCIPAL DEL PRODUCTO
export interface Product extends BaseEntity {
  // --- Relaciones ---
  restaurantId: string;
  // restaurant?: Restaurant; // Descomentar si tu API devuelve el objeto restaurante expandido
  
  // --- Datos Básicos ---
  name: string;
  description?: string; // El signo ? indica que puede ser null o undefined
  imageUrl?: string;
  
  // --- Precio y Valor ---
  price: number;
  rating: number;
  ratingCount: number;
  
  // --- Logística ---
  prepTimeMin?: number;
  prepTimeMax?: number;
  isAvailable: boolean;

  // --- Relaciones Complejas (Arrays) ---
  modifierGroups: ModifierGroup[];
  menuSections: MenuSection[]; // Ahora es un array gracias al Many-to-Many
  
  // promotions?: any[]; // Puedes definir la interfaz si la usas
}