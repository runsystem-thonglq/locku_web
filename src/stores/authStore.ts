import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  kind?: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered?: boolean;
  profilePicture?: string;
  refreshToken: string;
  expiresIn?: string;
  timeExpires?: number;

  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  passwordUpdatedAt?: number;
  providerUserInfo?: ProviderUserInfo[];
  validSince?: string;
  lastLoginAt?: string;
  createdAt?: string;
  customAuth?: boolean;
  phoneNumber?: string;
  customAttributes?: string;
  lastRefreshAt?: Date;
}

export interface ProviderUserInfo {
  providerId: string;
  rawId: string;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  federatedId?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  userInfo: User | null;
  isLoading: boolean;
  resetPasswordLoading: boolean;
  updateAvatarLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setUserInfo: (userInfo: User | null) => void;
  setLoading: (loading: boolean) => void;
  setResetPasswordLoading: (loading: boolean) => void;
  setUpdateAvatarLoading: (loading: boolean) => void;
  logout: () => void;
  clearStatus: () => void;
  setToken: (token: { access_token: string; refresh_token: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userInfo: null,
      isLoading: false,
      resetPasswordLoading: false,
      updateAvatarLoading: false,

      setUser: (user) => set({ user }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setLoading: (isLoading) => set({ isLoading }),
      setResetPasswordLoading: (resetPasswordLoading) =>
        set({ resetPasswordLoading }),
      setUpdateAvatarLoading: (updateAvatarLoading) =>
        set({ updateAvatarLoading }),

      logout: () =>
        set({
          user: null,
          userInfo: null,
          isLoading: false,
        }),

      clearStatus: () =>
        set({
          isLoading: false,
          updateAvatarLoading: false,
        }),

      setToken: (token) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                idToken: token.access_token,
                refreshToken: token.refresh_token,
              }
            : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        userInfo: state.userInfo,
      }),
    }
  )
);
