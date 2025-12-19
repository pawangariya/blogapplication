"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignUpFormProps {
  onSuccess?: () => void;
  switchToLogin?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: username, 
          email: email, 
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully!");
        
        // If onSuccess callback provided (dialog mode)
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
      console.error("Signup error:", err);
      alert("Server not reachable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="shadow-none rounded py-4 px-2 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r text-transparent from-blue-500 to-purple-500 bg-clip-text">
            Create a new account
          </span>
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              <User className="mr-2 inline-block w-3.5" /> Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow border rounded w-full py-2.5 px-4 text-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              <Mail className="mr-2 inline-block w-3.5" /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow border rounded w-full py-2.5 px-4 text-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              <Lock className="mr-2 inline-block w-3.5" /> Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow border rounded w-full py-2.5 px-4 text-gray-700"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-500 hover:underline ml-1"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;