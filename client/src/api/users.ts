import { apiClient } from '@/lib/apiClient';
import type { SignupInput, User } from '@/types/user';

interface ItemResponse {
  data: User;
}

export async function signup(input: SignupInput): Promise<User> {
  const res = await apiClient.post<ItemResponse>('/users', input);
  return res.data.data;
}
