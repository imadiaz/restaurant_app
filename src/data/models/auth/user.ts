// src/models/User.ts

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

  constructor(data: IUser) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.avatarUrl = data.avatarUrl;
    this.token = data.token;
  }

  // Helper method to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Helper to check permissions
  get isAdmin(): boolean {
    return this.role === 'admin';
  }
}