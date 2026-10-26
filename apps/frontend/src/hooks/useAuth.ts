// Auth Hook
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    initializeAuth,
    refreshToken,
    updateProfile,
    clearError,
  } = useAuthStore();

  const handleLogin = useCallback(async (email: string, password: string) => {
    await login(email, password);
  }, [login]);

  const handleRegister = useCallback(async (username: string, email: string, password: string) => {
    await register(username, email, password);
  }, [register]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleUpdateProfile = useCallback(async (data: Partial<typeof user>) => {
    await updateProfile(data);
  }, [updateProfile]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    initializeAuth,
    refreshToken,
    updateProfile: handleUpdateProfile,
    clearError,
  };
}