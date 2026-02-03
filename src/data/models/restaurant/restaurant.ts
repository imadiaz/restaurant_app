import type { User } from "../user/user";

export const PriceRange = {
  INEXPENSIVE: 'inexpensive',
  MODERATE: 'moderate',
  EXPENSIVE: 'expensive',
  VERY_EXPENSIVE: 'very_expensive',
} as const;

export type PriceRange = typeof PriceRange[keyof typeof PriceRange];

export interface Restaurant {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  name: string;
  description?: string;
  email?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  priceRange: PriceRange;
  rfc?: string;
  legalName?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  streetAddress: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  averagePrepTimeMin: number;
  stripeAccountId?: string;
  stripeOnboardingCompleted: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  commissionRate: number;
  publicPhone?: string;
  privatePhone?: string;
  status: string;
}