import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, hasHydrated, login, logout } = useAuthStore();
  return { user, token, isAuthenticated, hasHydrated, login, logout };
};
