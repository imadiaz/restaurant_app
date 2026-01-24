import type { LoginCredentials } from "../data/models/auth/loginCredentials";
import { User, type IUser } from "../data/models/auth/user";




export const authService = {
  
  async login(credentials: LoginCredentials): Promise<User> {
    // 1. Call the API
    // const response = await axiosClient.post<IUser>('/auth/login', credentials);
    
    // MOCKING THE SERVER RESPONSE FOR NOW (Remove this when you have a real backend)
    // simulating network delay...
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const mockResponseData: IUser = {
      id: 'u_123',
      email: credentials.email,
      firstName: 'Immanuel',
      lastName: 'Diaz',
      role:  'super_admin',
      token: 'fake-jwt-token-xyz',
      avatarUrl: 'https://i.pravatar.cc/150?u=u_123'
    };
    
    // 2. Transform raw data into the Class Model
    return new User(mockResponseData);
  },

  async logout(): Promise<void> {
    // Optional: Call server to invalidate token
    // await axiosClient.post('/auth/logout');
  }
};