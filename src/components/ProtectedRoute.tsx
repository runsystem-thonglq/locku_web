"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, getAccountInfo } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [accountError, setAccountError] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (user?.idToken) {
        try {
          await getAccountInfo(user.idToken, user.refreshToken);
          setAccountError(false);
        } catch (error) {
          console.error("Failed to get account info:", error);
          setAccountError(true);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [user, getAccountInfo]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-black-100 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">
              <img src="/favicon.ico" className="rounded-full" />
            </span>
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in OR account info failed, return to login
  if (!user || accountError) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
