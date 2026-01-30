import type { Restaurant } from "../restaurant/restaurant";
import type { Role } from "./role";


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
  restaurantId?: string;
  restaurant?: Restaurant;
  token?: string; 
  refreshToken?: string;
}