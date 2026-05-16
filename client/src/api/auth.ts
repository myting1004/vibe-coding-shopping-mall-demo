import { apiClient } from '@/lib/apiClient';
import type { SignupInput, User } from '@/types/user';

interface ItemResponse {
  data: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<User> {
  const res = await apiClient.post<ItemResponse>('/auth/login', input);
  return res.data.data;
}

export async function register(input: SignupInput): Promise<User> {
  const res = await apiClient.post<ItemResponse>('/auth/register', input);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<ItemResponse>('/auth/me');
  return res.data.data;
}
