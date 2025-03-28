export interface User {
  _key?: string;
  _id?: string;
  _rev?: string;
  email: string;
  name: string;
  password: string; // In a real app, this would be hashed
  createdAt: string;
  updatedAt: string;
}

// When returning user data to clients, omit sensitive information
export type SafeUser = Omit<User, 'password'>; 