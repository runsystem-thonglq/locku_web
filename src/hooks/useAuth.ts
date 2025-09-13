import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { authAPI } from '../lib/api';

export const useAuth = () => {
  const {
    user,
    userInfo,
    isLoading,
    resetPasswordLoading,
    updateAvatarLoading,
    setUser,
    setUserInfo,
    setLoading,
    setResetPasswordLoading,
    setUpdateAvatarLoading,
    logout,
    clearStatus,
    setToken,
  } = useAuthStore();

  const { setMessage } = useMessageStore();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response) {
        const now = new Date().getTime() + 3600 * 1000;
        const userData = { ...response, timeExpires: now };
        setUser(userData);
        setMessage({
          message: 'Login successful',
          type: 'Success',
        });
        return userData;
      }
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setMessage]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setResetPasswordLoading(true);
      const response = await authAPI.resetPassword(email);
      
      if (response) {
        setMessage({
          message: 'Password reset email has been sent',
          type: 'Success',
        });
        return response;
      }
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setResetPasswordLoading(false);
    }
  }, [setResetPasswordLoading, setMessage]);

  const getAccountInfo = useCallback(async (idToken: string, refreshToken: string) => {
    try {
      setLoading(true);
      const response = await authAPI.getAccountInfo(idToken);
      
      if (response?.users?.[0]) {
        const userData = response.users[0];
        
        // Fetch additional user info
        try {
          const fullName = await authAPI.fetchUser(userData.localId, idToken);
          userData.firstName = fullName.data.result.data.first_name;
          userData.lastName = fullName.data.result.data.last_name;
        } catch (error) {
          console.warn('Could not fetch additional user info:', error);
        }
        
        setUserInfo(userData);
        return userData;
      }
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUserInfo, setLoading, setMessage]);

  const refreshToken = useCallback(async (refreshToken: string) => {
    try {
      setLoading(true);
      const response = await authAPI.getAccessToken(refreshToken);
      
      if (response) {
        setToken({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        });
        
        // Get account info with new token
        await getAccountInfo(response.access_token, response.refresh_token);
        
        return response;
      }
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setToken, getAccountInfo, logout, setLoading, setMessage]);

  const updateDisplayName = useCallback(async (first_name: string, last_name: string) => {
    if (!user?.idToken) return;
    
    try {
      setLoading(true);
      await authAPI.updateDisplayName(first_name, last_name, user.idToken);
      
      setMessage({
        message: 'Display Name updated successfully',
        type: 'Success',
      });
      
      // Refresh account info
      await getAccountInfo(user.idToken, user.refreshToken);
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setMessage, getAccountInfo]);

  const updateAvatar = useCallback(async (profile_picture_url: string) => {
    if (!user?.idToken) return;
    
    try {
      setUpdateAvatarLoading(true);
      await authAPI.updateAvatar(profile_picture_url, user.idToken);
      
      setMessage({
        message: 'Avatar updated successfully',
        type: 'Success',
      });
      
      // Refresh account info
      await getAccountInfo(user.idToken, user.refreshToken);
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setUpdateAvatarLoading(false);
    }
  }, [user, setUpdateAvatarLoading, setMessage, getAccountInfo]);

  const handleLogout = useCallback(() => {
    logout();
    setMessage({
      message: 'Logged out successfully',
      type: 'Success',
    });
  }, [logout, setMessage]);

  return {
    user,
    userInfo,
    isLoading,
    resetPasswordLoading,
    updateAvatarLoading,
    login,
    resetPassword,
    getAccountInfo,
    refreshToken,
    updateDisplayName,
    updateAvatar,
    logout: handleLogout,
    clearStatus,
  };
};
