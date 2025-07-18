import { trpc } from "../../lib/trpc";

export function useMe() {
  return trpc.auth.getMe.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  
  return trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.getMe.invalidate();
    },
  });
}

export function useChangePassword() {
  return trpc.auth.changePassword.useMutation();
}

export function useDeleteAccount() {
  return trpc.auth.deleteAccount.useMutation();
}

export function useRegister() {
  return trpc.auth.register.useMutation();
}