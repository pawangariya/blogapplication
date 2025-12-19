"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  onSuccess?: () => void;
  switchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", data.name);
        localStorage.setItem("role", data.role);
        
        // Trigger storage event so navbar updates
        window.dispatchEvent(new Event("storage"));
        
        // Close dialog if onSuccess callback provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback for standalone page
          window.location.href = "/";
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server not reachable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="shadow-none rounded py-4 px-2 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-center">
          <span className="bg-gradient-to-r text-transparent from-blue-500 to-purple-500 bg-clip-text">
            LogIn
          </span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-1"
            >
              <Mail className="mr-2 inline-block w-3.5" /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow border rounded w-full py-2.5 px-4 text-gray-700"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-1"
            >
              <Lock className="mr-2 inline-block w-3.5" /> Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow border rounded w-full py-2.5 px-4 text-gray-700"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex items-center justify-center mt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-500 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "LogIn"}
            </Button>
          </div>
          <div className="text-center mt-3">
            <Link href="/" className="text-gray-600 hover:underline text-sm">
              Forget Password?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Don't have an account?
          <button
            type="button"
            onClick={switchToSignup}
            className="text-blue-500 hover:underline ml-1"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;