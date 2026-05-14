import { useMutation } from '@tanstack/react-query';
import { signup } from '@/api/users';
import type { SignupInput, User } from '@/types/user';

export function useSignup() {
  return useMutation<User, Error, SignupInput>({
    mutationFn: signup,
  });
}
