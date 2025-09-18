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
        // Save credentials on successful login
        try {
          localStorage.setItem(
            "locku_credentials",
            JSON.stringify({ email: email.trim(), password: password.trim() })
          );
        } catch (err) {
          // Ignore storage errors
        }
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

  // Autofill from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("locku_credentials");
      if (raw) {
        const creds = JSON.parse(raw) as { email?: string; password?: string };
        if (creds?.email) setEmail(creds.email);
        if (creds?.password) setPassword(creds.password);
      }
    } catch (err) {
      // Ignore parse/storage errors
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      <div className="bg-neutral-900 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-black">🔒</span>
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
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <button
              onClick={handleResetPassword}
              disabled={resetPasswordLoading}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
