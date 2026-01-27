import type { Role } from "./role";

export interface RestaurantLite {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string; 
  profileImageUrl?: string;
  email?: string; 
  phone: string;
  role: Role; 
  status: string;
  restaurant?: RestaurantLite;
  token?: string; 
}