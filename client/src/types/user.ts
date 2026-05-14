export type UserType = 'customer' | 'admin';

export interface User {
  _id: string;
  email: string;
  name: string;
  user_type: UserType;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupInput {
  email: string;
  name: string;
  password: string;
  address?: string;
}
