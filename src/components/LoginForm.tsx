"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessageStore } from "@/stores/messageStore";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, resetPassword, isLoading, resetPasswordLoading, clearStatus } =
    useAuth();
  const { message, clearMessage } = useMessageStore();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const checkEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (checkValue(false)) {
      try {
        await login(email.trim(), password.trim());
      } catch (error) {
        console.error("Login error:", error);
      }
    }
  };

  const handleResetPassword = async () => {
    if (checkValue(true)) {
      try {
        await resetPassword(email.trim());
      } catch (error) {
        console.error("Reset password error:", error);
      }
    }
  };

  const checkValue = (isResetPassword: boolean) => {
    if (!checkEmail(email.trim())) {
      return false;
    }
    if (!isResetPassword && password.trim().length < 8) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    clearStatus();
    return () => clearMessage();
  }, [clearStatus, clearMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Locket</h1>
          <p className="text-white/70">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && passwordRef.current) {
                    passwordRef.current.focus();
                  }
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your email"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Password
              </label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {message && (
            <div
              className={`${
                message.type === "Error"
                  ? "bg-red-500/20 border-red-500/50 text-red-200"
                  : "bg-green-500/20 border-green-500/50 text-green-200"
              } border rounded-xl p-3 text-sm`}
            >
              {message.message}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <button
              onClick={handleResetPassword}
              disabled={resetPasswordLoading}
              className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordLoading ? "Sending..." : "Reset Password"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Your data is secure and private
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
