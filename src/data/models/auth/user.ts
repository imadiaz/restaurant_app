// src/models/User.ts

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  restaurantId?: string;
  avatarUrl?: string;
  token: string; // The JWT token from the server
}

export class User implements IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  token: string;
  restaurantId?: string;

  constructor(data: IUser) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.avatarUrl = data.avatarUrl;
    this.token = data.token;
    this.restaurantId = data.restaurantId;
  }

  // Helper method to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}