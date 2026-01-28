export interface MenuSection {
  id: string;
  name: string;
  restaurantId: string;
  sortOrder: number;
  status: 'active' | 'inactive' | 'suspended'
}