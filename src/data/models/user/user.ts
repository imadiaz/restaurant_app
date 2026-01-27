import type { Role } from "./role";

export interface RestaurantLite {
  id: string;
  name: string;
  logoUrl?: string;
}

// La interfaz principal
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string; 
  email?: string; 
  phone: string;
  role: Role; 
  restaurant?: RestaurantLite;
  token?: string; 
}